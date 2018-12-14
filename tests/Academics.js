/* eslint-env qunit */
QUnit.module('Rasters');

function test_value_is_below(estimate, threshold, op_name, message) {
	QUnit.test(`${op_name} range tests`, function (assert) {
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
function test_value_is_above(estimate, threshold, op_name, message) {
	QUnit.test(`${op_name} range tests`, function (assert) {
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
function test_value_is_between(estimate, lo, hi, op_name, message) {
	QUnit.test(`${op_name} range tests`, function (assert) {
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
function test_transport_is_conserved(field, op_name, tolerance) {
	tolerance = tolerance || 1e-3;
	var sum = Float32Dataset.sum(field);
	QUnit.test(`${op_name} conservation tests`, function (assert) {
		assert.ok( 
			field,
			`${op_name}(...) must not return an undefined value`
		);
		assert.ok( 
			field instanceof Float32Array,
			`${op_name}(...) must return a raster`
		);
		assert.ok( 
			!isNaN(Float32Dataset.sum(field)),
			`${op_name}(...) must not contain NaNs`
		);
		assert.ok( 
			isFinite(Float32Dataset.sum(field)),
			`${op_name}(...) must not contain infinities`
		);
		assert.ok( 
			sum * sum < tolerance * tolerance,
			`${op_name}(...) must return a conserved field (-${tolerance.toFixed(4)} < ${sum.toFixed(4)} < ${tolerance.toFixed(4)})`
		);
	});
}
function test_values_are_between(field, lo, hi, op_name, message) {
	var min = Float32Dataset.min(field);
	var max = Float32Dataset.max(field);
	QUnit.test(`${op_name} range tests`, function (assert) {
		assert.ok( 
			field,
			`${op_name}(...) must not return an undefined value`
		);
		assert.ok( 
			field instanceof Float32Array,
			`${op_name}(...) must return a raster`
		);
		assert.ok( 
			!isNaN(Float32Dataset.sum(field)),
			`${op_name}(...) must not contain NaNs`
		);
		assert.ok( 
			isFinite(Float32Dataset.sum(field)),
			`${op_name}(...) must not contain infinities`
		);
		assert.ok( 
			lo < min,
			`${op_name}(...) ${message} (${lo.toFixed(2)} < ${min.toFixed(2)})`
		);
		assert.ok( 
			max < hi,
			`${op_name}(...) ${message} (${max.toFixed(2)} < ${hi.toFixed(2)})`
		);
	});
}
function test_values_are_valid(field, op_name) {
	QUnit.test(`${op_name} range tests`, function (assert) {
		assert.ok( 
			field,
			`${op_name}(...) must not return an undefined value`
		);
		assert.ok( 
			field instanceof Float32Array,
			`${op_name}(...) must return a raster`
		);
		assert.ok( 
			!isNaN(Float32Dataset.sum(field)),
			`${op_name}(...) must not contain NaNs`
		);
		assert.ok( 
			isFinite(Float32Dataset.sum(field)),
			`${op_name}(...) must not contain infinities`
		);
	});
}


// from https://www.reddit.com/r/askscience/comments/2gerkk/how_much_of_the_heat_from_the_sun_comes_from/

test_value_is_above(
	Thermodynamics.solve_black_body_fraction_below_wavelength(
		760*Units.NANOMETER, 
		Units.SOLAR_TEMPERATURE
	),
	0.5,
	'Thermodynamics.solve_black_body_fraction_below_wavelength',
	'must predict that the sun will return mostly visible light'
);

test_value_is_above(
	Thermodynamics.solve_black_body_fraction_between_wavelengths(
	 	380*Units.NANOMETER, 
	 	760*Units.NANOMETER, 
	 	Units.SOLAR_TEMPERATURE
 	),
	0.4,
	'Thermodynamics.solve_black_body_fraction_between_wavelengths',
	'must predict that the sun will return mostly visible light'
);

test_value_is_between(
	Thermodynamics.get_black_body_emissive_radiation_flux(Units.SOLAR_TEMPERATURE) * 
		SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
		SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT),
	0.99*Units.GLOBAL_SOLAR_CONSTANT,
	1.01*Units.GLOBAL_SOLAR_CONSTANT,
	'Thermodynamics.get_black_body_emissive_radiation_flux',
	'must predict the global solar constant to within 10%'
);

var EARTH_DAILY_AVERAGE_INSOLATION = Units.GLOBAL_SOLAR_CONSTANT/4;
test_value_is_between(
	Thermodynamics.get_equilibrium_temperature(EARTH_DAILY_AVERAGE_INSOLATION),
	0.9*Units.STANDARD_TEMPERATURE,
	1.1*Units.STANDARD_TEMPERATURE,
	'Thermodynamics.get_equilibrium_temperature',
	'must predict absolute average earth temperature to within 10%'
);

var emission_coefficient = 0.66;
var earth_heat_flow_estimate = Thermodynamics.solve_entropic_heat_flow(EARTH_DAILY_AVERAGE_INSOLATION, 0, emission_coefficient);
// estimates from Lorenz 2001
test_value_is_between( 
	Thermodynamics.solve_entropic_heat_flow(
			Thermodynamics.get_black_body_emissive_radiation_flux(Units.SOLAR_TEMPERATURE) * 
				SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
				SphericalGeometry.get_surface_area(9.6*Units.ASTRONOMICAL_UNIT)/4, 
			0, 1.
		), 
	0.3/1.8, 
	0.3*1.8,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict latitudinal heat flow of titan's atmosphere to within a half order of magnitude"
);
test_value_is_between( 
	Thermodynamics.solve_entropic_heat_flow(
			Thermodynamics.get_black_body_emissive_radiation_flux(Units.SOLAR_TEMPERATURE) * 
				SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
				SphericalGeometry.get_surface_area(1.5*Units.ASTRONOMICAL_UNIT)/4, 
			0, 1.
		), 
	25/1.8, 
	25*1.8,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict latitudinal heat flow of mars's atmosphere to within a half order of magnitude"
);
test_value_is_between( 
	earth_heat_flow_estimate, 30/1.8, 30*1.8,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict latitudinal heat flow of earth's atmosphere to within a half order of magnitude"
);
test_value_is_between(
	Thermodynamics.get_equilibrium_temperature(
		(EARTH_DAILY_AVERAGE_INSOLATION-earth_heat_flow_estimate) / emission_coefficient
	),
	Units.STANDARD_TEMPERATURE+18,
	Units.STANDARD_TEMPERATURE+55,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict temperatures at earth's equator to within a half order of magnitude"
);
test_value_is_between(
	Thermodynamics.get_equilibrium_temperature(
		(0+earth_heat_flow_estimate) / emission_coefficient
	),
	Units.STANDARD_TEMPERATURE-100,
	Units.STANDARD_TEMPERATURE-10,
	'Thermodynamics.solve_entropic_heat_flow',
	"must predict temperatures at earth's poles to within a half order of magnitude"
);


// Now test behavior over fields
var random = new Random();
var grid = new Grid(new THREE.IcosahedronGeometry(1, 3), { voronoi_generator: VoronoiSphere.FromPos });

test_values_are_between(
	ScalarField.mult_scalar(
		Thermodynamics.get_black_body_emissive_radiation_fluxes(
			Float32Raster(grid, 5800*Units.KELVIN)
		),
		SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
		SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT)
	),
	0.9*Units.GLOBAL_SOLAR_CONSTANT,
	1.1*Units.GLOBAL_SOLAR_CONSTANT,
	'Thermodynamics.get_black_body_emissive_radiation_fluxes',
	"must predict the global solar constant to within 10%"
);

var insolation = SphericalGeometry.get_random_surface_field(grid, random);
Float32Dataset.rescale(insolation, insolation, 0, EARTH_DAILY_AVERAGE_INSOLATION);
var heat_flow = Thermodynamics.guess_entropic_heat_flows(insolation, earth_heat_flow_estimate)

test_transport_is_conserved(
	heat_flow,
	'Thermodynamics.guess_entropic_heat_flows'
);

test_values_are_between(
	Thermodynamics.get_equilibrium_temperatures(
		ScalarField.div_scalar(
			ScalarField.sub_field(insolation, heat_flow),
			emission_coefficient
		)
	),
	Units.STANDARD_TEMPERATURE-100,
	Units.STANDARD_TEMPERATURE+55,
	'Thermodynamics.get_equilibrium_temperatures',
	"must predict the high and low temperatures on earth to within half an order of magnitude"
);