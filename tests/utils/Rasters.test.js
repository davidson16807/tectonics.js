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
function framework_tests(op, op_name, inv, inv_name, args){
	let a 	= args.a; 
	let b 	= args.b;

	QUnit.test(`${op_name}/${inv_name} Framework tests`, function (assert) {

		assert.deepApprox( a, a, 
			`It must be possible to test using QUnit's assert.deepApprox() function`
		);
		assert.notDeepApprox( a, b,
			`It must be possible to test using QUnit's assert.notdeepApprox() function`
		);
	});
}

function associativity_tests(op, op_name, inv, inv_name, args){
	let a 	= args.a; 
	let b 	= args.b;
	let ab 	= args.ab;
	let abinv = args.abinv;
	let c 	= args.c;
	let I 	= args.I;

	QUnit.test(`${op_name}/${inv_name} Associativity tests`, function (assert) {
		assert.deepApprox( 
			op( op(a, b), c ), 
			op( a, op(b, c) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
		assert.deepApprox( 
			op( op(a, c), b ), 
			op( a, op(c, b) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
		assert.deepApprox( 
			op( op(b, a), c ), 
			op( b, op(a, c) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
		assert.deepApprox( 
			op( op(b, c), a ), 
			op( b, op(c, a) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
	});
}


function closure_tests(op, op_name, inv, inv_name, args){
	let a 	= args.a; 
	let b 	= args.b;
	let ab 	= args.ab;
	let abinv = args.abinv;
	let c 	= args.c;
	let I 	= args.I;

	QUnit.test(`${op_name}/${inv_name} Closure tests`, function (assert) {

		assert.deepApprox( op(a, b), ab,
			`${op_name} needs the closure property: any value can be applied to produce a (predictable) valid value`
		);
		
		assert.deepApprox( inv(a, b), abinv,
			`${inv_name} needs the closure property: any value can be applied to produce a (predictable) valid value`
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

// "algabraic_group_tests" tests a operation and its inverse to see whether it functions as a group from Abstract Algebra
// NOTE: b and c must produce valid invertible values, i.e. they must not contain edge cases like NaNs or 0s
function algabraic_group_tests	(op, op_name, inv, inv_name, valid, edge){
	associativity_tests		(op, op_name, inv, inv_name, valid, edge);
	closure_tests			(op, op_name, inv, inv_name, valid, edge);
	identity_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_consistency_tests(op, op_name, inv, inv_name, valid, edge);
}

// "abelian_group_tests" tests a operation and its inverse to see whether it functions as an Abelian (aka "commutative") group from Abstract Algebra
// NOTE: b and c must produce valid invertible values, i.e. they must not contain edge cases like NaNs or 0s
function abelian_group_tests 	(op, op_name, inv, inv_name, valid, edge){
	associativity_tests		(op, op_name, inv, inv_name, valid, edge);
	closure_tests			(op, op_name, inv, inv_name, valid, edge);
	identity_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_tests			(op, op_name, inv, inv_name, valid, edge);
	inverse_consistency_tests(op, op_name, inv, inv_name, valid, edge);
	commutativity_tests		(op, op_name, inv, inv_name, valid, edge);
}

abelian_group_tests(
	ScalarField.add_field, "ScalarField.add_field",
	ScalarField.sub_field, "ScalarField.sub_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 2	 ], tetrahedron),
		b: 		Float32Raster.FromArray([ 1, 	 2,		 3,		 4 	 ], tetrahedron),
		ab: 	Float32Raster.FromArray([ 0, 	 2,		 4,		 6	 ], tetrahedron),
		abinv: 	Float32Raster.FromArray([-2, 	-2,		-2,		-2	 ], tetrahedron),
		c: 		Float32Raster.FromArray([ 2,	 1,		 0,		-1	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
	}
);

abelian_group_tests(
	ScalarField.mult_field, "ScalarField.mult_field",
	ScalarField.div_field,  "ScalarField.div_field",
	{
		a: 		Float32Raster.FromArray([-1,	-2,		 1,		 2	 ], tetrahedron),
		b: 		Float32Raster.FromArray([ 1, 	 2,		 3,		 4 	 ], tetrahedron),
		ab: 	Float32Raster.FromArray([-1, 	-4,		 3,	 	 8	 ], tetrahedron),
		abinv: 	Float32Raster.FromArray([-1, 	-1,		1/3,	1/2	 ], tetrahedron),
		c: 		Float32Raster.FromArray([ 2,	 1,		 3,		-1	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	}
);
