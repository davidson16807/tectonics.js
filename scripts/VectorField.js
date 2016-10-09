'use strict';

// The VectorField namespace provides operations over mathematical vector fields.
// All fields are represented on raster objects, e.g. VectorRaster or Float32Raster
var VectorField = {};


VectorField.sum = function (field) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

    for (var i=0, li=field.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }

    return {x:sum_x, y:sum_y, z:sum_z};
};
VectorField.average = function (field) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

    for (var i=0, li=field.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    
    return {
		x:sum_x / field.length, 
		y:sum_y / field.length, 
		z:sum_z / field.length
	};
};
VectorField.weighted_average = function (field, weights) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

	var weight_sum = 0;

    for (var i=0, li=weights.length; i<li; ++i) {
        sum_x += x[i] * weights[i];
        sum_y += y[i] * weights[i];
        sum_z += z[i] * weights[i];
      	weight_sum += weights[i];
    }
    
    return {
		x:sum_x / weight_sum, 
		y:sum_y / weight_sum, 
		z:sum_z / weight_sum
	};
};


VectorField.add_vector_field_term = function(field1, field2, scalar, result) {
	result = result || VectorRaster(field1.grid);

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
	    x[i] = x1[i] + scalar * x2[i];
	    y[i] = y1[i] + scalar * y2[i];
	    z[i] = z1[i] + scalar * z2[i];
	}

	return result;
};

VectorField.add_vector_field = function(field1, field2, result) {
	result = result || VectorRaster(field1.grid);

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
	result = result || VectorRaster(field1.grid);

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
	result = result || Float32Raster(field1.grid);

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
	result = result || VectorRaster(field1.grid);

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
VectorField.cross_vector_field = function (field1, field2, result) {
	result = result || VectorRaster(field1.grid);
	
	var ax = field1.x;
	var ay = field1.y;
	var az = field1.z;

	var bx = field2.x;
	var by = field2.y;
	var bz = field2.z;

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


VectorField.add_vector = function(field1, vector, result) {
	result = result || VectorRaster(field1.grid);

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
	result = result || VectorRaster(field1.grid);

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
	result = result || Float32Raster(field1.grid);

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
	result = result || VectorRaster(field1.grid);

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
VectorField.cross_vector = function (field, constant, result)  {
	result = result || VectorRaster(field.grid);

	var ax = field.x;
	var ay = field.y;
	var az = field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var axi = 0;
	var ayi = 0;
	var azi = 0;

	var bxi = constant.x;
	var byi = constant.y;
	var bzi = constant.z;

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
VectorField.mult_matrix = function (field, matrix, result)  {
	result = result || VectorRaster(field.grid);

	var ax = field.x;
	var ay = field.y;
	var az = field.z;

	var xx = matrix[0];	var xy = matrix[4];	var xz = matrix[8];
	var yx = matrix[1];	var yy = matrix[5];	var yz = matrix[9];
	var zx = matrix[2];	var zy = matrix[6];	var zz = matrix[10];

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

VectorField.add_scalar_field = function(vector, scalar, result) {
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || VectorRaster(vector.grid);

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
	result = result || Float32Raster(field.grid)

	var x = field.x;
	var y = field.y;
	var z = field.z;

	for (var i = field_value.length - 1; i >= 0; i--) {
		this_value[i] = fn(x[i], y[i], z[i]);
	}
	return result;
};


VectorField.magnitude = function(field, result) {
	result = result || Float32Raster(field.grid);

	var x = field.x;
	var y = field.y;
	var z = field.z;

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

// ∂X
VectorField.arrow_differential = function(field, result) {
	result = result || VectorRaster.OfLength(field.grid.arrows.length, field.grid);

	var x1 = field.x;
	var y1 = field.y;
	var z1 = field.z;

	var x = result.x;
	var y = result.y;
	var z = result.z;

	var arrows = field.grid.arrows;
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

VectorField.divergence = function(field, result) {
	result = result || Float32Raster(field.grid);

	var dpos = field.grid.pos_arrow_differential;
	var dx = dpos.x;
	var dy = dpos.y;
	var dz = dpos.z;

	var arrows = field.grid.arrows;
	var arrow_i_from = 0;
	var arrow_i_to = 0;

	var x = field.x;
	var y = field.y;
	var z = field.z;
	
	for (var i = 0, li = arrows.length; i<li; i++) {
		arrow_i_from = arrows[i][0];
		arrow_i_to = arrows[i][1];
		result[arrow_i_from] += ( x[arrow_i_to] - x[arrow_i_from] ) / dx[i] + 
					 			( y[arrow_i_to] - y[arrow_i_from] ) / dy[i] + 
					 			( z[arrow_i_to] - z[arrow_i_from] ) / dz[i] ;
	}

	var neighbor_lookup = field.grid.neighbor_lookup;
	for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
		result[i] /= neighbor_lookup[i].length || 1;
	}

	return result;
}

var Vector = {};
Vector.similarity = function(ax, ay, az, bx, by, bz) {
	var sqrt = Math.sqrt;
	return (ax*bx + 
			ay*by + 
			az*bz)   /   ( sqrt(ax*ax+
								ay*ay+
								az*az)   *   sqrt(bx*bx+
											  	  by*by+
											  	  bz*bz) );
}
Vector.dot = function(ax, ay, az, bx, by, bz) {
	var sqrt = Math.sqrt;
	return (ax*bx + ay*by + az*bz);
}
Vector.magnitude = function(x, y, z) {
	return Math.sqrt(x*x + y*y + z*z);
}
VectorField.flood_fill = function function_name(field, start_id, mask, result) {
	result = result || Uint8Raster(field.grid, 0);

	var neighbor_lookup = field.grid.neighbor_lookup;
	var similarity = Vector.similarity;
	var magnitude = Vector.magnitude;

	var x = field.x;
	var y = field.y;
	var z = field.z;

	var searching = [start_id];
	var searched = Uint8Raster(field.grid, 0);
	var grouped  = result;

	searched[start_id] = 1;

	var id = 0;
	var neighbor_id = 0;
	var neighbors = [];
	var is_similar = 0;
	var threshold = Math.cos(Math.PI * 60/180);
	while(searching.length > 0){
		id = searching.shift();

		is_similar = similarity (x[id], 		y[id], 		z[id], 
								 x[start_id],	y[start_id],	z[start_id]) > threshold;
		if (is_similar) {
			grouped[id] = 1;

			neighbors = neighbor_lookup[id];
			for (var i=0, li=neighbors.length; i<li; ++i) {
			    neighbor_id = neighbors[i];
			    if (searched[neighbor_id] === 0 && mask[id] != 0) {
			    	searching.push(neighbor_id);
			    	searched[neighbor_id] = 1;
			    }
			}
		}
	}

	return result;
}

