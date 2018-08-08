/* eslint-env qunit */
QUnit.module('Rasters');

var tetrahedron = new Grid({
	faces: [
		{ a: 0, b: 1, c: 2 },
		{ a: 0, b: 1, c: 3 },
		{ a: 0, b: 2, c: 3 },
		{ a: 1, b: 2, c: 3 },
	], 
	vertices: [
		{ x: 0, y: 0, z: 0 },
		{ x: 1, y: 0, z: 0 },
		{ x: 0, y: 1, z: 0 },
		{ x: 0, y: 0, z: 1 },
	],
});
function framework_tests(type_name, a,b){
	QUnit.test(`${type_name} Framework tests`, function (assert) {

		assert.deepApprox( a, a, 
			`It must be possible to test ${type_name} using QUnit's assert.deepApprox() function`
		);
		assert.notDeepApprox( a, b,
			`It must be possible to test ${type_name} using QUnit's assert.notdeepApprox() function`
		);
	});
}

function associativity_tests(op, op_name, inv, inv_name, valid){
	QUnit.test(`${op_name}/${inv_name} Associativity tests`, function (assert) {
		for (var a_name in valid) {
			for (var b_name in valid) {
				for (var c_name in valid) {
					let a = valid[a_name];
					let b = valid[b_name];
					let c = valid[c_name];
					assert.deepApprox( 
						op( op(a, b), c ), 
						op( a, op(b, c) ), 
						`${op_name}(${a_name}, ${op_name}(${b_name}, ${c_name})) needs the associative property: values can be applied in any order to the same effect`
					);
				}
			}
		}
	});
}


function closure_tests(op, op_name, inv, inv_name, args){
	let a 	= args.a; 
	let b 	= args.b;
	let ab 	= args.ab;
	let abinv = args.abinv;

	// TODO: generalize this not to depend on a precomputed value, just check it's the right type
	return
	QUnit.test(`${op_name}/${inv_name} Closure tests`, function (assert) {

		assert.deepApprox( op(a, b), ab,
			`${op_name}(a,b) needs the closure property: any value can be applied to produce another valid value`
		);
		
		assert.deepApprox( inv(a, b), abinv,
			`${inv_name}(a,b) needs the closure property: any value can be applied to produce another valid value`
		);
	});
}
function identity_tests(op, op_name, inv, inv_name, valid){
	let I 	= valid.I;

	QUnit.test(`${op_name}/${inv_name} Identity tests`, function (assert) {
		for (var a_name in valid) {
			let a = valid[a_name];
			assert.deepApprox( op(a, I), a,
				`${op_name}(${a_name}, I) needs the identity property: a value exists that can be applied that has no effect`
			);
		}
	});
}
function inverse_tests(op, op_name, inv, inv_name, valid){
	let I 	= valid.I;

	QUnit.test(`${op_name}/${inv_name} Inverse tests`, function (assert) {
		for (var a_name in valid) {
			let a = valid[a_name];
			assert.deepApprox( inv(a, a), I,
				`${inv_name}(${a_name}, ${a_name}) needs the inverse property: an operation exists that returns a value to the identity`
			);
		}
	});
}

function inverse_consistency_tests(op, op_name, inv, inv_name, valid){
	let I 	= valid.I;

	QUnit.test(`${op_name}/${inv_name} Inverse consistency tests`, function (assert) {
		for (var a_name in valid) {
			for (var b_name in valid) {
				let a = valid[a_name];
				let b = valid[b_name];
				assert.deepApprox( 
					op( a, inv( I, b ) ), 
					inv(a, b),
					`${inv_name}(${a_name}, ${inv_name}(I, ${b_name}) ) needs to behave consistantly with the identity`,
				);
			}
		}
	});
}

function commutativity_tests 	(op, op_name, inv, inv_name, valid){
	QUnit.test(`${op_name}/${inv_name} Commutativity tests`, function (assert) {
		for (var a_name in valid) {
			for (var b_name in valid) {
				let a = valid[a_name];
				let b = valid[b_name];
				assert.deepApprox( 
					op( a, b ), 
					op( b, a ), 
					`${op_name}(${a_name}, ${b_name}) needs the commutative property: values in an operation can be swapped to the same effect`,
				);
			}
		}
	});
}

function distributivity_tests 	(add, add_name, mult, mult_name, valid){
	QUnit.test(`${add_name}/${mult_name} Distributivity tests`, function (assert) {
		for (var a_name in valid) {
			for (var b_name in valid) {
				for (var c_name in valid) {
					let a = valid[a_name];
					let b = valid[b_name];
					let c = valid[c_name];
					assert.deepApprox( 
						mult( add(b,c), a ), 
						add( mult(b,a), mult(c,a) ), 
						`${mult_name}(${add_name}(${b_name}, ${c_name}), ${a_name}) needs the distributive property: a multiplied value can be distributed across added values`,
					);
				}
			}
		}
	});
}

// "algabraic_group_tests" tests a operation and its inverse to see whether it functions as a group from Abstract Algebra
// NOTE: b and c must produce valid invertible values, i.e. they must not contain edge cases like NaNs or 0s
function algabraic_group_tests	(op, op_name, inv, inv_name, valid, edge){
	closure_tests			(op, op_name, inv, inv_name, valid, edge);
	associativity_tests		(op, op_name, inv, inv_name, valid, edge);
	identity_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_consistency_tests(op, op_name, inv, inv_name, valid, edge);
}

// "abelian_group_tests" tests a operation and its inverse to see whether it functions as an Abelian (aka "commutative") group from Abstract Algebra
// NOTE: b and c must produce valid invertible values, i.e. they must not contain edge cases like NaNs or 0s
function abelian_group_tests 	(op, op_name, inv, inv_name, valid, edge){
	closure_tests			(op, op_name, inv, inv_name, valid, edge);
	associativity_tests		(op, op_name, inv, inv_name, valid, edge);
	identity_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_consistency_tests(op, op_name, inv, inv_name, valid, edge);
	commutativity_tests		(op, op_name, inv, inv_name, valid, edge);
}

function field_tests	(add, add_name, 	sub, sub_name, add_args,
						 mult,mult_name, 	div, div_name, mult_args) {

	abelian_group_tests		(add, add_name, sub, sub_name, add_args);

	abelian_group_tests		(mult, mult_name, div, div_name, mult_args);

	distributivity_tests	(add, add_name, mult, mult_name,	add_args	);
	distributivity_tests	(add, add_name, mult, mult_name,	mult_args	);
	distributivity_tests	(add, add_name, div,  div_name, 	mult_args	); // NOTE: don't run div on add_args, since div0 errors can occur

	distributivity_tests	(sub, sub_name, mult, mult_name,	add_args	);
	distributivity_tests	(sub, sub_name, mult, mult_name,	mult_args	);
	distributivity_tests	(sub, sub_name, div,  div_name, 	mult_args	); // NOTE: don't run div on add_args, since div0 errors can occur
}

framework_tests(
	'Float32Raster',
	Float32Raster.FromArray([-1,	 0,		 0.5,	 NaN ], tetrahedron),
	Float32Raster.FromArray([ 1, 	 2,		 0.49,	 3 	 ], tetrahedron),
);
field_tests(
	ScalarField.add_field, "ScalarField.add_field",
	ScalarField.sub_field, "ScalarField.sub_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		c: 		Float32Raster.FromArray([ 2,	 1,		 0,		-1	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
	},
	ScalarField.mult_field,"ScalarField.mult_field",
	ScalarField.div_field, "ScalarField.div_field",
	{
		a: 		Float32Raster.FromArray([-1,	-0.5,	 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ 1, 	 2,		 3,		 4 	 ], tetrahedron),
		c: 		Float32Raster.FromArray([ 2,	 1,		-2,		-1	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
);