/* eslint-env qunit */
QUnit.module('Rasters');

function test_ok(is_ok, op_name, message) {
	QUnit.test(`${op_name} ${message}`, function (assert) {
		assert.ok( 
			is_ok,
			`${op_name}(...) ${message} (${is_ok})`
		);
	});
}
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
function test_value_is_to_within(estimate, target, precision, op_name, message) {
	QUnit.test(`${op_name} range tests`, function (assert) {
		assert.ok( 
			estimate,
			`${op_name}(...) must return a number`
		);
		var lo = target*(1-precision);
		var hi = target*(1+precision);
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





var random = new Random();
var grid = new Grid(new THREE.IcosahedronGeometry(1, 3), {});
var lithosphere = new Lithosphere(grid);
var parameters = {
	'surface_gravity'		: 9.8 * Units.METER / (Units.SECOND*Units.SECOND),
	'sealevel'				: new Memo(-Units.EARTH_RADIUS),
	'material_density'		: 
		{
			// most values are estimates from looking around wolfram alpha
			fine_sediment: 1500.,
			coarse_sediment: 1500.,
			sediment: 1500.,
			sedimentary: 2600.,
			metamorphic: 2800.,
			felsic_plutonic: 2600.,
			felsic_volcanic: 2600.,
			mafic_volcanic_min: 2890., // Carlson & Raskin 1984
			mafic_volcanic_max: 3300.,
			mantle: 3075., // derived empirically using isostatic model
			ocean: 1026.,
		},
	'material_viscosity':
		{
			mantle: 1.57e20, 
		},
}
lithosphere.setDependencies(parameters);
CrustGenerator.generate(
	SphericalGeometry.get_random_surface_field(grid, random), 
	CrustGenerator.modern_earth_hypsography, 
	CrustGenerator.modern_earth_attribute_height_maps, 
	lithosphere.total_crust,
	random
);
lithosphere.initialize();

var timestep = 1/10 * Units.MEGAYEAR;

// run a single timestep in order to separate out plates
lithosphere.invalidate();
lithosphere.calcChanges(timestep);
lithosphere.applyChanges(timestep);

// store the state of the variables we will be measuring
var original_plate_ages = [];
var original_plate_masks = [];
var plates = lithosphere.plates;
for (var i = 0; i < plates.length; i++) {
	original_plate_ages[i]  = Float32Raster.copy(plates[i].crust.age);
	original_plate_masks [i] = Float32Raster.FromUint8Raster(plates[i].mask);
}

// now run a single timestep to verify crust age increments consistently across cells
lithosphere.invalidate();
lithosphere.calcChanges(timestep);
lithosphere.applyChanges(timestep);
for (var i = 0; i < plates.length; i++) {
	var age_delta = ScalarField.sub_field(plates[i].crust.age, original_plate_ages[i]);
	var age_deviation = ScalarField.sub_scalar(age_delta, timestep);
	ScalarField.mult_field(age_deviation, plates[i].mask, 			age_deviation);
	ScalarField.mult_field(age_deviation, original_plate_masks [i], age_deviation);
	var total_age_deviation = Float32Dataset.sum(age_delta) / timestep;
	test_value_is_above(
		total_age_deviation, 1.0, 
		"[crust age calculation]",
		`must increment crust age consistently across all cells within plate #${i}`
	)
}



// run a single timestep to verify mass is conserved when calculating deltas
lithosphere.invalidate();
lithosphere.calcChanges(timestep);
test_ok(
	Crust.is_conserved_delta(lithosphere.crust_delta, 0.01),
	"lithosphere.crust_delta", 	"must conserve continental crust across 1 timestep to within 1%"
);
test_ok(
	Crust.is_conserved_transport_delta(lithosphere.erosion, 0.01),
	"lithosphere.erosion", 		"must conserve continental crust across 1 timestep to within 1%"
);
test_ok(
	Crust.is_conserved_reaction_delta(lithosphere.weathering, 0.01), 
	"lithosphere.weathering", 	"must conserve continental crust across 1 timestep to within 1%"
);
test_ok(
	Crust.is_conserved_reaction_delta(lithosphere.lithification, 0.01),
	"lithosphere.lithification", "must conserve continental crust across 1 timestep to within 1%"
);
test_ok(
	Crust.is_conserved_reaction_delta(lithosphere.metamorphosis, 0.01),
	"lithosphere.metamorphosis", "must conserve continental crust across 1 timestep to within 1%"
);
lithosphere.applyChanges(timestep);



// run a few more timesteps to verify mass is conserved when applying deltas
for (var i = 0; i < 10; i++) {
	lithosphere.invalidate();
	lithosphere.calcChanges(timestep);
	lithosphere.applyChanges(timestep);
}
test_value_is_to_within(
	Crust.get_average_conserved_per_cell(lithosphere.total_crust),
	lithosphere.average_conserved_per_cell, 0.03,
	"lithosphere.applyChanges()",
	`must conserve continental crust across several timestep to within 3%`
);