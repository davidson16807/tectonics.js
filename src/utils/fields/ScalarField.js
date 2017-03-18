
#ifndef STRICT
#define STRICT
'use strict';
#endif


// The ScalarField namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Float32Raster
var ScalarField = {};

ScalarField.min_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < field2[i]? field1[i] : field2[i];
  }
  return result;
};
ScalarField.max_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > field2[i]? field1[i] : field2[i];
  }
  return result;
};
ScalarField.gt_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > field2[i]? 1:0;
  }
  return result;
};
ScalarField.gte_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] >= field2[i]? 1:0;
  }
  return result;
};
ScalarField.lt_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < field2[i]? 1:0;
  }
  return result;
};
ScalarField.lte_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] <= field2[i]? 1:0;
  }
  return result;
};


ScalarField.min_scalar = function (field1, scalar, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < scalar? field1[i] : scalar;
  }
  return result;
};
ScalarField.max_scalar = function (field1, scalar, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > scalar? field1[i] : scalar;
  }
  return result;
};
ScalarField.gt_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > scalar? 1:0;
  }
  return result;
};
ScalarField.gte_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] >= scalar? 1:0;
  }
  return result;
};
ScalarField.lt_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < scalar? 1:0;
  }
  return result;
};
ScalarField.lte_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] <= scalar? 1:0;
  }
  return result;
};

ScalarField.add_field_term = function (field1, field2, field3, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field3[i] * field2[i];
  }
  return result;
};
ScalarField.add_scalar_term = function (field1, field2, scalar, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + scalar * field2[i];
  }
  return result;
};
ScalarField.add_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field2[i];
  }
  return result;
};
ScalarField.sub_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] - field2[i];
  }
  return result;
};
ScalarField.mult_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] * field2[i];
  }
  return result;
};
ScalarField.div_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] / field2[i];
  }
  return result;
};
ScalarField.add_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] + scalar;
  }
  return result;
};
ScalarField.sub_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] - scalar;
  }
  return result;
};
ScalarField.mult_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] * scalar;
  }
  return result;
};
ScalarField.mult_vector = function (scalar, vector, result) {
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
ScalarField.div_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] / scalar;
  }
  return result;
};
ScalarField.differential = function (field, result) {
  result = result || VectorRaster(field.grid);
  var arrows = field.grid.arrows;
  var arrow = [];
  var from = 0, to = 0;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    from = arrow[0];
    to = arrow[1];
    x[to] += field[from] - field[to];
    y[to] += field[from] - field[to];
    z[to] += field[from] - field[to];
  }
  var neighbor_lookup = field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.gradient = function (field, result) {
  result = result || VectorRaster(field.grid);
  var dfield = 0;
  var dpos = field.grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var arrows = field.grid.arrows;
  var arrow = [];
  var x = result.x;
  var y = result.y;
  var z = result.z;
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    dfield = field[arrow[1]] - field[arrow[0]];
    x[arrow[0]] += (dfield * dx[i]);
    y[arrow[0]] += (dfield * dy[i]);
    z[arrow[0]] += (dfield * dz[i]);
  }
  var neighbor_lookup = field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.laplacian = function (field, result) {
  result = result || Float32Raster(field.grid);
  var arrows = field.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += field[arrow[1]] - field[arrow[0]];
  }
  var neighbor_lookup = field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      result[i] /= neighbor_count;
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_constant = function (input, constant, output, scratch) {
  output = output || Float32Raster(input.grid);
  var laplacian = scratch || Float32Raster(input.grid);
  var arrows = input.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += input[arrow[1]] - input[arrow[0]];
  }
  var neighbor_lookup = input.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      laplacian[i] /= neighbor_count;
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      output[i] = input[i] + constant * laplacian[i];
  }
  return output;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_field = function (input, field, output) {
  output = output || Float32Raster(input.grid);
  var laplacian = scratch || Float32Raster(input.grid);
  var arrows = input.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += input[arrow[1]] - input[arrow[0]];
  }
  var neighbor_lookup = input.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      laplacian[i] /= neighbor_count;
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      output[i] = input[i] + field[i] * laplacian[i];
  }
  return output;
};