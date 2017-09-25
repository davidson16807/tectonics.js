'use strict';
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Float32Raster
var Float32Dataset = {};
Float32Dataset.min = function (dataset) {
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  dataset[Float32Raster.min_id(dataset)];
};
Float32Dataset.max = function (dataset) {
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  dataset[Float32Raster.max_id(dataset)];
};
Float32Dataset.sum = function (dataset) {
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Float32Dataset.average = function (dataset) {
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
Float32Dataset.weighted_average = function (dataset, weights) {
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  if (!(weights instanceof Float32Array)) { throw "weights" + ' is not a ' + "Float32Array"; }
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
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  if (!(typeof min_new == "number")) { throw "min_new" + ' is not a ' + "number"; }
  if (!(typeof max_new == "number")) { throw "max_new" + ' is not a ' + "number"; }
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
  if (!(dataset instanceof Float32Array)) { throw "dataset" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  if (!(typeof max_new == "number")) { throw "max_new" + ' is not a ' + "number"; }
  for (var i=0, li=dataset.length; i<li; ++i) {
      result[i] = scaling_factor * dataset[i];
  }
  return result;
}
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Dataset = {};
Uint16Dataset.min = function (dataset) {
  if (!(dataset instanceof Uint16Array)) { throw "dataset" + ' is not a ' + "Uint16Array"; }
  dataset[Uint16Raster.min_id(dataset)];
};
Uint16Dataset.max = function (dataset) {
  if (!(dataset instanceof Uint16Array)) { throw "dataset" + ' is not a ' + "Uint16Array"; }
  dataset[Uint16Raster.max_id(dataset)];
};
Uint16Dataset.sum = function (dataset) {
  if (!(dataset instanceof Uint16Array)) { throw "dataset" + ' is not a ' + "Uint16Array"; }
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Uint16Dataset.average = function (dataset) {
  if (!(dataset instanceof Uint16Array)) { throw "dataset" + ' is not a ' + "Uint16Array"; }
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Dataset = {};
Uint8Dataset.min = function (dataset) {
  if (!(dataset instanceof Uint8Array)) { throw "dataset" + ' is not a ' + "Uint8Array"; }
  dataset[Uint8Raster.min_id(dataset)];
};
Uint8Dataset.max = function (dataset) {
  if (!(dataset instanceof Uint8Array)) { throw "dataset" + ' is not a ' + "Uint8Array"; }
  dataset[Uint8Raster.max_id(dataset)];
};
Uint8Dataset.sum = function (dataset) {
  if (!(dataset instanceof Uint8Array)) { throw "dataset" + ' is not a ' + "Uint8Array"; }
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Uint8Dataset.average = function (dataset) {
  if (!(dataset instanceof Uint8Array)) { throw "dataset" + ' is not a ' + "Uint8Array"; }
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
Uint8Dataset.unique = function (dataset) {
  if (!(dataset instanceof Uint8Array)) { throw "dataset" + ' is not a ' + "Uint8Array"; }
  var unique = {};
  for (var i=0, li=dataset.length; i<li; ++i) {
    unique[dataset[i]] = dataset[i];
  }
  return Object.values(unique);
};
// The VectorDataset namespace provides operations over raster objects
// treating them as if each cell were an entry in a statistical dataset
var VectorDataset = {};
VectorDataset.min = function (vector_dataset) {
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 var id = VectorRaster.min_id(vector_dataset);
 var x = vector_dataset.x;
 var y = vector_dataset.y;
 var z = vector_dataset.z;
 return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.max = function (vector_dataset) {
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 var id = VectorRaster.max_id(vector_dataset);
 var x = vector_dataset.x;
 var y = vector_dataset.y;
 var z = vector_dataset.z;
 return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.sum = function (vector_dataset) {
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 var x = vector_dataset.x;
 var y = vector_dataset.y;
 var z = vector_dataset.z;
 var sum_x = 0;
 var sum_y = 0;
 var sum_z = 0;
    for (var i=0, li=vector_dataset.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    return {x:sum_x, y:sum_y, z:sum_z};
};
VectorDataset.average = function (vector_dataset) {
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 var x = vector_dataset.x;
 var y = vector_dataset.y;
 var z = vector_dataset.z;
 var sum_x = 0;
 var sum_y = 0;
 var sum_z = 0;
    for (var i=0, li=vector_dataset.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    return {
  x:sum_x / vector_dataset.length,
  y:sum_y / vector_dataset.length,
  z:sum_z / vector_dataset.length
 };
};
VectorDataset.weighted_average = function (vector_dataset, weights) {
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 var x = vector_dataset.x;
 var y = vector_dataset.y;
 var z = vector_dataset.z;
 var sum_x = 0;
 var sum_y = 0;
 var sum_z = 0;
 var weight_sum = 0;
    for (var i=0, li=weights.length; i<li; ++i) {
        sum_x += x[i] * weights[i];
        sum_y += y[i] * weights[i];
        sum_z += z[i] * weights[i];
       weight_sum += weights[i];
    }
    return {
  x:sum_x / weight_sum,
  y:sum_y / weight_sum,
  z:sum_z / weight_sum
 };
};
// WARNING: potential gotcha!
// VectorDataset.normalize() performs statistical data normalization - it outputs a vector where minimum magnitude is always min_new
// VectorField.normalize() individually normalizes each vector within the field.
// VectorDataset.rescale() outputs a vector where minimum magnitude is scaled between 0 and max_new
VectorDataset.normalize = function(vector_dataset, result, min_new, max_new) {
 result = result || VectorRaster(vector_dataset.grid);
 var min = VectorDataset.min(vector_dataset);
 var min_mag = Math.sqrt(min.x*min.x + min.y*min.y + min.z*min.z);
 min_new = min_new || 0;
 var max = VectorDataset.max(vector_dataset);
 var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
 max_new = max_new || 1;
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 if (!(typeof min_new == "number")) { throw "min_new" + ' is not a ' + "number"; }
 if (!(typeof max_new == "number")) { throw "max_new" + ' is not a ' + "number"; }
 var range_mag = max_mag - min_mag;
 var range_new = max_new - min_new;
 var scaling_factor = range_new / range_mag;
 var ix = vector_dataset.x;
 var iy = vector_dataset.y;
 var iz = vector_dataset.z;
 var ox = result.x;
 var oy = result.y;
 var oz = result.z;
 for (var i=0, li=ix.length; i<li; ++i) {
  ox[i] = scaling_factor * (ix[i] - min_mag) + min_new;
  oy[i] = scaling_factor * (iy[i] - min_mag) + min_new;
  oz[i] = scaling_factor * (iz[i] - min_mag) + min_new;
 }
 return result;
}
VectorDataset.rescale = function(vector_dataset, result, max_new) {
 result = result || VectorRaster(vector_dataset.grid);
 var max = VectorDataset.max(vector_dataset);
 var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
 max_new = max_new || 1;
 if (!(vector_dataset.x !== void 0) && !(vector_dataset.x instanceof Float32Array)) { throw "vector_dataset" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 if (!(typeof max_new == "number")) { throw "max_new" + ' is not a ' + "number"; }
 var ix = vector_dataset.x;
 var iy = vector_dataset.y;
 var iz = vector_dataset.z;
 var ox = result.x;
 var oy = result.y;
 var oz = result.z;
 var scaling_factor = max_new / max_mag;
 for (var i=0, li=ix.length; i<li; ++i) {
  ox[i] = scaling_factor * ix[i];
  oy[i] = scaling_factor * iy[i];
  oz[i] = scaling_factor * iz[i];
 }
 return result;
}
// The ScalarField namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Float32Raster
var ScalarField = {};
ScalarField.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
ScalarField.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
ScalarField.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
ScalarField.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
ScalarField.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
ScalarField.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
ScalarField.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
ScalarField.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
ScalarField.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
ScalarField.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(field3 instanceof Float32Array || field3 instanceof Uint16Array || field3 instanceof Uint8Array)) { throw "field3" + ' is not a typed array'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
ScalarField.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
ScalarField.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
ScalarField.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(field3 instanceof Float32Array || field3 instanceof Uint16Array || field3 instanceof Uint8Array)) { throw "field3" + ' is not a typed array'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
ScalarField.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
ScalarField.add_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
ScalarField.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
ScalarField.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
ScalarField.div_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
ScalarField.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
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
ScalarField.differential = function (scalar_field, result) {
  result = result || VectorRaster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
  var arrows = scalar_field.grid.arrows;
  var arrow = [];
  var from = 0, to = 0;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    from = arrow[0];
    to = arrow[1];
    x[to] += scalar_field[from] - scalar_field[to];
    y[to] += scalar_field[from] - scalar_field[to];
    z[to] += scalar_field[from] - scalar_field[to];
  }
  var neighbor_lookup = scalar_field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.gradient = function (scalar_field, result) {
  result = result || VectorRaster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
  var d_scalar_field = 0;
  var dpos = scalar_field.grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var arrows = scalar_field.grid.arrows;
  var arrow = [];
  var x = result.x;
  var y = result.y;
  var z = result.z;
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    d_scalar_field = scalar_field[arrow[1]] - scalar_field[arrow[0]];
    x[arrow[0]] += (d_scalar_field * dx[i]);
    y[arrow[0]] += (d_scalar_field * dy[i]);
    z[arrow[0]] += (d_scalar_field * dz[i]);
  }
  var neighbor_lookup = scalar_field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.average_difference = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  if (scalar_field === result) { throw "scalar_field" + ' and ' + "result" + ' cannot be the same'; }
  var arrows = scalar_field.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_lookup = scalar_field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      result[i] /= neighbor_count;
  }
  return result;
};
// This function computes the laplacian of a surface. 
// The laplacian can be thought of as a metric for the average difference across space. 
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// We assume all vertices in scalar_field.grid are equidistant on a surface. 
// 
// Let ε be a small number and eᵢ be a component of the basis (e.g. [1,0] or [0,1]) 
// ∇²f = ∇ (     f(x+εeᵢ)     -     f(x-εeᵢ))      /  2ε 
// ∇²f =   ((f(x+2εeᵢ) -f(x)) - (f(x) -f(x-2εeᵢ))) / (2ε)² 
// ∇²f =   ( f(x+2εeᵢ) -f(x) 
//           f(x-2εeᵢ) -f(x)) ) / (2ε)² 
//   So for 2d: 
// ∇²f =   ( f(x+2ε, y) - f(x,y) 
//           f(x, y+2ε) - f(x,y) 
//           f(x-2ε, y) - f(x,y) 
//           f(x, y-2ε) - f(x,y) ) / (2ε)² 
//  
// Think of it as taking the sum of differences between the center point and four neighbors. 
// That means if we have an arbitrary number of neighbors,  
// we find the average difference and multiply it by 4. 
ScalarField.laplacian = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  if (scalar_field === result) { throw "scalar_field" + ' and ' + "result" + ' cannot be the same'; }
  for (var i = 0; i < result.length; i++) {
    result[i] = -4*scalar_field[i];
  }
  var arrows = scalar_field.grid.arrows;
  var arrow;
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += scalar_field[arrow[1]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  var average_distance = scalar_field.grid.average_distance * scalar_field.grid.average_distance;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      result[i] *= 4;
      result[i] /= neighbor_count[i] * average_distance;
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_constant = function (scalar_field, constant, result, scratch) {
  result = result || Float32Raster(scalar_field.grid);
  scratch = scratch || Float32Raster(scalar_field.grid);
  if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  if (!(scratch instanceof Float32Array)) { throw "scratch" + ' is not a ' + "Float32Array"; }
  if (!(typeof constant == "number")) { throw "constant" + ' is not a ' + "number"; }
  var laplacian = scratch;
  var arrows = scalar_field.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_lookup = scalar_field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      laplacian[i] /= neighbor_count;
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      result[i] = scalar_field[i] + constant * laplacian[i];
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_field = function (scalar_field1, scalar_field2, result, scratch) {
  result = result || Float32Raster(scalar_field1.grid);
  scratch = scratch || Float32Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Float32Array)) { throw "scalar_field1" + ' is not a ' + "Float32Array"; }
  if (!(scalar_field2 instanceof Float32Array)) { throw "scalar_field2" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  if (!(scratch instanceof Float32Array)) { throw "scratch" + ' is not a ' + "Float32Array"; }
  var laplacian = scratch;
  var arrows = scalar_field1.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += scalar_field1[arrow[1]] - scalar_field1[arrow[0]];
  }
  var neighbor_lookup = scalar_field1.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      laplacian[i] /= neighbor_count;
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      result[i] = scalar_field1[i] + scalar_field2[i] * laplacian[i];
  }
  return result;
};
// The Uint16Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Field = {};
Uint16Field.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint16Field.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint16Field.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Uint16Array)) { throw "scalar_field2" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint16Field.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint16Field.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
Uint16Field.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint16Field.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
Uint16Field.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint16Field.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
Uint16Field.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(field3 instanceof Float32Array || field3 instanceof Uint16Array || field3 instanceof Uint8Array)) { throw "field3" + ' is not a typed array'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
Uint16Field.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(field3 instanceof Float32Array || field3 instanceof Uint16Array || field3 instanceof Uint8Array)) { throw "field3" + ' is not a typed array'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
Uint16Field.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint16Array)) { throw "scalar_field1" + ' is not a ' + "Uint16Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
Uint16Field.add_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint16Array)) { throw "scalar_field" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
Uint16Field.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint16Array)) { throw "scalar_field" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
Uint16Field.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint16Array)) { throw "scalar_field" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
Uint16Field.div_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint16Array)) { throw "scalar_field" + ' is not a ' + "Uint16Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
Uint16Field.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);
  if (!(scalar_field instanceof Uint16Array)) { throw "scalar_field" + ' is not a ' + "Uint16Array"; }
  if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
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
// The Uint8Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Field = {};
Uint8Field.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint8Field.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint8Field.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.ne_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint8Field.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint8Field.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
Uint8Field.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint8Field.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
Uint8Field.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint8Field.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
Uint8Field.ne_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar? 1:0;
  }
  return result;
};
Uint8Field.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(field3 instanceof Float32Array || field3 instanceof Uint16Array || field3 instanceof Uint8Array)) { throw "field3" + ' is not a typed array'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
Uint8Field.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(field3 instanceof Float32Array || field3 instanceof Uint16Array || field3 instanceof Uint8Array)) { throw "field3" + ' is not a typed array'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
Uint8Field.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  if (!(scalar_field1 instanceof Uint8Array)) { throw "scalar_field1" + ' is not a ' + "Uint8Array"; }
  if (!(scalar_field2 instanceof Float32Array || scalar_field2 instanceof Uint16Array || scalar_field2 instanceof Uint8Array)) { throw "scalar_field2" + ' is not a typed array'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
Uint8Field.add_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint8Array)) { throw "scalar_field" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
Uint8Field.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint8Array)) { throw "scalar_field" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
Uint8Field.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint8Array)) { throw "scalar_field" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
Uint8Field.div_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
  if (!(scalar_field instanceof Uint8Array)) { throw "scalar_field" + ' is not a ' + "Uint8Array"; }
  if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
Uint8Field.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);
  if (!(scalar_field instanceof Uint8Array)) { throw "scalar_field" + ' is not a ' + "Uint8Array"; }
  if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
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
// The VectorField namespace provides operations over mathematical vector fields.
// All fields are represented on raster objects, e.g. VectorRaster or Float32Raster
var VectorField = {};
VectorField.add_vector_field_term = function(vector_field1, vector_field2, scalar, result) {
 result = result || VectorRaster(vector_field1.grid);
 if (!(vector_field1.x !== void 0) && !(vector_field1.x instanceof Float32Array)) { throw "vector_field1" + ' is not a vector raster'; }
 if (!(vector_field2.x !== void 0) && !(vector_field2.x instanceof Float32Array)) { throw "vector_field2" + ' is not a vector raster'; }
 if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field1.x;
 var y1 = vector_field1.y;
 var z1 = vector_field1.z;
 var x2 = vector_field2.x;
 var y2 = vector_field2.y;
 var z2 = vector_field2.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + scalar * x2[i];
     y[i] = y1[i] + scalar * y2[i];
     z[i] = z1[i] + scalar * z2[i];
 }
 return result;
};
VectorField.add_vector_field = function(vector_field1, vector_field2, result) {
 result = result || VectorRaster(vector_field1.grid);
 if (!(vector_field1.x !== void 0) && !(vector_field1.x instanceof Float32Array)) { throw "vector_field1" + ' is not a vector raster'; }
 if (!(vector_field2.x !== void 0) && !(vector_field2.x instanceof Float32Array)) { throw "vector_field2" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field1.x;
 var y1 = vector_field1.y;
 var z1 = vector_field1.z;
 var x2 = vector_field2.x;
 var y2 = vector_field2.y;
 var z2 = vector_field2.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + x2[i];
     y[i] = y1[i] + y2[i];
     z[i] = z1[i] + z2[i];
 }
 return result;
};
VectorField.sub_vector_field = function(vector_field1, vector_field2, result) {
 result = result || VectorRaster(vector_field1.grid);
 if (!(vector_field1.x !== void 0) && !(vector_field1.x instanceof Float32Array)) { throw "vector_field1" + ' is not a vector raster'; }
 if (!(vector_field2.x !== void 0) && !(vector_field2.x instanceof Float32Array)) { throw "vector_field2" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field1.x;
 var y1 = vector_field1.y;
 var z1 = vector_field1.z;
 var x2 = vector_field2.x;
 var y2 = vector_field2.y;
 var z2 = vector_field2.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] - x2[i];
     y[i] = y1[i] - y2[i];
     z[i] = z1[i] - z2[i];
 }
 return result;
};
VectorField.dot_vector_field = function(vector_field1, vector_field2, result) {
 result = result || Float32Raster(vector_field1.grid);
 if (!(vector_field1.x !== void 0) && !(vector_field1.x instanceof Float32Array)) { throw "vector_field1" + ' is not a vector raster'; }
 if (!(vector_field2.x !== void 0) && !(vector_field2.x instanceof Float32Array)) { throw "vector_field2" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field1.x;
 var y1 = vector_field1.y;
 var z1 = vector_field1.z;
 var x2 = vector_field2.x;
 var y2 = vector_field2.y;
 var z2 = vector_field2.z;
 for (var i=0, li=x.length; i<li; ++i) {
     result[i] = x1[i] * x2[i] +
        y1[i] * y2[i] +
        z1[i] * z2[i];
 }
 return result;
};
VectorField.hadamard_vector_field = function(vector_field1, vector_field2, result) {
 result = result || VectorRaster(vector_field1.grid);
 if (!(vector_field1.x !== void 0) && !(vector_field1.x instanceof Float32Array)) { throw "vector_field1" + ' is not a vector raster'; }
 if (!(vector_field2.x !== void 0) && !(vector_field2.x instanceof Float32Array)) { throw "vector_field2" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field1.x;
 var y1 = vector_field1.y;
 var z1 = vector_field1.z;
 var x2 = vector_field2.x;
 var y2 = vector_field2.y;
 var z2 = vector_field2.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] * x2[i];
     y[i] = y1[i] * y2[i];
     z[i] = z1[i] * z2[i];
 }
 return result;
};
VectorField.cross_vector_field = function (vector_field1, vector_field2, result) {
 result = result || VectorRaster(vector_field1.grid);
 if (!(vector_field1.x !== void 0) && !(vector_field1.x instanceof Float32Array)) { throw "vector_field1" + ' is not a vector raster'; }
 if (!(vector_field2.x !== void 0) && !(vector_field2.x instanceof Float32Array)) { throw "vector_field2" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var ax = vector_field1.x;
 var ay = vector_field1.y;
 var az = vector_field1.z;
 var bx = vector_field2.x;
 var by = vector_field2.y;
 var bz = vector_field2.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 var axi = 0;
 var ayi = 0;
 var azi = 0;
 var bxi = 0;
 var byi = 0;
 var bzi = 0;
 for (var i = 0, li=x.length; i<li; ++i) {
  axi = ax[i];
  ayi = ay[i];
  azi = az[i];
  bxi = bx[i];
  byi = by[i];
  bzi = bz[i];
  x[i] = ayi*bzi - azi*byi;
  y[i] = azi*bxi - axi*bzi;
  z[i] = axi*byi - ayi*bxi;
 }
 return result;
}
VectorField.add_vector = function(vector_field, vector, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x2 = vector.x;
 var y2 = vector.y;
 var z2 = vector.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + x2;
     y[i] = y1[i] + y2;
     z[i] = z1[i] + z2;
 }
 return result;
};
VectorField.sub_vector = function(vector_field, vector, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x2 = vector.x;
 var y2 = vector.y;
 var z2 = vector.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] - x2;
     y[i] = y1[i] - y2;
     z[i] = z1[i] - z2;
 }
 return result;
};
VectorField.dot_vector = function(vector_field, vector, result) {
 result = result || Float32Raster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x2 = vector.x;
 var y2 = vector.y;
 var z2 = vector.z;
 for (var i=0, li=x.length; i<li; ++i) {
     result[i] = x1[i] * x2[i] +
        y1[i] * y2[i] +
        z1[i] * z2[i];
 }
 return result;
};
VectorField.hadamard_vector = function(vector_field, vector, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x2 = vector.x;
 var y2 = vector.y;
 var z2 = vector.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] * x2;
     y[i] = y1[i] * y2;
     z[i] = z1[i] * z2;
 }
 return result;
};
VectorField.cross_vector = function (vector_field, vector, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var ax = vector_field.x;
 var ay = vector_field.y;
 var az = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 var axi = 0;
 var ayi = 0;
 var azi = 0;
 var bxi = vector.x;
 var byi = vector.y;
 var bzi = vector.z;
 for (var i = 0, li=x.length; i < li; ++i) {
  axi = ax[i];
  ayi = ay[i];
  azi = az[i];
  x[i] = ayi*bzi - azi*byi;
  y[i] = azi*bxi - axi*bzi;
  z[i] = axi*byi - ayi*bxi;
 }
 return result;
}
// NOTE: matrix is structured to match the output of THREE.Matrix3.toArray()
// i.e single array in column-major format
VectorField.mult_matrix = function (vector_field, matrix, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var ax = vector_field.x;
 var ay = vector_field.y;
 var az = vector_field.z;
 var xx = matrix[0]; var xy = matrix[4]; var xz = matrix[8];
 var yx = matrix[1]; var yy = matrix[5]; var yz = matrix[9];
 var zx = matrix[2]; var zy = matrix[6]; var zz = matrix[10];
 var x = result.x;
 var y = result.y;
 var z = result.z;
 var axi = 0;
 var ayi = 0;
 var azi = 0;
 for (var i = 0, li=x.length; i < li; ++i) {
  axi = ax[i];
  ayi = ay[i];
  azi = az[i];
  x[i] = axi * xx + ayi * xy + azi * xz ;
  y[i] = axi * yx + ayi * yy + azi * yz ;
  z[i] = axi * zx + ayi * zy + azi * zz ;
 }
 return result;
}
VectorField.add_scalar_field = function(vector_field, scalar_field, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + scalar_field[i];
     y[i] = y1[i] + scalar_field[i];
     z[i] = z1[i] + scalar_field[i];
 }
 return result;
};
VectorField.sub_scalar_field_field = function(vector_field, scalar_field, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + scalar_field[i];
     y[i] = y1[i] + scalar_field[i];
     z[i] = z1[i] + scalar_field[i];
 }
 return result;
};
VectorField.mult_scalar_field_field = function(vector_field, scalar_field, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + scalar_field[i];
     y[i] = y1[i] + scalar_field[i];
     z[i] = z1[i] + scalar_field[i];
 }
 return result;
};
VectorField.div_scalar_field_field = function(vector_field, scalar_field, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(scalar_field instanceof Float32Array)) { throw "scalar_field" + ' is not a ' + "Float32Array"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] / scalar_field[i];
     y[i] = y1[i] / scalar_field[i];
     z[i] = z1[i] / scalar_field[i];
 }
 return result;
};
VectorField.add_scalar = function(vector_field, scalar, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] + scalar;
     y[i] = y1[i] + scalar;
     z[i] = z1[i] + scalar;
 }
 return result;
};
VectorField.sub_scalar = function(vector_field, scalar, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] - scalar;
     y[i] = y1[i] - scalar;
     z[i] = z1[i] - scalar;
 }
 return result;
};
VectorField.mult_scalar = function(vector_field, scalar, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] * scalar;
     y[i] = y1[i] * scalar;
     z[i] = z1[i] * scalar;
 }
 return result;
};
VectorField.div_scalar = function(vector_field, scalar, result) {
 result = result || VectorRaster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(typeof scalar == "number")) { throw "scalar" + ' is not a ' + "number"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 var inv_scalar = 1/scalar;
 for (var i=0, li=x.length; i<li; ++i) {
     x[i] = x1[i] * inv_scalar;
     y[i] = y1[i] * inv_scalar;
     z[i] = z1[i] * inv_scalar;
 }
 return result;
};
VectorField.map = function(vector_field, fn, result) {
 result = result || Float32Raster(vector_field.grid)
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
 var x = vector_field.x;
 var y = vector_field.y;
 var z = vector_field.z;
 for (var i = field_value.length - 1; i >= 0; i--) {
  this_value[i] = fn(x[i], y[i], z[i]);
 }
 return result;
};
VectorField.magnitude = function(vector_field, result) {
 result = result || Float32Raster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
 var x = vector_field.x;
 var y = vector_field.y;
 var z = vector_field.z;
 var xi=0, yi=0, zi=0;
 var sqrt = Math.sqrt;
 for (var i = 0, li = result.length; i<li; i++) {
  var xi = x[i];
  var yi = y[i];
  var zi = z[i];
  result[i] = sqrt( xi * xi +
       yi * yi +
       zi * zi );
 }
 return result;
}
// ∂X
VectorField.arrow_differential = function(vector_field, result) {
 result = result || VectorRaster.OfLength(vector_field.grid.arrows.length, vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var x1 = vector_field.x;
 var y1 = vector_field.y;
 var z1 = vector_field.z;
 var x = result.x;
 var y = result.y;
 var z = result.z;
 var arrows = vector_field.grid.arrows;
 var arrow_i_from = 0;
 var arrow_i_to = 0;
 for (var i = 0, li = arrows.length; i<li; i++) {
  arrow_i_from = arrows[i][0];
  arrow_i_to = arrows[i][1];
  x[i] = x1[arrow_i_to] - x1[arrow_i_from];
  y[i] = y1[arrow_i_to] - y1[arrow_i_from];
  z[i] = z1[arrow_i_to] - z1[arrow_i_from];
 }
 return result;
}
VectorField.divergence = function(vector_field, result) {
 result = result || Float32Raster(vector_field.grid);
 if (!(vector_field.x !== void 0) && !(vector_field.x instanceof Float32Array)) { throw "vector_field" + ' is not a vector raster'; }
 if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
 var dpos = vector_field.grid.pos_arrow_differential;
 var dx = dpos.x;
 var dy = dpos.y;
 var dz = dpos.z;
 var arrows = vector_field.grid.arrows;
 var arrow_i_from = 0;
 var arrow_i_to = 0;
 var x = vector_field.x;
 var y = vector_field.y;
 var z = vector_field.z;
 for (var i = 0, li = arrows.length; i<li; i++) {
  arrow_i_from = arrows[i][0];
  arrow_i_to = arrows[i][1];
  result[arrow_i_from] += ( x[arrow_i_to] - x[arrow_i_from] ) / dx[i] +
         ( y[arrow_i_to] - y[arrow_i_from] ) / dy[i] +
         ( z[arrow_i_to] - z[arrow_i_from] ) / dz[i] ;
 }
 var neighbor_lookup = vector_field.grid.neighbor_lookup;
 for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
  result[i] /= neighbor_lookup[i].length || 1;
 }
 return result;
}
var Float32RasterGraphics = {};
Float32RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
 result = result || Float32Raster(raster.grid);
 if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
 if (!(copied instanceof Float32Array)) { throw "copied" + ' is not a ' + "Float32Array"; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
 for (var i=0, li=raster.length; i<li; ++i) {
     result[i] = selection[i] === 1? copied[i] : raster[i];
 }
 return result;
}
Float32RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
 result = result || Float32Raster(raster.grid);
 if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
 if (!(typeof fill == "number")) { throw "fill" + ' is not a ' + "number"; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
 for (var i=0, li=raster.length; i<li; ++i) {
     result[i] = selection[i] === 1? fill : raster[i];
 }
 return result;
}
var Uint16RasterGraphics = {};
Uint16RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
 result = result || Uint16Raster(raster.grid);
 if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
 if (!(copied instanceof Uint16Array)) { throw "copied" + ' is not a ' + "Uint16Array"; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
 for (var i=0, li=raster.length; i<li; ++i) {
     result[i] = selection[i] === 1? copied[i] : raster[i];
 }
 return result;
}
Uint16RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
 result = result || Uint16Raster(raster.grid);
 if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
 if (!(typeof fill == "number")) { throw "fill" + ' is not a ' + "number"; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
 for (var i=0, li=raster.length; i<li; ++i) {
     result[i] = selection[i] === 1? fill : raster[i];
 }
 return result;
}
var Uint8RasterGraphics = {};
Uint8RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
 result = result || Uint8Raster(raster.grid);
 if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
 if (!(copied instanceof Uint8Array)) { throw "copied" + ' is not a ' + "Uint8Array"; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
 for (var i=0, li=raster.length; i<li; ++i) {
     result[i] = selection[i] === 1? copied[i] : raster[i];
 }
 return result;
}
Uint8RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
 result = result || Uint8Raster(raster.grid);
 if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
 if (!(typeof fill == "number")) { throw "fill" + ' is not a ' + "number"; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
 for (var i=0, li=raster.length; i<li; ++i) {
     result[i] = selection[i] === 1? fill : raster[i];
 }
 return result;
}
// The VectorRasterGraphics namespace encompasses functionality 
// you've come to expect from a standard image editor like Gimp or MS Paint
var VectorRasterGraphics = {};
VectorRasterGraphics.magic_wand_select = function function_name(vector_raster, start_id, mask, result) {
 result = result || Uint8Raster(vector_raster.grid, 0);
 if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
 if (!(typeof start_id == "number")) { throw "start_id" + ' is not a ' + "number"; }
 if (!(mask instanceof Uint8Array)) { throw "mask" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
 var neighbor_lookup = vector_raster.grid.neighbor_lookup;
 var similarity = Vector.similarity;
 var magnitude = Vector.magnitude;
 var x = vector_raster.x;
 var y = vector_raster.y;
 var z = vector_raster.z;
 var searching = [start_id];
 var searched = Uint8Raster(vector_raster.grid, 0);
 var grouped = result;
 searched[start_id] = 1;
 var id = 0;
 var neighbor_id = 0;
 var neighbors = [];
 var is_similar = 0;
 var threshold = Math.cos(Math.PI * 60/180);
 while(searching.length > 0){
  id = searching.shift();
  is_similar = similarity (x[id], y[id], z[id],
         x[start_id], y[start_id], z[start_id]) > threshold;
  if (is_similar) {
   grouped[id] = 1;
   neighbors = neighbor_lookup[id];
   for (var i=0, li=neighbors.length; i<li; ++i) {
       neighbor_id = neighbors[i];
       if (searched[neighbor_id] === 0 && mask[id] != 0) {
        searching.push(neighbor_id);
        searched[neighbor_id] = 1;
       }
   }
  }
 }
 return result;
}
VectorRasterGraphics.copy_into_selection = function(vector_raster, copied, selection, result) {
 result = result || Float32Raster(vector_raster.grid);
 if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
 if (!(copied.x !== void 0) && !(copied.x instanceof Float32Array)) { throw "copied" + ' is not a vector raster'; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var ax = vector_raster.x;
 var ay = vector_raster.y;
 var az = vector_raster.z;
 var bx = copied.x;
 var by = copied.y;
 var bz = copied.z;
 var cx = result.x;
 var cy = result.y;
 var cz = result.z;
 for (var i=0, li=vector_raster.length; i<li; ++i) {
     cx[i] = selection[i] === 1? bx[i] : ax[i];
     cy[i] = selection[i] === 1? by[i] : ay[i];
     cz[i] = selection[i] === 1? bz[i] : az[i];
 }
 return result;
}
VectorRasterGraphics.fill_into_selection = function(vector_raster, fill, selection, result) {
 result = result || Float32Raster(vector_raster.grid);
 if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
 if (!(selection instanceof Uint8Array)) { throw "selection" + ' is not a ' + "Uint8Array"; }
 if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var ax = vector_raster.x;
 var ay = vector_raster.y;
 var az = vector_raster.z;
 var bx = fill.x;
 var by = fill.y;
 var bz = fill.z;
 var cx = result.x;
 var cy = result.y;
 var cz = result.z;
 for (var i=0, li=vector_raster.length; i<li; ++i) {
     cx[i] = selection[i] === 1? bx : ax[i];
     cy[i] = selection[i] === 1? by : ay[i];
     cz[i] = selection[i] === 1? bz : az[i];
 }
 return result;
}
// Float32Raster represents a grid where each cell contains a 32 bit floating point value
// A Float32Raster is composed of two parts:
// 		The first is a object of type Grid, representing a collection of vertices that are connected by edges
//  	The second is a typed array, representing a value for each vertex within the grid
// 
// Float32Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Float32Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Float32Raster class, operations on Float32Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function Float32Raster(grid, fill) {
 var result = new Float32Array(grid.vertices.length);
 result.grid = grid;
 if (fill !== void 0) {
 for (var i=0, li=result.length; i<li; ++i) {
     result[i] = fill;
 }
 }
 return result;
};
Float32Raster.OfLength = function(length, grid) {
 var result = new Float32Array(length);
 result.grid = grid;
 return result;
}
Float32Raster.FromUint8Raster = function(raster) {
  var result = Float32Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.FromUint16Raster = function(raster) {
  var result = Float32Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.copy = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i=0, li=raster.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.fill = function (raster, value) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  for (var i = 0, li = raster.length; i < li; i++) {
    raster[i] = value;
  }
};
Float32Raster.min_id = function (raster) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Float32Raster.max_id = function (raster) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Float32Raster.get_nearest_value = function(raster, pos) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  return raster[raster.grid.getNearestId(pos)];
}
Float32Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Float32Raster(pos_raster.grid);
  if (!(value_raster instanceof Float32Array)) { throw "value_raster" + ' is not a ' + "Float32Array"; }
  if (!(pos_raster.x !== void 0) && !(pos_raster.x instanceof Float32Array)) { throw "pos_raster" + ' is not a vector raster'; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Float32Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Float32Raster(id_array.grid) : Float32Array(id_array.length));
  if (!(value_raster instanceof Float32Array)) { throw "value_raster" + ' is not a ' + "Float32Array"; }
  if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Float32Raster.get_mask = function(raster, mask) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  if (!(mask instanceof Uint8Array)) { throw "mask" + ' is not a ' + "Uint8Array"; }
  var result = new Float32Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Float32Raster.set_ids_to_value = function(raster, id_array, value) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Float32Raster.set_ids_to_values = function(raster, id_array, value_array) {
  if (!(raster instanceof Float32Array)) { throw "raster" + ' is not a ' + "Float32Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}
// Uint16Raster represents a grid where each cell contains a 32 bit floating point value
// A Uint16Raster is composed of two parts:
//    The first is a object of type Grid, representing a collection of vertices that are connected by edges
//    The second is a typed array, representing a value for each vertex within the grid
// 
// Uint16Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Uint16Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Uint16Raster class, operations on Uint16Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function Uint16Raster(grid, fill) {
  var result = new Uint16Array(grid.vertices.length);
  result.grid = grid;
  if (fill !== void 0) {
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = fill;
  }
  }
  return result;
};
Uint16Raster.OfLength = function(length, grid) {
  var result = new Uint16Array(length);
  result.grid = grid;
  return result;
}
Uint16Raster.FromUint8Raster = function(raster) {
  var result = Uint16Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint16Raster.FromUint16Raster = function(raster) {
  var result = Uint16Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint16Raster.copy = function(raster, result) {
  var result = result || Uint16Raster(raster.grid);
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i=0, li=raster.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint16Raster.fill = function (raster, value) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  for (var i = 0, li = raster.length; i < li; i++) {
    raster[i] = value;
  }
};
Uint16Raster.min_id = function (raster) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint16Raster.max_id = function (raster) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint16Raster.get_nearest_value = function(raster, pos) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  return raster[raster.grid.getNearestId(pos)];
}
Uint16Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Uint16Raster(pos_raster.grid);
  if (!(value_raster instanceof Uint16Array)) { throw "value_raster" + ' is not a ' + "Uint16Array"; }
  if (!(pos_raster.x !== void 0) && !(pos_raster.x instanceof Float32Array)) { throw "pos_raster" + ' is not a vector raster'; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Uint16Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Uint16Raster(id_array.grid) : Uint16Array(id_array.length));
  if (!(value_raster instanceof Uint16Array)) { throw "value_raster" + ' is not a ' + "Uint16Array"; }
  if (!(result instanceof Uint16Array)) { throw "result" + ' is not a ' + "Uint16Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Uint16Raster.get_mask = function(raster, mask) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  if (!(mask instanceof Uint8Array)) { throw "mask" + ' is not a ' + "Uint8Array"; }
  var result = new Uint16Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Uint16Raster.set_ids_to_value = function(raster, id_array, value) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Uint16Raster.set_ids_to_values = function(raster, id_array, value_array) {
  if (!(raster instanceof Uint16Array)) { throw "raster" + ' is not a ' + "Uint16Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}
// Uint8Raster represents a grid where each cell contains a 32 bit floating point value
// A Uint8Raster is composed of two parts:
//    The first is a object of type Grid, representing a collection of vertices that are connected by edges
//    The second is a typed array, representing a value for each vertex within the grid
// 
// Uint8Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Uint8Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Uint8Raster class, operations on Uint8Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function Uint8Raster(grid, fill) {
  var result = new Uint8Array(grid.vertices.length);
  result.grid = grid;
  if (fill !== void 0) {
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = fill;
  }
  }
  return result;
};
Uint8Raster.OfLength = function(length, grid) {
  var result = new Uint8Array(length);
  result.grid = grid;
  return result;
}
Uint8Raster.FromUint8Raster = function(raster) {
  var result = Uint8Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint8Raster.FromUint16Raster = function(raster) {
  var result = Uint8Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint8Raster.copy = function(raster, result) {
  var result = result || Uint8Raster(raster.grid);
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i=0, li=raster.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint8Raster.fill = function (raster, value) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  for (var i = 0, li = raster.length; i < li; i++) {
    raster[i] = value;
  }
};
Uint8Raster.min_id = function (raster) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint8Raster.max_id = function (raster) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint8Raster.get_nearest_value = function(raster, pos) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  return raster[raster.grid.getNearestId(pos)];
}
Uint8Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Uint8Raster(pos_raster.grid);
  if (!(value_raster instanceof Uint8Array)) { throw "value_raster" + ' is not a ' + "Uint8Array"; }
  if (!(pos_raster.x !== void 0) && !(pos_raster.x instanceof Float32Array)) { throw "pos_raster" + ' is not a vector raster'; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Uint8Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Uint8Raster(id_array.grid) : Uint8Array(id_array.length));
  if (!(value_raster instanceof Uint8Array)) { throw "value_raster" + ' is not a ' + "Uint8Array"; }
  if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Uint8Raster.get_mask = function(raster, mask) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  if (!(mask instanceof Uint8Array)) { throw "mask" + ' is not a ' + "Uint8Array"; }
  var result = new Uint8Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Uint8Raster.set_ids_to_value = function(raster, id_array, value) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Uint8Raster.set_ids_to_values = function(raster, id_array, value_array) {
  if (!(raster instanceof Uint8Array)) { throw "raster" + ' is not a ' + "Uint8Array"; }
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}
// VectorRaster represents a grid where each cell contains a vector value. It is a specific kind of a multibanded raster.
// A VectorRaster is composed of two parts
// 		The first is a object of type Grid, representing a collection of vertices that are connected by edges
//  	The second is a structure of arrays (SoA), representing a vector for each vertex within the grid. 
// 
// VectorRaster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// VectorRasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that can be performed on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the VectorRaster class, operations on VectorRasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function VectorRaster(grid) {
 var length = grid.vertices.length;
 var result = {
  x: new Float32Array(length),
  y: new Float32Array(length),
  z: new Float32Array(length),
  grid: grid
 };
 return result;
}
VectorRaster.OfLength = function(length, grid) {
 var result = {
  x: new Float32Array(length),
  y: new Float32Array(length),
  z: new Float32Array(length),
  grid: grid
 };
 return result;
}
VectorRaster.FromVectors = function(vectors, grid) {
 var result = VectorRaster.OfLength(vectors.length, grid);
 var x = result.x;
 var y = result.y;
 var z = result.z;
 for (var i=0, li=vectors.length; i<li; ++i) {
     x[i] = vectors[i].x;
     y[i] = vectors[i].y;
     z[i] = vectors[i].z;
 }
 return result;
}
VectorRaster.copy = function(vector_raster, output) {
  var output = output || VectorRaster(vector_raster.grid);
  if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
  if (!(output.x !== void 0) && !(output.x instanceof Float32Array)) { throw "output" + ' is not a vector raster'; }
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  var ox = output.x;
  var oy = output.y;
  var oz = output.z;
  for (var i=0, li=ix.length; i<li; ++i) {
      ox[i] = ix[i];
      oy[i] = iy[i];
      oz[i] = iz[i];
  }
  return output;
}
VectorRaster.fill = function (vector_raster, value) {
  if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
  var ix = value.x;
  var iy = value.y;
  var iz = value.z;
  var ox = vector_raster.x;
  var oy = vector_raster.y;
  var oz = vector_raster.z;
  for (var i=0, li=ox.length; i<li; ++i) {
      ox[i] = ix;
      oy[i] = iy;
      oz[i] = iz;
  }
  return vector_raster;
};
VectorRaster.min_id = function (vector_raster) {
  if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
  var max = Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag < max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};
VectorRaster.max_id = function (vector_raster) {
  if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
  var max = -Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag > max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};
VectorRaster.get_nearest_value = function(value_raster, pos) {
  if (!(value_raster.x !== void 0) && !(value_raster.x instanceof Float32Array)) { throw "value_raster" + ' is not a vector raster'; }
 var id = value_raster.grid.getNearestId(pos);
 return {x: value_raster.x[id], y: value_raster.y[id], z: value_raster.z[id]};
}
VectorRaster.get_nearest_values = function(value_raster, pos_raster, result) {
 result = result || VectorRaster(pos_raster.grid);
  if (!(vector_raster.x !== void 0) && !(vector_raster.x instanceof Float32Array)) { throw "vector_raster" + ' is not a vector raster'; }
  if (!(pos_raster.x !== void 0) && !(pos_raster.x instanceof Float32Array)) { throw "pos_raster" + ' is not a vector raster'; }
  if (!(result.x !== void 0) && !(result.x instanceof Float32Array)) { throw "result" + ' is not a vector raster'; }
 var ids = pos_raster.grid.getNearestIds(pos_raster);
  var ix = value_raster.x;
  var iy = value_raster.y;
  var iz = value_raster.z;
 var ox = result.x;
 var oy = result.y;
 var oz = result.z;
 for (var i=0, li=ids.length; i<li; ++i) {
  ox[i] = ix[ids[i]];
  oy[i] = iy[ids[i]];
  oz[i] = iz[ids[i]];
 }
 return result;
}
// The FieldInterpolation namespaces provide operations commonly used in interpolation for computer graphics
// All input are raster objects, e.g. VectorRaster or Float32Raster
var Float32RasterInterpolation = {};
Float32RasterInterpolation.lerp = function(a,b, x, result){
    if (!(x instanceof Float32Array)) { throw "x" + ' is not a ' + "Float32Array"; }
    for (var i = 0, li = result.length; i < li; i++) {
  result[i] = a + x[i]*(b-a);
    }
    return result;
}
Float32RasterInterpolation.clamp = function(x, min_value, max_value, result) {
    if (!(x instanceof Float32Array)) { throw "x" + ' is not a ' + "Float32Array"; }
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = fraction > max_value? max_value : fraction < min_value? min_value : fraction;
    }
    return result;
}
Float32RasterInterpolation.smoothstep = function(edge0, edge1, x, result) {
    if (!(x instanceof Float32Array)) { throw "x" + ' is not a ' + "Float32Array"; }
 var fraction;
 var inverse_edge_distance = 1 / (edge1 - edge0);
    for (var i = 0, li = result.length; i < li; i++) {
  fraction = (x[i] - edge0) * inverse_edge_distance;
  result[i] = fraction > 1.0? 1.0 : fraction < 0.0? 0.0 : fraction;
 }
 return result;
}
//Float32RasterInterpolation.smooth_heaviside = function(x, k) {
//	return 2 / (1 + Math.exp(-k*x)) - 1;
//	return x>0? 1: 0; 
//}
var Vector = {};
Vector.similarity = function(ax, ay, az, bx, by, bz) {
 var sqrt = Math.sqrt;
 return (ax*bx +
   ay*by +
   az*bz) / ( sqrt(ax*ax+
        ay*ay+
        az*az) * sqrt(bx*bx+
                by*by+
                bz*bz) );
}
Vector.dot = function(ax, ay, az, bx, by, bz) {
 var sqrt = Math.sqrt;
 return (ax*bx + ay*by + az*bz);
}
Vector.magnitude = function(x, y, z) {
 return Math.sqrt(x*x + y*y + z*z);
}
// The VectorImageAnalysis namespace encompasses advanced functionality 
// common to image analysis
var VectorImageAnalysis = {};
// performs image segmentation
// NOTE: this uses no particular algorithm, I wrote it before I started looking into the research
// This function repeatedly uses the flood fill algorithm from VectorRasterGraphics,
// then uses mathematical morphology to ensure there are no overlapping regions between segments
VectorImageAnalysis.image_segmentation = function(vector_field, grid) {
  //TODO: holy shit, this still needs perf improvement
  var magnitude = VectorField.magnitude(vector_field);
  var mask = Uint8Raster(vector_field.grid);
  Uint8Raster.fill(mask, 1);
  var UINT8_NULL = 255;
  // step 1: run flood fill algorithm several times
  var min_plate_size = 200;
  var flood_fill;
  var plate_masks = Uint8Raster(vector_field.grid);
  Uint8Raster.fill(plate_masks, UINT8_NULL);
  for (var i=1; i<7; ) {
    flood_fill = VectorRasterGraphics.magic_wand_select(vector_field, Float32Raster.max_id(magnitude), mask);
    ScalarField.sub_field_term(magnitude, flood_fill, magnitude, magnitude);
    Uint8Field.sub_field(mask, flood_fill, mask);
      if (Uint8Dataset.sum(flood_fill) > min_plate_size) {
        Uint8RasterGraphics.fill_into_selection(plate_masks, i, flood_fill, plate_masks);
        // TODO: do something about infinite loop
        i++;
    }
  }
  // step 2: dilate and take difference with (plate_masks != i)
  var plate_mask = Uint8Raster(vector_field.grid);
  var is_empty = Uint8Raster(vector_field.grid);
  var is_occupied = Uint8Raster(vector_field.grid);
  for (var i=0; i<7; ++i) {
    Uint8Field.eq_scalar (plate_masks, i, plate_mask);
    Uint8Field.eq_scalar (plate_masks, UINT8_NULL, is_empty);
    Uint8Field.ne_scalar (plate_masks, i, is_occupied);
    BinaryMorphology.difference (is_occupied, is_empty, is_occupied);
    BinaryMorphology.dilation (plate_mask, 5, plate_mask);
    BinaryMorphology.closing (plate_mask, 5, plate_mask);
    BinaryMorphology.difference (plate_mask, is_occupied, plate_mask);
    Uint8RasterGraphics.fill_into_selection(plate_masks, i, plate_mask, plate_masks);
  }
  // step 3: find the remaining region that is not mapped to a plate, and make a new plate just for it
  Uint8Field.eq_scalar (plate_masks, UINT8_NULL, is_empty);
  Uint8RasterGraphics.fill_into_selection(plate_masks, 7, is_empty, plate_masks);
  return plate_masks;
}
var BinaryMorphology = {};
BinaryMorphology.VertexTypedArray = function(grid) {
 var result = new Uint8Array(grid.vertices.length);
 result.grid = grid;
 return result;
}
BinaryMorphology.to_binary = function(field, threshold, result) {
 result = result || Uint8Raster(field.grid);
 threshold = threshold || 0;
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field.length; i<li; ++i) {
     result[i] = (field[i] > threshold)? 1:0;
 }
 return result;
}
BinaryMorphology.to_float = function(field, result) {
 result = result || new Float32Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; }
 if (!(result instanceof Float32Array)) { throw "result" + ' is not a ' + "Float32Array"; }
 for (var i=0, li=field.length; i<li; ++i) {
     result[i] = (field[i]===1)? 1:0;
 }
 return result;
}
BinaryMorphology.copy = function(field, result) {
 result = result || Uint8Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field.length; i<li; ++i) {
     result[i] = field[i];
 }
 return result;
}
BinaryMorphology.universal = function(field) {
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field.length; i<li; ++i) {
     field[i] = 1;
 }
}
BinaryMorphology.empty = function(field) {
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field.length; i<li; ++i) {
     field[i] = 0;
 }
}
BinaryMorphology.union = function(field1, field2, result) {
 result = result || Uint8Raster(field1.grid);
 if (!(field1 instanceof Uint8Array)) { throw "field1" + ' is not a ' + "Uint8Array"; };
 if (!(field2 instanceof Uint8Array)) { throw "field2" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field1.length; i<li; ++i) {
     result[i] = (field1[i]===1 || field2[i]===1)? 1:0;
 }
 return result;
}
BinaryMorphology.intersection = function(field1, field2, result) {
 result = result || Uint8Raster(field1.grid);
 if (!(field1 instanceof Uint8Array)) { throw "field1" + ' is not a ' + "Uint8Array"; };
 if (!(field2 instanceof Uint8Array)) { throw "field2" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field1.length; i<li; ++i) {
     result[i] = (field1[i]===1 && field2[i]===1)? 1:0;
 }
 return result;
}
BinaryMorphology.difference = function(field1, field2, result) {
 result = result || Uint8Raster(field1.grid);
 if (!(field1 instanceof Uint8Array)) { throw "field1" + ' is not a ' + "Uint8Array"; };
 if (!(field2 instanceof Uint8Array)) { throw "field2" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field1.length; i<li; ++i) {
     result[i] = (field1[i]===1 && field2[i]===0)? 1:0;
 }
 return result;
}
BinaryMorphology.negation = function(field, result) {
 result = result || Uint8Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 for (var i=0, li=field.length; i<li; ++i) {
     result[i] = (field[i]===0)? 1:0;
 }
 return result;
}
BinaryMorphology.dilation = function(field, radius, result) {
 radius = radius || 1;
 result = result || Uint8Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 var buffer1 = radius % 2 == 1? result: Uint8Raster(field.grid);
 var buffer2 = radius % 2 == 0? result: BinaryMorphology.copy(field);
 var temp = buffer1;
 var neighbor_lookup = field.grid.neighbor_lookup;
 var neighbors = [];
 var buffer_i = true;
 for (var k=0; k<radius; ++k) {
  for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
      neighbors = neighbor_lookup[i];
      buffer_i = buffer2[i];
      for (var j=0, lj=neighbors.length; j<lj; ++j) {
          buffer_i = buffer_i || buffer2[neighbors[j]];
      }
      buffer1[i] = buffer_i? 1:0;
  }
  temp = buffer1;
  buffer1 = buffer2;
  buffer2 = temp;
 }
 return buffer2;
}
BinaryMorphology.erosion = function(field, radius, result) {
 radius = radius || 1;
 result = result || Uint8Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 var buffer1 = radius % 2 == 1? result: Uint8Raster(field.grid);
 var buffer2 = radius % 2 == 0? result: BinaryMorphology.copy(field);
 var temp = buffer1;
 var neighbor_lookup = field.grid.neighbor_lookup;
 var neighbors = [];
 var buffer_i = true;
 for (var k=0; k<radius; ++k) {
  for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
      neighbors = neighbor_lookup[i];
      buffer_i = buffer2[i];
      for (var j=0, lj=neighbors.length; j<lj; ++j) {
          buffer_i = buffer_i && buffer2[neighbors[j]];
      }
      buffer1[i] = buffer_i? 1:0;
  }
  temp = buffer1;
  buffer1 = buffer2;
  buffer2 = temp;
 }
 return buffer2;
}
BinaryMorphology.opening = function(field, radius) {
 var result = BinaryMorphology.erosion(field, radius);
 return BinaryMorphology.dilation(result, radius);
}
BinaryMorphology.closing = function(field, radius) {
 var result = BinaryMorphology.dilation(field, radius);
 return BinaryMorphology.erosion(result, radius);
}
BinaryMorphology.white_top_hat = function(field, radius) {
 var closing = BinaryMorphology.closing(field, radius);
 return BinaryMorphology.difference(closing, field);
}
BinaryMorphology.black_top_hat = function(field, radius) {
 var opening = BinaryMorphology.opening(field, radius);
 return BinaryMorphology.difference(field, opening);
}
// NOTE: this is not a standard concept in math morphology
// It is meant to represent the difference between a figure and its dilation
// Its name eludes to the "margin" concept within the html box model
BinaryMorphology.margin = function(field, radius, result) {
 result = result || Uint8Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 if(field === result) throw ("cannot use same input for 'field' and 'result' - margin() is not an in-place function")
 var dilation = result; // reuse result raster for performance reasons
 BinaryMorphology.dilation(field, radius, dilation);
 return BinaryMorphology.difference(dilation, field, result);
}
// NOTE: this is not a standard concept in math morphology
// It is meant to represent the difference between a figure and its erosion
// Its name eludes to the "padding" concept within the html box model
BinaryMorphology.padding = function(field, radius, result) {
 result = result || Uint8Raster(field.grid);
 if (!(field instanceof Uint8Array)) { throw "field" + ' is not a ' + "Uint8Array"; };
 if (!(result instanceof Uint8Array)) { throw "result" + ' is not a ' + "Uint8Array"; };
 if(field === result) throw ("cannot use same input for 'field' and 'result' - padding() is not an in-place function")
 var erosion = result; // reuse result raster for performance reasons
 BinaryMorphology.erosion(field, radius, erosion);
 return BinaryMorphology.difference(field, erosion, result);
}
