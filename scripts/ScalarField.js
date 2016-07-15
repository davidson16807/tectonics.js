'use strict';

// The ScalarField class is the representation of a mathematical scalar field.
// It should theoretically work for any manifold or coordinate system given the appropriate geometry,
// However it is only intended for use with spheres 
// It performs mathematical operations that are common to fields

function ScalarField(grid){
	this.grid = grid;

	this._geometry = world.grid.template;
	this._vertices = this._geometry.vertices;
	this._faces = this._geometry.faces;
	
	this.values = new Float32Array(this._vertices.length);
	this.length = this._vertices.length;
}
ScalarField.prototype.add_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] += field_values[i];
	}
	return this;
};
ScalarField.prototype.sub_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] -= field_values[i];
	}
	return this;
};
ScalarField.prototype.mult_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] *= field_values[i];
	}
	return this;
};
ScalarField.prototype.div_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] /= field_values[i];
	}
	return this;
};
ScalarField.prototype.add_scalar = function(scalar) {
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] += scalar;
	}
	return this;
};
ScalarField.prototype.sub_scalar = function(scalar) {
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] -= scalar;
	}
	return this;
};
ScalarField.prototype.mult_scalar = function(scalar) {
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] *= scalar;
	}
	return this;
};
ScalarField.prototype.div_scalar = function(scalar) {
	var inv_scalar = scalar;
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] *= inv_scalar;
	}
	return this;
};
ScalarField.prototype.map = function(fn) {
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] = fn(this_values[i])
	}
	return this;
};