
#ifndef STRICT
#define STRICT
'use strict';
#endif

// Uint8Raster represents a grid where each cell contains a 8 bit integer
// A Uint8Raster is composed of two parts:
// 		The first is a object of type Grid, representing a collection of vertices that are connected by edges
//  	The second is a typed array, representing a value for each vertex within the grid
// 
// Uint8Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Uint8Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Uint8Raster class, operations on Uint8Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.

function Uint8Raster(grid, fill) {
  var result = new Uint8Array(grid.vertices.length);
  result.grid = grid;
  if (fill !== void 0) { 
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = fill;
    }
  }
  return result;
};
Uint8Raster.OfLength = function(length, grid) {
	var result = new Uint8Array(length);
	result.grid = grid;
	return result;
}
Uint8Raster.FromFloat32Raster = function(raster) {
  var result = Uint8Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i] | 0;
  }
  return result;
}
Uint8Raster.FromUint16Raster = function(raster) {
  var result = Uint8Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}

Uint8Raster.copy = function(field, result) {
  var result = result || Uint8Raster(field.grid);
  for (var i=0, li=field.length; i<li; ++i) {
      result[i] = field[i];
  }
  return result;
}
Uint8Raster.fill = function (field, value) {
  for (var i = 0, li = field.length; i < li; i++) {
    field[i] = value;
  }
};

Uint8Raster.min_id = function (field) {
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = field.length; i < li; i++) {
    value = field[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};

Uint8Raster.max_id = function (field) {
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = field.length; i < li; i++) {
    value = field[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};


Uint8Raster.get_nearest_value = function(field, pos) {
  return field[field.grid.getNearestId(pos)];
}

Uint8Raster.get_nearest_values = function(value_field, pos_field, result) {
  result = result || Uint8Raster(pos_field.grid);
  var ids = pos_field.grid.getNearestIds(pos_field);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_field[ids[i]];
  }
  return result;
}
Uint8Raster.get_id = function(field, id) {
  return field[id];
}
Uint8Raster.get_ids = function(value_field, id_raster, result) {
  result = result || Uint8Raster(id_raster.grid);
  for (var i=0, li=id_raster.length; i<li; ++i) {
      result[i] = value_field[id_raster[i]];
  }
  return result;
}
