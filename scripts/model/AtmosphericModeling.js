
var AtmosphericModeling = {};
AtmosphericModeling.surface_air_pressure_land_effect = function(displacement, lat, sealevel, effect, scratch) {
	var is_land = ScalarField.gt_scalar(displacement, sealevel);
	BinaryMorphology.erosion(is_land, 2, is_land);
	Float32Raster.FromUint8Raster(is_land, effect);
	var diffuse = ScalarField.diffusion_by_constant;
	var smoothing_iterations =  2;
	for (var i=0; i<smoothing_iterations; ++i) {
		diffuse(effect, 1, effect, scratch);
	}
	var pos = world.grid.pos;
	ScalarField.mult_field(effect, lat, effect);
	return effect;
}
AtmosphericModeling.surface_air_pressure_lat_effect = function (lat, pressure) {
	pressure = pressure || Float32Raster(lat.grid);
	var cos = Math.cos;
	for (var i=0, li=lat.length; i<li; ++i) {
	    pressure[i] = -cos(5*(lat[i]));
	}
	return pressure
}
AtmosphericModeling.surface_air_velocity_coriolis_effect = function(pos, velocity, angular_speed, effect) {
	effect = effect || VectorRaster(pos.grid);
	VectorField.cross_vector_field	(velocity, pos, 			effect);
	VectorField.mult_scalar 		(effect, 2 * angular_speed, effect);
	VectorField.mult_scalar_field	(effect, pos.y, 			effect);
	return effect;
}
// "seasonal" air pressure is the pressure when taking seasons into account
// To set the season to winter for the Northern hemisphere, set axial_tilt to the correct positve value.
// To set the season to summer for the Northern hemisphere, set axial_tilt to the negation of the correct value.
// Remember: axial_tilt is in radians.
// Earth's axial_tilt is Math.PI*23.5/180
AtmosphericModeling.seasonal_surface_air_pressure = function(displacement, lat, sealevel, axial_tilt, pressure, scratch) {
	// "effective latitude" is what the latitude is like weather-wise, when taking axial tilt into account
	var effective_lat = scratch; 
	ScalarField.add_scalar(lat, axial_tilt, effective_lat);
	Float32RasterInterpolation.clamp(effective_lat, -Math.PI/2, Math.PI/2, effective_lat);

	AtmosphericModeling.surface_air_pressure_lat_effect(effective_lat, pressure);

	var land_effect = Float32Raster(lat.grid);
	var scratch2 = Float32Raster(lat.grid);
	AtmosphericModeling.surface_air_pressure_land_effect(displacement, effective_lat, sealevel, land_effect, scratch2);
	ScalarField.add_scalar_term(pressure, land_effect, 1, pressure);
	return pressure;
}