/* eslint-env qunit */
QUnit.module('Rasters');


QUnit.test(`Thermodynamics tests`, function (assert) {

	// from https://www.reddit.com/r/askscience/comments/2gerkk/how_much_of_the_heat_from_the_sun_comes_from/
	var solar_sub_IR_fraction_estimate = 
		Thermodynamics.solve_black_body_fraction_below_wavelength(
			700*Units.NANOMETER, 
			Units.SOLAR_TEMPERATURE
		)
	assert.ok( 
		solar_sub_IR_fraction_estimate,
		`Thermodynamics.solve_black_body_fraction_below_wavelength(...) must return a number`
	);
	assert.ok( 
		solar_sub_IR_fraction_estimate > 0.4,
		`Thermodynamics.solve_black_body_fraction_below_wavelength(...) must predict the sun will return mostly visible light`
	);


	var solar_visible_fraction_estimate = 
		Thermodynamics.solve_black_body_fraction_between_wavelengths(
		 	400*Units.NANOMETER, 
		 	700*Units.NANOMETER, 
		 	Units.SOLAR_TEMPERATURE
	 	)
	assert.ok( 
		solar_visible_fraction_estimate,
		`Thermodynamics.solve_black_body_fraction_between_wavelengths(...) must return a number`
	);
	assert.ok( 
		solar_visible_fraction_estimate > 0.3,
		`Thermodynamics.solve_black_body_fraction_between_wavelengths(...) must predict the sun will return mostly visible light`
	);


	var global_solar_constant_estimate = Thermodynamics.get_black_body_emissive_radiation_flux(Units.SOLAR_TEMPERATURE) * 
		SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
		SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT);
	assert.ok( 
		global_solar_constant_estimate,
		`Thermodynamics.get_black_body_emissive_radiation_flux(...) must return a number`
	);
	assert.ok( 
		0.99*Units.GLOBAL_SOLAR_CONSTANT < global_solar_constant_estimate &&
										   global_solar_constant_estimate < 1.01*Units.GLOBAL_SOLAR_CONSTANT,
		`Thermodynamics.get_black_body_emissive_radiation_flux(...) must predict the global solar constant to within 10%`
	);

	var EARTH_DAILY_AVERAGE_INSOLATION = Units.GLOBAL_SOLAR_CONSTANT/4;

	var global_temperature_estimate = Thermodynamics.get_equilibrium_temperature(EARTH_DAILY_AVERAGE_INSOLATION);
	assert.ok( 
		global_temperature_estimate,
		`Thermodynamics.get_equilibrium_temperature(...) must return a number`
	);
	assert.ok( 
		0.9*Units.STANDARD_TEMPERATURE < global_temperature_estimate && 
										 global_temperature_estimate < 1.1*Units.STANDARD_TEMPERATURE,
		`Thermodynamics.get_equilibrium_temperature(...) must predict average earth temperature to within 10%`
	);

	var earth_heat_flow_estimate = Thermodynamics.solve_entropic_heat_flow(EARTH_DAILY_AVERAGE_INSOLATION, 0, 1.5);
	var equatorial_temperature_estimate = Thermodynamics.get_equilibrium_temperature(EARTH_DAILY_AVERAGE_INSOLATION-earth_heat_flow_estimate, 1.5);
	var polar_temperature_estimate = Thermodynamics.get_equilibrium_temperature(0+earth_heat_flow_estimate, 1.5);
	assert.ok( 
		equatorial_temperature_estimate,
		`Thermodynamics.solve_entropic_heat_flow(...) must return a number`
	);
	assert.ok( 
		polar_temperature_estimate,
		`Thermodynamics.solve_entropic_heat_flow(...) must return a number`
	);
	assert.ok( 
		Units.STANDARD_TEMPERATURE+18 < equatorial_temperature_estimate && 
										 equatorial_temperature_estimate < Units.STANDARD_TEMPERATURE+55,
		`Thermodynamics.solve_entropic_heat_flow(...) must predict temperatures at earth's equator to within a half order of magnitude`
	);
	assert.ok( 
		Units.STANDARD_TEMPERATURE-100 < polar_temperature_estimate && 
										 polar_temperature_estimate < Units.STANDARD_TEMPERATURE-10,
		`Thermodynamics.solve_entropic_heat_flow(...) must predict temperatures at earth's pole to within an order of magnitude`
	);
});
