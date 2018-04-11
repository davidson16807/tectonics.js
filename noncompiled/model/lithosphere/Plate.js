'use strict';

function Plate(params)
{
	params = params || stop('missing parameter object')
	this.world = params['world'] || stop('missing parameter: "world"');
	this.grid = this.world.grid;

	this.crust = params['crust'] || new Crust({grid: this.grid});

	this.total_mass = Float32Raster(this.grid);
	this.thickness = Float32Raster(this.grid);
	this.density = Float32Raster(this.grid);
	this.buoyancy = Float32Raster(this.grid);
	this.velocity = VectorRaster(this.grid);

	this.mask = params['mask'] || Uint8Raster(this.grid);

	this.local_to_global_matrix = params['local_to_global_matrix'] || Matrix.Identity();
	this.global_to_local_matrix = Matrix.invert(this.local_to_global_matrix);

	this.global_ids_of_local_cells = Uint16Raster(this.grid);
	this.local_ids_of_global_cells = Uint16Raster(this.grid);

	this.global_pos_of_local_cells = VectorRaster(this.grid);
	this.local_pos_of_global_cells = VectorRaster(this.grid);
}
Plate.prototype.move = function(timestep){
	var grid = this.grid;

	var world = this.world;
    Crust.get_thickness		(this.crust, world.material_density,									this.thickness); 
    Crust.get_total_mass 	(this.crust, world.material_density,									this.total_mass); 
    Crust.get_density		(this.total_mass, this.thickness, world.material_density.mafic_volcanic_min, this.density); 
	Crust.get_buoyancy 		(this.density, world.material_density, world.surface_gravity, 			this.buoyancy);
	LithosphereModeling.get_plate_velocity(this.mask, this.buoyancy, world.material_viscosity,		this.velocity);

	var center_of_mass = LithosphereModeling.get_plate_center_of_mass	(this.total_mass, this.mask);
	var rotation_matrix = LithosphereModeling.get_plate_rotation_matrix(this.velocity, center_of_mass, timestep);

	Matrix.mult_matrix(this.local_to_global_matrix, rotation_matrix, this.local_to_global_matrix);
	Matrix.invert(this.local_to_global_matrix, this.global_to_local_matrix);

	// for each cell in the master's grid, this raster indicates the id of the corresponding cell in the plate's grid
	// this is used to convert between global and local coordinate systems
    VectorField.mult_matrix(grid.pos, this.global_to_local_matrix, this.local_pos_of_global_cells); 
	grid.getNearestIds(this.local_pos_of_global_cells, this.local_ids_of_global_cells);

	// for each cell in the plate's grid, this raster indicates the id of the corresponding cell in the world's grid
	// this is used to convert between global and local coordinate systems
    VectorField.mult_matrix(grid.pos, this.local_to_global_matrix, this.global_pos_of_local_cells);
	grid.getNearestIds(this.global_pos_of_local_cells, this.global_ids_of_local_cells);
}
