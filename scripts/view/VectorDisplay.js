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
VectorDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement, scalar;
	vector = geometry.attributes.vector.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index;
	var is_member_model = plate.is_member; 
	var displacement_model = plate.displacement; 
	var vector_model = this.getField !== void 0? this.getField(plate) : void 0;
	var is_member;
	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		is_member = is_member_model[buffer_array_index]
		displacement[j] = is_member * displacement_model[buffer_array_index]; 
		if (vector_model !== void 0) {
			vector[j] = is_member * scalar_model[buffer_array_index]; 
		}
	}
	geometry.attributes.displacement.needsUpdate = true;
	if (scalar_model !== void 0) {
		geometry.attributes.scalar.needsUpdate = true;
	}
}
vectorDisplays.test	= new VectorDisplay( {  } );
