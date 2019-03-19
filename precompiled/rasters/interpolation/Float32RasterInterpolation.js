
// The FieldInterpolation namespaces provide operations commonly used in interpolation for computer graphics
// All input are raster objects, e.g. VectorRaster or Float32Raster
var Float32RasterInterpolation = {};
Float32RasterInterpolation.mix = function(a,b, x, result){
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = a + x[i]*(b-a);
    }
    return result;
}
Float32RasterInterpolation.mix_fsf = function(a,b, x, result){
    ASSERT_IS_ARRAY(a, Float32Array)
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = a[i] + x[i] * (b-a[i]);
    }
    return result;
}
Float32RasterInterpolation.mix_sff = function(a,b, x, result){
    ASSERT_IS_ARRAY(b, Float32Array)
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = a + x[i] * (b[i]-a);
    }
    return result;
}
Float32RasterInterpolation.clamp = function(x, min_value, max_value, result) {
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    var x_i = 0.0;
    for (var i = 0, li = x.length; i < li; i++) {
        x_i = x[i];
        result[i] = x_i > max_value? max_value : x_i < min_value? min_value : x_i;
    }
    return result;
}
Float32RasterInterpolation.step = function(edge, x, result) {
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    for (var i = 0, li = x.length; i < li; i++) {
        result[i] = x[i] > edge? 1. : 0.;
    }
    return result;
}
Float32RasterInterpolation.linearstep = function(edge0, edge1, x, result) {
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    var fraction = 0.;
    var inverse_edge_distance = 1 / (edge1 - edge0);
    for (var i = 0, li = result.length; i < li; i++) {
        fraction = (x[i] - edge0) * inverse_edge_distance;
        result[i] = fraction > 1.0? 1.0 : fraction < 0.0? 0.0 : fraction;
    }
    return result;
}
Float32RasterInterpolation.smoothstep = function(edge0, edge1, x, result) {
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    var inverse_edge_distance = 1 / (edge1 - edge0);
    var fraction = 0.;
    var linearstep = 0.;
    for (var i = 0, li = result.length; i < li; i++) {
        fraction = (x[i] - edge0) * inverse_edge_distance;
        linearstep = fraction > 1.0? 1.0 : fraction < 0.0? 0.0 : fraction;
        result[i] = linearstep*linearstep*(3-2*linearstep);
    }
    return result;
}
// NOTE: you probably don't want to use this - you should use "smoothstep", instead
// smoothstep is faster, and it uses more intuitive parameters
// smoothstep2 is only here to support legacy behavior
Float32RasterInterpolation.smoothstep2 = function(x, k, result) {
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    ASSERT_IS_ARRAY(result, Float32Array)
    var exp = Math.exp;
    for (var i = 0, li = result.length; i < li; i++) {
       result[i] = 2 / (1 + exp(-k*x[i])) - 1;
    }
    return result;
}
// performs Linear piecewise intERPolation:
// given a list of control points that map 1d space to 1d scalars, and a raster of 1d input, 
// it returns a scalar field where each value maps to the corresponding value on the input field
Float32RasterInterpolation.lerp = function(control_points_x, control_points_y, x, result, scratch) {
    ASSERT_IS_ARRAY(x, Float32Array)
    result = result || Float32Raster.FromExample(x);
    scratch = scratch || Float32Raster.FromExample(x);

    var mix = Float32RasterInterpolation.mix_fsf;
    var linearstep = Float32RasterInterpolation.linearstep;
    
    Float32Raster.fill(result, control_points_y[0]);
    for (var i = 1; i < control_points_x.length; i++) {
        linearstep  (control_points_x[i-1], control_points_x[i], x,  scratch)
        mix         (result, control_points_y[i], scratch,           result);
    }

    return result;
}
