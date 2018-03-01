
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
  return VectorRaster.OfLength(grid.vertices.length, grid);
}
VectorRaster.OfLength = function(length, grid) {
  var buffer = new ArrayBuffer(3 * Float32Array.BYTES_PER_ELEMENT * length);

  return {
    x: new Float32Array(buffer, 0 * Float32Array.BYTES_PER_ELEMENT * length, length),
    y: new Float32Array(buffer, 1 * Float32Array.BYTES_PER_ELEMENT * length, length),
    z: new Float32Array(buffer, 2 * Float32Array.BYTES_PER_ELEMENT * length, length),
    everything: new Float32Array(buffer),
    grid: grid
  };
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
  output.everything.set(vector_raster.everything);
  return output;
}
VectorRaster.fill = function (vector_raster, value) {
  ASSERT_IS_VECTOR_RASTER(vector_raster)

  vector_raster.x.fill(value.x);
  vector_raster.y.fill(value.y);
  vector_raster.z.fill(value.z);
  
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
