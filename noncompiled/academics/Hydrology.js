// Hydrology is a namespace isolating all business logic relating to the behavior of liquids on a planet
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Hydrology = {};

Hydrology.get_surface_heights = function(displacement, sealevel, result) {
    ScalarField.sub_scalar(displacement, sealevel, result);
    ScalarField.max_scalar(result, 0, result);
    return result;
}

Hydrology.get_ocean_depths = function(displacement, sealevel, result) {
    ScalarField.sub_scalar(displacement, sealevel, result);
    ScalarField.mult_scalar(result, -1, result);
    ScalarField.max_scalar(result, 0, result);
    return result;
}

// solve for sealevel using iterative numerical approximation
Hydrology.solve_sealevel = function(displacement, average_ocean_depth, scratch, iterations) {
    iterations = iterations || 10;
    scratch = scratch || Float32Raster(displacement.grid);

    // lowest possible value - assumes average_ocean_depth == 0
    var sealevel_min = 0;
    // highest possible value - the value sealevel takes if the entire globe is at the highest elevation observed
    var sealevel_max = Float32Dataset.max(displacement) + average_ocean_depth; 
    // our current guess for sealevel, which we improve iteratively
    var sealevel_guess = 0;
    // the value we get for average_ocean_depth when we plug in our guess for sealevel
    var average_ocean_depth_guess = 0;

    var get_ocean_depth = Hydrology.get_ocean_depths;
    var average = Float32Dataset.average;

    var ocean_depth_guess = scratch;
    for (var i = 0; i < iterations; i++) {
        sealevel_guess = sealevel_min + (sealevel_max - sealevel_min) / 2;
        get_ocean_depth(displacement, sealevel_guess, ocean_depth_guess);
        average_ocean_depth_guess = average(ocean_depth_guess);
        var diff = average_ocean_depth - average_ocean_depth_guess;
        if (average_ocean_depth_guess < average_ocean_depth) {
            sealevel_min = sealevel_guess;
        } else {
            sealevel_max = sealevel_guess;
        }
    }
    return sealevel_guess;
}
