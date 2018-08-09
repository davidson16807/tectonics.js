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
function framework_tests(type_name, a, b){
	QUnit.test(`${type_name} Framework tests`, function (assert) {

		assert.deepApprox( a, a, 
			`It must be possible to test ${type_name} using QUnit's assert.deepApprox() function`
		);
		assert.notDeepApprox( a, b,
			`It must be possible to test ${type_name} using QUnit's assert.notdeepApprox() function`
		);
	});
}

function output_reference_test(op, op_name, A, B){
	let out = A.out;
	QUnit.test(`${op_name} Output Reference tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				assert.deepApprox( 
					op( a, b ), op( a, b, out ), 
					`${op_name}(${a_name}, ${b_name}, out) should behave the same whether or not "out" is specified`
				);
				assert.strictEqual( 
					op( a, b, out ), out, 
					`${op_name}(${a_name}, ${b_name}, out) should return a reference to the "out" variable`
				);
			}
		}
	});
}

function idempotence_tests(op, op_name, A, B){
	QUnit.test(`${op_name} Idempotence tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				assert.deepApprox( 
					op( a, b ), op( a, b ), 
					`${op_name}(${a_name}, ${b_name}) needs the idemoptent property: the operation can be called repeatedly without changing the value`
				);
			}
		}
	});
}

function associativity_tests(op, op_name, inv, inv_name, A, B){
	QUnit.test(`${op_name}/${inv_name} Associativity tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				for (var c_name in B) {
					let a = A[a_name];
					let b = B[b_name];
					let c = B[c_name];
					assert.deepApprox( 
						op( op(a, b), c ), 
						op( op(a, c), b ), 
						`${op_name}(${a_name}, ${op_name}(${b_name}, ${c_name})) needs the associative property: values can be applied in any order to the same effect`
					);
				}
			}
		}
	});
}


function closure_tests(op, op_name, inv, inv_name, A, B){
	QUnit.test(`${op_name}/${inv_name} Closure tests`, function (assert) {

		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				assert.equal( typeof op(a, b), typeof a,
					`${op_name}(a,b) needs the closure property: any value can be applied to produce another valid value`
				);
				assert.equal( op(a, b).constructor.name, a.constructor.name,
					`${op_name}(a,b) needs the closure property: any value can be applied to produce another valid value`
				);
			}
		}
	});
}
function identity_tests(op, op_name, inv, inv_name, A, B){
	let Ia 	= A.I;
	let Ib 	= B.I;

	QUnit.test(`${op_name}/${inv_name} Identity tests`, function (assert) {
		for (var a_name in A) {
			let a = A[a_name];
			assert.deepApprox( op(a, Ib), a,
				`${op_name}(${a_name}, I) needs the identity property: a value exists that can be applied that has no effect`
			);
		}
	});
}

function inverse_tests(op, op_name, inv, inv_name, A, B){
	let I 	= B.I;

	QUnit.test(`${op_name}/${inv_name} Inverse consistency tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				assert.deepApprox( 
					op( a, I ), a, 
					`${op_name}(${a_name}, I) needs to behave consistantly with the identity`,
				);
				assert.deepApprox( 
					inv(a, I), a,
					`${inv_name}(${a_name}, I) needs to behave consistantly with the identity`,
				);
			}
		}
	});
}
function commutative_inverse_tests(op, op_name, inv, inv_name, args){
	let I 	= args.I;

	QUnit.test(`${op_name}/${inv_name} Commutative Inverse tests`, function (assert) {
		for (var a_name in args) {
			let a = args[a_name];
			assert.deepApprox( inv(a, a), I,
				`${inv_name}(${a_name}, ${a_name}) needs the inverse property: an operation exists that returns a value to the identity`
			);
		}
	});
	QUnit.test(`${op_name}/${inv_name} Commutative Inverse Consistency tests`, function (assert) {
		for (var a_name in args) {
			for (var b_name in args) {
				let a = args[a_name];
				let b = args[b_name];
				assert.deepApprox( 
					op( a, inv( I, b ) ), 
					inv(a, b),
					`${inv_name}(${a_name}, ${inv_name}(I, ${b_name}) ) needs to behave consistantly with the identity`,
				);
			}
		}
	});
}

function commutativity_tests 	(op, op_name, inv, inv_name, args){
	QUnit.test(`${op_name}/${inv_name} Commutativity tests`, function (assert) {
		for (var a_name in args) {
			for (var b_name in args) {
				let a = args[a_name];
				let b = args[b_name];
				assert.deepApprox( 
					op( a, b ), 
					op( b, a ), 
					`${op_name}(${a_name}, ${b_name}) needs the commutative property: values in an operation can be swapped to the same effect`,
				);
			}
		}
	});
}

function distributivity_tests 	(add, add_name, mult, mult_name, args){
	QUnit.test(`${add_name}/${mult_name} Distributivity tests`, function (assert) {
		for (var a_name in args) {
			for (var b_name in args) {
				for (var c_name in args) {
					let a = args[a_name];
					let b = args[b_name];
					let c = args[c_name];
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
function algabraic_group_tests	(op, op_name, inv, inv_name, A, B){
	output_reference_test 	(op, op_name, 				 A, B);

	idempotence_tests		(op, op_name, 		 		 A, B);
	idempotence_tests		(inv,inv_name,		 		 A, B);

	closure_tests			(op, op_name, inv, inv_name, A, B);
	associativity_tests		(op, op_name, inv, inv_name, A, B);
	identity_tests			(op, op_name, inv, inv_name, A, B);
	inverse_tests 			(op, op_name, inv, inv_name, A, B);
}

// "abelian_group_tests" tests a operation and its inverse to see whether it functions as an Abelian (aka "commutative") group from Abstract Algebra
function abelian_group_tests 	(op, op_name, inv, inv_name, args){
	output_reference_test 	(op, op_name, 				 args, args);

	idempotence_tests		(op, op_name, 		 		 args, args);
	idempotence_tests		(inv,inv_name,		 		 args, args);

	closure_tests			(op, op_name, inv, inv_name, args, args);
	associativity_tests		(op, op_name, inv, inv_name, args, args);
	identity_tests			(op, op_name, inv, inv_name, args, args);
	inverse_tests 			(op, op_name, inv, inv_name,args, args);
	commutative_inverse_tests(op, op_name, inv, inv_name, args);
	commutativity_tests		(op, op_name, inv, inv_name, args);
}

// "abelian_group_tests" tests a set of four operations to see whether it consitutes a "Field" from Abstract Algebra
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
algabraic_group_tests(
	ScalarField.add_scalar, "ScalarField.add_scalar",
	ScalarField.sub_scalar, "ScalarField.sub_scalar",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ NaN,	 NaN,	 NaN,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([Infinity,Infinity,Infinity,Infinity ], tetrahedron),
		O: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		out: 	Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
	{
		a: 		-1,
		b: 		 0.5,
		c: 		 1,
		d: 		 2,
		I: 		 0,
	},
);
algabraic_group_tests(
	ScalarField.mult_scalar, "ScalarField.mult_scalar",
	ScalarField.div_scalar, "ScalarField.div_scalar",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ NaN,	 NaN,	 NaN,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([Infinity,Infinity,Infinity,Infinity ], tetrahedron),
		O: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
		out: 	Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
	{
		a: 		-1,
		b: 		 0.5,
		c: 		 0,
		d: 		 2,
		I: 		 1,
	},
);
algabraic_group_tests(
	ScalarField.add_field, "ScalarField.add_field",
	ScalarField.sub_field, "ScalarField.sub_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ NaN,	 NaN,	 NaN,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([Infinity,Infinity,Infinity,Infinity ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		out: 	Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ NaN,	 NaN,	 NaN,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([Infinity,Infinity,Infinity,Infinity ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
	},
);
algabraic_group_tests(
	ScalarField.mult_field,"ScalarField.mult_field",
	ScalarField.div_field, "ScalarField.div_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ NaN,	 NaN,	 NaN,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([Infinity,Infinity,Infinity,Infinity ], tetrahedron),
		O: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
		out: 	Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ NaN,	 NaN,	 NaN,	 NaN ], tetrahedron),
		c: 		Float32Raster.FromArray([Infinity,Infinity,Infinity,Infinity ], tetrahedron),
		O: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
);
field_tests(
	ScalarField.add_field, "ScalarField.add_field",
	ScalarField.sub_field, "ScalarField.sub_field",
	{
		a: 		Float32Raster.FromArray([-1,	 0,		 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ 0.5,	-1,		 0,		 1,	 ], tetrahedron),
		c: 		Float32Raster.FromArray([ 1,	 0.5,	-1,		 0,	 ], tetrahedron),
		d: 		Float32Raster.FromArray([ 0,	 1,	 	 0.5,	-1,	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 0,	 0,		 0,		 0	 ], tetrahedron),
		out: 	Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
	ScalarField.mult_field,"ScalarField.mult_field",
	ScalarField.div_field, "ScalarField.div_field",
	{
		a: 		Float32Raster.FromArray([-1,	-0.5,	 1,		 0.5 ], tetrahedron),
		b: 		Float32Raster.FromArray([ 0.5,	-1,		-0.5,	 1,	 ], tetrahedron),
		c: 		Float32Raster.FromArray([ 1,	 0.5,	-1,		-0.5 ], tetrahedron),
		d: 		Float32Raster.FromArray([-0.5,	 1,	 	 0.5,	-1,	 ], tetrahedron),
		I: 		Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
		out: 	Float32Raster.FromArray([ 1,	 1,		 1,		 1	 ], tetrahedron),
	},
);