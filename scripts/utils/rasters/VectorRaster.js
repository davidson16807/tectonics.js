"use strict";
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

VectorRaster.copy = function(input, output) {
  var output = output || VectorRaster(input.grid);

  var ix = input.x;
  var iy = input.y;
  var iz = input.z;

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
VectorRaster.fill = function (value, output) {

  var ix = value.x;
  var iy = value.y;
  var iz = value.z;

  var ox = output.x;
  var oy = output.y;
  var oz = output.z;

  for (var i=0, li=ix.length; i<li; ++i) {
      ox[i] = ix[i];
      oy[i] = iy[i];
      oz[i] = iz[i];
  }
  return output;
};

VectorRaster.min_id = function (input) {
  var max = Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = input.x;
  var iy = input.y;
  var iz = input.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag < max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};

VectorRaster.max_id = function (field) {
  var max = -Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = input.x;
  var iy = input.y;
  var iz = input.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag > max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};