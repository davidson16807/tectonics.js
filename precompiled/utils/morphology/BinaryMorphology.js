
var BinaryMorphology = {};
BinaryMorphology.VertexTypedArray = function(grid) {

	var result = new Uint8Array(grid.vertices.length);
	result.grid = grid;
	return result;
}
BinaryMorphology.to_binary = function(field, threshold, result) {
	result = result || Uint8Raster(field.grid);
	threshold = threshold || 0;

	ASSERT_IS_ARRAY(field, Uint8Array);
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i] > threshold)? 1:0;
	}

	return result;
}
BinaryMorphology.to_float = function(field, result) {
	result = result || new Float32Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array)
	ASSERT_IS_ARRAY(result, Float32Array)
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i]===1)? 1:0;
	}

	return result;
}
BinaryMorphology.copy = function(field, result) {
	result = result || Uint8Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);
	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = field[i];
	}
	return result;
}

BinaryMorphology.universal = function(field) {
	ASSERT_IS_ARRAY(field, Uint8Array);
	for (var i=0, li=field.length; i<li; ++i) {
	    field[i] = 1;
	}
}
BinaryMorphology.empty = function(field) {
	ASSERT_IS_ARRAY(field, Uint8Array);
	for (var i=0, li=field.length; i<li; ++i) {
	    field[i] = 0;
	}
}

BinaryMorphology.union = function(field1, field2, result) {

	result = result || Uint8Raster(field1.grid);
	ASSERT_IS_ARRAY(field1, Uint8Array);
	ASSERT_IS_ARRAY(field2, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);
	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 || field2[i]===1)? 1:0;
	}

	return result;
}

BinaryMorphology.intersection = function(field1, field2, result) {
	result = result || Uint8Raster(field1.grid);
	ASSERT_IS_ARRAY(field1, Uint8Array);
	ASSERT_IS_ARRAY(field2, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);

	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 && field2[i]===1)? 1:0;
	}

	return result;
}

BinaryMorphology.difference = function(field1, field2, result) {
	result = result || Uint8Raster(field1.grid);
	ASSERT_IS_ARRAY(field1, Uint8Array);
	ASSERT_IS_ARRAY(field2, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);


	for (var i=0, li=field1.length; i<li; ++i) {
	    result[i] = (field1[i]===1 && field2[i]===0)? 1:0;
	}

	return result;
}

BinaryMorphology.negation = function(field, result) {
	result = result || Uint8Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);


	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = (field[i]===0)? 1:0;
	}

	return result;
}

BinaryMorphology.dilation = function(field, radius, result, scratch) {
	radius = radius || 1;
	result = result || Uint8Raster(field.grid);
	scratch = scratch || Uint8Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);
	var buffer1 = radius % 2 == 1? result: 				scratch;
	var buffer2 = radius % 2 == 0? result: 				scratch;
	BinaryMorphology.copy(field, scratch);
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
BinaryMorphology.erosion = function(field, radius, result, scratch) {
	radius = radius || 1;
	result = result || Uint8Raster(field.grid);
	scratch = scratch || Uint8Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);
	var buffer1 = radius % 2 == 1? result: 				scratch;
	var buffer2 = radius % 2 == 0? result: 				scratch;
	BinaryMorphology.copy(field, scratch);
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



// NOTE: this is not a standard concept in math morphology
// It is meant to represent the difference between a figure and its dilation
// Its name eludes to the "margin" concept within the html box model
BinaryMorphology.margin = function(field, radius, result) {
	result = result || Uint8Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);
	if(field === result) throw ("cannot use same input for 'field' and 'result' - margin() is not an in-place function")
	var dilation = result; // reuse result raster for performance reasons
	BinaryMorphology.dilation(field, radius, dilation);
	return BinaryMorphology.difference(dilation, field, result);
}
// NOTE: this is not a standard concept in math morphology
// It is meant to represent the difference between a figure and its erosion
// Its name eludes to the "padding" concept within the html box model
BinaryMorphology.padding = function(field, radius, result, scratch) {
	result = result || Uint8Raster(field.grid);
	ASSERT_IS_ARRAY(field, Uint8Array);
	ASSERT_IS_ARRAY(result, Uint8Array);
	if(field === result) throw ("cannot use same input for 'field' and 'result' - padding() is not an in-place function")
	var erosion = result; // reuse result raster for performance reasons
	BinaryMorphology.erosion(field, radius, erosion);
	return BinaryMorphology.difference(field, erosion, result, scratch);
}