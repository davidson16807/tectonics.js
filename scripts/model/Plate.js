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
}
Plate.prototype.move = function(timestep){
	// this.angularSpeed = 0;
	this.increment = this.angularSpeed * timestep;
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationAxis( this.eulerPole, this.angularSpeed * timestep );
	rotationMatrix.multiply( this.local_to_global_matrix ); 
	this.local_to_global_matrix = rotationMatrix;
	this.global_to_local_matrix = new THREE.Matrix4();
	this.global_to_local_matrix.getInverse(this.local_to_global_matrix);
}
