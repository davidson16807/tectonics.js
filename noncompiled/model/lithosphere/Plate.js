'use strict';

function Plate(parameters)
{
	parameters = parameters || stop('missing parameter object')
	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	this.crust = parameters['crust'] || new Crust({grid: grid});
	var material_density = parameters['material_density'] || parameters['world'].material_density;
	var material_viscosity = parameters['material_viscosity'] || parameters['world'].material_viscosity;
	var surface_gravity = parameters['surface_gravity'] || parameters['world'].surface_gravity;

	var self = this; 
	// The following are fields that are derived from other fields:
	// "displacement is the height of the crust relative to an arbitrary datum level
	// It is not called "elevation" because we want to emphasize that it is not relative to sea level
	this.displacement = new Memo(
		Float32Raster(grid),  
		result => LithosphereModeling.get_displacement(self.thickness.value(), self.density.value(), material_density, result) 
	); 
	// the thickness of the crust in km
	this.thickness = new Memo(  
		Float32Raster(grid),  
		result => Crust.get_thickness(self.crust, material_density, result)
	); 
	// total mass of the crust in tons
	this.total_mass = new Memo(  
		Float32Raster(grid),  
		result => Crust.get_total_mass(self.crust, result)
	); 
	// the average density of the crust, in T/m^3
	this.density = new Memo(  
		Float32Raster(grid),  
		result => Crust.get_density(self.total_mass.value(), self.thickness.value(),	material_density.mafic_volcanic_min, result)
	); 
	this.buoyancy = new Memo(  
		Float32Raster(grid),  
		result => Crust.get_buoyancy(self.density.value(), material_density, surface_gravity, result)
	); 
	this.velocity = new Memo(  
		VectorRaster(grid), 
		result => LithosphereModeling.get_plate_velocity(self.mask, self.buoyancy.value(), material_viscosity, result)
	); 
	this.center_of_mass = new Memo(  
		{ x:0, y:0, z:0 },
		result => LithosphereModeling.get_plate_center_of_mass	(self.total_mass.value(), self.mask)
	); 

	this.mask = parameters['mask'] || Uint8Raster(grid);

	this.local_to_global_matrix = parameters['local_to_global_matrix'] || Matrix.Identity();
	this.global_to_local_matrix = Matrix.invert(this.local_to_global_matrix);

	this.global_ids_of_local_cells = Uint16Raster(grid);
	this.local_ids_of_global_cells = Uint16Raster(grid);

	this.global_pos_of_local_cells = VectorRaster(grid);
	this.local_pos_of_global_cells = VectorRaster(grid);

	this.invalidate = function(){
		this.displacement.invalidate();
		this.thickness.invalidate();
		this.total_mass.invalidate();
		this.density.invalidate();
		this.buoyancy.invalidate();
		this.velocity.invalidate();
		this.center_of_mass.invalidate();
	}
	
	this.move = function(timestep){
		var world = this.world;

		var rotation_matrix = LithosphereModeling.get_plate_rotation_matrix(this.velocity.value(), this.center_of_mass.value(), timestep);

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
}
