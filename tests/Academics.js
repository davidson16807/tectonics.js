/* eslint-env qunit */
QUnit.module('Rasters');

function test_below(estimate, threshold, op_name, message) {
	QUnit.test(`${op_name} tests`, function (assert) {
		assert.ok( 
			estimate,
			`${op_name}(...) must return a number`
		);
		assert.ok( 
			estimate < threshold,
			`${op_name}(...) ${message} (${estimate.toFixed(2)} < ${threshold.toFixed(2)})`
		);
	});
}
function test_above(estimate, threshold, op_name, message) {
	QUnit.test(`${op_name} tests`, function (assert) {
		assert.ok( 
			estimate,
			`${op_name}(...) must return a number`
		);
		assert.ok( 
			threshold < estimate,
			`${op_name}(...) ${message} (${threshold.toFixed(2)} < ${estimate.toFixed(2)})`
		);
	});
}
function test_between(estimate, lo, hi, op_name, message) {
	QUnit.test(`${op_name} tests`, function (assert) {
		assert.ok( 
			estimate,
			`${op_name}(...) must return a number`
		);
		assert.ok( 
			lo < estimate && 
				 estimate < hi,
			`${op_name}(...) ${message} (${lo.toFixed(2)} < ${estimate.toFixed(2)} < ${hi.toFixed(2)})`
		);
	});
}


// from https://www.reddit.com/r/askscience/comments/2gerkk/how_much_of_the_heat_from_the_sun_comes_from/

test_above(
	Thermodynamics.solve_black_body_fraction_below_wavelength(
		700*Units.NANOMETER, 
		Units.SOLAR_TEMPERATURE
	),
	0.4,
	'Thermodynamics.solve_black_body_fraction_below_wavelength',
	'must predict that the sun will return mostly visible light'
);

test_above(
	Thermodynamics.solve_black_body_fraction_between_wavelengths(
	 	400*Units.NANOMETER, 
	 	700*Units.NANOMETER, 
	 	Units.SOLAR_TEMPERATURE
 	),
	0.3,
	'Thermodynamics.solve_black_body_fraction_between_wavelengths',
	'must predict that the sun will return mostly visible light'
);

test_between(
	Thermodynamics.get_black_body_emissive_radiation_flux(Units.SOLAR_TEMPERATURE) * 
		SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
		SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT),
	0.99*Units.GLOBAL_SOLAR_CONSTANT,
	1.01*Units.GLOBAL_SOLAR_CONSTANT,
	'Thermodynamics.get_black_body_emissive_radiation_flux',
	'must predict the global solar constant to within 10%'
);

var EARTH_DAILY_AVERAGE_INSOLATION = Units.GLOBAL_SOLAR_CONSTANT/4;
test_between(
	Thermodynamics.get_equilibrium_temperature(EARTH_DAILY_AVERAGE_INSOLATION),
	0.9*Units.STANDARD_TEMPERATURE,
	1.1*Units.STANDARD_TEMPERATURE,
	'Thermodynamics.get_equilibrium_temperature',
	'must predict absolute average earth temperature to within 10%'
);

var greenhouse_gas_factor = 1.5;
var earth_heat_flow_estimate = Thermodynamics.solve_entropic_heat_flow(EARTH_DAILY_AVERAGE_INSOLATION, 0, greenhouse_gas_factor);
test_between(
	Thermodynamics.get_equilibrium_temperature(
		EARTH_DAILY_AVERAGE_INSOLATION-earth_heat_flow_estimate, 
		greenhouse_gas_factor
	),
	Units.STANDARD_TEMPERATURE+18,
	Units.STANDARD_TEMPERATURE+55,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict temperatures at earth's equator to within a half order of magnitude"
);
test_between(
	Thermodynamics.get_equilibrium_temperature(
		0+earth_heat_flow_estimate, 
		greenhouse_gas_factor
	),
	Units.STANDARD_TEMPERATURE-100,
	Units.STANDARD_TEMPERATURE-10,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict temperatures at earth's poles to within a half order of magnitude"
);

