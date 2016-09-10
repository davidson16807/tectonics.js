'use strict';

var vectorDisplays = {};


function VectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
VectorDisplay.prototype.addTo = function(mesh) {};
VectorDisplay.prototype.removeFrom = function(mesh) {};
VectorDisplay.prototype.updateAttributes = function(material, plate) {
	var material, displacement, scalar;
	var vector = material.attributes.vector.value;
	var is_member_model = plate.is_member; 
	var vector_model = this.getField !== void 0? this.getField(plate) : new THREE.Vector3(0.03,0.03,0.03);
	for(var i=0, li = is_member_model.length; i<li; i++){
		var vector_i = 2*i+1;
		vector[vector_i] = is_member_model[i] === 1?  
			plate.eulerPole.clone().multiplyScalar(1/30) : 
			new THREE.Vector3(0.00,0.00,0.00); 
	}
	material.attributes.vector.needsUpdate = true;
}
vectorDisplays.angularVelocity	= new VectorDisplay( {  } );


function VectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
VectorDisplay.prototype.addTo = function(mesh) {};
VectorDisplay.prototype.removeFrom = function(mesh) {};
VectorDisplay.prototype.updateAttributes = function(material, plate) {
	var material, displacement, scalar;
	var vector = material.attributes.vector.value;
	var is_member_model = plate.is_member; 
	var positions_model = plate.pos;
	var vector_model = this.getField !== void 0? this.getField(plate) : new THREE.Vector3(0.03,0.03,0.03);
	for(var i=0, li = is_member_model.length; i<li; i++){
		var vector_i = 2*i+1;
		vector[vector_i] = is_member_model[i] === 1?  
			plate.eulerPole
				.clone()
				.cross(positions_model[i])
				.normalize()
				.multiplyScalar(0.17) : 
			new THREE.Vector3(0.00,0.00,0.00); 
	}
	material.attributes.vector.needsUpdate = true;
}
vectorDisplays.velocity	= new VectorDisplay( {  } );


function DisabledVectorDisplay(options) {}
DisabledVectorDisplay.prototype.addTo = function(mesh) {
	var vector = mesh.material.attributes.vector.value;
	for(var i=0, li = vector.length; i<li; i++){
		vector[i] = new THREE.Vector3(); 
	}
};
DisabledVectorDisplay.prototype.removeFrom = function(mesh) {};
DisabledVectorDisplay.prototype.updateAttributes = function(material, plate) {}
vectorDisplays.disabled	= new DisabledVectorDisplay( {  } );
