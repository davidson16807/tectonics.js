'use strict';

function Plate(params)
{
	params = params || stop('missing parameter object')
	this.world = params['world'] || stop('missing parameter: "world"');
	this.grid = this.world.grid;

	this.crust = params['crust'] || new Crust({grid: this.grid});

	this.density = Float32Raster(this.grid);

	this.mask = params['mask'] || Uint8Raster(this.grid);

	this.eulerPole = params['eulerPole'] || Vector();
	this.angularSpeed = params['angularSpeed'];
	
	this.local_to_global_matrix = params['local_to_global_matrix'] || Matrix.Identity();
	this.global_to_local_matrix = Matrix.invert(this.local_to_global_matrix);

	this.global_ids_of_local_cells = Uint16Raster(this.grid);
	this.local_ids_of_global_cells = Uint16Raster(this.grid);

	this.global_pos_of_local_cells = VectorRaster(this.grid);
	this.local_pos_of_global_cells = VectorRaster(this.grid);
}
Plate.prototype.move = function(timestep){
	this.increment = this.angularSpeed * timestep;

	var rotation_matrix = Matrix.RotationAboutAxis( this.eulerPole.x, this.eulerPole.y, this.eulerPole.z, this.angularSpeed * timestep );
	Matrix.mult_matrix(this.local_to_global_matrix, rotation_matrix, this.local_to_global_matrix);
	Matrix.invert(this.local_to_global_matrix, this.global_to_local_matrix);

	var grid = this.grid;

	// for each cell in the master's grid, this raster indicates the id of the corresponding cell in the plate's grid
	// this is used to convert between global and local coordinate systems
    VectorField.mult_matrix(grid.pos, this.global_to_local_matrix, this.local_pos_of_global_cells); 
	this.local_ids_of_global_cells = grid.getNearestIds(this.local_pos_of_global_cells);

	// for each cell in the plate's grid, this raster indicates the id of the corresponding cell in the world's grid
	// this is used to convert between global and local coordinate systems
    VectorField.mult_matrix(grid.pos, this.local_to_global_matrix, this.global_pos_of_local_cells);
	this.global_ids_of_local_cells = grid.getNearestIds(this.global_pos_of_local_cells);
}
