'use strict';

// The VectorField namespace provides operations over mathematical vector fields.
// It should theoretically work for any manifold or coordinate system in R^3 given the appropriate geometry,
// However it is only intended for use with spheres 
// It performs mathematical operations that are common to fields
var VectorField = {}
VectorField.TypedArray = function(grid){
	return new Array(grid.pos.length);
}
VectorField.add_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)

	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] += field_value[i];
	}
	return this;
};
VectorField.sub_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)

	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] -= field_value[i];
	}
	return this;
};
VectorField.mult_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)

	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] *= field_value[i];
	}
	return this;
};
VectorField.div_field = function(field1, field2, result) {
	result = result || new Float32Array(field.length)

	var field_value = field.value;
	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] /= field_value[i];
	}
	return this;
};
VectorField.add_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] += scalar;
	}
	return this;
};
VectorField.sub_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] -= scalar;
	}
	return this;
};
VectorField.mult_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] *= scalar;
	}
	return this;
};
VectorField.div_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	var inv_scalar = scalar;
	var this_value = this.value;
	for (var i = this_value.length - 1; i >= 0; i--) {
		this_value[i] *= inv_scalar;
	}
	return this;
};
VectorField.map = function(field, fn, result) {
	result = result || new Float32Array(field.length)

	var this_value = this.value;
	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] = fn(this_value[i])
	}
	return this;
};