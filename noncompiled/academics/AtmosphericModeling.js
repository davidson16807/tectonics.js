
var AtmosphericModeling = (function() {

	var surface_air_pressure_land_effect = function(displacement, lat, sealevel, season, effect, scratch) {
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
	var surface_air_pressure_lat_effect = function (lat, pressure) {
		pressure = pressure || Float32Raster(lat.grid);
		var cos = Math.cos;
		for (var i=0, li=lat.length; i<li; ++i) {
		    pressure[i] = -cos(5*(lat[i]));
		}
		return pressure
	}
	var surface_air_velocity_coriolis_effect = function(pos, velocity, angular_speed, effect) {
		effect = effect || VectorRaster(pos.grid);
		VectorField.cross_vector_field	(velocity, pos, 			effect);
		VectorField.mult_scalar 		(effect, 2 * angular_speed, effect);
		VectorField.mult_scalar_field	(effect, pos.y, 			effect);
		return effect;
	}

	AtmosphericModeling = {};
	AtmosphericModeling.surface_air_velocity = function(pos, pressure, angular_speed, velocity) {
		velocity = velocity || VectorRaster(pos.grid);
		ScalarField.gradient(pressure, velocity);
		EARTH_RADIUS = 6.3e6; // meters
		VectorField.div_scalar(velocity, EARTH_RADIUS, velocity); // need to adjust gradient because grid.pos is on a unit sphere
		var coriolis_effect = surface_air_velocity_coriolis_effect(pos, velocity, angular_speed);
		VectorField.add_vector_field(velocity, coriolis_effect, velocity);
		VectorDataset.rescale(velocity, velocity, 15.65); //15.65 m/s is the fastest average wind speed on Earth, recorded at Mt. Washington
		return velocity;
	}
	AtmosphericModeling.surface_air_pressure = function(displacement, lat, sealevel, meanAnomaly, axial_tilt, pressure, scratch) {
		pressure = pressure || Float32Raster(lat.grid);
		scratch = scratch || Float32Raster(lat.grid);
		var season = meanAnomaly / Math.PI;
		// "effective latitude" is what the latitude is like weather-wise, when taking axial tilt into account
		var effective_lat = scratch; 
		ScalarField.add_scalar(lat, season*axial_tilt, effective_lat);
		Float32RasterInterpolation.clamp(effective_lat, -Math.PI/2, Math.PI/2, effective_lat);

		surface_air_pressure_lat_effect(effective_lat, pressure);

		var land_effect = Float32Raster(lat.grid);
		var scratch2 = Float32Raster(lat.grid);
		surface_air_pressure_land_effect(displacement, effective_lat, sealevel, season, land_effect, scratch2);
		ScalarField.add_scalar_term(pressure, land_effect, 1, pressure);
		Float32Dataset.normalize(pressure, pressure, 980e3, 1030e3);

		return pressure;
	}
	AtmosphericModeling.surface_air_temp = function(pos, meanAnomaly, axial_tilt) {
		var season = meanAnomaly / Math.PI;
		var temp = Float32Raster(pos.grid);
		var lat = Float32SphereRaster.latitude(pos.y);
		var effective_lat = ScalarField.add_scalar(lat, season*axial_tilt);
		Float32RasterInterpolation.clamp(effective_lat, -Math.PI/2, Math.PI/2, effective_lat);
		var cos_lat = Float32RasterTrigonometry.cos(effective_lat);
		var cos_lat_i = 0.
		for (var i = 0; i < cos_lat.length; i++) {
			cos_lat_i = cos_lat[i];
			temp[i] = (273.15-25)*(1-cos_lat_i) + (273.15+30)*(cos_lat_i);
		}
		return temp;
	}
	AtmosphericModeling.precip = function(lat, result) {
	    result = result || Float32Raster(lat.grid);
		//Mean annual precipitation over land, mm yr-1
		//credits for original model go to /u/astrographer, 
		//some modifications made to improve goodness of fit and conceptual integrity 
		//parameters fit to data from 
		precip_intercept = 2000;
		precip_min = 60;
		var cell_effect = 1.;
		var cos = Math.cos;
		var abs = Math.abs;
		var PI = Math.PI;
		for (var i = 0; i < lat.length; i++) {
			result[i] =  precip_intercept * 
				(1. - abs(lat[i]) / (PI*90./180.)) * 							//latitude effect
				//amplitude of circulation cell decreases with latitude, and precip inherently must be positive
				//for these reasons, we multiply the lat effect with the circulation effect
				(cell_effect * cos(6.*abs(lat[i]) + (PI*30./180.)) + 1.) +		//circulation cell effect
				precip_min;
		}
		return result;
	}
	AtmosphericModeling.albedo = function(
		land_fraction,
		ice_fraction, 
		plant_fraction,
		result) {

	    result = result || Float32Raster(land_fraction.grid);
	    var albedo = result;

	    var water_albedo = 0.06;
	    var land_albedo = 0.27;
	    var plant_albedo = 0.1;
	    var ice_albedo = 0.9;

	    var lerp_fsf = Float32RasterInterpolation.lerp_fsf;
	    var lerp_sff = Float32RasterInterpolation.lerp_sff;

	    // albedo hierarchy: cloud, ice, water, plant, soil
	    Float32Raster.fill(albedo, land_albedo);
		lerp_fsf(albedo, 		plant_albedo, 	plant_fraction, albedo);
		lerp_sff(water_albedo, 	albedo, 		land_fraction, 	albedo);
		lerp_fsf(albedo, 		ice_albedo, 	ice_fraction, 	albedo);

		return result;
	}

	return AtmosphericModeling;
})();