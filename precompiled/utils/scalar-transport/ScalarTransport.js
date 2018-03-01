var ScalarTransport = {};

ScalarTransport.assert_nonnegative_quantity = function(quantity) {
  ASSERT_IS_ARRAY(quantity, Float32Array)

#ifndef IS_PROD
  var quantity_i = 0.0;
  for (var i=0, li=quantity.length; i<li; ++i) {
    if (quantity[i] < 0) {
      debugger;
    }
  }
#endif
}
ScalarTransport.assert_conserved_quantity_delta = function(delta, threshold) {
  ASSERT_IS_ARRAY(delta, Float32Array)

#ifndef IS_PROD
  var average = Float32Dataset.average(delta);
  if (average * average > threshold * threshold) {
    debugger;
  }
#endif
}
ScalarTransport.assert_nonnegative_quantity_delta = function(delta, quantity) {
  ASSERT_IS_ARRAY(delta, Float32Array)
  ASSERT_IS_ARRAY(quantity, Float32Array)
  
#ifndef IS_PROD
  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      debugger;
    }
  }
#endif
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
// NOTE: if anyone can find a shorter more intuitive name for this, I'm all ears
ScalarTransport.fix_nonnegative_conserved_quantity_delta = function(delta, quantity, scratch) {
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
      delta[i] = -quantity[i];
      total_excess += -delta[i] - quantity[i];
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