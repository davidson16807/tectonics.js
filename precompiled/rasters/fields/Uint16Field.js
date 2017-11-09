
// The Uint16Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Field = {};

Uint16Field.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint16Field.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint16Field.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.ne_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ARRAY(scalar_field2, Uint16Array)
  ASSERT_IS_ARRAY(result, Uint16Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar_field2[i]? 1:0;
  }
  return result;
};


Uint16Field.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint16Field.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint16Field.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
Uint16Field.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint16Field.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
Uint16Field.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint16Field.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
Uint16Field.ne_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar? 1:0;
  }
  return result;
};

Uint16Field.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
Uint16Field.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
Uint16Field.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Uint16Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
Uint16Field.add_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
Uint16Field.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
Uint16Field.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
Uint16Field.div_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Uint16Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint16Array)
  
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
Uint16Field.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Uint16Array)
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