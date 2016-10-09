("use strict");

// The ScalarField namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Float32Raster
var ScalarField = {};

ScalarField.copy = function(field, result) {
  var result = Float32Raster(field.grid);
  for (var i=0, li=field.length; i<li; ++i) {
      result[i] = field[i];
  }
  return result;
}
ScalarField.fill = function (field, value) {
  for (var i = 0, li = field.length; i < li; i++) {
    field[i] = value;
  }
};
ScalarField.min_id = function (field) {
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = field.length; i < li; i++) {
    value = field[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
ScalarField.min = function (field) {
  field[ScalarField.min_id(field)];
};
ScalarField.max_id = function (field) {
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = field.length; i < li; i++) {
    value = field[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
ScalarField.max = function (field) {
  field[ScalarField.max_id(field)];
};
ScalarField.sum = function (field) {
  var result = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i];
  }
  return result;
};
ScalarField.average = function (field) {
  var result = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i];
  }
  return result / field.length;
};
ScalarField.weighted_average = function (field, weights) {
  var result = 0;
  var weight_sum = 0;
  for (var i=0, li=field.length; i<li; ++i) {
      result += field[i] * weights[i];
      weight_sum += weights[i];
  }
  return result / weight_sum;
};


ScalarField.normalize_field = function(field, result) {
  result = result || Float32Raster(field.grid);

  var min = ScalarField.min(field);
  var max = ScalarField.max(field);
  for (var i=0, li=field.length; i<li; ++i) {
      field[i] = (field[i] - min) / (max - min);
  }
  return result;
}
ScalarField.add_field_term = function (field1, field2, scalar, result) {
  result = result || Float32Raster(field1.grid);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + scalar * field2[i];
  }
  return result;
};
ScalarField.add_field_term = function (field1, field2, scalar, result) {
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

ScalarField.get_nearest_value = function(field, pos) {
  return field[field.grid.getNearestId(pos)];
}
ScalarField.get_nearest_values = function(value_field, pos_field, result) {
  result = result || Float32Raster(pos_field.grid);
  var ids = pos_field.grid.getNearestIds(pos_field);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_field[ids[i]];
  }
  return result;
}