'use strict';

var BinaryMorphology = {};
BinaryMorphology.VertexTypedArray = function(grid) {
	var result = new Uint8Array(grid.vertices.length);
	result.grid = grid;
	return result;
}
BinaryMorphology.to_binary = function(field, threshold, result) {
	result = result || Uint8Raster(field.grid);
	threshold = threshold || 0;

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i] > threshold)? 1:0;
	}

	return result;
}
BinaryMorphology.to_float = function(field, result) {
	result = result || new Float32Array(field.length);
	
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i]===1)? 1:0;
	}

	return result;
}
BinaryMorphology.copy = function(field, result) {
	result = result || Uint8Raster(field.grid);
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = field[i];
	}
	return result;
}

BinaryMorphology.universal = function(field) {
	for (var i=0, li=field.length; i<li; ++i) {
	    field[i] = 1;
	}
}
BinaryMorphology.empty = function(field) {
	for (var i=0, li=field.length; i<li; ++i) {
	    field[i] = 0;
	}
}

BinaryMorphology.union = function(field1, field2, result) {
	result = result || Uint8Raster(field1.grid);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 || field2[i]===1)? 1:0;
	}

	return result;
}

BinaryMorphology.intersection = function(field1, field2, result) {
	result = result || Uint8Raster(field1.grid);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 && field2[i]===1)? 1:0;
	}

	return result;
}

BinaryMorphology.difference = function(field1, field2, result) {
	result = result || Uint8Raster(field1.grid);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 && field2[i]===0)? 1:0;
	}

	return result;
}

BinaryMorphology.negation = function(field, result) {
	result = result || Uint8Raster(field1.grid);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===0)? 1:0;
	}

	return result;
}

BinaryMorphology.dilation = function(field, radius, result) {
	radius = radius || 1;
	result = result || Uint8Raster(field.grid);
	var buffer1 = radius % 2 == 1? result: 				Uint8Raster(field.grid);
	var buffer2 = radius % 2 == 0? result: 				BinaryMorphology.copy(field);
	var temp = buffer1;

	var neighbor_lookup = field.grid.neighbor_lookup;
	var neighbors = [];
	var buffer_i = true;

	for (var k=0; k<radius; ++k) {
		for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
		    neighbors = neighbor_lookup[i];
		    buffer_i = buffer2[i];
		    for (var j=0, lj=neighbors.length; j<lj; ++j) {
		        buffer_i = buffer_i || buffer2[neighbors[j]];
		    }
		    buffer1[i] = buffer_i? 1:0;
		}
		temp = buffer1;
		buffer1 = buffer2;
		buffer2 = temp;
	}

	return buffer2;
}
BinaryMorphology.erosion = function(field, radius, result) {
	radius = radius || 1;
	result = result || Uint8Raster(field.grid);
	var buffer1 = radius % 2 == 1? result: 				Uint8Raster(field.grid);
	var buffer2 = radius % 2 == 0? result: 				BinaryMorphology.copy(field);
	var temp = buffer1;

	var neighbor_lookup = field.grid.neighbor_lookup;
	var neighbors = [];
	var buffer_i = true;

	for (var k=0; k<radius; ++k) {
		for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
		    neighbors = neighbor_lookup[i];
		    buffer_i = buffer2[i];
		    for (var j=0, lj=neighbors.length; j<lj; ++j) {
		        buffer_i = buffer_i && buffer2[neighbors[j]];
		    }
		    buffer1[i] = buffer_i? 1:0;
		}
		temp = buffer1;
		buffer1 = buffer2;
		buffer2 = temp;
	}

	return buffer2;
}
BinaryMorphology.opening = function(field, radius) {
	var result = BinaryMorphology.erosion(field, radius);
	return BinaryMorphology.dilation(result, radius);
}
BinaryMorphology.closing = function(field, radius) {
	var result = BinaryMorphology.dilation(field, radius);
	return BinaryMorphology.erosion(result, radius);
}
BinaryMorphology.white_top_hat = function(field, radius) {
	var closing = BinaryMorphology.closing(field, radius);
	return BinaryMorphology.difference(closing, field);
}
BinaryMorphology.black_top_hat = function(field, radius) {
	var opening = BinaryMorphology.opening(field, radius);
	return BinaryMorphology.difference(field, opening);
}
