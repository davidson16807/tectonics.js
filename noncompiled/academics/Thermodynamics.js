// Thermodynamics is a namespace isolating all business logic relating to the transfer of radiation
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Thermodynamics = (function() {
	var Thermodynamics = {};

	// NOTE: this stays a private variable here until we can figure out where else to put it.
	var SPEED_OF_LIGHT = 299792458 * Units.METER / Units.SECOND; 

	Thermodynamics.BOLTZMANN_CONSTANT = 1.3806485279e-23 * Units.JOULE / Units.KELVIN;
	Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * Units.WATT / (Units.METER*Units.METER* Units.KELVIN*Units.KELVIN*Units.KELVIN*Units.KELVIN);
	Thermodynamics.PLANCK_CONSTANT = 6.62607004e-34 * Units.JOULE * Units.SECOND;
	Thermodynamics.MODERN_COSMIC_BACKGROUND_TEMPERATURE = 2.725 * Units.KELVIN;



	// This calculates the radiation (in watts/m^2) that's emitted by a single object
	Thermodynamics.get_black_body_emissive_radiation_flux = function(temperature) {
		return Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT * temperature * temperature * temperature * temperature;
	}
	// This calculates the radiation (in watts/m^2) that's emitted by the surface of an object.
	Thermodynamics.get_black_body_emissive_radiation_fluxes = function(
			temperature,
			result
		) {
		result = result || Float32Raster(pos.grid);
		Float32Raster.fill(result, 1);
		ScalarField.mult_field	(result, 		temperature, 						result);
		ScalarField.mult_field	(result, 		temperature, 						result);
		ScalarField.mult_field	(result, 		temperature, 						result);
		ScalarField.mult_field	(result, 		temperature, 						result);
		ScalarField.mult_scalar	(result, 		Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 	result);

		return result;
	}







	// This calculates the uniform (non-field) temperature of a body given its luminosity 
	// TODO: put this under a new namespace? "Thermodynamics"? 
	Thermodynamics.get_equilibrium_temperature = function(heat, emission_coefficient) { 
		return Math.pow(emission_coefficient*heat/Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4); 
	} 
	// This calculates the temperature of a body given its luminosity
	// TODO: put this under a new namespace? "Thermodynamics"?
	Thermodynamics.get_equilibrium_temperatures = function(
			luminosity,
			result
		) {
		result = result || Float32Raster(luminosity.grid);
		ScalarField.div_scalar	(luminosity, 	Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 	result);
		ScalarField.pow_scalar	(result, 		1/4, 										result);

		return result;
	}



	// calculates entropy given an energy and temperature,
	// returns results in Joules per Kelvin
	Thermodynamics.get_entropy = function(E, T) {
		return E/(Thermodynamics.BOLTZMANN_CONSTANT * T);
	}
	// calculates entropy given an energy flux and two temperature extremes,
	// returns results in Watts per Kelvin
	Thermodynamics.get_entropy_production = function(F, Th, Tc) {
		return F/(Thermodynamics.BOLTZMANN_CONSTANT * (Th - Tc));
	}




	Thermodynamics.guess_entropic_heat_flows = function(heat, heat_flow, result) {
		result = result || Float32Raster(net_energy.grid);

		var heat_flow_field = result;
		Float32Dataset.normalize(heat, result, -heat_flow, heat_flow);
		ScalarTransport.fix_conserved_quantity_delta(result, 1e-5);
		ScalarField.sub_field(heat, result, result);

		return result;
	}
  	// calculates entropic heat flow within a 2 box temperature model  
	// calculates heat flow within a 2 box temperature model 
	// using the Max Entropy Production Principle and Gradient Descent
	// for more information, see Lorenz et al. 2001: 
	// "Titan, Mars and Earth : Entropy Production by Latitudinal Heat Transport"
	Thermodynamics.solve_entropic_heat_flow = function(insolation_hot, insolation_cold, emission_coefficient, iterations) {
		iterations = iterations || 10;

		var Ih = insolation_hot;
		var Ic = insolation_cold;
		var β = emission_coefficient || 1.;
		// temperature given net energy flux

		var T = Thermodynamics.get_equilibrium_temperature;
		var S = Thermodynamics.get_entropy_production;
		// entropy production given heat flux
		function N(F, Ih, Ic) {
			return S(F, T((Ic+F)/β), T((Ih-F)/β));
		}

 
	    // heat flow 
	    var F = (Ih-Ic)/4; 
	    var dF = F/iterations; // "dF" is a measure for how much F changes with each iteration 
	    // reduce step_size by this fraction for each iteration 
	    var annealing_factor = 0.8; 
		// amount to change F with each iteration
		for (var i = 0; i < iterations; i++) {
			// TODO: relax assumption that world must have earth-like rotation (e.g. tidally locked)
			dN = N(F-dF, Ih, Ic) - N(F+dF, Ih, Ic);
			F -= dF * Math.sign(dN);
			dF *= annealing_factor;
		}
		// console.log(T(Ih-2*F)-273.15, T(Ic+F)-273.15)
		return F;
	}




	return Thermodynamics;
})();
