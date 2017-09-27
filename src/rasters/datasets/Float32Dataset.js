
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Float32Raster
var Float32Dataset = {};
Float32Dataset.min = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Float32Array)
  dataset[Float32Raster.min_id(dataset)];
};
Float32Dataset.max = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Float32Array)
  dataset[Float32Raster.max_id(dataset)];
};
Float32Dataset.sum = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Float32Array)
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Float32Dataset.average = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Float32Array)
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
Float32Dataset.weighted_average = function (dataset, weights) {
  ASSERT_IS_ARRAY(dataset, Float32Array)
  ASSERT_IS_ARRAY(weights, Float32Array)
  var result = 0;
  var weight_sum = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i] * weights[i];
      weight_sum += weights[i];
  }
  return result / weight_sum;
};
Float32Dataset.normalize = function(dataset, result, min_new, max_new) {
  result = result || Float32Raster(dataset.grid);

  var min = Float32Dataset.min(dataset);
  min_new = min_new || 0;
  
  var max = Float32Dataset.max(dataset);
  max_new = max_new || 1;

  ASSERT_IS_ARRAY(dataset, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_TYPE(min_new, number)
  ASSERT_IS_TYPE(max_new, number)

  var range = max - min;
  var range_new = max_new - min_new;

  var scaling_factor = range_new / range;

  for (var i=0, li=dataset.length; i<li; ++i) {
      result[i] = scaling_factor * (dataset[i] - min) + min_new;
  }
  return result;
}

Float32Dataset.rescale = function(dataset, result, max_new) {
  result = result || Float32Raster(dataset.grid);

  var max = Float32Dataset.max(dataset);
  var max_new = max_new || 1;
  var scaling_factor = max_new / max;

  ASSERT_IS_ARRAY(dataset, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_TYPE(max_new, number)

  for (var i=0, li=dataset.length; i<li; ++i) {
      result[i] = scaling_factor * dataset[i];
  }
  return result;
}
