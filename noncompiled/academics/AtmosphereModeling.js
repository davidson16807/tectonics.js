
var AtmosphereModeling = (function() {

	var surface_air_pressure_temperature_effect = function(temperature, material_heat_capacity, atmospheric_height, result) {
		// NOTE: "volumetric_heat_capacity" is the energy required to heat a volume of air by 1 Kelvin
		// it is reported in joules per kelvin per square meter column of air

		return ScalarField.mult_scalar(temperature, material_heat_capacity.air / atmospheric_height, result);
	}
	var surface_air_pressure_lat_effect = function (lat, pressure) {
		pressure = pressure || Float32Raster(lat.grid);
		var cos = Math.cos;
		for (var i=0, li=lat.length; i<li; ++i) {
		    pressure[i] = -cos(5*(lat[i]));
		}
		return pressure;
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
	AtmosphereModeling.surface_air_pressure = function(temperature, lat, material_heat_capacity, atmospheric_height, result, scratch) {
		result = result || Float32Raster(lat.grid);
		scratch = scratch || Float32Raster(lat.grid);

		surface_air_pressure_lat_effect(lat, result);

		var temperature_effect = scratch;
		surface_air_pressure_temperature_effect(temperature, material_heat_capacity, atmospheric_height, temperature_effect);
		Float32Dataset.normalize(temperature_effect, temperature_effect);
		ScalarField.add_scalar_term(result, temperature_effect, 3, result);
		Float32Dataset.normalize(result, result, 980e3, 1030e3);

		return result;
	}
	AtmosphereModeling.surface_air_temp = function(net_energy, infrared_optical_depth, result) {
		infrared_optical_depth = infrared_optical_depth || Float32Raster(net_energy.grid);
		result = result || Float32Raster(net_energy.grid);

		var τ = infrared_optical_depth;
		var σ = Optics.STEPHAN_BOLTZMANN_CONSTANT;
		var pow = Math.pow;

		for (var i = 0; i < net_energy.length; i++) {
			result[i] = pow( (1+0.75*τ)*net_energy[i]/σ, 1/4 );
		}

		return result;
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

	    var ocean_albedo 	= material_reflectivity.ocean || 0.06;
	    var land_albedo 	= material_reflectivity.felsic || 0.27;
	    var plant_albedo 	= material_reflectivity.forest || 0.1;
	    var ice_albedo 		= material_reflectivity.ice || 0.9;

	    var lerp_fsf = Float32RasterInterpolation.lerp_fsf;
	    var lerp_sff = Float32RasterInterpolation.lerp_sff;
	    // albedo hierarchy: cloud, ice, water, plant, soil
	    Float32Raster.fill(albedo, land_albedo);
		if (plant_fraction !== void 0) {	lerp_fsf(albedo, 	plant_albedo, 	plant_fraction, albedo);	}
		if (ocean_fraction !== void 0) {	lerp_fsf(albedo, 	ocean_albedo, 	ocean_fraction, albedo);	}
		if (ice_fraction !== void 0)   {	lerp_fsf(albedo, 	ice_albedo, 	ice_fraction, 	albedo);	}
		
		return result;
	}
	AtmosphereModeling.heat_capacity = function(
		ocean_fraction,
		material_heat_capacity,
		result) {

	    result = result || Float32Raster(ocean_fraction.grid);

	    var ocean_heat_capacity 	= material_heat_capacity.ocean || 30e7; // heat capacity of 1m^2 of 75m water column, the ocean's "mixing layer"
	    var land_heat_capacity		= material_heat_capacity.felsic || 1e7; // heat capacity of 1m^2 air column on earth

	    var lerp_fsf = Float32RasterInterpolation.lerp_fsf;

	    Float32Raster.fill(result, land_heat_capacity);
		if (ocean_fraction !== void 0) {	lerp_fsf(result, 	ocean_heat_capacity, 	ocean_fraction, result);	}
		
		return result;
	}



	AtmosphereModeling.surface_air_heat = function(absorbed_radiation, heat_flow, result) {
		result = result || Float32Raster(net_energy.grid);

		var heat_flow_field = result;
		Float32Dataset.normalize(absorbed_radiation, result, -heat_flow, heat_flow);
		ScalarTransport.fix_conserved_quantity_delta(result, 1e-5);
		ScalarField.sub_field(absorbed_radiation, result, result);

		return result;
	}
	AtmosphereModeling.STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8; // W/m^2 per K^4
	AtmosphereModeling.WATER_FREEZING_POINT_STP = 273.15; // Kelvin/Celcius
	// TODO: generalize to scalar fields and arbitrary temperature cycles
	AtmosphereModeling.get_scalar_equilibrium_temperature = function(E, τ) {
		// var τ = infrared_optical_depth;
		var σ = AtmosphereModeling.STEPHAN_BOLTZMANN_CONSTANT;
		return Math.pow( (1+0.75*τ)*E/σ, 1/4 );
	}
	AtmosphereModeling.guess_heat_flow_uniform = function(insolation_hot, insolation_cold, insolation_average, infrared_optical_depth) { 
		var Ih = insolation_hot; 
		var Ic = insolation_cold; 
		var τ = infrared_optical_depth; 
		var σ = Optics.STEPHAN_BOLTZMANN_CONSTANT; 
		var Tguess = Optics.black_body_equilibrium_temperature_uniform(insolation_average); 
		var Tmax = Optics.black_body_equilibrium_temperature_uniform(insolation_hot);
		var Tmin = Optics.black_body_equilibrium_temperature_uniform(insolation_cold);
		var B = 4*σ * Tguess*Tguess*Tguess / (1+0.75*τ); // estimated change in emission with respect to temperature 

		var ΔT = Tmax-Tmin; // temperature differential 
		var D = B/4; // "meridional heat diffusion" discussed by North et al 1989 
		var F = 2*D*ΔT; // F, starts with initial estimate described by Lorenz 2001 
		return F; 
	} 
  	// calculates entropic heat flow within a 2 box temperature model  
	// calculates heat flow within a 2 box temperature model 
	// using the Max Entropy Production Principle and Gradient Descent
	// for more information, see Lorenz et al. 2001: 
	// "Titan, Mars and Earth : Entropy Production by Latitudinal Heat Transport"
	AtmosphereModeling.solve_heat_flow_uniform = function(insolation_hot, insolation_cold, infrared_optical_depth, iterations) {
		iterations = iterations || 10;

		var Ih = insolation_hot;
		var Ic = insolation_cold;
		var τ = infrared_optical_depth;
		var σ = Optics.STEPHAN_BOLTZMANN_CONSTANT;
		// temperature given net energy flux

		function T(E) {
			return Math.pow( (1+0.75*τ)*E/σ, 1/4 );
		}
		// entropy production given heat flux
		function N(F, Ih, Ic) {
			return 2*F/T(Ic+F) - 2*F/T(Ih-2*F);
		}

 
	    // heat flow 
	    var F = (Ih-Ic)/4; 
	    var dF = F/iterations; // "dF" is a measure for how much F changes with each iteration 
	    // reduce step_size by this fraction for each iteration 
	    var annealing_factor = 0.8; 
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