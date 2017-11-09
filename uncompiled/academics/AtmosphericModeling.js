
var AtmosphericModeling = {};
AtmosphericModeling.surface_air_pressure_land_effect = function(displacement, lat, sealevel, season, effect, scratch) {
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
    ScalarField.mult_scalar(effect, season, effect);
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
AtmosphericModeling.surface_air_pressure = function(displacement, lat, sealevel, season, axial_tilt, pressure, scratch) {
	pressure = pressure || Float32Raster(lat.grid);
	scratch = scratch || Float32Raster(lat.grid);
	// "effective latitude" is what the latitude is like weather-wise, when taking axial tilt into account
	var effective_lat = scratch; 
	ScalarField.add_scalar(lat, season*axial_tilt, effective_lat);
	Float32RasterInterpolation.clamp(effective_lat, -Math.PI/2, Math.PI/2, effective_lat);

	AtmosphericModeling.surface_air_pressure_lat_effect(effective_lat, pressure);

	var land_effect = Float32Raster(lat.grid);
	var scratch2 = Float32Raster(lat.grid);
	AtmosphericModeling.surface_air_pressure_land_effect(displacement, effective_lat, sealevel, season, land_effect, scratch2);
	ScalarField.add_scalar_term(pressure, land_effect, 1, pressure);
	Float32Dataset.normalize(pressure, pressure, 980e3, 1030e3);

	return pressure;
}
AtmosphericModeling.surface_air_velocity_coriolis_effect = function(pos, velocity, angular_speed, effect) {
	effect = effect || VectorRaster(pos.grid);
	VectorField.cross_vector_field	(velocity, pos, 			effect);
	VectorField.mult_scalar 		(effect, 2 * angular_speed, effect);
	VectorField.mult_scalar_field	(effect, pos.y, 			effect);
	return effect;
}
AtmosphericModeling.surface_air_velocity = function(pos, pressure, angular_speed, velocity) {
	velocity = velocity || VectorRaster(pos.grid);
	ScalarField.gradient(pressure, velocity);
	var coriolis_effect = AtmosphericModeling.surface_air_velocity_coriolis_effect(pos, velocity, angular_speed);
	VectorField.add_vector_field(velocity, coriolis_effect, velocity);
	return velocity;
}
AtmosphericModeling.surface_air_temp = function(pos) {
	var temp = Float32Raster(pos.grid);
	var cos_lat = Float32SphereRaster.cos_lat(pos);
	var cos_lat_i = 0.
	for (var i = 0; i < cos_lat.length; i++) {
		cos_lat_i = cos_lat[i];
		temp[i] = -25*(1-cos_lat_i) + 30*(cos_lat_i);
	}
	return temp;
}
AtmosphericModeling.precip = function(lat, result) {
    result = result || Float32Raster(grid);
	//Mean annual precipitation over land, mm yr-1
	//credits for original model go to /u/astrographer, 
	//some modifications made to improve goodness of fit and conceptual integrity 
	//parameters fit to data from 
	precip_intercept = 2000;
	precip_min = 60;
	cell_effect = 0.;
	lat_effect = 0.;
	for (var i = 0; i < lat.length; i++) {
		//amplitude of circulation cell decreases with latitude, and precip inherently must be positive
		//for these reasons, we multiply the lat effect with the circulation effect
		lat_effect = precip_intercept *
			(1-lat[i] / (Math.PI/2))
		cell_effect = (cell_effect * cos(6.*lat + radians(30.)) + 1.) +	precip_min;	//circulation cell effect
		result[i] = cell_effect + lat_effect;
	}
	return result;
}