
#ifndef STRICT
#define STRICT
'use strict';
#endif


// The Uint8Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Field = {};

Uint8Field.min_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < field2[i]? field1[i] : field2[i];
  }
  return result;
};
Uint8Field.max_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > field2[i]? field1[i] : field2[i];
  }
  return result;
};
Uint8Field.gt_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > field2[i]? 1:0;
  }
  return result;
};
Uint8Field.gte_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] >= field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lt_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lte_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] <= field2[i]? 1:0;
  }
  return result;
};
Uint8Field.eq_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] == field2[i]? 1:0;
  }
  return result;
};
Uint8Field.ne_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] != field2[i]? 1:0;
  }
  return result;
};






Uint8Field.min_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < scalar? field1[i] : scalar;
  }
  return result;
};
Uint8Field.max_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > scalar? field1[i] : scalar;
  }
  return result;
};
Uint8Field.gt_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > scalar? 1:0;
  }
  return result;
};
Uint8Field.gte_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint8Field.lt_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < scalar? 1:0;
  }
  return result;
};
Uint8Field.lte_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint8Field.eq_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] == scalar? 1:0;
  }
  return result;
};
Uint8Field.ne_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] != scalar? 1:0;
  }
  return result;
};




Uint8Field.add_field_term = function (field1, field2, field3, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field3[i] * field2[i];
  }
  return result;
};
Uint8Field.add_scalar_term = function (field1, field2, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + scalar * field2[i];
  }
  return result;
};
Uint8Field.add_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field2[i];
  }
  return result;
};
Uint8Field.sub_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] - field2[i];
  }
  return result;
};
Uint8Field.mult_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] * field2[i];
  }
  return result;
};
Uint8Field.div_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] / field2[i];
  }
  return result;
};
Uint8Field.add_scalar = function (field, scalar, result) {
  result = result || Uint8Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] + scalar;
  }
  return result;
};
Uint8Field.sub_scalar = function (field, scalar, result) {
  result = result || Uint8Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] - scalar;
  }
  return result;
};
Uint8Field.mult_scalar = function (field, scalar, result) {
  result = result || Uint8Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] * scalar;
  }
  return result;
};
Uint8Field.mult_vector = function (scalar, vector, result) {
  result = result || VectorRaster(scalar.grid);

  var ix = vector.x;
  var iy = vector.y;
  var iz = vector.z;

  var ox = result.x;
  var oy = result.y;
  var oz = result.z;

  for (var i = 0, li = scalar.length; i < li; i++) {
    ox[i] = scalar[i] * ix;
    oy[i] = scalar[i] * iy;
    oz[i] = scalar[i] * iz;
  }
  return result;
};
Uint8Field.div_scalar = function (field, scalar, result) {
  result = result || Uint8Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] / scalar;
  }
  return result;
};