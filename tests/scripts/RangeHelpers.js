
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
