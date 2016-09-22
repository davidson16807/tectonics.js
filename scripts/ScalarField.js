("use strict");
var ScalarField = {};
ScalarField.VertexTypedArray = function (grid, fill, Constructor) {
  Constructor = Constructor || Float32Array;
  var result = new Constructor(grid.vertices.length);
  if (fill !== void 0) { 
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = fill;
    }
  }
  return result;
};
ScalarField.EdgeTypedArray = function (grid, fill) {
  var result = new Float32Array(grid.edges.length);
  if (fill !== void 0) { 
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = fill;
    }
  }
  return result;  
};
ScalarField.ArrowTypedArray = function (grid, fill) {
  var result = new Float32Array(grid.arrows.length);
  if (fill !== void 0) { 
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = fill;
    }
  }
  return result;  
};
ScalarField.TypedArrayOfLength = function (length, fill) {
  var result = new Float32Array(length);
  if (fill !== void 0) { 
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = fill;
    }
  }
  return result;  
};

ScalarField.copy = function(field, result) {
  var result = new Float32Array(length);
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
  result = result || new Float32Array(field.length);

  var min = ScalarField.min(field);
  var max = ScalarField.max(field);
  for (var i=0, li=field.length; i<li; ++i) {
      field[i] = (field[i] - min) / (max - min);
  }
  return result;
}
ScalarField.add_field_term = function (field1, field2, scalar, result) {
  result = result || new Float32Array(field1.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + scalar * field2[i];
  }
  return result;
};
ScalarField.add_field_term = function (field1, field2, scalar, result) {
  result = result || new Float32Array(field1.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + scalar * field2[i];
  }
  return result;
};
ScalarField.add_field = function (field1, field2, result) {
  result = result || new Float32Array(field1.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field2[i];
  }
  return result;
};
ScalarField.sub_field = function (field1, field2, result) {
  result = result || new Float32Array(field1.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] - field2[i];
  }
  return result;
};
ScalarField.mult_field = function (field1, field2, result) {
  result = result || new Float32Array(field1.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] * field2[i];
  }
  return result;
};
ScalarField.div_field = function (field1, field2, result) {
  result = result || new Float32Array(field1.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] / field2[i];
  }
  return result;
};
ScalarField.add_scalar = function (field, scalar, result) {
  result = result || new Float32Array(field.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] + scalar;
  }
  return result;
};
ScalarField.sub_scalar = function (field, scalar, result) {
  result = result || new Float32Array(field.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] - scalar;
  }
  return result;
};
ScalarField.mult_scalar = function (field, scalar, result) {
  result = result || new Float32Array(field.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] * scalar;
  }
  return result;
};
ScalarField.div_scalar = function (field, scalar, result) {
  result = result || new Float32Array(field.length);
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] / scalar;
  }
  return result;
};
ScalarField.arrow_differential = function (field, grid, result) {
  result = result || ScalarField.ArrowTypedArray(grid);
  var arrows = grid.arrows;
  var arrow = [];
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    result[i] = field[arrow[1]] - field[arrow[0]];
  }
  return result;
};
ScalarField.edge_differential = function (field, grid, result) {
  result = result || ScalarField.EdgeTypedArray(grid);
  var edges = grid.edges;
  var edge = [];
  for (var i = 0, li = edges.length; i < li; i++) {
    edge = edges[i];
    result[i] = field[edge[1]] - field[edge[0]];
  }
  return result;
};
ScalarField.vertex_differential = function (field, grid, result) {
  result = result || VectorField.VertexDataFrame(grid);
  var dpos = grid.pos_arrow_differential;
  var arrows = grid.arrows;
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
  var neighbor_lookup = grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.edge_gradient = function (field, grid, result) {
  result = result || VectorField.EdgeDataFrame(grid);
  var dfield = 0;
  var dpos = grid.pos_edge_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  var edges = grid.edges;
  var edge = [];
  for (var i = 0, li = edges.length; i < li; i++) {
    edge = edges[i];
    dfield = field[edge[1]] - field[edge[0]];
    x[i] = dfield / dx[i] || 0;
    y[i] = dfield / dy[i] || 0;
    z[i] = dfield / dz[i] || 0;
  }
  return result;
};
ScalarField.arrow_gradient = function (field, grid, result) {
  result = result || VectorField.ArrowDataFrame(grid);
  var dfield = 0;
  var dpos = grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  var arrows = grid.arrows;
  var arrow = [];
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    dfield = field[arrow[1]] - field[arrow[0]];
    x[i] = dfield / dx[i] || 0;
    y[i] = dfield / dy[i] || 0;
    z[i] = dfield / dz[i] || 0;
  }
  return result;
};
ScalarField.vertex_gradient = function (field, grid, result) {
  result = result || VectorField.VertexDataFrame(grid);
  var dfield = 0;
  var dpos = grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var arrows = grid.arrows;
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
  var neighbor_lookup = grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.edge_gradient_similarity = function (field, grid, result) {
  result = result || ScalarField.EdgeTypedArray(grid);
  var gradient = ScalarField.vertex_gradient(field, grid);
  VectorField.edge_similarity(gradient, grid, result);
  return result;
};
ScalarField.arrow_gradient_similarity = function (field, grid, result) {
  result = result || ScalarField.ArrowTypedArray(grid);
  var gradient = ScalarField.vertex_gradient(field, grid);
  VectorField.arrow_similarity(gradient, grid, result);
  return result;
};
ScalarField.edge_laplacian = function (field, grid, result) {
  result = result || ScalarField.EdgeTypedArray(grid);
  var gradient = ScalarField.vertex_gradient(field, grid);
  VectorField.edge_divergence(gradient, grid, result);
  return result;
};
ScalarField.arrow_laplacian = function (field, grid, result) {
  result = result || ScalarField.ArrowTypedArray(grid);
  var gradient = ScalarField.vertex_gradient(field, grid);
  VectorField.arrow_divergence(gradient, grid, result);
  return result;
};
ScalarField.vertex_laplacian = function (field, grid, result) {
  result = result || ScalarField.VertexTypedArray(grid);
  var arrows = grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += field[arrow[1]] - field[arrow[0]];
  }
  var neighbor_lookup = grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      result[i] /= neighbor_count;
  }
  return result;
};

