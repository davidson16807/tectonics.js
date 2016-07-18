'use strict';

// The ScalarField namespace provides operations over mathematical scalar fields.
// It should theoretically work for any manifold or coordinate system given the appropriate geometry,
// However it is only intended for use with spheres 
// It performs mathematical operations that are common to fields
var ScalarField = {}
ScalarField.TypedArray = function(grid){
	return new Float32Array(grid.vertices.length);
}
ScalarField.VertexTypedArray = function(grid){
	return new Float32Array(grid.vertices.length);
}
ScalarField.EdgeTypedArray = function(grid){
	return new Float32Array(grid.edges.length);
}
ScalarField.ArrowTypedArray = function(grid){
	return new Float32Array(grid.arrows.length);
}
ScalarField.TypedArrayOfLength = function(length){
	return new Float32Array(length);
}
ScalarField.add_field = function(field1, field2, result) {
	result = result || new Float32Array(field1.length)

	for (var i=0, li=field1.length; i<li; ++i) {
		result[i] = field1[i] + field2[i];
	}
	return result;
};
ScalarField.sub_field = function(field1, field2, result) {
	result = result || new Float32Array(field1.length)

	for (var i=0, li=field1.length; i<li; ++i) {
		result[i] = field1[i] - field2[i];
	}
	return result;
};
ScalarField.mult_field = function(field1, field2, result) {
	result = result || new Float32Array(field1.length)

	for (var i=0, li=field1.length; i<li; ++i) {
		result[i] = field1[i] * field2[i];
	}
	return result;
};
ScalarField.div_field = function(field1, field2, result) {
	result = result || new Float32Array(field1.length)

	for (var i=0, li=field1.length; i<li; ++i) {
		result[i] = field1[i] / field2[i];
	}
	return result;
};

ScalarField.add_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	for (var i=0, li=field.length; i<li; ++i) {
		result[i] = field[i] + scalar;
	}
	return result;
};
ScalarField.sub_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	for (var i=0, li=field.length; i<li; ++i) {
		result[i] = field[i] - scalar;
	}
	return result;
};
ScalarField.mult_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	for (var i=0, li=field.length; i<li; ++i) {
		result[i] = field[i] * scalar;
	}
	return result;
};
ScalarField.div_scalar = function(field, scalar, result) {
	result = result || new Float32Array(field.length)

	var inv_scalar;
	for (var i=0, li=field.length; i<li; ++i) {
		result[i] = field[i] * inv_scalar;
	}
	return result;
};


// minimum value within the field
ScalarField.min = function(field) {
	var min = Infinity;
	var value;
	for (var i=0, li=field.length; i<li; ++i) {
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
	for (var i=0, li=field.length; i<li; ++i) {
		value = field[i];
		if (value > max) {
			max = value;
		}
	}
	return max;
};

// ∂X
ScalarField.arrow_differential = function(field, grid, result) {
	result = result || ScalarField.ArrowTypedArray(grid);

	var arrows = grid.arrows;
	var arrow = [];
	for (var i = 0, li = arrows.length; i<li; i++) {
		arrow = arrows[i];
		result[i] = field[arrow[1]] - field[arrow[0]];
	}
	return result;
}

// ∂X
ScalarField.edge_differential = function(field, grid, result) {
	result = result || ScalarField.EdgeTypedArray(grid);

	var edges = grid.edges;
	var edge = [];
	for (var i = 0, li = edges.length; i<li; i++) {
		edge = edges[i];
		result[i] = field[edge[1]] - field[edge[0]];
	}
	return result;
}

// ∂X
ScalarField.vertex_differential = function(field, grid, result){
	result = result || VectorField.VertexDataFrame(grid);

	var dpos = grid.pos_arrow_differential;

	var arrows = grid.arrows;
	var arrow = [];

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=arrows.length; i<li; ++i) {
	    arrow = arrows[i];
	    x[arrow[0]] += (field[arrow[1]] - field[arrow[0]] );
	    y[arrow[0]] += (field[arrow[1]] - field[arrow[0]] );
	    z[arrow[0]] += (field[arrow[1]] - field[arrow[0]] );
	}

	var neighbor_lookup = grid.neighbor_lookup;
	var neighbor_count = 0;
	for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
	    neighbor_count = neighbor_lookup[i].length;
	    x[i] /= neighbor_count;
	    y[i] /= neighbor_count;
	    z[i] /= neighbor_count;
	}

	return result;
}

// ∇X
ScalarField.arrow_gradient = function(field, grid, result){
	result = result || VectorField.ArrowDataFrame(grid);

	var arrows = grid.arrows;
	var arrow = [];
	for (var i=0, li=arrows.length; i<li; ++i) {
	    result[i] = field[arrow[1]] - field[arrow[0]];
	}
	return result;
}

// ∇X
ScalarField.vertex_gradient = function(field, grid, result){
	result = result || VectorField.VertexDataFrame(grid);

	var dfield = 0;
	var dpos = grid.pos_arrow_differential;
	var dx = dpos.x;
	var dy = dpos.y;
	var dz = dpos.z;

	var arrows = grid.arrows;
	var arrow = [];

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=arrows.length; i<li; ++i) {
	    arrow = arrows[i];
	    dfield = field[arrow[1]] - field[arrow[0]];
	    x[arrow[0]] += dfield / dx[i];
	    y[arrow[0]] += dfield / dy[i];
	    z[arrow[0]] += dfield / dz[i];
	}

	var neighbor_lookup = grid.neighbor_lookup;
	var neighbor_count = 0
	for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
	    neighbor_count = neighbor_lookup[i].length;
	    x[i] /= neighbor_count;
	    y[i] /= neighbor_count;
	    z[i] /= neighbor_count;
	}

	return result;
}

// ∂⋅∇X
// can be thought of as the similarity between neighbors
ScalarField.edge_gradient_similarity = function(field, grid, result) {
	result = result || ScalarField.EdgeTypedArray;

	var gradient = ScalarField.vertex_gradient(field, grid);

	VectorField.edge_similarity(field, grid, result);

	return result;
}

// ∇⋅∇X, A.K.A. ∇²X
// can be thought of as the difference between neighbors
ScalarField.laplacian = function(field, grid, result) {
	result = result || ScalarField.EdgeTypedArray;

	var gradient = ScalarField.vertex_gradient(field, grid);
}