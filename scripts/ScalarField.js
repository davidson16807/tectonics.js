'use strict';

// The ScalarField namespace provides operations over mathematical scalar fields.
// It should theoretically work for any manifold or coordinate system given the appropriate geometry,
// However it is only intended for use with spheres 
// It performs mathematical operations that are common to fields
var ScalarField = {}
ScalarField.TypedArray = function(grid){
	return new Float32Array(grid.pos.length);
}
ScalarField.add_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)

	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] += field_value[i];
	}
	return this;
};
ScalarField.sub_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)
	
	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] -= field_value[i];
	}
	return this;
};
ScalarField.mult_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)
	
	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] *= field_value[i];
	}
	return this;
};
ScalarField.div_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)
	
	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] /= field_value[i];
	}
	return this;
};
ScalarField.add_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)
	
	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] += scalar;
	}
	return this;
};
ScalarField.sub_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)
	
	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] -= scalar;
	}
	return this;
};
ScalarField.mult_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)
	
	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] *= scalar;
	}
	return this;
};
ScalarField.div_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)
	
	var inv_scalar = scalar;
	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] *= inv_scalar;
	}
	return this;
};
// minimum value within the field
ScalarField.min = function(field) {
	var min = Infinity;
	var value;
	for (var i = field.length - 1; i >= 0; i--) {
		value = field[i];
		if (value < min) {
			min = value;
		}
	}
	return min;
};
// maximum value within the field
ScalarField.max = function(field) {
	var max = -Infinity;
	var value;
	for (var i = field.length - 1; i >= 0; i--) {
		value = field[i];
		if (value > max) {
			max = value;
		}
	}
	return max;
};
ScalarField.map = function(fn) {
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] = fn(this_value[i])
	}
	return this;
};