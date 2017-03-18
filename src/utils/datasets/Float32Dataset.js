
#ifndef STRICT
#define STRICT
'use strict';
#endif


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
Float32Dataset.normalize = function(input, output, min_new, max_new) {
  output = output || Float32Raster(input.grid);

  var min = Float32Dataset.min(input);
  min_new = min_new || 0;
  
  var max = Float32Dataset.max(input);
  max_new = max_new || 1;

  var range = max - min;
  var range_new = max_new - min_new;

  var scaling_factor = range_new / range;

  for (var i=0, li=input.length; i<li; ++i) {
      output[i] = scaling_factor * (input[i] - min) + min_new;
  }
  return output;
}

Float32Dataset.rescale = function(input, output, max_new) {
  output = output || Float32Raster(input.grid);

  var max = Float32Dataset.max(input);
  var max_new = max_new || 1;
  var scaling_factor = max_new / max;

  for (var i=0, li=input.length; i<li; ++i) {
      output[i] = scaling_factor * input[i];
  }
  return output;
}
