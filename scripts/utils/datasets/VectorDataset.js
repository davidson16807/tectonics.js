'use strict';

var VectorDataset = {};

VectorDataset.sum = function (field) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

    for (var i=0, li=field.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }

    return {x:sum_x, y:sum_y, z:sum_z};
};
VectorDataset.average = function (field) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

    for (var i=0, li=field.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    
    return {
		x:sum_x / field.length, 
		y:sum_y / field.length, 
		z:sum_z / field.length
	};
};
VectorDataset.weighted_average = function (field, weights) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

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


// TODO: needs implementation
// WARNING: potential gotcha!
// VectorDataset.normalize(0) performs statistical normalization, whereas
// VectorField.normalize(0) individually normalizes each vector within the field.
// VectorDataset.normalize() outputs vectors with magnitude ranging from 0 to 1
// VectorField.normalize() outputs unit vectors.
VectorDataset.normalize = function(field, result) {
  throw 'not implemented';
  result = result || VectorRaster(field.grid);

  var min = VectorDataset.min(field);
  var max = VectorDataset.max(field);
  for (var i=0, li=field.length; i<li; ++i) {
      field[i] = (field[i] - min) / (max - min);
  }
  return result;
}