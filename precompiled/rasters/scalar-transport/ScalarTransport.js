var ScalarTransport = {};

ScalarTransport.is_nonnegative_quantity = function(quantity) {
  ASSERT_IS_ARRAY(quantity, Float32Array)

  var quantity_i = 0.0;
  for (var i=0, li=quantity.length; i<li; ++i) {
    if (quantity[i] < 0) {
      return false;
    }
  }
  return true;
}
ScalarTransport.is_conserved_quantity_delta = function(delta, threshold) {
  ASSERT_IS_ARRAY(delta, Float32Array)

  var average = Float32Dataset.average(delta);
  if (average * average > threshold * threshold) {
    return false;
  }
  return true;
}
ScalarTransport.is_nonnegative_quantity_delta = function(delta, quantity) {
  ASSERT_IS_ARRAY(delta, Float32Array)
  ASSERT_IS_ARRAY(quantity, Float32Array)
  
  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      return false;
    }
  }
  return true;
}
ScalarTransport.fix_nonnegative_quantity = function(quantity) {
  ASSERT_IS_ARRAY(quantity, Float32Array)
  
  ScalarField.min_scalar(quantity, 0);
}
ScalarTransport.fix_conserved_quantity_delta = function(delta, threshold) {
  ASSERT_IS_ARRAY(delta, Float32Array)

  var average = Float32Dataset.average(delta);
  if (average * average > threshold * threshold) {
    ScalarField.sub_scalar(delta, average, delta);
  }
}
ScalarTransport.fix_nonnegative_quantity_delta = function(delta, quantity) {
  ASSERT_IS_ARRAY(delta, Float32Array)
  ASSERT_IS_ARRAY(quantity, Float32Array)

  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      delta[i] = -quantity[i];
    }
  }
}
ScalarTransport.fix_nonnegative_conserved_quantity_delta = function(delta, quantity, scratch) {
  return;

  var scratch = scratch || Float32Raster(delta.grid);

  ASSERT_IS_ARRAY(delta, Float32Array)
  ASSERT_IS_ARRAY(quantity, Float32Array)
  ASSERT_IS_ARRAY(scratch, Float32Array)
  
  var total_excess = 0.0;
  var total_remaining = 0.0;
  var remaining = scratch;
  // clamp delta to quantity available
  // keep tabs on excess where delta exceeds quantity
  // also keep tabs on which cells still have quantity remaining after delta is applied
  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      total_excess += -delta[i] - quantity[i];
      delta[i] = -quantity[i];
      remaining[i] = 0;
    }
    else {
      remaining[i] = quantity[i] + delta[i];
      total_remaining += quantity[i] + delta[i];
    }
  }
  // go back and correct the excess by taxing from the remaining quantity
  // the more remaining a cell has, the more it gets taxed
  var remaining_tax = total_excess / total_remaining;
  if (remaining_tax) {
    for (var i=0, li=delta.length; i<li; ++i) {
      delta[i] -= remaining[i] * remaining_tax;
    }
  }
}