
// The ScalarField namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Float32Raster
var ScalarField = {};

ScalarField.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
ScalarField.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
ScalarField.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.eq_field = function (scalar_field1, scalar_field2, threshold, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_SCALAR(threshold)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i] + threshold || scalar_field1[i] > scalar_field2[i] - threshold ? 1:0;
  }
  return result;
};
ScalarField.ne_field = function (scalar_field1, scalar_field2, threshold, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_SCALAR(threshold)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i] + threshold || scalar_field1[i] < scalar_field2[i] - threshold ? 1:0;
  }
  return result;
};


ScalarField.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
ScalarField.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
ScalarField.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
ScalarField.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
ScalarField.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
ScalarField.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
ScalarField.between_scalars = function (scalar_field1, scalar1, scalar2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar1)
  ASSERT_IS_SCALAR(scalar2)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar1 < scalar_field1[i] && scalar_field1[i] < scalar2? 1:0;
  }
  return result;
};
ScalarField.eq_scalar = function (scalar_field1, scalar, threshold, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_SCALAR(threshold)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar + threshold || scalar_field1[i] > scalar - threshold ? 1:0;
  }
  return result;
};
ScalarField.ne_scalar = function (scalar_field1, scalar, threshold, result) {
  result = result || Uint8Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_SCALAR(threshold)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar + threshold || scalar_field1[i] < scalar - threshold ? 1:0;
  }
  return result;
};

ScalarField.add_field_term = function (scalar_field1, scalar_field2, scalar_field3, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ANY_ARRAY(scalar_field3) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field3[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
ScalarField.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
ScalarField.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
ScalarField.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
ScalarField.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(scalar_field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
ScalarField.add_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
ScalarField.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
ScalarField.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
ScalarField.div_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_SCALAR(scalar)
  ASSERT_IS_ARRAY(result, Float32Array)
  
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
ScalarField.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_VECTOR_RASTER(result)

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

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_VECTOR_RASTER(result)
  
  var arrows = scalar_field.grid.arrows;
  var arrow = [];
  var from = 0, to = 0;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  Float32Raster.fill(x, 0);
  Float32Raster.fill(y, 0);
  Float32Raster.fill(z, 0);
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
  scratch = scratch || VectorRaster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_VECTOR_RASTER(result)

  var dpos = scalar_field.grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var arrows = scalar_field.grid.arrows;
  var arrow = [];
  var arrow_distances = scalar_field.grid.pos_arrow_distances;
  var max_slope = scratch;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  var abs = Math.abs;
  var arrow_distance = 0;
  var slope = 0;
  var slope_magnitude = 0;
  var slope_adjust = 0;
  var from = 0;
  var to = 0;
  //
  // NOTE: 
  // The naive implementation is to estimate the gradient based on each individual neighbor,
  //  then take the average between the estimates.
  // This is wrong! If dx, dy, or dz is very small, 
  //  then the gradient estimate along that dimension will be very big.
  // This will result in very strange behavior.
  //
  // The correct implementation is to take a weighted sum of the position differentials across neighbors.
  // The "weights" are estimates for the derivative along that axis - 
  //  that is, the change in scalar_field across neighbors divided by the distance that separates neighbors.
  // Take the weighted sum and scale it as if there were 3 neighbors instead of however many there are. 
  // This is effectively what you do when you find the gradient using normal methods:
  //  each component of the cartesian coordinate basis corresponds to a "neighbor" in our approach.
  // We create a weighted sum between them, weighting by the derivative for each. 
  //  There are already 3 "neighbors", one for each coordinate basis, so we don't do anything.
  Float32Raster.fill(max_slope, 0);
  Float32Raster.fill(x, 0);
  Float32Raster.fill(y, 0);
  Float32Raster.fill(z, 0);
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    from = arrow[0];
    to = arrow[1];
    arrow_distance = arrow_distances[i];
    slope = (scalar_field[to] - scalar_field[from]) / arrow_distance;
    slope_magnitude = abs(slope);
    if (slope_magnitude > max_slope[from]) {
      max_slope[from] = slope_magnitude;
      slope_adjust = slope/arrow_distance;
      x[from] = dx[i] * slope_adjust;
      y[from] = dy[i] * slope_adjust;
      z[from] = dz[i] * slope_adjust;
    }
  }
  return result;
};

ScalarField.average_difference = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_NOT_EQUAL(scalar_field, result)

  var arrows = scalar_field.grid.arrows;
  var arrow
  Float32Raster.fill(result, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      result[i] /= neighbor_count[i];
  }
  return result;
};
 
// This function computes the laplacian of a surface. 
// The laplacian can be thought of as the average difference across space, per unit area. 
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// We assume all vertices in scalar_field.grid are equidistant on a surface. 
// 
// So for 2d: 
//
// ∇⋅∇f = ∇⋅[ (f(x+dx) - f(x-dx)) / 2dx,  
//            (f(x+dy) - f(x-dy)) / 2dy  ]
//
// ∇⋅∇f = d/dx (f(x+dx) - f(x-dx)) / 2dx  
//      + d/dy (f(x+dy) - f(x-dy)) / 2dy
//
// ∇⋅∇f =  1/4 (f(x+2dx) - f(x)) / dxdx  
//      +  1/4 (f(x-2dx) - f(x)) / dxdx  
//      +  1/4 (f(x+2dy) - f(x)) / dydy
//      +  1/4 (f(x-2dy) - f(x)) / dydy
//  
// Think of it as taking the average slope between four neighbors. 
// That means if we have an arbitrary number of neighbors,  
// we find the average difference and divide by the average area covered by a point.
ScalarField.laplacian = function (scalar_field, result) { 
  result = result || Float32Raster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_NOT_EQUAL(scalar_field, result)

  var arrows = scalar_field.grid.arrows;
  var arrow

  Float32Raster.fill(result, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  var average_distance = scalar_field.grid.average_distance;
  var average_area = average_distance * average_distance;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      result[i] /= average_area * neighbor_count[i];
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_constant = function (scalar_field, constant, result, scratch) {
  result = result || Float32Raster(scalar_field.grid);
  scratch = scratch || Float32Raster(scalar_field.grid);

  ASSERT_IS_ARRAY(scalar_field, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_ARRAY(scratch, Float32Array)
  ASSERT_IS_SCALAR(constant)

  var laplacian = scratch;
  var arrows = scalar_field.grid.arrows;
  var arrow
  Float32Raster.fill(laplacian, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      laplacian[i] /= neighbor_count[i];
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

  ASSERT_IS_ARRAY(scalar_field1, Float32Array)
  ASSERT_IS_ARRAY(scalar_field2, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_ARRAY(scratch, Float32Array)

  var laplacian = scratch;
  var arrows = scalar_field1.grid.arrows;
  var arrow
  Float32Raster.fill(laplacian, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += scalar_field1[arrow[1]] - scalar_field1[arrow[0]];
  }
  var neighbor_count = scalar_field1.grid.neighbor_count;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      laplacian[i] /= neighbor_count[i];
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      result[i] = scalar_field1[i] + scalar_field2[i] * laplacian[i];
  }
  return result;
};
