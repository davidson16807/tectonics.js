
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Dataset = {};
Uint8Dataset.min = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint8Array)
  return dataset[Uint8Raster.min_id(dataset)];
};
Uint8Dataset.max = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint8Array)
  return dataset[Uint8Raster.max_id(dataset)];
};
Uint8Dataset.sum = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint8Array)
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Uint8Dataset.average = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint8Array)
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
Uint8Dataset.unique = function (dataset) {
  ASSERT_IS_ARRAY(dataset, Uint8Array)
  var unique = {};
  for (var i=0, li=dataset.length; i<li; ++i) {
    unique[dataset[i]] = dataset[i];
  }
  return Object.values(unique);
};
