
// Float32Raster represents a grid where each cell contains a 32 bit floating point value
// A Float32Raster is composed of two parts:
// 		The first is a object of type Grid, representing a collection of vertices that are connected by edges
//  	The second is a typed array, representing a value for each vertex within the grid
// 
// Float32Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Float32Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Float32Raster class, operations on Float32Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.

function Float32Raster(grid, fill) {
	var result = new Float32Array(grid.vertices.length);
	result.grid = grid;
	if (fill !== void 0) { 
    result.fill(fill);
	}
	return result;
};
Float32Raster.FromExample = function(raster) {
  var length = 0; 
  if (raster instanceof Float32Array) { 
    length = raster.length; 
  } else if(raster !== void 0 && raster.x instanceof Float32Array) { 
    length = raster.x.length; 
  } else { 
    throw 'must supply a vector or scalar raster' 
  } 
  var result = new Float32Array(length);
  result.grid = raster.grid;
  return result;
}
Float32Raster.OfLength = function(length, grid) {
  var result = new Float32Array(length);
  result.grid = grid;
  return result;
}
Float32Raster.FromBuffer = function(buffer, grid, start) {
  start = start || 0;
  var result = new Float32Array(buffer, start, grid.vertices.length);
  result.grid = grid;
  return result;
}
Float32Raster.FromArray = function(array, grid) {
  var result = new Float32Array(array);
  result.grid = grid;
  return result;
}
Float32Raster.FromUint8Raster = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
  ASSERT_IS_ARRAY(raster, Uint8Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.FromUint16Raster = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
  ASSERT_IS_ARRAY(raster, Uint16Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.copy = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
  ASSERT_IS_ARRAY(raster, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  result.set(raster);
  return result;
}
Float32Raster.fill = function (raster, value) {
  raster = raster || Float32Raster.FromExample(raster);
  ASSERT_IS_ARRAY(raster, Float32Array)
  raster.fill(value);
  return raster;
};

Float32Raster.min_id = function (raster) {
  ASSERT_IS_ARRAY(raster, Float32Array)
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};

Float32Raster.max_id = function (raster) {
  ASSERT_IS_ARRAY(raster, Float32Array)
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};

Float32Raster.get_nearest_value = function(raster, pos) {
  ASSERT_IS_ARRAY(raster, Float32Array)
  return raster[raster.grid.getNearestId(pos)];
}
Float32Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Float32Raster(pos_raster.grid);
  ASSERT_IS_ARRAY(value_raster, Float32Array)
  ASSERT_IS_VECTOR_RASTER(pos_raster)
  ASSERT_IS_ARRAY(result, Float32Array)
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Float32Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Float32Raster(id_array.grid) : Float32Array(id_array.length));
  ASSERT_IS_ARRAY(value_raster, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Float32Raster.get_mask = function(raster, mask) {
  ASSERT_IS_ARRAY(raster, Float32Array)
  ASSERT_IS_ARRAY(mask, Uint8Array)
  var result = new Float32Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Float32Raster.set_ids_to_value = function(raster, id_array, value) {
  ASSERT_IS_ARRAY(raster, Float32Array)
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Float32Raster.set_ids_to_values = function(raster, id_array, value_array) {
  ASSERT_IS_ARRAY(raster, Float32Array)
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}

// example: Float32Raster.add_values_to_ids(local, local_ids_of_global_cells, global, local);
// NOTE: this differs from set_ids_to_values - 
//   in the event an id is mentioned twice in id_array, add_values_to_ids will add those values together
Float32Raster.add_values_to_ids = function(raster1, id_array, raster2, result) {
  if (raster1 !== result) {
    Float32Raster.copy(raster1, result);
  }
  
  var id_array_i = 0;
  for (var i=0, li=raster2.length; i<li; ++i) {
    id_array_i = id_array[i];
    result[id_array_i] = result[id_array_i] + raster2[i];
  }
  return result;
}


