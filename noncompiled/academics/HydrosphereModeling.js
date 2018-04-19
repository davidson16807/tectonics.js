var HydrosphereModeling = {};

HydrosphereModeling.get_surface_height = function(displacement, sealevel, result) {
	ScalarField.sub_scalar(displacement, sealevel, result);
	ScalarField.max_scalar(result, 0, result);
	return result;
}

HydrosphereModeling.get_ocean_depth = function(displacement, sealevel, result) {
	ScalarField.sub_scalar(displacement, sealevel, result);
	ScalarField.mult_scalar(result, -1, result);
	ScalarField.max_scalar(result, 0, result);
	return result;
}

// solve for sealevel using iterative numerical approximation
HydrosphereModeling.solve_sealevel = function(displacement, total_ocean_mass, ocean_density, scratch, iterations) {
	iterations = iterations || 10;
	scratch = scratch || Float32Raster(displacement.grid);

	// lowest possible value - assumes total_ocean_mass == 0
	var sealevel_min = 0;
	// highest possible value - the value sealevel takes if the entire globe is at the highest elevation observed
	var sealevel_max = Float32Dataset.max(displacement) + total_ocean_mass / (ocean_density * displacement.grid.vertices.length); 
	// our current guess for sealevel, which we improve iteratively
	var sealevel_guess = 0;
	// the value we get for total_ocean_mass when we plug in our guess for sealevel
	var average_ocean_depth_guess = 0;

	var get_ocean_depth = HydrosphereModeling.get_ocean_depth;
	var average = Float32Dataset.average;

	var ocean_depth_guess = scratch;
	for (var i = 0; i < iterations; i++) {
		sealevel_guess = sealevel_min + (sealevel_max - sealevel_min) / 2;
		get_ocean_depth(displacement, sealevel_guess, ocean_depth_guess);
		average_ocean_depth_guess = average(ocean_depth_guess);
		var diff = total_ocean_mass - average_ocean_depth_guess;
		if (average_ocean_depth_guess < total_ocean_mass) {
			sealevel_min = sealevel_guess;
		} else {
			sealevel_max = sealevel_guess;
		}
	}
	return sealevel_guess;
}