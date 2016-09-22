'use strict';

var Morphology = {};
Morphology.to_binary = function(field, threshold, result) {
	result = result || new Uint8Array(field.length);
	threshold = threshold || 0;

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i] > threshold)? 1:0;
	}

	return result;
}
Morphology.to_float = function(field, result) {
	result = result || new Float32Array(field.length);
	
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i]===1)? 1:0;
	}

	return result;
}
Morphology.copy = function(field, result) {
	result = result || new Uint8Array(field.length);
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = field[i];
	}
	return result;
}

Morphology.universal = function(field) {
	for (var i=0, li=field.length; i<li; ++i) {
	    field[i] = 1;
	}
}
Morphology.empty = function(field) {
	for (var i=0, li=field.length; i<li; ++i) {
	    field[i] = 0;
	}
}

Morphology.union = function(field1, field2, result) {
	result = result || new Uint8Array(field1.length);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 || field2[i]===1)? 1:0;
	}

	return result;
}

Morphology.intersection = function(field1, field2, result) {
	result = result || new Uint8Array(field1.length);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 && field2[i]===1)? 1:0;
	}

	return result;
}

Morphology.difference = function(field1, field2, result) {
	result = result || new Uint8Array(field1.length);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 && field2[i]===0)? 1:0;
	}

	return result;
}

Morphology.negation = function(field, result) {
	result = result || new Uint8Array(field1.length);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===0)? 1:0;
	}

	return result;
}

Morphology.dilation = function(field, grid, result) {
	result = result || new Uint8Array(field.length);

	var neighbor_lookup = grid.neighbor_lookup;
	var neighbors = [];
	var result_i = true;

	for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
	    neighbors = neighbor_lookup[i];
	    result_i = field[i];
	    for (var j=0, lj=neighbors.length; j<lj; ++j) {
	        result_i = result_i || field[neighbors[j]];
	    }
	    result[i] = result_i? 1:0;
	}

	return result;
}
Morphology.erosion = function(field, grid, result) {
	result = result || new Uint8Array(field.length);

	var neighbor_lookup = grid.neighbor_lookup;
	var neighbors = [];
	var result_i = true;

	for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
	    neighbors = neighbor_lookup[i];
	    result_i = field[i];
	    for (var j=0, lj=neighbors.length; j<lj; ++j) {
	        result_i = result_i && field[neighbors[j]];
	    }
	    result[i] = result_i? 1:0;
	}

	return result;
}
Morphology.opening = function(field, grid) {
	var result = Morphology.erosion(field, grid);
	result = Morphology.dilation(result, grid);
	return result;
}
Morphology.closing = function(field, grid) {
	var result = Morphology.dilation(field, grid);
	result = Morphology.erosion(result, grid);
	return result;	
}
