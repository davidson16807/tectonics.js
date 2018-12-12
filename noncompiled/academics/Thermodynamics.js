// Thermodynamics is a namespace isolating all business logic relating to the transfer of radiation
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Thermodynamics = (function() {
	var Thermodynamics = {};

	Thermodynamics.BOLTZMANN_CONSTANT = 1.3806485279e-23 * Units.JOULE / Units.KELVIN;
	Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * Units.WATT / (Units.METER*Units.METER* Units.KELVIN*Units.KELVIN*Units.KELVIN*Units.KELVIN);
	Thermodynamics.SPEED_OF_LIGHT = 299792458 * Units.METER / Units.SECOND; 
	Thermodynamics.PLANCK_CONSTANT = 6.62607004e-34 * Units.JOULE * Units.SECOND;



	// This calculates the radiation (in watts/m^2) that's emitted by a single object
	Thermodynamics.black_body_radiation_uniform = function(temperature) {
		return Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT * temperature * temperature * temperature * temperature;
	}
	// This calculates the radiation (in watts/m^2) that's emitted by the surface of an object.
	Thermodynamics.black_body_radiation_field = function(
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
	Thermodynamics.black_body_equilibrium_temperature_uniform = function(heat) { 
		return Math.pow(heat / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4); 
	} 
	// This calculates the temperature of a body given its luminosity
	// TODO: put this under a new namespace? "Thermodynamics"?
	Thermodynamics.black_body_equilibrium_temperature_field = function(
			luminosity,
			result,
			greenhouse_gas_factor
		) {
		greenhouse_gas_factor = greenhouse_gas_factor || 1.3;
		result = result || Float32Raster(luminosity.grid);
		ScalarField.mult_scalar	(luminosity, 	greenhouse_gas_factor / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 	result);
		ScalarField.pow_scalar	(result, 		1/4, 														result);

		return result;
	}
	








	return Thermodynamics;
})();
