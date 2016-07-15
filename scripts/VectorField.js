'use strict';

// The VectorField class is the representation of a mathematical vector field.
// It should theoretically work for any manifold or coordinate system in R^3 given the appropriate geometry,
// However it is only intended for use with spheres 
// It performs mathematical operations that are common to fields

function VectorField(grid){
	this.grid = grid;

	this._geometry = world.grid.template;
	this._vertices = this._geometry.vertices;
	this._faces = this._geometry.faces;
	
	this.values = new Array(this._vertices.length);
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] = new THREE.Vector3();
	}
	this.length = this._vertices.length;
}
VectorField.prototype.add_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] += field_values[i];
	}
	return this;
};
VectorField.prototype.sub_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] -= field_values[i];
	}
	return this;
};
VectorField.prototype.mult_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] *= field_values[i];
	}
	return this;
};
VectorField.prototype.div_field = function(field) {
	var field_values = field.values;
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] /= field_values[i];
	}
	return this;
};
VectorField.prototype.add_scalar = function(scalar) {
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] += scalar;
	}
	return this;
};
VectorField.prototype.sub_scalar = function(scalar) {
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] -= scalar;
	}
	return this;
};
VectorField.prototype.mult_scalar = function(scalar) {
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] *= scalar;
	}
	return this;
};
VectorField.prototype.div_scalar = function(scalar) {
	var inv_scalar = scalar;
	var this_values = this.values;
	for (var i = this_values.length - 1; i >= 0; i--) {
		this_values[i] *= inv_scalar;
	}
	return this;
};
VectorField.prototype.map = function(fn) {
	var this_values = this.values;
	for (var i = field_values.length - 1; i >= 0; i--) {
		this_values[i] = fn(this_values[i])
	}
	return this;
};