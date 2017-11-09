
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
Vector.cross = function(ax, ay, az, bx, by, bz) { 
  var x = ay*bz   -   az*by; 
  var y = az*bx   -   ax*bz; 
  var z = ax*by   -   ay*bx; 
  return {x:x,y:y,z:z}; 
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