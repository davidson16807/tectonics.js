
var AtmosphereModeling = (function() {

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

	AtmosphereModeling = {};
	AtmosphereModeling.surface_air_velocity = function(pos, pressure, angular_speed, velocity) {
		velocity = velocity || VectorRaster(pos.grid);
		ScalarField.gradient(pressure, velocity);
		EARTH_RADIUS = 6.3e6; // meters
		VectorField.div_scalar(velocity, EARTH_RADIUS, velocity); // need to adjust gradient because grid.pos is on a unit sphere
		var coriolis_effect = surface_air_velocity_coriolis_effect(pos, velocity, angular_speed);
		VectorField.add_vector_field(velocity, coriolis_effect, velocity);
		VectorDataset.rescale(velocity, velocity, 15.65); //15.65 m/s is the fastest average wind speed on Earth, recorded at Mt. Washington
		return velocity;
	}
	AtmosphereModeling.surface_air_pressure = function(displacement, lat, sealevel, meanAnomaly, axial_tilt, pressure, scratch) {
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
	AtmosphereModeling.surface_air_temp = function(pos, meanAnomaly, axial_tilt, temp) {
		var season = meanAnomaly / Math.PI;
		var temp = temp || Float32Raster(pos.grid);
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
	AtmosphereModeling.precip = function(lat, result) {
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
	AtmosphereModeling.albedo = function(
		ocean_fraction,
		ice_fraction, 
		plant_fraction,
		material_reflectivity,
		result) {

		material_reflectivity = material_reflectivity || {};
	    result = result || Float32Raster(ocean_fraction.grid);
	    var albedo = result;

	    var ocean_albedo 	= || material_reflectivity || 0.06;
	    var land_albedo 	= || material_reflectivity || 0.27;
	    var plant_albedo 	= || material_reflectivity || 0.1;
	    var ice_albedo 		= || material_reflectivity || 0.9;

	    var lerp_fsf = Float32RasterInterpolation.lerp_fsf;
	    var lerp_sff = Float32RasterInterpolation.lerp_sff;

	    // albedo hierarchy: cloud, ice, water, plant, soil
	    Float32Raster.fill(albedo, land_albedo);
		lerp_fsf(albedo, 		plant_albedo, 	plant_fraction, albedo);
		lerp_sff(albedo, 		ocean_albedo, 	ocean_fraction, albedo);
		lerp_fsf(albedo, 		ice_albedo, 	ice_fraction, 	albedo);

		return result;
	}



	// This calculates the fraction of the global solar constant that's felt by the surface of a planet.
	// This fraction is the cosine of solar zenith angle, as seen in Lambert's law.
	// The fraction is calculated as a daily average for every region on the globe
	//
	// Q: Why calculate the fraction in a separate function? Why not just calculate incident radiation?
	// A:  The fraction stays constant over time because we assume the planet's orbit is stable,
	//     but the global solar constant changes over time due to stellar aging.
	//     It takes much longer to recompute the fraction than it does the global solar constant.
	//     We calculate the fraction in a separate function so we can store the result for later.
	AtmosphereModeling.daily_average_incident_radiation_fraction = function(
			// This is a vector raster of each grid cell's position in geocentric equatorial coordinates (just like "pos" in other functions) 
			pos, 
			// this is a single vector of the planet's position in heliocentric eliptic coordinates (not to be confused with "pos")
			orbital_pos, 
			// tilt of the planet's axis, in radians
			axial_tilt, 
			// number of samples used to calculate average, default is 12
			sample_num,
			// Float32Raster that stores results
			result
		) {
		result = result || Float32Raster(pos.grid);
		sample_num = sample_num || 12;

		// this is a vector of the sun's geocentric position 
		var sun_coordinates = Vector(-orbital_pos.x, -orbital_pos.y, -orbital_pos.z);

		var grid = pos.grid;

		// TODO: need scratch for these
		var surface_normal = VectorRaster(grid);
		var cos_solar_zenith_angle = Float32Raster(grid);
		var incident_radiation_sum  = Float32Raster(grid);

		var get_surface_normal = OrbitalMechanics.get_eliptic_coordinates_raster_from_equatorial_coordinates_raster;
		var similarity = VectorField.vector_similarity;
		var add = ScalarField.add_field;
		var clamp = Float32RasterInterpolation.clamp;

		var PI = Math.PI;
		var rotation_angle = 0.; 
		for (var i=0; i<sample_num; ++i) {
			rotation_angle = i * 2*PI/sample_num;

			// find surface normal, i.e. vector that points straight up from the ground
			get_surface_normal(
				pos,
				rotation_angle, 
				axial_tilt, 
				surface_normal);

			// use cosine similarity to find cosine of solar zenith angle 
			similarity 	(surface_normal, sun_coordinates, 					cos_solar_zenith_angle);

			// disregard solar angle at night
			clamp		(cos_solar_zenith_angle, 0, 1, 						cos_solar_zenith_angle);

			add  		(incident_radiation_sum, cos_solar_zenith_angle, 	incident_radiation_sum);
		}
		ScalarField.div_scalar(incident_radiation_sum, sample_num, result);
		return result;
	}
	AtmosphereModeling.STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-11; // kW/m^2 per K^4
	AtmosphereModeling.WATER_FREEZING_POINT_STP = 273.15; // Kelvin/Celcius
	AtmosphereModeling.black_body_equilibrium_temperature = function(
			// intensity of sunlight on a panel that's directly facing the sun, number in W/m^2
			global_solar_constant,
			// fraction of global solar constant that's felt by the surface of a planet, Float32Raster in W/m^2
			daily_average_incident_radiation_ratio
		) {
		var incident_radiation = ScalarField.mult_scalar(daily_average_incident_radiation_ratio, global_solar_constant);
		var temperature_4 = ScalarField.div_scalar(incident_radiation, AtmosphericModeling.STEPHAN_BOLTZMANN_CONSTANT);
		var temperature = ScalarField.pow_scalar(temperature_4, 1/4);
		return temperature;
	}
	// TODO: generalize to scalar fields and arbitrary temperature cycles
	AtmosphereModeling.get_scalar_equilibrium_temperature = function(E, τ) {
		// var τ = infrared_optical_depth;
		var σ = AtmosphereModeling.STEPHAN_BOLTZMANN_CONSTANT;
		return Math.pow( (1+0.75*τ)*E/σ, 1/4 );
	}
	// calculates heat flow within a 2 box temperature model 
	// using the Max Entropy Production Principle and Gradient Descent
	// for more information, see Lorenz et al. 2001: 
	// "Titan, Mars and Earth : Entropy Production by Latitudinal Heat Transport"
	AtmosphereModeling.solve_heat_flow = function(insolation_hot, insolation_cold, infrared_optical_depth, iterations) {
		iterations = iterations || 10;

		var Ih = insolation_hot;
		var Ic = insolation_cold;
		var τ = infrared_optical_depth;
		var σ = AtmosphereModeling.STEPHAN_BOLTZMANN_CONSTANT;
		// temperature given net energy flux

		function T(E) {
			return Math.pow( (1+0.75*τ)*E/σ, 1/4 );
		}
		// entropy production given heat flux
		function N(F, Ih, Ic) {
			return 2*F/T(Ic+F) - 2*F/T(Ih-2*F);
		}

		// heat flow
		F = (Ih-Ic)/4;
		dF = (Ih-Ic)/iterations;
		// reduce step_size by this fraction for each iteration
		annealing_factor = 0.8;
		// amount to change F with each iteration
		for (var i = 0; i < iterations; i++) {
			// TODO: relax assumption that world must have earth-like rotation (e.g. tidally locked)
			dN = ( N(F-dF, Ih, Ic) - N(F+dF, Ih, Ic) );
			F -= dF * Math.sign(dN);
			dF *= annealing_factor;
		}
		// console.log(T(Ih-2*F)-273.15, T(Ic+F)-273.15)
		return F;
	}
	return AtmosphereModeling;
})();