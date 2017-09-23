
// The ScalarField namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Float32Raster
var ScalarField = {};

ScalarField.min_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ARRAY(field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < field2[i]? field1[i] : field2[i];
  }
  return result;
};
ScalarField.max_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ARRAY(field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > field2[i]? field1[i] : field2[i];
  }
  return result;
};
ScalarField.gt_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ARRAY(field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > field2[i]? 1:0;
  }
  return result;
};
ScalarField.gte_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ARRAY(field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] >= field2[i]? 1:0;
  }
  return result;
};
ScalarField.lt_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ARRAY(field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < field2[i]? 1:0;
  }
  return result;
};
ScalarField.lte_field = function (field1, field2, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ARRAY(field2, Float32Array)
  ASSERT_IS_ARRAY(result, Uint8Array)

  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] <= field2[i]? 1:0;
  }
  return result;
};


ScalarField.min_scalar = function (field1, scalar, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < scalar? field1[i] : scalar;
  }
  return result;
};
ScalarField.max_scalar = function (field1, scalar, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > scalar? field1[i] : scalar;
  }
  return result;
};
ScalarField.gt_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] > scalar? 1:0;
  }
  return result;
};
ScalarField.gte_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] >= scalar? 1:0;
  }
  return result;
};
ScalarField.lt_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] < scalar? 1:0;
  }
  return result;
};
ScalarField.lte_scalar = function (field1, scalar, result) {
  result = result || Uint8Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Uint8Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] <= scalar? 1:0;
  }
  return result;
};

ScalarField.add_field_term = function (field1, field2, field3, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field3[i] * field2[i];
  }
  return result;
};
ScalarField.add_scalar_term = function (field1, field2, scalar, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + scalar * field2[i];
  }
  return result;
};
ScalarField.add_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] + field2[i];
  }
  return result;
};
ScalarField.sub_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] - field2[i];
  }
  return result;
};
ScalarField.sub_field_term = function (field1, field2, field3, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_ANY_ARRAY(field3) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] - field3[i] * field2[i];
  }
  return result;
};
ScalarField.sub_scalar_term = function (field1, field2, scalar, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] - scalar * field2[i];
  }
  return result;
};
ScalarField.mult_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] * field2[i];
  }
  return result;
};
ScalarField.div_field = function (field1, field2, result) {
  result = result || Float32Raster(field1.grid);
  ASSERT_IS_ARRAY(field1, Float32Array)
  ASSERT_IS_ANY_ARRAY(field2) 
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field1[i] / field2[i];
  }
  return result;
};
ScalarField.add_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] + scalar;
  }
  return result;
};
ScalarField.sub_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] - scalar;
  }
  return result;
};
ScalarField.mult_scalar = function (field, scalar, result) {
  result = result || Float32Raster(field.grid);
  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_TYPE(scalar, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] * scalar;
  }
  return result;
};
ScalarField.mult_vector = function (scalar, vector, result) {
  result = result || VectorRaster(scalar.grid);

  ASSERT_IS_ARRAY(field, Float32Array)

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
ScalarField.div_scalar = function (field, constant, result) {
  result = result || Float32Raster(field.grid);

  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_TYPE(constant, number)
  ASSERT_IS_ARRAY(result, Float32Array)
  
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = field[i] / constant;
  }
  return result;
};
ScalarField.differential = function (field, result) {
  result = result || VectorRaster(field.grid);

  ASSERT_IS_ARRAY(field, Float32Array)
  
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

  ASSERT_IS_ARRAY(field, Float32Array)

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

ScalarField.average_difference = function (field, result) {
  result = result || Float32Raster(field.grid);

  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_NOT_EQUAL(field, result)

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
 
// This function computes the laplacian of a surface. 
// The laplacian can be thought of as a metric for the average difference across space. 
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// We assume all vertices in field.grid are equidistant on a surface. 
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
ScalarField.laplacian = function (field, result) { 
  result = result || Float32Raster(field.grid);

  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_ARRAY(result, Float32Array)
  ASSERT_IS_NOT_EQUAL(field, result)

  for (var i = 0; i < result.length; i++) { 
    result[i] = -4*field[i]; 
  } 
  var arrows = field.grid.arrows;
  var arrow;
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += field[arrow[1]]; 
  }
  var neighbor_count = field.grid.neighbor_count; 
  var average_distance = field.grid.average_distance * field.grid.average_distance; 
  for (var i = 0, li = neighbor_count.length; i < li; i++) { 
      result[i] *= 4; 
      result[i] /= neighbor_count[i] * average_distance; 
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_constant = function (input, constant, output, scratch) {
  output = output || Float32Raster(input.grid);
  scratch = scratch || Float32Raster(input.grid);

  ASSERT_IS_ARRAY(input, Float32Array)
  ASSERT_IS_ARRAY(output, Float32Array)
  ASSERT_IS_ARRAY(scratch, Float32Array)
  ASSERT_IS_TYPE(constant, number)

  var laplacian = scratch;
  var arrows = input.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += input[arrow[1]] - input[arrow[0]];
  }
  var neighbor_lookup = input.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      laplacian[i] /= neighbor_count;
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      output[i] = input[i] + constant * laplacian[i];
  }
  return output;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_field = function (input, field, output, scratch) {
  output = output || Float32Raster(input.grid);
  scratch = scratch || Float32Raster(input.grid);

  ASSERT_IS_ARRAY(input, Float32Array)
  ASSERT_IS_ARRAY(field, Float32Array)
  ASSERT_IS_ARRAY(output, Float32Array)
  ASSERT_IS_ARRAY(scratch, Float32Array)

  var laplacian = scratch;
  var arrows = input.grid.arrows;
  var arrow
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += input[arrow[1]] - input[arrow[0]];
  }
  var neighbor_lookup = input.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
      neighbor_count = neighbor_lookup[i].length;
      laplacian[i] /= neighbor_count;
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      output[i] = input[i] + field[i] * laplacian[i];
  }
  return output;
};