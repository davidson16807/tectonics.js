/* eslint-env qunit */
QUnit.module('Rasters');

var EQUAL = undefined;
var COPY = undefined;

function framework_tests(type_name, a, b){
	QUnit.test(`${type_name} Framework tests`, function (assert) {

		assert.ok(
			EQUAL( a, a), 
			`It must be possible to test ${type_name} using QUnit's assert.deepApprox() function`
		);
	});
}

// NOTE: this behavior is no longer part of spec since moving to a c++ implementation
// this is because the behavior is difficult to accomplish using a c++ wrapper
function test_binary_output_reference(op, op_name, A, B){
	return;
}
function test_unary_output_reference(op, op_name, A){
	return;
}

function test_binary_output_idempotence(op, op_name, A, B){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	QUnit.test(`${op_name} Idempotence tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				op(a,b, out1);
				op(a,b, out2);
				assert.ok(
					EQUAL(out1, out2), 
					`${op_name}(${a_name}, ${b_name}) needs the idemoptent property: the operation can be called repeatedly without changing the value`
				);
			}
		}
	});
}

function test_unary_output_idempotence(op, op_name, A){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	QUnit.test(`${op_name} Idempotence tests`, function (assert) {
		for (var a_name in A) {
			let a = A[a_name];
			op(a, out1);
			op(a, out2);
			assert.ok(
				EQUAL(out1, out2), 
				`${op_name}(${a_name}) needs the idemoptent property: the operation can be called repeatedly without changing the value`
			);
		}
	});
}

function test_associativity(op, op_name, A, B){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	QUnit.test(`${op_name} Associativity tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				for (var c_name in B) {
					let a = A[a_name];
					let b = B[b_name];
					let c = B[c_name];

					op(a, b, out1);
					op( out1, c, out1 );

					op(b, c, out2);
					op(a, out2, out2 );
					assert.ok(
						EQUAL(out1, out2),
						`${op_name}(${a_name}, ${op_name}(${b_name}, ${c_name})) needs the associative property: values can be applied in any order to the same effect`
					);
				}
			}
		}
	});
}


function test_closure(op, op_name, A, B){
	return;
}
function test_identity(op, op_name, A, B){
	let Ia 	= A.I;
	let Ib 	= B.I;
	let out1 = COPY(A.out);

	QUnit.test(`${op_name} Identity tests`, function (assert) {
		for (var a_name in A) {
			let a = A[a_name];
			op(a, Ib, out1);
			assert.ok(
				EQUAL(a, out1),
				`${op_name}(${a_name}, I) needs the identity property: a value exists that can be applied that has no effect`
			);
		}
	});
}

function inverse_tests(op, op_name, inv, inv_name, A, B){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	QUnit.test(`${op_name}/${inv_name} Inverse tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				inv( a, b, out1 );
				op( out1, b, out1);
				assert.ok(
					EQUAL(out1, a),
					`${op_name}(${inv_name}(${a_name}, ${b_name}), ${b_name} ) needs to return ${a_name}`,
				);
				op( a, b, out2 );
				inv( out2 , b, out2);
				assert.ok(
					EQUAL(out2, a),
					`${inv_name}(${op_name}(${a_name}, ${b_name}), ${b_name} ) needs to return ${a_name}`,
				);
			}
		}
	});
}

function test_commutativity (op, op_name, A){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	QUnit.test(`${op_name} Commutativity tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in A) {
				let a = A[a_name];
				let b = A[b_name];
				op( a, b, out1 ); 
				op( b, a, out2 );
				assert.ok(
					EQUAL(out1, out2),
					`${op_name}(${a_name}, ${b_name}) must equal ${op_name}(${b_name}, ${a_name})`,
				);
			}
		}
	});
}

function test_anticommutativity (op, op_name, inv, inv_name, A){
	let I = A.I;
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	QUnit.test(`${op_name} Anticommutativity tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in A) {
				let a = A[a_name];
				let b = A[b_name];
				op( a, b, out1 );
				op( b, a, out2 );
				inv(I, out2, out2); 
				assert.ok(
					EQUAL(out1, out2),
					`${op_name}(${a_name}, ${b_name}) must equal ${inv_name}(I, ${op_name}(${b_name}, ${a_name}))`,
				);
			}
		}
	});
}

function test_distributivity (add, add_name, mult, mult_name, A){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	let out3 = COPY(A.out);
	QUnit.test(`${add_name}/${mult_name} Distributivity tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in A) {
				for (var c_name in A) {
					let a = A[a_name];
					let b = A[b_name];
					let c = A[c_name];
					add(b,c, out1);
					mult(out1, a, out1);

					mult(b,a, out2);
					mult(c,a, out3);
					add(out2, out3, out2);
					assert.ok(
						EQUAL(out1, out2),
						`${mult_name}(${add_name}(${b_name}, ${c_name}), ${a_name}) needs the distributive property: a multiplied value can be distributed across added values`,
					);
				}
			}
		}
	});
}

function test_equivalence 	(op1, op1_name, op2, op2_name, A, B, C){
	let out1 = COPY(A.out);
	let out2 = COPY(A.out);
	B = B || {'': undefined};
	C = C || {'': undefined};
	QUnit.test(`${op1_name}/${op2_name} Equivalence tests`, function (assert) {
		for (var a_name in A) {
			for (var b_name in B) {
				let a = A[a_name];
				let b = B[b_name];
				op1(a, b, out1);
				op2(a, b, out2);
				assert.ok(
					EQUAL(out1, out2),
					`${op1_name} must behave equivalently to ${op2_name} for arguments: ${a_name}, ${b_name}`,
				);
			}
		}
	});
}

function test_properties(properties, op, op_name, A, B) {
	for(let test of properties){
		test(op, op_name, A, B);
	}
}

// "test_algabraic_group" tests a operation and its inverse to see whether it functions as a group from Abstract Algebra
function test_algabraic_group	(
	op, op_name, inv, inv_name, 
	happy1, happy2, 
	edgy1, edgy2
 ){
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_associativity,
			test_identity,
		], 
		op, op_name, happy1, happy2,
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_associativity, 
			test_identity,
		], 
		op, op_name, edgy1, edgy2,
	);

	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_associativity, // NOTE: inv can never be associative - it's the inverse!
			test_identity,
		], 
		inv, inv_name, happy1, happy2,
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_associativity, // NOTE: inv can never be associative - it's the inverse!
			test_identity,
		], 
		inv, inv_name, edgy1, edgy2,
	);

	inverse_tests 			(op, op_name, inv, inv_name,  happy1, happy2);

}

// "algabraic_abelian_group_tests" tests a operation and its inverse to see whether it functions as an Abelian (aka "commutative") group from Abstract Algebra
function algabraic_abelian_group_tests 	(op, op_name,  inv, inv_name, happy_op_args, edgy_op_args){

	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			test_identity,
			test_associativity,
			test_commutativity,
		], 
		op, op_name, happy_op_args, happy_op_args
	);

	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			test_associativity,
			test_commutativity,
		], 
		op, op_name, edgy_op_args, edgy_op_args
	);

	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			test_identity,
			// test_associativity, // NOTE: inv can never be associative - it's the inverse!
			// test_commutativity,
		], 
		inv, inv_name, happy_op_args, happy_op_args
	);

	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			// test_associativity, // NOTE: inv can never be associative - it's the inverse!
			// test_commutativity,
		], 
		inv, inv_name, edgy_op_args, edgy_op_args
	);

	inverse_tests 			(op, op_name, inv, inv_name,  happy_op_args, happy_op_args);

}

// "algabraic_abelian_group_tests" tests a set of four operations to see whether it consitutes a "Field" from Abstract Algebra
function test_algabraic_field	(add, add_name,  sub, sub_name, happy_add_args,	edgy_add_args,
								 mult,mult_name, div, div_name, happy_mult_args,edgy_mult_args) {

	algabraic_abelian_group_tests	(add, add_name, sub, sub_name,  happy_add_args, edgy_add_args);
	algabraic_abelian_group_tests	(mult, mult_name, div, div_name,  happy_mult_args, edgy_mult_args);

	test_distributivity	(add, add_name, mult, mult_name,	happy_add_args	);
	test_distributivity	(add, add_name, mult, mult_name,	happy_mult_args	);
	test_distributivity	(add, add_name, div,  div_name, 	happy_mult_args	); // NOTE: don't run div on happy_add_args, since div0 errors can occur

	test_distributivity	(sub, sub_name, mult, mult_name,	happy_add_args	);
	test_distributivity	(sub, sub_name, mult, mult_name,	happy_mult_args	);
	test_distributivity	(sub, sub_name, div,  div_name, 	happy_mult_args	); // NOTE: don't run div on happy_add_args, since div0 errors can occur
}








add_uniform_args = {
	pos: 	 1,
	neg: 	-1,
	tiny: 	 1e-1,
	big: 	 1e1,
	I: 		 0,
}
mult_uniform_args = {
	...add_uniform_args,
	I: 		 1,
}
Rasters().then(function(rasters) {
	cpp = rasters
	// NOTE: 
	// a "happy path" in this script indicates an operation should produce a valid value as understood within the confines of an abelian algebra
	// an "edge case" is anything that produces a technically valid value but not one understood to be an abelian algebra
	// for instance, a "NaN" value that spreads through calculations
	add_vector_happy_args = {
		pos: 	new cpp.vec3( 1,	2,		 3 			),
		neg:	new cpp.vec3(-1,	-2,		-3 			),
		tiny: 	new cpp.vec3( 1e-1,	1e-1,	 1e-1 		),
		big: 	new cpp.vec3( 1e1,	1e1,	 1e1 		),
		I: 		new cpp.vec3( 0,	0,		 0 			),
		out: 	new cpp.vec3( 1,	1,		 1 			),
	}
	mult_vector_happy_args = {
		...add_vector_happy_args,
		I: 		new cpp.vec3( 1,	1,		 1 			),
	}
	add_vector_edgy_args = {
		...add_vector_happy_args,
		// nans: 	new cpp.vec3( NaN,		 NaN, 	 NaN 		),
		// infs: 	new cpp.vec3( Infinity,	 Infinity, Infinity ),
		// ninfs: 	new cpp.vec3(-Infinity,	-Infinity,-Infinity ),
	}
	mult_vector_edgy_args = {
		...add_vector_edgy_args,
		// zeros: 	new cpp.vec3( 0,	0,		 0 			),
		I: 		new cpp.vec3( 1,	1,		 1 			),
	}


	add_matrix_happy_args = {
		pos: 	new cpp.mat3( 1,			 2,		 3, 		
					      4,			 5,		 6, 		
					      7,			 8,		 9, 		),
		neg:	new cpp.mat3(-1,			-2,		-3, 		
					     -4,			-5,		-6, 		
					     -7,			-8,		-9, 		),
		tiny: 	new cpp.mat3( 1e-2,		 1e-2,	 1e-2,		
					      1e-2,		 1e-2,	 1e-2,		
					      1e-2,		 1e-2,	 1e-2,		),
		big: 	new cpp.mat3( 1e2,		 1e2,	 1e2, 		
					      1e2,		 1e2,	 1e2, 		
					      1e2,		 1e2,	 1e2, 		),
		I: 		new cpp.mat3( 0,			 0,		 0, 		
					      0,			 0,		 0, 		
					      0,			 0,		 0, 		),
		out: 	new cpp.mat3( 1,			 1,		 1, 		
					      1,			 1,		 1, 		
					      1,			 1,		 1, 		),
	}
	mult_matrix_happy_args = {
		...add_matrix_happy_args,
		I: 		new cpp.mat3(1.),
	}
	add_matrix_edgy_args = {
		...add_matrix_happy_args,
		nans: 	new cpp.mat3( NaN,		 NaN, 	 NaN, 		
					          NaN,		 NaN, 	 NaN, 		
					          NaN,		 NaN, 	 NaN, 		),
		infs: 	new cpp.mat3( Infinity,	 Infinity, Infinity, 
					          Infinity,	 Infinity, Infinity, 
					          Infinity,	 Infinity, Infinity, ),
		ninfs: 	new cpp.mat3(-Infinity,	-Infinity,-Infinity, 
					         -Infinity,	-Infinity,-Infinity, 
					         -Infinity,	-Infinity,-Infinity, ),
	}

	mult_matrix_edgy_args = {
		...add_matrix_edgy_args,
		zeros: 	new cpp.mat3( 0,			 0,		 0, 		
					          0,			 0,		 0, 		
					          0,			 0,		 0, 		),
		I: 		new cpp.mat3(1.),
	}

	add_matrix4x4_happy_args = {
		pos: 	new cpp.mat4( 1,			 2,		 3, 		 4, 		
					          5,			 6,		 7, 		 8, 		
					          9,			 10,	 11, 		 12, 		
					          13,			 14,	 15, 		 16, 		),
		neg:	new cpp.mat4(-1,			-2,		-3, 		-4, 		
					         -5,			-6,		-7, 		-8, 		
					         -9,			-10,	-11, 		-12, 		
					         -13,			-14,	-15, 		-16, 		),
		tiny: 	new cpp.mat4( 1e-1,		 1e-1,	 1e-1,		 1e-1,		
					          1e-1,		 1e-1,	 1e-1,		 1e-1,		
					          1e-1,		 1e-1,	 1e-1,		 1e-1,		
					          1e-1,		 1e-1,	 1e-1,		 1e-1,		),
		big: 	new cpp.mat4( 1e4,		 1e4,	 1e4, 		 1e4, 		
					          1e4,		 1e4,	 1e4, 		 1e4, 		
					          1e4,		 1e4,	 1e4, 		 1e4, 		
					          1e4,		 1e4,	 1e4, 		 1e4, 		),
		I: 		new cpp.mat4( 0,			 0,		 0, 		 0, 		
					          0,			 0,		 0, 		 0, 		
					          0,			 0,		 0, 		 0, 		
					          0,			 0,		 0, 		 0, 		),
		out: 	new cpp.mat4( 1,			 1,		 1, 		 1, 		
					          1,			 1,		 1, 		 1, 		
					          1,			 1,		 1, 		 1, 		
					          1,			 1,		 1, 		 1, 		),
	}
	mult_matrix4x4_happy_args = {
		...add_matrix4x4_happy_args,
		I: 		new cpp.mat4(1.),
	}    
	add_matrix4x4_edgy_args = {
		...add_matrix4x4_happy_args,
		nans: 	new cpp.mat4 ( NaN,		 NaN, 	 NaN, 		 NaN, 		
					     	   NaN,		 NaN, 	 NaN, 		 NaN, 		
					     	   NaN,		 NaN, 	 NaN, 		 NaN, 		
					     	   NaN,		 NaN, 	 NaN, 		 NaN, 		),
		infs: 	new cpp.mat4 ( Infinity,	 Infinity, Infinity, Infinity, 
					     	   Infinity,	 Infinity, Infinity, Infinity, 
					     	   Infinity,	 Infinity, Infinity, Infinity, 
					     	   Infinity,	 Infinity, Infinity, Infinity, ),
		ninfs: 	new cpp.mat4 (-Infinity,	-Infinity,-Infinity,-Infinity, 
					    	  -Infinity,	-Infinity,-Infinity,-Infinity, 
					     	  -Infinity,	-Infinity,-Infinity,-Infinity, 
					     	  -Infinity,	-Infinity,-Infinity,-Infinity, ),
	}
	mult_matrix4x4_edgy_args = {
		...add_matrix4x4_edgy_args,
		zeros: 	new cpp.mat4 ( 0,			 0,		 0, 		 0, 		
					     	   0,			 0,		 0, 		 0, 		
					     	   0,			 0,		 0, 		 0, 		
					     	   0,			 0,		 0, 		 0, 		),
		I: 		new cpp.mat4(1.),
	}    
	   
	 
	add_scalar_field_happy_args = {
		pos: 	cpp.floats_from_list([ 1,	 2,		 3,		 4,	 ]),
		neg:	cpp.floats_from_list([-1,	-2,		-3,		-4	 ]),
		tiny: 	cpp.floats_from_list([ 1e-2,1e-2,	 1e-2,	 1e-2]),
		big: 	cpp.floats_from_list([ 1e2, 1e2,	 1e2,	 1e2,]),
		I: 		cpp.floats_from_list([ 0,	 0,		 0,		 0	 ]),
		out: 	cpp.floats_from_list([ 1,	 1,		 1,		 1	 ]),
	}
	mult_scalar_field_happy_args = {
		...add_scalar_field_happy_args,
		I: 		cpp.floats_from_list([ 1,	 1,		 1,		 1	 ]),
	}
	add_scalar_field_edgy_args = {
		...add_scalar_field_happy_args,
		// nans: 	cpp.floats_from_list([ NaN,	 NaN, 	 NaN, 	 NaN ]),
		// infs: 	cpp.floats_from_list([ Infinity, Infinity, Infinity, Infinity]),
		// ninfs: 	cpp.floats_from_list([-Infinity,-Infinity,-Infinity,-Infinity]),
	}
	mult_scalar_field_edgy_args = {
		...add_scalar_field_edgy_args,
		// zeros: 	cpp.floats_from_list([ 0,	 0,		 0,		 0	 ]),
		I: 		cpp.floats_from_list([ 1,	 1,		 1,		 1	 ]),
	}

	EQUAL = function(a,b) {
		return cpp.floats_equal_floats(a,b);
	};
	COPY = function(a) {
		return cpp.floats_from_floats(a);
	};

	framework_tests(
		'Float32Raster',
		cpp.floats_from_list([-1,	 0,		 0.5,	 -0.5 ]),
		cpp.floats_from_list([ 1, 	 2,		 0.49,	  3   ]),
	);

	test_algabraic_group(
		cpp.floats_add_float, "cpp.floats_add_float",
		cpp.floats_sub_float, "cpp.floats_sub_float",
		add_scalar_field_happy_args, add_uniform_args,
		add_scalar_field_edgy_args, add_uniform_args,
	);

	test_algabraic_group(
		cpp.floats_mult_float, "cpp.floats_mult_float",
		cpp.floats_div_float, "cpp.floats_div_float",
		mult_scalar_field_happy_args, mult_uniform_args,
		mult_scalar_field_edgy_args, mult_uniform_args,
	);

	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			// test_associativity, 
			// test_commutativity,
		], 
		cpp.floats_min_float, "cpp.floats_min_float",
		mult_scalar_field_happy_args, mult_uniform_args,
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			// test_associativity, 
			// test_commutativity,
		], 
		cpp.floats_max_float, "cpp.floats_max_float",
		mult_scalar_field_happy_args, mult_uniform_args,
	);
	//test_equivalence(
	//	cpp.floats_greaterThanEqual_float, "cpp.floats_greaterThanEqual_float",
	//	(a,b,out1) => {
	//		out1 = new cpp.bools(out1.size());
	//		out2 = new cpp.bools(out1.size());
	//		cpp.floats_greaterThan_float(a,b,out1)
	//		cpp.floats_equal_float(a,b,out2)
	//		cpp.bools_unite_bools(out1,out2,out1);
	//	}, 
	//	"[equivalent expression]",
	//	mult_scalar_field_happy_args, mult_uniform_args,
	//);
	//test_equivalence(
	//	cpp.floats_notEqual_float, "cpp.floats_notEqual_float",
	//	(a,b,out1) => {
	//		cpp.floats_equal_float(a,b,out1);
	//		cpp.bools_negate_bools(out1,out1);
	//	}, 
	//	"[equivalent expression]",
	//	mult_scalar_field_happy_args, mult_uniform_args,
	//);
	//test_equivalence(
	//	floats_add_float_term, "floats_add_float_term",
	//	(a,b,c) => floats_add_field(a,floats_mult_float(b,c)), "[equivalent expression]",
	//	mult_scalar_field_happy_args, mult_scalar_field_happy_args, mult_uniform_args,
	//);
	//test_equivalence(
	//	floats_sub_float_term, "floats_sub_float_term",
	//	(a,b,c) => floats_sub_field(a,floats_mult_float(b,c)), "[equivalent expression]",
	//	mult_scalar_field_happy_args, mult_scalar_field_happy_args, mult_uniform_args,
	//);

	test_algabraic_field(
		cpp.floats_add_floats, "cpp.floats_add_floats", 
		cpp.floats_sub_floats, "cpp.floats_sub_floats", 
		add_scalar_field_happy_args, 
		add_scalar_field_edgy_args, 
		cpp.floats_mult_floats,"cpp.floats_mult_floats",
		cpp.floats_div_floats, "cpp.floats_div_floats", 
		mult_scalar_field_happy_args, 
		mult_scalar_field_edgy_args, 
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			test_associativity, 
			// test_commutativity,
		], 
		cpp.floats_min_floats, "cpp.floats_min_floats",
		mult_scalar_field_happy_args, mult_scalar_field_happy_args, 
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			test_associativity, 
			// test_commutativity,
		], 
		cpp.floats_max_floats, "cpp.floats_max_floats",
		mult_scalar_field_happy_args, mult_scalar_field_happy_args, 
	);

	//test_equivalence(
	//	cpp.floats_sqrt, "cpp.floats_sqrt",
	//	(a) => cpp.floats_pow_float(a,1/2), "cpp.floats_pow_float(...,1/2)",
	//	mult_scalar_field_happy_args
	//);
	// test_equivalence(
	// 	cpp.floats_inv, "cpp.floats_inv",
	// 	(a) => cpp.floats_div_field(mult_scalar_field_happy_args.I,a), "cpp.floats_div_field(I,...)",
	// 	mult_scalar_field_happy_args
	// );
	// test_equivalence(
	// 	cpp.floats_gte_field, "cpp.floats_gte_field",
	// 	(a,b) => BinaryMorphology.union(cpp.floats_gt_field(a,b), cpp.floats_eq_field(a,b)), "BinaryMorphology.union(cpp.floats_gt_field, cpp.floats_eq_field)",
	// 	mult_scalar_field_happy_args, mult_scalar_field_happy_args, 
	// );
	// test_equivalence(
	// 	cpp.floats_lte_field, "cpp.floats_lte_field",
	// 	(a,b) => BinaryMorphology.union(cpp.floats_lt_field(a,b), cpp.floats_eq_field(a,b)), "BinaryMorphology.union(cpp.floats_lt_field, cpp.floats_eq_field)",
	// 	mult_scalar_field_happy_args, mult_scalar_field_happy_args, 
	// );
	// test_equivalence(
	// 	cpp.floats_ne_field, "cpp.floats_ne_field",
	// 	(a,b) => BinaryMorphology.negation(cpp.floats_eq_field(a,b)), "BinaryMorphology.negation(cpp.floats_eq_field)",
	// 	mult_scalar_field_happy_args, mult_scalar_field_happy_args, 
	// );
	// test_equivalence(
	// 	cpp.floats_add_field_term, "cpp.floats_add_field_term",
	// 	(a,b,c) => cpp.floats_add_field(a, cpp.floats_mult_field(b,c)), "cpp.floats_add_field(..., cpp.floats_mult_field)",
	// 	mult_scalar_field_happy_args, mult_scalar_field_happy_args, mult_scalar_field_happy_args,
	// );
	// test_equivalence(
	// 	cpp.floats_sub_field_term, "cpp.floats_sub_field_term",
	// 	(a,b,c) => cpp.floats_sub_field(a, cpp.floats_mult_field(b,c)), "cpp.floats_sub_field(..., ScalarField.mult_field)",
	// 	mult_scalar_field_happy_args, mult_scalar_field_happy_args, mult_scalar_field_happy_args,
	// );

	add_vector_field_happy_args = {
		pos: 	cpp.vec3s_from_list([ 1,	 2,		 3,		 4,	  
									  5,	 6,		 7,		 8,	  
									  9,	 10,	 11,	 12 ]),
		neg:	cpp.vec3s_from_list([-1,	-2,		-3,		-4, 
									 -5,	-6,		-7,		-8, 
									 -9,	-10,	-11,	-12 ]),
		tiny: 	cpp.vec3s_from_list([ 1e-1,	 1e-1,	 1e-1,	 1e-1, 
									  1e-1,	 1e-1,	 1e-1,	 1e-1, 
									  1e-1,	 1e-1,	 1e-1,	 1e-1]),
		big: 	cpp.vec3s_from_list([ 1e1,	 1e1,	 1e1,	 1e1,  
									  1e1,	 1e1,	 1e1,	 1e1,  
									  1e1,	 1e1,	 1e1,	 1e1,]),
		I: 		cpp.vec3s_from_list([ 0,	 0,		 0,		 0, 
									  0,	 0,		 0,		 0, 
									  0,	 0,		 0,		 0 ]),
		out: 	cpp.vec3s_from_list([ 1,	 1,		 1,		 1,
									  1,	 1,		 1,		 1,
									  1,	 1,		 1,		 1 ]),
	}
	mult_vector_field_happy_args = {
		...add_vector_field_happy_args,
		I: 		cpp.vec3s_from_list([ 1,	 1,		 1,		 1, 
									  1,	 1,		 1,		 1, 
									  1,	 1,		 1,		 1 ]),
	}
	add_vector_field_edgy_args = {
		...add_vector_field_happy_args,
		//nans: 	cpp.vec3s_from_list([ NaN,	 NaN, 	 NaN, 	 NaN, 
		//							  NaN,	 NaN, 	 NaN, 	 NaN, 
		//							  NaN,	 NaN, 	 NaN, 	 NaN ]),
		//infs: 	cpp.vec3s_from_list([ Infinity, Infinity, Infinity, Infinity, 
		//							  Infinity, Infinity, Infinity, Infinity, 
		//							  Infinity, Infinity, Infinity, Infinity]),
		//ninfs: 	cpp.vec3s_from_list([-Infinity,-Infinity,-Infinity,-Infinity, 
		//							 -Infinity,-Infinity,-Infinity,-Infinity, 
		//							 -Infinity,-Infinity,-Infinity,-Infinity]),
	}
	mult_vector_field_edgy_args = {
		...add_vector_field_edgy_args,
		//zeros: 	cpp.vec3s_from_list([ 0,	 0,		 0,		 0, 
		//							  0,	 0,		 0,		 0, 
		//							  0,	 0,		 0,		 0 ]),
		I: 		cpp.vec3s_from_list([ 1,	 1,		 1,		 1, 
									  1,	 1,		 1,		 1, 
									  1,	 1,		 1,		 1 ]),
	}
	   
	EQUAL = function(a,b) {
		return cpp.vec3s_equal_vec3s(a,b);
	};
	COPY = function(a) {
		return cpp.vec3s_from_vec3s(a);
	};
	test_algabraic_group(
		cpp.vec3s_add_float, "cpp.vec3s_add_float",
		cpp.vec3s_sub_float, "cpp.vec3s_sub_float",
		add_vector_field_happy_args, add_uniform_args,
		add_vector_field_edgy_args, add_uniform_args,
	);
	test_algabraic_group(
		cpp.vec3s_mult_float, "cpp.vec3s_mult_float",
		cpp.vec3s_div_float, "cpp.vec3s_div_float",
		mult_vector_field_happy_args, mult_uniform_args,
		mult_vector_field_edgy_args, mult_uniform_args,
	);

	test_algabraic_group(
		cpp.vec3s_add_vec3, "cpp.vec3s_add_vec3",
		cpp.vec3s_sub_vec3, "cpp.vec3s_sub_vec3",
		add_vector_field_happy_args, add_vector_happy_args,
		add_vector_field_edgy_args, add_vector_edgy_args,
	);
	test_algabraic_group(
		cpp.vec3s_mult_vec3, "cpp.vec3s_mult_vec3",
		cpp.vec3s_div_vec3, "cpp.vec3s_div_vec3",
		mult_vector_field_happy_args, mult_vector_happy_args,
		mult_vector_field_edgy_args, mult_vector_edgy_args,
	);

	test_algabraic_group(
		cpp.vec3s_add_floats, "cpp.vec3s_add_floats",
		cpp.vec3s_sub_floats, "cpp.vec3s_sub_floats",
		add_vector_field_happy_args, add_scalar_field_happy_args,
		add_vector_field_edgy_args, add_scalar_field_edgy_args,
	);
	test_algabraic_group(
		cpp.vec3s_mult_floats, "cpp.vec3s_mult_floats",
		cpp.vec3s_div_floats, "cpp.vec3s_div_floats",
		mult_vector_field_happy_args, mult_scalar_field_happy_args,
		mult_vector_field_edgy_args, mult_scalar_field_edgy_args,
	);

	test_algabraic_field(
		cpp.vec3s_add_vec3s, "cpp.vec3s_add_vec3s",
		cpp.vec3s_sub_vec3s, "cpp.vec3s_sub_vec3s",
		add_vector_field_happy_args, 
		add_vector_field_edgy_args, 
		cpp.vec3s_mult_vec3s,"cpp.vec3s_mult_vec3s",
		cpp.vec3s_div_vec3s, "cpp.vec3s_div_vec3s",
		mult_vector_field_happy_args, 
		mult_vector_field_edgy_args, 
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			// test_associativity, // NOTE: max_vector_field and min_vector_field are nonassociative, since two vectors can have the same magnitude, e.g. [1,1,1] and [-1,-1,-1]
			// test_commutativity,
		], 
		cpp.vec3s_min_vec3s, "cpp.vec3s_min_vec3s",
		mult_vector_field_happy_args, mult_vector_field_happy_args, 
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			// test_associativity, // NOTE: max_vector_field and min_vector_field are nonassociative, since two vectors can have the same magnitude, e.g. [1,1,1] and [-1,-1,-1]
			// test_commutativity,
		], 
		cpp.vec3s_max_vec3s, "cpp.vec3s_max_vec3s",
		mult_vector_field_happy_args, mult_vector_field_happy_args, 
	);
	test_properties([
			// test_binary_output_reference,
			test_binary_output_idempotence,			
			test_closure,
			// test_identity,
			// test_associativity, 
			// test_commutativity,
		], 
		cpp.vec3s_cross_vec3s, "cpp.vec3s_cross_vec3s",
		mult_vector_field_happy_args, mult_vector_field_happy_args, 
	);
	test_anticommutativity(
		cpp.vec3s_cross_vec3s, "cpp.vec3s_cross_vec3s",
		cpp.vec3s_sub_vec3s, "cpp.vec3s_sub_vec3s",
		add_vector_field_happy_args, add_vector_field_happy_args, 
	);
	test_distributivity(
		cpp.vec3s_add_vec3s, "cpp.vec3s_add_vec3s",
		cpp.vec3s_cross_vec3s, "cpp.vec3s_cross_vec3s",
		mult_vector_field_happy_args
	);


});


















// test_properties([
// 		test_unary_output_reference,
// 		test_unary_output_idempotence,			
// 		test_closure,
// 		// test_identity,
// 		test_associativity, 
// 		// test_commutativity,
// 	], 
// 	cpp.vec3s_normalize, "cpp.vec3s_normalize",
// 	mult_vector_field_happy_args, mult_vector_field_happy_args, 
// );
// test_binary_output_idempotence(
// 	cpp.vec3s_dot_vec3s, "cpp.vec3s_dot_vec3s",
// 	mult_vector_field_happy_args, mult_vector_field_happy_args, 
// );

// test_properties([
//		// test_binary_output_reference,
// 		test_binary_output_idempotence,			
// 		test_closure,
// 		// test_identity,
// 		// test_associativity, 
// 		// test_commutativity,
// 	], 
// 	VectorField.cross_vector, "VectorField.cross_vector",
// 	mult_vector_field_happy_args, mult_vector_happy_args, 
// );
// test_equivalence(
// 	(a) => Vector.cross_vector(a.x, a.y, a.z, a.x, a.y, a.z), "Vector.cross_vector",
// 	(a) => mult_vector_edgy_args.zeros, '0',
// 	mult_vector_happy_args, 
// );
// test_equivalence(
// 	(a,b) => { 
// 		x = Vector.cross_vector(a.x, a.y, a.z, b.x, b.y, b.z); 
// 		return Vector.dot_vector(a.x, a.y, a.z, x.x, x.y, x.z, );
// 	}, "Vector.dot_vector(..., Vector.cross_vector)",
// 	(a,b) => 0, '0', 
// 	mult_vector_happy_args, mult_vector_happy_args, 
// );
// test_properties([
// 		//test_binary_output_reference,
// 		test_binary_output_idempotence,			
// 		test_closure,
// 		test_identity,
// 		test_associativity, 
// 		// test_commutativity,
// 	], 
// 	VectorField.mult_matrix, "VectorField.mult_matrix",
// 	mult_vector_field_happy_args, mult_matrix_happy_args, 
// );
// test_binary_output_idempotence(
// 	VectorField.dot_vector, "VectorField.dot_vector_field",
// 	mult_vector_field_happy_args, mult_vector_happy_args, 
// );
// test_binary_output_idempotence(
// 	VectorField.vector_field_similarity, "VectorField.vector_field_similarity",
// 	mult_vector_field_happy_args, mult_vector_field_happy_args, 
// );
// test_equivalence(
// 	(a) => VectorField.cross_vector_field(a, a), "VectorField.cross_vector_field",
// 	(a) => mult_vector_field_edgy_args.zeros, "0",
// 	mult_vector_field_happy_args, 
// );

// NOTE: this test fails, but I'm not sure whether it's failing 
//  because its broken or because the "tetrahedron" grid isn't a suitable test subject
//test_equivalence(
//	(a) => VectorField.divergence(VectorField.curl(a)), "VectorField.curl(ScalarField.gradient)",
//	(a) => mult_scalar_field_edgy_args.zeros, "0",
//	mult_vector_field_happy_args, 
//);
// test_equivalence(
// 	(a) => VectorField.curl(ScalarField.gradient(a)), "VectorField.curl(ScalarField.gradient)",
// 	(a) => mult_vector_field_edgy_args.zeros, "0",
// 	mult_scalar_field_happy_args, 
// );

// test_equivalence(
// 	(a,b) => VectorField.dot_vector_field(a, VectorField.cross_vector_field(a, b)), "VectorField.cross_vector_field",
// 	(a,b) => mult_scalar_field_edgy_args.zeros, "0",
// 	mult_vector_field_happy_args, mult_vector_field_happy_args, 
// );
// NOTE: look into sporadic failures
// test_equivalence(
// 	(a) => VectorField.vector_field_similarity(a, a), "VectorField.vector_field_similarity",
// 	(a) => mult_scalar_field_happy_args.I, "1",
// 	mult_vector_field_happy_args, 
// );

