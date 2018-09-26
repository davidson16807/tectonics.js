// Tectonics.js rolls its own Vector and Matrix3x3 libraries for two reasons:
//   1.) performance
//   2.) separation from volatile 3rd part libraries (Three.js)
// 
// NOTE: matrices are always represented as column-major order list
// This is done to match standards with Three.js
// 
// Lists are used instead of params because performance gain over 
// independant params is negligible for our purposes.

function Matrix3x3(){
  return new Float32Array([0,0,0,
                           0,0,0,
                           0,0,0]);
}
Matrix3x3.Identity = function() {
  return new Float32Array([1,0,0,
                           0,1,0,
                           0,0,1]);
}
Matrix3x3.RowMajorOrder = function(list) {
  ASSERT_IS_3X3_MATRIX(list)

  var xx = list[0]; var xy = list[1]; var xz = list[2];
  var yx = list[3]; var yy = list[4]; var yz = list[5];
  var zx = list[6]; var zy = list[7]; var zz = list[8];

  var result = Matrix();
  result[0] = xx; result[4] = xy; result[8] = xz;
  result[1] = yx; result[5] = yy; result[9] = yz;
  result[2] = zx; result[6] = zy; result[10]= zz;

  return result;
}
Matrix3x3.ColumnMajorOrder = function(list) {
  ASSERT_IS_3X3_MATRIX(list)
  return new Float32Array(list); //matrices are standardized to column major order, already
}
Matrix3x3.BasisVectors = function(a, b, c) { 
  return new Float32Array([a.x, a.y, a.z, 
                           b.x, b.y, b.z, 
                           c.x, c.y, c.z ]); 
} 
Matrix3x3.RotationAboutAxis = function(axis_x, axis_y, axis_z, angle) {
  var θ = angle,
      x = axis_x,
      y = axis_y,
      z = axis_z,
      cθ = Math.cos(θ),
      sθ = Math.sin(θ),
      vθ = 1 - cθ,      // aka versine of θ
      vθx = vθ*x,
      vθy = vθ*y;
  return new Float32Array([
    vθx*x+cθ,   vθx*y+sθ*z, vθx*z-sθ*y, 
    vθx*y-sθ*z, vθy*y+cθ,   vθy*z+sθ*x,  
    vθx*z+sθ*y, vθy*z-sθ*x, vθ*z*z+cθ
  ]);
}
Matrix3x3.FromRotationVector = function(ωx, ωy, ωz) {
  var axis = Vector.normalize(ωx, ωy, ωz);
  var θ = Vector.magnitude(ωx, ωy, ωz),
      x = axis.x,
      y = axis.y,
      z = axis.z,
      cθ = Math.cos(θ),
      sθ = Math.sin(θ),
      vθ = 1 - cθ,      // aka versine of θ
      vθx = vθ*x,
      vθy = vθ*y;
  return new Float32Array([
    vθx*x+cθ,   vθx*y+sθ*z, vθx*z-sθ*y, 
    vθx*y-sθ*z, vθy*y+cθ,   vθy*z+sθ*x,  
    vθx*z+sθ*y, vθy*z-sθ*x, vθ*z*z+cθ
  ]);
}
Matrix3x3.invert = function(matrix, result) {
    result = result || Matrix();

    ASSERT_IS_3X3_MATRIX(matrix)
    ASSERT_IS_3X3_MATRIX(result)

    var A = matrix;
    var B = result;

    var a11 = A[ 0 ], a12 = A[ 3 ], a13 = A[ 6 ];
    var a21 = A[ 1 ], a22 = A[ 4 ], a23 = A[ 7 ];
    var a31 = A[ 2 ], a32 = A[ 5 ], a33 = A[ 8 ];

    var det = a11 * (a22 * a33 - a32 * a23) -
              a12 * (a21 * a33 - a23 * a31) +
              a13 * (a21 * a32 - a22 * a31);

    var invdet = 1 / det;

    var b11 = (a22 * a33 - a32 * a23) * invdet;
    var b12 = (a13 * a32 - a12 * a33) * invdet;
    var b13 = (a12 * a23 - a13 * a22) * invdet;
    var b21 = (a23 * a31 - a21 * a33) * invdet;
    var b22 = (a11 * a33 - a13 * a31) * invdet;
    var b23 = (a21 * a13 - a11 * a23) * invdet;
    var b31 = (a21 * a32 - a31 * a22) * invdet;
    var b32 = (a31 * a12 - a11 * a32) * invdet;
    var b33 = (a11 * a22 - a21 * a12) * invdet;


    B[ 0 ] = b11, B[ 3 ] = b12, B[ 6 ] = b13;
    B[ 1 ] = b21, B[ 4 ] = b22, B[ 7 ] = b23;
    B[ 2 ] = b31, B[ 5 ] = b32, B[ 8 ] = b33;

    return B;
}
Matrix3x3.add_scalar = function(matrix, scalar, result) {
  var result = result || Matrix();
  var A = matrix;
  var b = scalar;
  var C = result;

  ASSERT_IS_3X3_MATRIX(matrix)
  ASSERT_IS_TYPE(scalar, 'number')
  ASSERT_IS_3X3_MATRIX(result)

  C[0] = A[0]+b;
  C[1] = A[1]+b;
  C[2] = A[2]+b;
  C[3] = A[3]+b;
  C[4] = A[4]+b;
  C[5] = A[5]+b;
  C[6] = A[6]+b;
  C[7] = A[7]+b;
  C[8] = A[8]+b;
  
  return C;
}
Matrix3x3.sub_scalar = function(matrix, scalar, result) {
  var result = result || Matrix();
  var A = matrix;
  var b = scalar;
  var C = result;

  ASSERT_IS_3X3_MATRIX(matrix)
  ASSERT_IS_TYPE(scalar, 'number')
  ASSERT_IS_3X3_MATRIX(result)

  C[0] = A[0]-b;
  C[1] = A[1]-b;
  C[2] = A[2]-b;
  C[3] = A[3]-b;
  C[4] = A[4]-b;
  C[5] = A[5]-b;
  C[6] = A[6]-b;
  C[7] = A[7]-b;
  C[8] = A[8]-b;
  
  return C;
}
Matrix3x3.mult_scalar = function(matrix, scalar, result) {
  var result = result || Matrix();
  var A = matrix;
  var b = scalar;
  var C = result;

  ASSERT_IS_3X3_MATRIX(matrix)
  ASSERT_IS_TYPE(scalar, 'number')
  ASSERT_IS_3X3_MATRIX(result)

  C[0] = A[0]*b;
  C[1] = A[1]*b;
  C[2] = A[2]*b;
  C[3] = A[3]*b;
  C[4] = A[4]*b;
  C[5] = A[5]*b;
  C[6] = A[6]*b;
  C[7] = A[7]*b;
  C[8] = A[8]*b;
  
  return C;
}
Matrix3x3.mult_matrix = function(A, B, result) {
  var result = result || Matrix();
  var C = result;

  ASSERT_IS_3X3_MATRIX(A)
  ASSERT_IS_3X3_MATRIX(B)
  ASSERT_IS_3X3_MATRIX(C)

  var a11 = A[ 0 ], a12 = A[ 3 ], a13 = A[ 6 ];
  var a21 = A[ 1 ], a22 = A[ 4 ], a23 = A[ 7 ];
  var a31 = A[ 2 ], a32 = A[ 5 ], a33 = A[ 8 ];

  var b11 = B[ 0 ], b12 = B[ 3 ], b13 = B[ 6 ];
  var b21 = B[ 1 ], b22 = B[ 4 ], b23 = B[ 7 ];
  var b31 = B[ 2 ], b32 = B[ 5 ], b33 = B[ 8 ];

  C[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
  C[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
  C[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

  C[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
  C[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
  C[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

  C[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
  C[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
  C[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

  return C;
}
Matrix3x3.hadamard_matrix = function(A, B, result) {
  var result = result || Matrix();
  var C = result;

  ASSERT_IS_3X3_MATRIX(A)
  ASSERT_IS_3X3_MATRIX(B)
  ASSERT_IS_3X3_MATRIX(C)

  C[0] = A[0]*B[0];
  C[1] = A[1]*B[1];
  C[2] = A[2]*B[2];
  C[3] = A[3]*B[3];
  C[4] = A[4]*B[4];
  C[5] = A[5]*B[5];
  C[6] = A[6]*B[6];
  C[7] = A[7]*B[7];
  C[8] = A[8]*B[8];
  
  return C;
}