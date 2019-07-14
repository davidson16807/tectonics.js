
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

function test_binary_output_reference(op, op_name, A, B){
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
                //NOTE: clean up out after your done, so you don't get wierd test results later on
                op(A.I, B.I, out)
            }
        }
    });
}
function test_unary_output_reference(op, op_name, A){
    let out = A.out;
    QUnit.test(`${op_name} Output Reference tests`, function (assert) {
        for (var a_name in A) {
            let a = A[a_name];
            assert.deepApprox( 
                op( a ), op( a, out ), 
                `${op_name}(${a_name}, out) should behave the same whether or not "out" is specified`
            );
            assert.strictEqual( 
                op( a, out ), out, 
                `${op_name}(${a_name}, out) should return a reference to the "out" variable`
            );
        }
    });
}

function test_binary_output_idempotence(op, op_name, A, B){
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

function test_unary_output_idempotence(op, op_name, A){
    QUnit.test(`${op_name} Idempotence tests`, function (assert) {
        for (var a_name in A) {
            let a = A[a_name];
            assert.deepApprox( 
                op( a ), op( a ), 
                `${op_name}(${a_name}) needs the idemoptent property: the operation can be called repeatedly without changing the value`
            );
        }
    });
}

function test_associativity(op, op_name, A, B){
    QUnit.test(`${op_name} Associativity tests`, function (assert) {
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


function test_closure(op, op_name, A, B){
    QUnit.test(`${op_name} Closure tests`, function (assert) {

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
function test_identity(op, op_name, A, B){
    let Ia     = A.I;
    let Ib     = B.I;

    QUnit.test(`${op_name} Identity tests`, function (assert) {
        for (var a_name in A) {
            let a = A[a_name];
            assert.deepApprox( op(a, Ib), a,
                `${op_name}(${a_name}, I) needs the identity property: a value exists that can be applied that has no effect`
            );
        }
    });
}

function test_binary_inverse(op, op_name, inv, inv_name, A, B){
    QUnit.test(`${op_name}/${inv_name} Inverse tests`, function (assert) {
        for (var a_name in A) {
            for (var b_name in B) {
                let a = A[a_name];
                let b = B[b_name];
                assert.deepApprox( 
                    op( inv( a, b ), b ),     a,
                    `${op_name}(${inv_name}(${a_name}, ${b_name}), ${b_name} ) needs the inversability property: it must return ${a_name}`,
                );
                assert.deepApprox( 
                    inv( op( a, b ), b ),     a,
                    `${inv_name}(${op_name}(${a_name}, ${b_name}), ${b_name} ) needs the inversability property: it must return ${a_name}`,
                );
            }
        }
    });
}
function test_unary_inverse(op, op_name, inv, inv_name, A){
    QUnit.test(`${op_name}/${inv_name} Inverse tests`, function (assert) {
        for (var a_name in A) {
            let a = A[a_name];
            assert.deepApprox( 
                inv( op( a ) ),     a,
                `${inv_name}(${op_name}(${a_name}) ) needs the inversability property: it must return ${a_name}`,
            );
        }
    });
}

function test_commutativity     (op, op_name, args){
    QUnit.test(`${op_name} Commutativity tests`, function (assert) {
        for (var a_name in args) {
            for (var b_name in args) {
                let a = args[a_name];
                let b = args[b_name];
                assert.deepApprox( 
                    op( a, b ), 
                    op( b, a ), 
                    `${op_name}(${a_name}, ${b_name}) must equal ${op_name}(${b_name}, ${a_name})`,
                );
            }
        }
    });
}

function test_anticommutativity (op, op_name, inv, inv_name, args){
    let I = args.I;
    QUnit.test(`${op_name} Anticommutativity tests`, function (assert) {
        for (var a_name in args) {
            for (var b_name in args) {
                let a = args[a_name];
                let b = args[b_name];
                assert.deepApprox( 
                    op( a, b ), 
                    inv(I, op( b, a )), 
                    `${op_name}(${a_name}, ${b_name}) must equal ${inv_name}(I, ${op_name}(${b_name}, ${a_name}))`,
                );
            }
        }
    });
}

function test_distributivity     (add, add_name, mult, mult_name, args){
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

function test_equivalence     (op1, op1_name, op2, op2_name, A, B, C){
    B = B || {'': undefined};
    C = C || {'': undefined};
    QUnit.test(`${op1_name}/${op2_name} Equivalence tests`, function (assert) {
        for (var a_name in A) {
            for (var b_name in B) {
                for (var c_name in C) {
                    let a = A[a_name];
                    let b = B[b_name];
                    let c = C[c_name];
                    assert.deepApprox( 
                        op1(a, b, c), op2(a, b, c),
                        `${op1_name} must behave equivalently to ${op2_name} for arguments: ${a_name}, ${b_name}, ${c_name}`,
                    );
                }
            }
        }
    });
}

function test_properties(properties, op, op_name, A, B) {
    for(let test of properties){
        test(op, op_name, A, B);
    }
}