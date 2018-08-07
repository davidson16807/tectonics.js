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


// "abelian_group_tests" tests a operation and its inverse to see whether it functions as an Abelian (aka "commutative") group from Abstract Algebra
// NOTE: b and c must produce valid invertible values, i.e. they must not contain edge cases like NaNs or 0s
function abelian_group_tests(op, op_name, inv, inv_name, args){
	let a 	= args.a; 
	let b 	= args.b;
	let ab 	= args.ab;
	let abinv = args.abinv;
	let c 	= args.c;
	let I 	= args.I;
	QUnit.test(`${op_name}/${inv_name} Abelian Group tests`, function (assert) {
		assert.deepEqual( a, a, 
			`this test ensures ${op_name} and ${inv_name} can be tested using QUnit's assert.deepEqual() function`
		);
		assert.notDeepEqual( a, b,
			`this test ensures ${op_name} and ${inv_name} can be tested using QUnit's assert.notDeepEqual() function`
		);
		

		assert.deepEqual( op(a, b), ab,
			`${op_name} needs the closure property: any value can be applied to produce a (predictable) valid value`
		);
		
		assert.deepEqual( inv(a, b), abinv,
			`${inv_name} needs the closure property: any value can be applied to produce a (predictable) valid value`
		);


		assert.deepEqual( 
			op( op(a, b), c ), 
			op( a, op(b, c) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
		assert.deepEqual( 
			op( op(a, c), b ), 
			op( a, op(c, b) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
		assert.deepEqual( 
			op( op(b, a), c ), 
			op( b, op(a, c) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);
		assert.deepEqual( 
			op( op(b, c), a ), 
			op( b, op(c, a) ), 
			`${op_name} needs the associative property: values can be applied in any order to the same effect`
		);


		assert.deepEqual( op(b, I), b,
			`${op_name} needs the identity property: a value exists that can be applied that has no effect`
		);
		assert.deepEqual( op(c, I), c,
			`${op_name} needs the identity property: a value exists that can be applied that has no effect`
		);
		
		assert.deepEqual( inv(b, I), b,
			`${inv_name} needs the identity property: a value exists that can be applied that has no effect`
		);
		assert.deepEqual( inv(c, I), c,
			`${inv_name} needs the identity property: a value exists that can be applied that has no effect`
		);


		assert.deepEqual( inv(b, b), I,
			`${inv_name} needs the inverse property: an operation exists that returns a value to the identity`
		);
		assert.deepEqual( inv(c, c), I,
			`${inv_name} needs the inverse property: an operation exists that returns a value to the identity`
		);
		

		assert.deepEqual( 
			op( a, b ), 
			op( b, a ), 
			`${op_name} needs the commutative property: values in an operation can be swapped to the same effect`,
		);
		assert.deepEqual( 
			op( a, c ), 
			op( c, a ), 
			`${op_name} needs the commutative property: values in an operation can be swapped to the same effect`,
		);
		assert.deepEqual( 
			op( b, c ), 
			op( c, b ), 
			`${op_name} needs the commutative property: values in an operation can be swapped to the same effect`,
		);


		assert.deepEqual( 
			op( a, inv( I, b ) ), 
			inv(a, b),
			`${inv_name} needs to behave consistantly with the identity`,
		);
		assert.deepEqual( 
			op( a, inv( I, c ) ), 
			inv(a, c),
			`${inv_name} needs to behave consistantly with the identity`,
		);
		assert.deepEqual( 
			op( b, inv( I, a ) ), 
			inv(b, a),
			`${inv_name} needs to behave consistantly with the identity`,
		);
		assert.deepEqual( 
			op( b, inv( I, c ) ), 
			inv(b, c),
			`${inv_name} needs to behave consistantly with the identity`,
		);
		assert.deepEqual( 
			op( c, inv( I, a ) ), 
			inv(c, a),
			`${inv_name} needs to behave consistantly with the identity`,
		);
		assert.deepEqual( 
			op( c, inv( I, b ) ), 
			inv(c, b),
			`${inv_name} needs to behave consistantly with the identity`,
		);
	});
}


abelian_group_tests(
	ScalarField.add_field, "ScalarField.add_field",
	ScalarField.sub_field, "ScalarField.sub_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 NaN ], tetrahedron),
		b: 		Float32Raster.FromArray([ 1, 	 2,		 3,		 4 	 ], tetrahedron),
		ab: 	Float32Raster.FromArray([ 0, 	 2,		 4,		 NaN ], tetrahedron),
		abinv: 	Float32Raster.FromArray([-2, 	-2,		-2,		 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([ 2,	 1,		 0,		-1	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
	}
);

abelian_group_tests(
	ScalarField.mult_field, "ScalarField.mult_field",
	ScalarField.div_field,  "ScalarField.div_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 NaN ], tetrahedron),
		b: 		Float32Raster.FromArray([ 1, 	 2,		 3,		 4 	 ], tetrahedron),
		ab: 	Float32Raster.FromArray([-1, 	 0,		 3,	 	 NaN ], tetrahedron),
		abinv: 	Float32Raster.FromArray([-1, 	 0,		1/3,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([ 2,	 1,		 3,		-1	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	}
);
