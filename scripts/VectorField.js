'use strict';

// The VectorField namespace provides operations over mathematical vector fields.
// It should theoretically work for any manifold or coordinate system in R^3 given the appropriate geometry,
// However it is only intended for use with spheres 
// It performs mathematical operations that are common to fields
var VectorField = {}

// return vector field data structures for aspects of a grid
VectorField.VertexDataFrame = function(grid){
	return VectorField.DataFrameOfLength(grid.vertices.length)
}
VectorField.EdgeDataFrame = function(grid){
	return VectorField.DataFrameOfLength(grid.vertices.length)
}
VectorField.ArrowDataFrame = function(grid){
	return VectorField.DataFrameOfLength(grid.vertices.length)
}

// return vector field data structure given length
VectorField.DataFrameOfLength = function(length){
	return {
		x: new Float32Array(length),
		y: new Float32Array(length),
		z: new Float32Array(length),
	};
}
// return vector field data structure given array of single vector objects
VectorField.DataFrameOfVectors = function(vectors){
	var result = VectorField.DataFrameOfLength(vectors.length);
	var x = result.x;
	var y = result.y;
	var z = result.z;
	for (var i=0, li=vectors.length; i<li; ++i) {
	    x[i] = vectors[i].x;
	    y[i] = vectors[i].y;
	    z[i] = vectors[i].z;
	}
	return result;
}
VectorField.add_vector_field = function(field1, field2, result) {
	result = result || VectorField.DataFrameOfLength(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = field2.x;
	var y2 = field2.y;
	var z2 = field2.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + x2[i];
	    y[i] = y1[i] + y2[i];
	    z[i] = z1[i] + z2[i];
	}

	return result;
};

VectorField.sub_vector_field = function(field1, field2, result) {
	result = result || VectorField.DataFrameOfLength(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = field2.x;
	var y2 = field2.y;
	var z2 = field2.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] - x2[i];
	    y[i] = y1[i] - y2[i];
	    z[i] = z1[i] - z2[i];
	}

	return result;
};
VectorField.dot_vector_field = function(field1, field2, result) {
	result = result || new Float32Array(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = field2.x;
	var y2 = field2.y;
	var z2 = field2.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    result[i] = x1[i] * x2[i] + 
	    			y1[i] * y2[i] + 
	    			z1[i] * z2[i];
	}

	return result;
};
VectorField.hadamard_vector_field = function(field1, field2, result) {
	result = result || VectorField.DataFrameOfLength(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = field2.x;
	var y2 = field2.y;
	var z2 = field2.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] * x2[i];
	    y[i] = y1[i] * y2[i];
	    z[i] = z1[i] * z2[i];
	}

	return result;
};


VectorField.add_vector = function(field1, vector, result) {
	result = result || VectorField.DataFrameOfLength(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = vector.x;
	var y2 = vector.y;
	var z2 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + x2;
	    y[i] = y1[i] + y2;
	    z[i] = z1[i] + z2;
	}

	return result;
};

VectorField.sub_vector = function(field1, vector, result) {
	result = result || VectorField.DataFrameOfLength(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = vector.x;
	var y2 = vector.y;
	var z2 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] - x2;
	    y[i] = y1[i] - y2;
	    z[i] = z1[i] - z2;
	}

	return result;
};
VectorField.dot_vector = function(field1, vector, result) {
	result = result || new Float32Array(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = vector.x;
	var y2 = vector.y;
	var z2 = vector.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    result[i] = x1[i] * x2[i] + 
	    			y1[i] * y2[i] + 
	    			z1[i] * z2[i];
	}
	return result;
};
VectorField.hadamard_vector = function(field1, vector, result) {
	result = result || VectorField.DataFrameOfLength(field1.x.length);

	var x1 = field1.x;
	var y1 = field1.y;
	var z1 = field1.z;

	var x2 = vector.x;
	var y2 = vector.y;
	var z2 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] * x2;
	    y[i] = y1[i] * y2;
	    z[i] = z1[i] * z2;
	}

	return result;
};

VectorField.add_scalar_field = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar[i];
	    y[i] = y1[i] + scalar[i];
	    z[i] = z1[i] + scalar[i];
	}

	return result;
};
VectorField.sub_scalar_field = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar[i];
	    y[i] = y1[i] + scalar[i];
	    z[i] = z1[i] + scalar[i];
	}

	return result;
};
VectorField.mult_scalar_field = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar[i];
	    y[i] = y1[i] + scalar[i];
	    z[i] = z1[i] + scalar[i];
	}

	return result;
};
VectorField.div_scalar_field = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] / scalar[i];
	    y[i] = y1[i] / scalar[i];
	    z[i] = z1[i] / scalar[i];
	}

	return result;
};

VectorField.add_scalar = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar;
	    y[i] = y1[i] + scalar;
	    z[i] = z1[i] + scalar;
	}

	return result;
};
VectorField.sub_scalar = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] - scalar;
	    y[i] = y1[i] - scalar;
	    z[i] = z1[i] - scalar;
	}

	return result;
};
VectorField.mult_scalar = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] * scalar;
	    y[i] = y1[i] * scalar;
	    z[i] = z1[i] * scalar;
	}

	return result;
};
VectorField.div_scalar = function(vector, scalar, result) {
	result = result || VectorField.DataFrameOfLength(vector.x.length);

	var x1 = vector.x;
	var y1 = vector.y;
	var z1 = vector.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var inv_scalar = 1/scalar;
	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] * inv_scalar;
	    y[i] = y1[i] * inv_scalar;
	    z[i] = z1[i] * inv_scalar;
	}

	return result;
};
VectorField.map = function(field, fn, result) {
	result = result || new Float32Array(field.length)

	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] = fn(this_value[i])
	}
	return result;
};


// ∂X
VectorField.arrow_differential = function(field, grid, result) {
	result = result || VectorField.ArrowDataFrame(grid);

	var x1 = field.x;
	var y1 = field.y;
	var z1 = field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var arrows = grid.arrows;
	var arrow_i_from = 0;
	var arrow_i_to = 0;
	for (var i = 0, li = arrows.length; i<li; i++) {
		arrow_i_from = arrows[i][0];
		arrow_i_to = arrows[i][1];
		x[i] = x1[arrow_i_to] - x1[arrow_i_from];
		y[i] = y1[arrow_i_to] - y1[arrow_i_from];
		z[i] = z1[arrow_i_to] - z1[arrow_i_from];
	}
	return result;
}

// ∂X
VectorField.edge_differential = function(field, grid, result) {
	result = result || VectorField.EdgeDataFrame(grid);

	var x1 = field.x;
	var y1 = field.y;
	var z1 = field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var edges = grid.edges;
	var edge_i_from = 0;
	var edge_i_to = 0;
	for (var i = 0, li = edges.length; i<li; i++) {
		edge_i_from = edges[i][0];
		edge_i_to = edges[i][1];
		x[i] = x1[edge_i_to] - x1[edge_i_from];
		y[i] = y1[edge_i_to] - y1[edge_i_from];
		z[i] = z1[edge_i_to] - z1[edge_i_from];
	}
	return result;
}

// f(x+∂x)⋅f(x)
//
// ok, this is a nonstandard operation but bear with me
// for every pair of neighboring vertices in a network, 
// this operation gives their measure of similarity (i.e. dot product)
// this is useful because you can perform a flood-fill 
// to find regions of the field with similar direction and magnitude
// ∇⋅X measures how much they come together or apart
// ∂⋅X measures how similar they are
// there is a relation between them: when ∂⋅X>0, ∇⋅X=0,
// but ∇⋅X encodes more information at the expense of performance
//
// Why call it ∂⋅X? 
// because I need a name for it
// if you took the measure of similarity between vertices, 
// and divided by their offset, you would get divergence.
// divergence is ∇⋅X and ∇=[∂/∂x,∂/∂y,∂/∂z], 
// so measure of similarity must be ∂⋅X
VectorField.edge_similarity = function(field, grid, result) {
	result = result || new Float32Array(grid.edges.length);

	var x = field.x;
	var y = field.y;
	var z = field.z;

	var edges = grid.edges;
	var edges_i_from = 0;
	var edges_i_to = 0;
	for (var i = 0, li = edges.length; i<li; i++) {
		edges_i_from = edges[i][0];
		edges_i_to = edges[i][1];
		result[i] = x[edges_i_to] * x[edges_i_from] + 
					y[edges_i_to] * y[edges_i_from] + 
					z[edges_i_to] * z[edges_i_from];
	}

	return result;
}

// f(X+∂X)⋅f(X)
VectorField.arrow_similarity = function(field, grid, result) {
	result = result || new Float32Array(grid.arrow.length);

	var x = field.x;
	var y = field.y;
	var z = field.z;

	var arrows = grid.arrows;
	var arrow_i_from = 0;
	var arrow_i_to = 0;
	for (var i = 0, li = arrows.length; i<li; i++) {
		arrow_i_from = arrows[i][0];
		arrow_i_to = arrows[i][1];
		result[i] = x[arrow_i_to] * x[arrow_i_from] + 
					y[arrow_i_to] * y[arrow_i_from] + 
					z[arrow_i_to] * z[arrow_i_from];
	}

	return result;
}

VectorField.edge_divergence = function(field, grid, result) {
	result = result || new Float32Array(grid.edges.length);

	var dpos = grid.pos_edge_differential;
	var dx = dpos.x;
	var dy = dpos.y;
	var dz = dpos.z;

	var x = field.x;
	var y = field.y;
	var z = field.z;

	var edges = grid.edges;
	var edges_i_from = 0;
	var edges_i_to = 0;
	for (var i = 0, li = edges.length; i<li; i++) {
		edges_i_from = edges[i][0];
		edges_i_to = edges[i][1];
		result[i] = ( x[edges_i_to] - x[edges_i_from] ) / dx[i] + 
					( y[edges_i_to] - y[edges_i_from] ) / dy[i] + 
					( z[edges_i_to] - z[edges_i_from] ) / dz[i];
	}

	return result;
}

VectorField.arrow_divergence = function(field, grid, result) {
	result = result || new Float32Array(grid.arrow.length);

	var dpos = grid.pos_arrow_differential;
	var dx = dpos.x;
	var dy = dpos.y;
	var dz = dpos.z;

	var x = field.x;
	var y = field.y;
	var z = field.z;

	var arrows = grid.arrows;
	var arrow_i_from = 0;
	var arrow_i_to = 0;
	for (var i = 0, li = arrows.length; i<li; i++) {
		arrow_i_from = arrows[i][0];
		arrow_i_to = arrows[i][1];
		result[i] = ( x[arrow_i_to] - x[arrow_i_from] ) / dx[i] + 
					( y[arrow_i_to] - y[arrow_i_from] ) / dy[i] + 
					( z[arrow_i_to] - z[arrow_i_from] ) / dz[i] ;
	}

	return result;
}