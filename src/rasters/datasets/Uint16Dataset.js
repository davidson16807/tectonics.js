
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Dataset = {};
Uint16Dataset.min = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint16Array)
  dataset[Uint16Raster.min_id(dataset)];
};
Uint16Dataset.max = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint16Array)
  dataset[Uint16Raster.max_id(dataset)];
};
Uint16Dataset.sum = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint16Array)
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Uint16Dataset.average = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint16Array)
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};