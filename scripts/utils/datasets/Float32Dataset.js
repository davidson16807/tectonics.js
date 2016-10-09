'use strict';

// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Float32Raster
var Float32Dataset = {};
Float32Dataset.min = function (field) {
  field[Float32Raster.min_id(field)];
};
Float32Dataset.max = function (field) {
  field[Float32Raster.max_id(field)];
};
Float32Dataset.sum = function (field) {
  var result = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i];
  }
  return result;
};
Float32Dataset.average = function (field) {
  var result = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i];
  }
  return result / field.length;
};
Float32Dataset.weighted_average = function (field, weights) {
  var result = 0;
  var weight_sum = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i] * weights[i];
      weight_sum += weights[i];
  }
  return result / weight_sum;
};
Float32Dataset.normalize = function(field, result) {
  result = result || Float32Raster(field.grid);

  var min = Float32Dataset.min(field);
  var max = Float32Dataset.max(field);
  for (var i=0, li=field.length; i<li; ++i) {
      field[i] = (field[i] - min) / (max - min);
  }
  return result;
}