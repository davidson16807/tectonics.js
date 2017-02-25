'use strict';

function Plate(params)
{
	params = params || stop('missing parameter object')
	this.world = params['world'] || stop('missing parameter: "world"');
	params.grid = world.grid;
	Crust.call(this, params);

	this.mask = params['mask'] || stop('mask')

	this.eulerPole = params['eulerPole'];
	this.angularSpeed = params['angularSpeed'];
	
	this.local_to_global_matrix = params['matrix'] || new THREE.Matrix4();
	this.global_to_local_matrix = params['matrix'] || new THREE.Matrix4();
}
Plate.prototype.move = function(timestep){
	this.angularSpeed = 0;
	this.increment = this.angularSpeed * timestep;
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationAxis( this.eulerPole, this.angularSpeed * timestep );
	rotationMatrix.multiply( this.matrix ); 
	this.matrix = rotationMatrix;
	this.worldToLocalMatrix = new THREE.Matrix4();
	this.worldToLocalMatrix.getInverse(this.matrix);
}