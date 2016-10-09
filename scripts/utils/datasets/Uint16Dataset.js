'use strict';

// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Dataset = {};
Uint16Dataset.min = function (field) {
  field[Uint16Raster.min_id(field)];
};
Uint16Dataset.max = function (field) {
  field[Uint16Raster.max_id(field)];
};
Uint16Dataset.sum = function (field) {
  var result = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i];
  }
  return result;
};
Uint16Dataset.average = function (field) {
  var result = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i];
  }
  return result / field.length;
};
Uint16Dataset.weighted_average = function (field, weights) {
  var result = 0;
  var weight_sum = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i] * weights[i];
      weight_sum += weights[i];
  }
  return result / weight_sum;
};
Uint16Dataset.normalize = function(field, result) {
  result = result || Uint16Raster(field.grid);

  var min = Uint16Dataset.min(field);
  var max = Uint16Dataset.max(field);
  for (var i=0, li=field.length; i<li; ++i) {
      field[i] = (field[i] - min) / (max - min);
  }
  return result;
}