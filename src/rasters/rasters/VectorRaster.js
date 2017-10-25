
// NOTE: vectors are always represented using independant xyz params where possible,
// This is done for performance reasons.
// Vectors are represented as object when returned from functions, instead of lists.
// This is done for clarity.
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

// NOTE: matrices are always represented as column-major order list
// Lists are used instead of params because performance gain is negligible for our purposes
// This is done to match standards with Three.js
var Matrix = {};
Matrix.row_major_order = function(list) {

  var xx = list[0]; var xy = list[1]; var xz = list[2];
  var yx = list[3]; var yy = list[4]; var yz = list[5];
  var zx = list[6]; var zy = list[7]; var zz = list[8];

  result = [];
  result[0] = xx; result[4] = xy; result[8] = xz;
  result[1] = yx; result[5] = yy; result[9] = yz;
  result[2] = zx; result[6] = zy; result[10]= zz;

  return result;
}
Matrix.column_major_order = function(list) {
  return list; //matrices are standardized to column major order, already
}
Matrix.rotation_about_axis = function(axis_x, axis_y, axis_z, angle) {
  var θ = angle,
      cθ = Math.cos(θ),
      sθ = Math.sin(θ),
      vθ = 1 - cθ,      // aka versine of θ
      x = axis_x,
      y = axis_y,
      z = axis_z,
      vθx = vθ*x,
      vθy = vθ*y;
  return [
    vθx*x+cθ,   vθx*y+sθ*z, vθx*z-sθ*y, 
    vθx*y-sθ*z, vθy*y+cθ,   vθy*z+sθ*x,  
    vθx*z+sθ*y, vθy*z-sθ*x, vθ*z*z+cθ
  ];
}
Matrix.mult_matrix = function(ae, be, te) {
  te = te || [];

  var a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
  var a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
  var a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

  var b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
  var b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
  var b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

  te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
  te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
  te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

  te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
  te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
  te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

  te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
  te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
  te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

  return te;
}

// VectorRaster represents a grid where each cell contains a vector value. It is a specific kind of a multibanded raster.
// A VectorRaster is composed of two parts
// 		The first is a object of type Grid, representing a collection of vertices that are connected by edges
//  	The second is a structure of arrays (SoA), representing a vector for each vertex within the grid. 
// 
// VectorRaster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// VectorRasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that can be performed on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the VectorRaster class, operations on VectorRasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.

function VectorRaster(grid) {
	var length = grid.vertices.length;
	var result = {
		x: new Float32Array(length),
		y: new Float32Array(length),
		z: new Float32Array(length),
		grid: grid
	};
	return result;
}
VectorRaster.OfLength = function(length, grid) {
	var result = {
		x: new Float32Array(length),
		y: new Float32Array(length),
		z: new Float32Array(length),
		grid: grid
	};	
	return result;
}
VectorRaster.FromVectors = function(vectors, grid) {
	var result = VectorRaster.OfLength(vectors.length, grid);
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

VectorRaster.copy = function(vector_raster, output) {
  var output = output || VectorRaster(vector_raster.grid);
  ASSERT_IS_VECTOR_RASTER(vector_raster)
  ASSERT_IS_VECTOR_RASTER(output)

  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;

  var ox = output.x;
  var oy = output.y;
  var oz = output.z;

  for (var i=0, li=ix.length; i<li; ++i) {
      ox[i] = ix[i];
      oy[i] = iy[i];
      oz[i] = iz[i];
  }
  return output;
}
VectorRaster.fill = function (vector_raster, value) {
  ASSERT_IS_VECTOR_RASTER(vector_raster)

  var ix = value.x;
  var iy = value.y;
  var iz = value.z;

  var ox = vector_raster.x;
  var oy = vector_raster.y;
  var oz = vector_raster.z;

  for (var i=0, li=ox.length; i<li; ++i) {
      ox[i] = ix;
      oy[i] = iy;
      oz[i] = iz;
  }
  return vector_raster;
};

VectorRaster.min_id = function (vector_raster) {
  ASSERT_IS_VECTOR_RASTER(vector_raster)
  var max = Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag < max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};

VectorRaster.max_id = function (vector_raster) {
  ASSERT_IS_VECTOR_RASTER(vector_raster)
  var max = -Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag > max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};

VectorRaster.get_nearest_value = function(value_raster, pos) {
  ASSERT_IS_VECTOR_RASTER(value_raster)
	var id = value_raster.grid.getNearestId(pos);
	return {x: value_raster.x[id], y: value_raster.y[id], z: value_raster.z[id]};
}
VectorRaster.get_nearest_values = function(value_raster, pos_raster, result) {
	result = result || VectorRaster(pos_raster.grid);
  ASSERT_IS_VECTOR_RASTER(vector_raster)
  ASSERT_IS_VECTOR_RASTER(pos_raster)
  ASSERT_IS_VECTOR_RASTER(result)
	var ids = pos_raster.grid.getNearestIds(pos_raster);

  var ix = value_raster.x; 
  var iy = value_raster.y; 
  var iz = value_raster.z; 

	var ox = result.x;
	var oy = result.y;
	var oz = result.z;

	for (var i=0, li=ids.length; i<li; ++i) {
		ox[i] = ix[ids[i]];
		oy[i] = iy[ids[i]];
		oz[i] = iz[ids[i]];
	}
	
	return result;
}