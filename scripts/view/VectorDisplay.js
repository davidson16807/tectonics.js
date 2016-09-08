'use strict';

var vectorDisplays = {};


function VectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
VectorDisplay.prototype.addTo = function(mesh) {

};
VectorDisplay.prototype.removeFrom = function(mesh) {
		
};
VectorDisplay.prototype.updateAttributes = function(material, plate) {
	var material, displacement, scalar;
	var vector = material.attributes.vector.value;
	var is_member_model = plate.is_member; 
	var vector_model = this.getField !== void 0? this.getField(plate) : new THREE.Vector3(0.03,0.03,0.03);
	var is_member;
	for(var j=0, lj = vector_model.length; j<lj; j++){
		is_member = is_member_model[i];
		vector[j] = is_member * vector_model[i]; 
	}
	material.attributes.vector.needsUpdate = true;
}
vectorDisplays.test	= new VectorDisplay( {  } );
