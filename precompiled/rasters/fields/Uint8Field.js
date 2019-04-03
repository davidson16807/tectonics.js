
// The Uint8Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Field = {};

Uint8Field.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint8Field.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint8Field.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.ne_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint8Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar_field2[i]? 1:0;
  }
  return result;
};


Uint8Field.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint8Field.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint8Field.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
Uint8Field.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint8Field.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
Uint8Field.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint8Field.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
Uint8Field.ne_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar? 1:0;
  }
  return result;
};

Uint8Field.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
Uint8Field.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
Uint8Field.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint8Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
Uint8Field.add_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
Uint8Field.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
Uint8Field.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
Uint8Field.div_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Uint8Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
Uint8Field.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Uint8Array)
  ASSERT_IS_VECTOR_RASTER(result)

  var ix = vector.x;
  var iy = vector.y;
  var iz = vector.z;

  var ox = result.x;
  var oy = result.y;
  var oz = result.z;

  for (var i = 0, li = scalar_field.length; i < li; i++) {
    ox[i] = scalar_field[i] * ix;
    oy[i] = scalar_field[i] * iy;
    oz[i] = scalar_field[i] * iz;
  }
  return result;
};
Uint8Field.gradient = function (scalar_field, result) {
  result = result || VectorRaster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Uint8Array)
  ASSERT_IS_VECTOR_RASTER(result)

  var grid = scalar_field.grid;
  var pos = grid.pos; 
  var ix = pos.x; 
  var iy = pos.y; 
  var iz = pos.z; 
  var dpos_hat = grid.pos_arrow_differential_normalized; 
  var dxhat = dpos_hat.x; 
  var dyhat = dpos_hat.y; 
  var dzhat = dpos_hat.z; 
  var dpos = grid.pos_arrow_differential; 
  var dx = dpos.x; 
  var dy = dpos.y; 
  var dz = dpos.z; 
  var arrows = grid.arrows; 
  var arrow = []; 
  var dlength = grid.pos_arrow_distances; 
  var neighbor_count = grid.neighbor_count; 
  var x = result.x; 
  var y = result.y; 
  var z = result.z; 
  var arrow_distance = 0; 
  var average_distance = grid.average_distance; 
  var slope = 0; 
  var slope_magnitude = 0; 
  var from = 0; 
  var to = 0; 
  var max_slope_from = 0; 
  var PI = Math.PI; 
  //
  // NOTE: 
  // The naive implementation is to estimate the gradient based on each individual neighbor,
  //  then take the average between the estimates.
  // This is wrong! If dx, dy, or dz is very small, 
  //  then the gradient estimate along that dimension will be very big.
  // This will result in very strange behavior.
  //
  // The correct implementation is to use the Gauss-Green theorem: 
  //   ∫∫∫ᵥ ∇ϕ dV = ∫∫ₐ ϕn̂ da
  // so:
  //   ∇ϕ = 1/V ∫∫ₐ ϕn̂ da
  // so find flux out of an area, then divide by volume
  // the area/volume is calculated for a circle that reaches halfway to neighboring vertices
  x.fill(0);
  y.fill(0);
  z.fill(0);
  var difference = 0;
  for (var i = 0, li = arrows.length; i < li; i++) { 
    arrow = arrows[i]; 
    from = arrow[0]; 
    to = arrow[1]; 
    difference = (scalar_field[to] - scalar_field[from]); 
    x[from] += difference * dx[i] * PI / neighbor_count[from]; 
    y[from] += difference * dy[i] * PI / neighbor_count[from]; 
    z[from] += difference * dz[i] * PI / neighbor_count[from]; 
  } 
  var inverse_volume = 1 / (PI * (average_distance/2) * (average_distance/2)); 
  for (var i = 0, li = scalar_field.length; i < li; i++) { 
    x[i] *= inverse_volume; 
    y[i] *= inverse_volume; 
    z[i] *= inverse_volume; 
  } 

  return result;
};
