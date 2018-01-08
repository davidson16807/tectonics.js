
// The VectorField namespace provides operations over mathematical vector fields.
// All fields are represented on raster objects, e.g. VectorRaster or Float32Raster
var VectorField = {};



VectorField.add_vector_field_term = function(vector_field1, vector_field2, scalar, result) {
	result = result || VectorRaster(vector_field1.grid);

	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_TYPE(scalar, number)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field1.x;
	var y1 = vector_field1.y;
	var z1 = vector_field1.z;

	var x2 = vector_field2.x;
	var y2 = vector_field2.y;
	var z2 = vector_field2.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar * x2[i];
	    y[i] = y1[i] + scalar * y2[i];
	    z[i] = z1[i] + scalar * z2[i];
	}

	return result;
};

VectorField.add_vector_field_term = function(vector_field1, vector_field2, scalar_field, result) {
	result = result || VectorRaster(vector_field1.grid);

	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_ANY_ARRAY(scalar_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field1.x;
	var y1 = vector_field1.y;
	var z1 = vector_field1.z;

	var x2 = vector_field2.x;
	var y2 = vector_field2.y;
	var z2 = vector_field2.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar_field[i] * x2[i];
	    y[i] = y1[i] + scalar_field[i] * y2[i];
	    z[i] = z1[i] + scalar_field[i] * z2[i];
	}

	return result;
};

VectorField.add_vector_field = function(vector_field1, vector_field2, result) {
	result = result || VectorRaster(vector_field1.grid);

	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field1.x;
	var y1 = vector_field1.y;
	var z1 = vector_field1.z;

	var x2 = vector_field2.x;
	var y2 = vector_field2.y;
	var z2 = vector_field2.z;

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

VectorField.sub_vector_field = function(vector_field1, vector_field2, result) {
	result = result || VectorRaster(vector_field1.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field1.x;
	var y1 = vector_field1.y;
	var z1 = vector_field1.z;

	var x2 = vector_field2.x;
	var y2 = vector_field2.y;
	var z2 = vector_field2.z;

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
VectorField.dot_vector_field = function(vector_field1, vector_field2, result) {
	result = result || Float32Raster(vector_field1.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_ARRAY(result, Float32Array)

	var x1 = vector_field1.x;
	var y1 = vector_field1.y;
	var z1 = vector_field1.z;

	var x2 = vector_field2.x;
	var y2 = vector_field2.y;
	var z2 = vector_field2.z;

	for (var i=0, li=x1.length; i<li; ++i) {
	    result[i] = x1[i] * x2[i] + 
	    			y1[i] * y2[i] + 
	    			z1[i] * z2[i];
	}

	return result;
};
VectorField.hadamard_vector_field = function(vector_field1, vector_field2, result) {
	result = result || VectorRaster(vector_field1.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field1.x;
	var y1 = vector_field1.y;
	var z1 = vector_field1.z;

	var x2 = vector_field2.x;
	var y2 = vector_field2.y;
	var z2 = vector_field2.z;

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
VectorField.cross_vector_field = function (vector_field1, vector_field2, result) {
	result = result || VectorRaster(vector_field1.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field1)
	ASSERT_IS_VECTOR_RASTER(vector_field2)
	ASSERT_IS_VECTOR_RASTER(result)
	
	var ax = vector_field1.x;
	var ay = vector_field1.y;
	var az = vector_field1.z;

	var bx = vector_field2.x;
	var by = vector_field2.y;
	var bz = vector_field2.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var axi = 0;
	var ayi = 0;
	var azi = 0;

	var bxi = 0;
	var byi = 0;
	var bzi = 0;

	for (var i = 0, li=x.length; i<li; ++i) {
		axi = ax[i];
		ayi = ay[i];
		azi = az[i];

		bxi = bx[i];
		byi = by[i];
		bzi = bz[i];

		x[i] = ayi*bzi - azi*byi;
		y[i] = azi*bxi - axi*bzi;
		z[i] = axi*byi - ayi*bxi;
	}

	return result;
}


VectorField.add_vector = function(vector_field, vector, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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

VectorField.sub_vector = function(vector_field, vector, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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
VectorField.dot_vector = function(vector_field, vector, result) {
	result = result || Float32Raster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(result, Float32Array)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

	var x2 = vector.x;
	var y2 = vector.y;
	var z2 = vector.z;

	for (var i=0, li=x1.length; i<li; ++i) {
	    result[i] = x1[i] * x2 + 
	    			y1[i] * y2 + 
	    			z1[i] * z2;
	}
	return result;
};
VectorField.hadamard_vector = function(vector_field, vector, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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
VectorField.cross_vector = function (vector_field, vector, result)  {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var ax = vector_field.x;
	var ay = vector_field.y;
	var az = vector_field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var axi = 0;
	var ayi = 0;
	var azi = 0;

	var bxi = vector.x;
	var byi = vector.y;
	var bzi = vector.z;

	for (var i = 0, li=x.length; i < li; ++i) {
		axi = ax[i];
		ayi = ay[i];
		azi = az[i];

		x[i] = ayi*bzi   -   azi*byi;
		y[i] = azi*bxi   -   axi*bzi;
		z[i] = axi*byi   -   ayi*bxi;
	}
	return result;
}

// NOTE: matrix is structured to match the output of THREE.Matrix3.toArray()
// i.e single array in column-major format
VectorField.mult_matrix = function (vector_field, matrix, result)  {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var ax = vector_field.x;
	var ay = vector_field.y;
	var az = vector_field.z;

	var xx = matrix[0];	var xy = matrix[3];	var xz = matrix[6];
	var yx = matrix[1];	var yy = matrix[4];	var yz = matrix[7];
	var zx = matrix[2];	var zy = matrix[5];	var zz = matrix[8];

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var axi = 0;
	var ayi = 0;
	var azi = 0;

	for (var i = 0, li=x.length; i < li; ++i) {
		axi = ax[i];
		ayi = ay[i];
		azi = az[i];

		x[i] = axi * xx    + ayi * xy     + azi * xz     ;
		y[i] = axi * yx    + ayi * yy     + azi * yz     ;
		z[i] = axi * zx    + ayi * zy     + azi * zz     ;
	}

	return result;
}

VectorField.add_scalar_field = function(vector_field, scalar_field, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(scalar_field, Float32Array)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] + scalar_field[i];
	    y[i] = y1[i] + scalar_field[i];
	    z[i] = z1[i] + scalar_field[i];
	}

	return result;
};
VectorField.sub_scalar_field = function(vector_field, scalar_field, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(scalar_field, Float32Array)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] - scalar_field[i];
	    y[i] = y1[i] - scalar_field[i];
	    z[i] = z1[i] - scalar_field[i];
	}

	return result;
};
VectorField.mult_scalar_field = function(vector_field, scalar_field, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(scalar_field, Float32Array)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] * scalar_field[i];
	    y[i] = y1[i] * scalar_field[i];
	    z[i] = z1[i] * scalar_field[i];
	}

	return result;
};
VectorField.div_scalar_field = function(vector_field, scalar_field, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(scalar_field, Float32Array)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	for (var i=0, li=x.length; i<li; ++i) {
	    x[i] = x1[i] / scalar_field[i];
	    y[i] = y1[i] / scalar_field[i];
	    z[i] = z1[i] / scalar_field[i];
	}

	return result;
};


VectorField.add_scalar = function(vector_field, scalar, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_TYPE(scalar, number)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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
VectorField.sub_scalar = function(vector_field, scalar, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_TYPE(scalar, number)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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
VectorField.mult_scalar = function(vector_field, scalar, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_TYPE(scalar, number)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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
VectorField.div_scalar = function(vector_field, scalar, result) {
	result = result || VectorRaster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_TYPE(scalar, number)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

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

VectorField.map = function(vector_field, fn, result) {
	result = result || Float32Raster(vector_field.grid)
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(result, Float32Array)

	var x = vector_field.x;
	var y = vector_field.y;
	var z = vector_field.z;

	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] = fn(x[i], y[i], z[i]);
	}
	return result;
};


VectorField.magnitude = function(vector_field, result) {
	result = result || Float32Raster(vector_field.grid);

	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(result, Float32Array)

	var x = vector_field.x;
	var y = vector_field.y;
	var z = vector_field.z;

	var xi=0, yi=0, zi=0;
	var sqrt = Math.sqrt;
	for (var i = 0, li = result.length; i<li; i++) {
		var xi = x[i];
		var yi = y[i];
		var zi = z[i];
		result[i] = sqrt(	xi * xi + 
							yi * yi + 
							zi * zi	  );
	}
	return result;
}

VectorField.normalize = function(vector_field, result) {
	result = result || VectorRaster(vector_field.grid);

	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var x = vector_field.x;
	var y = vector_field.y;
	var z = vector_field.z;

	var ox = result.x;
	var oy = result.y;
	var oz = result.z;

	var xi=0., yi=0., zi=0.;
	var sqrt = Math.sqrt;
	var mag = 0.;
	for (var i = 0, li = x.length; i<li; i++) {
		var xi = x[i];
		var yi = y[i];
		var zi = z[i];
		mag = sqrt(	xi * xi + 
					yi * yi + 
					zi * zi	  );
		ox[i] = xi/(mag||1);
		oy[i] = yi/(mag||1);
		oz[i] = zi/(mag||1);
	}
	return result;
}

// ∂X
// NOTE: should arrow_differential exist at all? 
// Consider moving its code to grid
VectorField.arrow_differential = function(vector_field, result) {
	result = result || VectorRaster.OfLength(vector_field.grid.arrows.length, undefined);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_VECTOR_RASTER(result)

	var x1 = vector_field.x;
	var y1 = vector_field.y;
	var z1 = vector_field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var arrows = vector_field.grid.arrows;
	var from = 0;
	var to = 0;
	for (var i = 0, li = arrows.length; i<li; i++) {
		from = arrows[i][0];
		to = arrows[i][1];
		x[i] = x1[to] - x1[from];
		y[i] = y1[to] - y1[from];
		z[i] = z1[to] - z1[from];
	}
	return result;
}
// This function computes the divergence of a 3d mesh. 
// The divergence can be thought of as the amount by which vectors diverge around a point
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// This implementation does not have to assume all vertices are equidistant. 
// 
// So for 2d: 
//  ∇⋅f = (fx(x+dx) - fx(x-dx)) / 2dx + 
//        (fy(x+dy) - fy(x-dy)) / 2dy  
//
//  ∇⋅f =  1/2 (fx(x+dx) - fx(x-dx)) / dx + 
//         1/2 (fy(x+dy) - fy(x-dy)) / dy  
//
// Think of it as taking the average change in projection:
// For each neighbor:
//   draw a vector to the neighbor
//   find the projection between that vector and the field, 
//   find how the projection changes along that vector
//   find the average change across all neighbors
VectorField.divergence = function(vector_field, result) {
	result = result || Float32Raster(vector_field.grid);
	
	ASSERT_IS_VECTOR_RASTER(vector_field)
	ASSERT_IS_ARRAY(result, Float32Array)

	var dlength = vector_field.grid.pos_arrow_distances;

	var arrows = vector_field.grid.arrows;

	var x = vector_field.x;
	var y = vector_field.y;
	var z = vector_field.z;

	var arrow_pos_diff_normalized = vector_field.grid.pos_arrow_differential_normalized;
	var dxhat = arrow_pos_diff_normalized.x;
	var dyhat = arrow_pos_diff_normalized.y;
	var dzhat = arrow_pos_diff_normalized.z;

	var from = 0;
	var to = 0;
	Float32Raster.fill(result, 0);
	for (var i = 0, li = arrows.length; i<li; i++) {
		from = arrows[i][0];
		to = arrows[i][1];

        result[from] += 
		  ( (x[to] - x[from]) * dxhat[i]   
		   +(y[to] - y[from]) * dyhat[i]   
		   +(z[to] - z[from]) * dzhat[i]) / dlength[i];
	}

	var neighbor_count = vector_field.grid.neighbor_count;
	var average_distance = vector_field.grid.average_distance;
	for (var i = 0, li = neighbor_count.length; i < li; i++) {
		result[i] /= (neighbor_count[i] || 1);
	}

	return result;
}
