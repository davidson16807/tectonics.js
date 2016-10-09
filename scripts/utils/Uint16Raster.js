"use strict";
// Uint16Raster represents a grid where each cell contains a 16 bit integer
// A Uint16Raster is composed of two parts:
// 		The first is a object of type Grid, representing a collection of vertices that are connected by edges
//  	The second is a typed array, representing a value for each vertex within the grid
// 
// Uint16Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Uint16Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Uint16Raster class, operations on Uint16Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.

function Uint16Raster(grid, fill) {
  var result = new Uint16Array(grid.vertices.length);
  result.grid = grid;
  if (fill !== void 0) { 
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = fill;
    }
  }
  return result;
};
Uint16Raster.OfLength = function(length, grid) {
	var result = new Uint16Array(length);
	result.grid = grid;
	return result;
}
