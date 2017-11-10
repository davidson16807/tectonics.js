'use strict';

function Plate(params)
{
	params = params || stop('missing parameter object')
	this.world = params['world'] || stop('missing parameter: "world"');
	params.grid = world.grid;
	Crust.call(this, params);
	this.subductability = Float32Raster(this.grid);

	this.mask = params['mask'] || Uint8Raster(this.grid);

	this.eulerPole = params['eulerPole'] || new THREE.Vector3();
	this.angularSpeed = params['angularSpeed'];
	
	this.local_to_global_matrix = params['local_to_global_matrix'] || new THREE.Matrix4();
	this.global_to_local_matrix = new THREE.Matrix4();
	this.global_to_local_matrix.getInverse(this.local_to_global_matrix);

	this.global_ids_of_local_cells = Uint16Raster(this.grid);
	this.local_ids_of_global_cells = Uint16Raster(this.grid);

	this.global_pos_of_local_cells = VectorRaster(this.grid);
	this.local_pos_of_global_cells = VectorRaster(this.grid);
}
Plate.prototype.move = function(timestep){
	this.increment = this.angularSpeed * timestep;

	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationAxis( this.eulerPole, this.angularSpeed * timestep );
	rotationMatrix.multiply( this.local_to_global_matrix ); 
	this.local_to_global_matrix = rotationMatrix;
	this.global_to_local_matrix = new THREE.Matrix4();
	this.global_to_local_matrix.getInverse(this.local_to_global_matrix);

	var grid = this.grid;

	// for each cell in the master's grid, this raster indicates the id of the corresponding cell in the plate's grid
	// this is used to convert between global and local coordinate systems
    VectorField.mult_matrix(grid.pos, this.global_to_local_matrix.elements, this.local_pos_of_global_cells); 
	this.local_ids_of_global_cells = grid.getNearestIds(this.local_pos_of_global_cells);

	// for each cell in the plate's grid, this raster indicates the id of the corresponding cell in the world's grid
	// this is used to convert between global and local coordinate systems
    VectorField.mult_matrix(grid.pos, this.local_to_global_matrix.elements, this.global_pos_of_local_cells);
	this.global_ids_of_local_cells = grid.getNearestIds(this.global_pos_of_local_cells);
}
