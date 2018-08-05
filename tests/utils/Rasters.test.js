/* eslint-env qunit */
QUnit.module('Rasters');

QUnit.test('some basic tests', function (assert) {
	var x, y;

	assert.equal('Foo', 'Foo', 'Similar strings are equal');

	// Same as `true == 1` in regular code.
	assert.equal(true, 1, 'Boolean true and 1 are equal');

	// Same as `true !== 1` in regular code.
	assert.notStrictEqual(true, 1, 'But not *strictly* the same');

	assert.strictEqual(true, true, 'true equals true ');

	x = { one : 1, two: 2 };
	y = x;
	assert.strictEqual(
		x,
		y,
		'assert.strictEqual compares by reference, same references are equal'
	);
	assert.notStrictEqual(
		{ one : 1, two: 2 },
		{ one: 1, two: 2 },
		'assert.strictEqual compares by reference, different objects are not identical'
	);
	assert.deepEqual(
		{ one : 1, two: 2 },
		{ one: 1, two: 2 },
		'assert.deepEqual compares values, similar key/values are equal'
	);
});
