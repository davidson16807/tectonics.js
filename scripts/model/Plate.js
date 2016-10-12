'use strict';

function Plate(world, optional)
{
	optional = {};
	Crust.call(this, optional);

	optional = optional || {}
	this.world = world;
	this.grid = world.grid;

	this.eulerPole = optional['eulerPole'] ;
	this.angularSpeed = optional['angularSpeed'] || world.getRandomPlateSpeed();
	
	this.local_to_global_matrix = optional['matrix'] || new THREE.Matrix4();
	this.global_to_local_matrix = optional['matrix'] || new THREE.Matrix4();
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