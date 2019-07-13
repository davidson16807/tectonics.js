'use strict';
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
 
  var xx = list[0]; var xy = list[1]; var xz = list[2];
  var yx = list[3]; var yy = list[4]; var yz = list[5];
  var zx = list[6]; var zy = list[7]; var zz = list[8];
  var result = Matrix3x3();
  result[0] = xx; result[4] = xy; result[8] = xz;
  result[1] = yx; result[5] = yy; result[9] = yz;
  result[2] = zx; result[6] = zy; result[10]= zz;
  return result;
}
Matrix3x3.ColumnMajorOrder = function(list) {
 
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
      vθ = 1 - cθ, // aka versine of θ
      vθx = vθ*x,
      vθy = vθ*y;
  return new Float32Array([
    vθx*x+cθ, vθx*y+sθ*z, vθx*z-sθ*y,
    vθx*y-sθ*z, vθy*y+cθ, vθy*z+sθ*x,
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
      vθ = 1 - cθ, // aka versine of θ
      vθx = vθ*x,
      vθy = vθ*y;
  return new Float32Array([
    vθx*x+cθ, vθx*y+sθ*z, vθx*z-sθ*y,
    vθx*y-sθ*z, vθy*y+cθ, vθy*z+sθ*x,
    vθx*z+sθ*y, vθy*z-sθ*x, vθ*z*z+cθ
  ]);
}
Matrix3x3.invert = function(matrix, result) {
    result = result || Matrix3x3();
   
   
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
  var result = result || Matrix3x3();
  var A = matrix;
  var b = scalar;
  var C = result;
 
 
 
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
  var result = result || Matrix3x3();
  var A = matrix;
  var b = scalar;
  var C = result;
 
 
 
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
  var result = result || Matrix3x3();
  var A = matrix;
  var b = scalar;
  var C = result;
 
 
 
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
  var result = result || Matrix3x3();
  var C = result;
 
 
 
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
  var result = result || Matrix3x3();
  var C = result;
 
 
 
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
// NOTE:
// I don't have time to roll my own Matrix4x4 class, so 
// I'm just borrowing code from the gl-matrix library and adapting it to fit with my own math backend
// The MIT license shown below should allow for this.
// 
// sexily yours,
//  -Carl
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
function Matrix4x4() {
  return new Float32Array(16);
}
Matrix4x4.EPSILON = 1e-4;
Matrix4x4.identity = function(out) {
  out = out || Matrix4x4();
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Copy the values from one out to another
 *
 * @param {out} out the receiving matrix
 * @param {out} a the source matrix
 * @returns {out} out
 */
Matrix4x4.copy = function(a, out) {
  out = out || Matrix4x4();
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
Matrix4x4.from_matrix3x3 = function(a, out) {
  out = out || Matrix4x4();
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[4] = a[3];
  out[5] = a[4];
  out[6] = a[5];
  out[8] = a[6];
  out[9] = a[7];
  out[10] = a[8];
  out[15] = 1.;
  return out;
}
Matrix4x4.from_vector3_basis = function(x,y,z, out) {
  out = out || Matrix4x4();
  out[0] = x[0];
  out[1] = x[1];
  out[2] = x[2];
  out[4] = y[3];
  out[5] = y[4];
  out[6] = y[5];
  out[8] = z[6];
  out[9] = z[7];
  out[10] = z[8];
  out[15] = 1.;
  return out;
}
Matrix4x4.column_major_order = function(
      in0, in1, in2, in3, in4, in5, in6, in7, in8, in9, in10, in11, in12, in13, in14, in15, out
    ) {
  out = out || Matrix4x4();
  out[0] = in0
  out[1] = in1
  out[2] = in2
  out[3] = in3
  out[4] = in4
  out[5] = in5
  out[6] = in6
  out[7] = in7
  out[8] = in8
  out[9] = in9
  out[10] = in10
  out[11] = in11
  out[12] = in12
  out[13] = in13
  out[14] = in14
  out[15] = in15
  return out;
}
Matrix4x4.row_major_order = function(
      in0, in1, in2, in3,
      in4, in5, in6, in7,
      in8, in9, in10, in11,
      in12, in13, in14, in15, out
    ) {
  out = out || Matrix4x4();
  out[0] = in0; out[4] = in1; out[8] = in2;
  out[1] = in3; out[5] = in4; out[9] = in5;
  out[2] = in6; out[6] = in7; out[10]= in8;
  return out;
}
/**
 * Transpose the values of a out
 *
 * @param {out} out the receiving matrix
 * @param {out} a the source matrix
 * @returns {out} out
 */
Matrix4x4.transpose = function(a, out) {
  out = out || Matrix4x4();
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    let a01 = a[1], a02 = a[2], a03 = a[3];
    let a12 = a[6], a13 = a[7];
    let a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
/**
 * Inverts a out
 *
 * @param {out} out the receiving matrix
 * @param {out} a the source matrix
 * @returns {out} out
 */
Matrix4x4.invert = function(a, out) {
  out = out || Matrix4x4();
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the adjugate of a out
 *
 * @param {out} out the receiving matrix
 * @param {out} a the source matrix
 * @returns {out} out
 */
Matrix4x4.adjoint = function(a, out) {
  out = out || Matrix4x4();
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  out[0] = (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
  out[8] = (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
  return out;
}
/**
 * Calculates the determinant of a out
 *
 * @param {out} a the source matrix
 * @returns {Number} determinant of a
 */
Matrix4x4.determinant = function(a){
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  // Calculate the determinant
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two outs
 *
 * @param {out} out the receiving matrix
 * @param {out} a the first operand
 * @param {out} b the second operand
 * @returns {out} out
 */
Matrix4x4.mult_matrix = function(a, b, out) {
  out = out || Matrix4x4();
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  // Cache only the current line of the second matrix
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     out.identity(dest);
 *     out.translate(dest, dest, vec);
 *
 * @param {out} out out receiving operation result
 * @param {vec3} v Translation vector
 * @returns {out} out
 */
Matrix4x4.from_translation = function( x, y, z, out) {
  out = out || Matrix4x4();
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = x;
  out[13] = y;
  out[14] = z;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     out.identity(dest);
 *     out.scale(dest, dest, vec);
 *
 * @param {out} out out receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {out} out
 */
Matrix4x4.from_scaling = function( x, y, z, out) {
  out = out || Matrix4x4();
  out[0] = x;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = y;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = z;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     out.identity(dest);
 *     out.rotate(dest, dest, rad, axis);
 *
 * @param {out} out out receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {out} out
 */
Matrix4x4.from_rotation = function( x, y, z, rad, out) {
  out = out || Matrix4x4();
  // let x = axis[0], y = axis[1], z = axis[2];
  let len = Math.sqrt(x * x + y * y + z * z);
  let s, c, t;
  if (len < Matrix4x4.EPSILON) { return null; }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  // Perform rotation-specific matrix multiplication
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a new out from a dual quat.
 *
 * @param {out} out Matrix
 * @param {quat2} a Dual Quaternion
 * @returns {out} out receiving operation result
 */
Matrix4x4.from_dual_quaternion = function(a, out) {
  out = out || Matrix4x4();
  let translation = new Float32Array(3);
  let bx = -a[0], by = -a[1], bz = -a[2], bw = a[3],
  ax = a[4], ay = a[5], az = a[6], aw = a[7];
  let magnitude = bx * bx + by * by + bz * bz + bw * bw;
  //Only scale if it makes sense
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(a, translation, out);
  out = out || Matrix4x4();
  return out;
}
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {out} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
Matrix4x4.get_translation = function( mat, out) {
  out = out || Vector();
  out.x = mat[12];
  out.y = mat[13];
  out.z = mat[14];
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {out} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
Matrix4x4.get_scaling = function( mat, out) {
  out = out || Vector();
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  out.x = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out.y = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out.z = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {out} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
Matrix4x4.get_quaternion = function( mat, out) {
  out = out || Matrix4x4();
  // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  let trace = mat[0] + mat[5] + mat[10];
  let S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (mat[6] - mat[9]) / S;
    out[1] = (mat[8] - mat[2]) / S;
    out[2] = (mat[1] - mat[4]) / S;
  } else if ((mat[0] > mat[5]) && (mat[0] > mat[10])) {
    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
    out[3] = (mat[6] - mat[9]) / S;
    out[0] = 0.25 * S;
    out[1] = (mat[1] + mat[4]) / S;
    out[2] = (mat[8] + mat[2]) / S;
  } else if (mat[5] > mat[10]) {
    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
    out[3] = (mat[8] - mat[2]) / S;
    out[0] = (mat[1] + mat[4]) / S;
    out[1] = 0.25 * S;
    out[2] = (mat[6] + mat[9]) / S;
  } else {
    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
    out[3] = (mat[1] - mat[4]) / S;
    out[0] = (mat[8] + mat[2]) / S;
    out[1] = (mat[6] + mat[9]) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {out} out out receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {out} out
 */
Matrix4x4.from_quaternion = function( q, out) {
  out = out || Matrix4x4();
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let yx = y * x2;
  let yy = y * y2;
  let zx = z * x2;
  let zy = z * y2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {out} out out frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {out} out
 */
Matrix4x4.from_frustum = function( left, right, bottom, top, near, far, out) {
  out = out || Matrix4x4();
  let rl = 1 / (right - left);
  let tb = 1 / (top - bottom);
  let nf = 1 / (near - far);
  out[0] = (near * 2) * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = (near * 2) * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = (far * near * 2) * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {out} out out frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {out} out
 */
Matrix4x4.from_perspective = function( fovy, aspect, near, far, out) {
  out = out || Matrix4x4();
  let f = 1.0 / Math.tan(fovy / 2);
  let nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = (2 * far * near) * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {out} out out frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {out} out
 */
Matrix4x4.from_field_of_view_perspective = function( fov, near, far, out) {
  out = out || Matrix4x4();
  let upTan = Math.tan(fov.upDegrees * Math.PI/180.0);
  let downTan = Math.tan(fov.downDegrees * Math.PI/180.0);
  let leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0);
  let rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0);
  let xScale = 2.0 / (leftTan + rightTan);
  let yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = ((upTan - downTan) * yScale * 0.5);
  out[10] = far / (near - far);
  out[11] = -1.0;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = (far * near) / (near - far);
  out[15] = 0.0;
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {out} out out frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {out} out
 */
Matrix4x4.ortho = function( left, right, bottom, top, near, far, out) {
  out = out || Matrix4x4();
  let lr = 1 / (left - right);
  let bt = 1 / (bottom - top);
  let nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis. 
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {out} out out frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {out} out
 */
Matrix4x4.look_at = function( eye, center, up, out) {
  out = out || Matrix4x4();
  let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  let eyex = eye[0];
  let eyey = eye[1];
  let eyez = eye[2];
  let upx = up[0];
  let upy = up[1];
  let upz = up[2];
  let centerx = center[0];
  let centery = center[1];
  let centerz = center[2];
  if (Math.abs(eyex - centerx) < Matrix4x4.EPSILON &&
      Math.abs(eyey - centery) < Matrix4x4.EPSILON &&
      Math.abs(eyez - centerz) < Matrix4x4.EPSILON) {
    return identity(out);
  out = out || Matrix4x4();
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {out} out out frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {out} out
 */
Matrix4x4.target_to = function( eye, target, up, out) {
  out = out || Matrix4x4();
  let eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];
  let z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];
  let len = z0*z0 + z1*z1 + z2*z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  let x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;
  len = x0*x0 + x1*x1 + x2*x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
};
/**
 * Returns a string representation of a out
 *
 * @param {out} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
Matrix4x4.to_string = function(a) {
  return 'out(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
          a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
          a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' +
          a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
}
/**
 * Returns Frobenius norm of a out
 *
 * @param {out} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
Matrix4x4.frobenius = function(a) {
  return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
}
/**
 * Adds two out's
 *
 * @param {out} out the receiving matrix
 * @param {out} a the first operand
 * @param {out} b the second operand
 * @returns {out} out
 */
Matrix4x4.add_matrix = function(a, b, out) {
  out = out || Matrix4x4();
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {out} out the receiving matrix
 * @param {out} a the first operand
 * @param {out} b the second operand
 * @returns {out} out
 */
Matrix4x4.sub_matrix = function(a, b, out) {
  out = out || Matrix4x4();
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {out} out the receiving matrix
 * @param {out} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {out} out
 */
Matrix4x4.mult_scalar = function(a, b, out) {
  out = out || Matrix4x4();
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
/**
 * Adds two out's after multing each element of the second operand by a scalar value.
 *
 * @param {out} out the receiving vector
 * @param {out} a the first operand
 * @param {out} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {out} out
 */
Matrix4x4.mult_scalar_term = function(a, b, scale, out) {
  out = out || Matrix4x4();
  out[0] = a[0] + (b[0] * scale);
  out[1] = a[1] + (b[1] * scale);
  out[2] = a[2] + (b[2] * scale);
  out[3] = a[3] + (b[3] * scale);
  out[4] = a[4] + (b[4] * scale);
  out[5] = a[5] + (b[5] * scale);
  out[6] = a[6] + (b[6] * scale);
  out[7] = a[7] + (b[7] * scale);
  out[8] = a[8] + (b[8] * scale);
  out[9] = a[9] + (b[9] * scale);
  out[10] = a[10] + (b[10] * scale);
  out[11] = a[11] + (b[11] * scale);
  out[12] = a[12] + (b[12] * scale);
  out[13] = a[13] + (b[13] * scale);
  out[14] = a[14] + (b[14] * scale);
  out[15] = a[15] + (b[15] * scale);
  return out;
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {out} a The first matrix.
 * @param {out} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
Matrix4x4.equals = function(a, b) {
  let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  let a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  let a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  let a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  let b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  let b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  let b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return (Math.abs(a0 - b0) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
          Math.abs(a1 - b1) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
          Math.abs(a2 - b2) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
          Math.abs(a3 - b3) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
          Math.abs(a4 - b4) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
          Math.abs(a5 - b5) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
          Math.abs(a6 - b6) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
          Math.abs(a7 - b7) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
          Math.abs(a8 - b8) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
          Math.abs(a9 - b9) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
          Math.abs(a10 - b10) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
          Math.abs(a11 - b11) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
          Math.abs(a12 - b12) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
          Math.abs(a13 - b13) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
          Math.abs(a14 - b14) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
          Math.abs(a15 - b15) <= Matrix4x4.EPSILON*Math.max(1.0, Math.abs(a15), Math.abs(b15)));
}
// Tectonics.js rolls its own Vector and Matrix libraries for two reasons:
//   1.) performance
//   2.) separation from volatile 3rd part libraries (Three.js)
// 
// NOTE: vectors are always represented using independant xyz params where possible,
// This is done for two reasons:
//   1.) performance
//   2.) integration into fast raster operations
// 
// Vectors are represented as objects when returned from functions, instead of lists.
// This is done for clarity
function Vector(x,y,z) {
  return {
    x: x || 0,
    y: y || 0,
    z: z || 0,
  };
}
Vector.FromArray = function(array) {
  return {
    x: array[0] || 0,
    y: array[1] || 0,
    z: array[2] || 0,
  };
}
Vector.add_vector = function(ax, ay, az, bx, by, bz, result) {
  result = result || Vector()
  result.x = ax + bx;
  result.y = ay + by;
  result.z = az + bz;
  return result;
}
Vector.sub_vector = function(ax, ay, az, bx, by, bz, result) {
  result = result || Vector()
  result.x = ax - bx;
  result.y = ay - by;
  result.z = az - bz;
  return result;
}
// TODO: rename to "cross_vector" 
Vector.cross_vector = function(ax, ay, az, bx, by, bz, result) {
  result = result || Vector()
  result.x = ay*bz - az*by;
  result.y = az*bx - ax*bz;
  result.z = ax*by - ay*bx;
  return result;
}
Vector.dot_vector = function(ax, ay, az, bx, by, bz) {
  var sqrt = Math.sqrt;
  return (ax*bx + ay*by + az*bz);
}
Vector.mult_scalar = function(x, y, z, scalar, result) {
  result = result || Vector();
  result.x = x * scalar;
  result.y = y * scalar;
  result.z = z * scalar;
  return result;
}
Vector.div_scalar = function(x, y, z, scalar, result) {
  result = result || Vector();
  result.x = x / scalar;
  result.y = y / scalar;
  result.z = z / scalar;
  return result;
}
Vector.mult_matrix = function(x, y, z, matrix, result) {
  result = result || Vector();
  var xx = matrix[0]; var xy = matrix[3]; var xz = matrix[6];
  var yx = matrix[1]; var yy = matrix[4]; var yz = matrix[7];
  var zx = matrix[2]; var zy = matrix[5]; var zz = matrix[8];
  result.x = x * xx + y * xy + z * xz;
  result.y = x * yx + y * yy + z * yz;
  result.z = x * zx + y * zy + z * zz;
  return result;
}
Vector.mult_matrix4x4 = function(x, y, z, matrix, result) {
  result = result || Vector();
  var xx = matrix[0]; var xy = matrix[4]; var xz = matrix[8]; var xw = matrix[12];
  var yx = matrix[1]; var yy = matrix[5]; var yz = matrix[9]; var yw = matrix[13];
  var zx = matrix[2]; var zy = matrix[6]; var zz = matrix[10]; var zw = matrix[14];
  var wx = matrix[3]; var wy = matrix[7]; var wz = matrix[11]; var ww = matrix[15];
  result.x = x * xx + y * xy + z * xz + xw;
  result.y = x * yx + y * yy + z * yz + yw;
  result.z = x * zx + y * zy + z * zz + zw;
  return result;
}
Vector.similarity = function(ax, ay, az, bx, by, bz) {
  var sqrt = Math.sqrt;
  return (ax*bx +
          ay*by +
          az*bz) / ( sqrt(ax*ax+
                              ay*ay+
                              az*az) * sqrt(bx*bx+
                                          by*by+
                                          bz*bz) );
}
Vector.magnitude = function(x, y, z) {
  return Math.sqrt(x*x + y*y + z*z);
}
Vector.normalize = function(x, y, z, result) {
  result = result || Vector()
  var magnitude = Math.sqrt(x*x + y*y + z*z);
  result.x = x/(magnitude||1);
  result.y = y/(magnitude||1);
  result.z = z/(magnitude||1);
  return result;
}
// Float32Raster represents a grid where each cell contains a 32 bit floating point value
// A Float32Raster is composed of two parts:
//         The first is a object of type Grid, representing a collection of vertices that are connected by edges
//      The second is a typed array, representing a value for each vertex within the grid
// 
// Float32Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Float32Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Float32Raster class, operations on Float32Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function Float32Raster(grid, fill) {
    var result = new Float32Array(grid.vertices.length);
    result.grid = grid;
    if (fill !== void 0) {
    result.fill(fill);
    }
    return result;
};
Float32Raster.map = function(raster, fn, result) {
  result = result || Float32Raster(raster.grid);
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = fn(raster[i]);
  }
  return result;
}
Float32Raster.FromExample = function(raster) {
  var length = 0;
  if (raster instanceof Float32Array || raster instanceof Uint8Array || raster instanceof Uint16Array) {
    length = raster.length;
  } else if(raster !== void 0 && raster.x instanceof Float32Array) {
    length = raster.x.length;
  } else {
    throw 'must supply a vector or scalar raster'
  }
  var result = new Float32Array(length);
  result.grid = raster.grid;
  return result;
}
Float32Raster.OfLength = function(length, grid) {
  var result = new Float32Array(length);
  result.grid = grid;
  return result;
}
Float32Raster.FromBuffer = function(buffer, grid, start) {
  start = start || 0;
  var result = new Float32Array(buffer, start, grid.vertices.length);
  result.grid = grid;
  return result;
}
Float32Raster.FromArray = function(array, grid) {
  var result = new Float32Array(array);
  result.grid = grid;
  return result;
}
Float32Raster.FromUint8Raster = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
 
 
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.FromUint16Raster = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
 
 
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Float32Raster.copy = function(raster, result) {
  var result = result || Float32Raster(raster.grid);
 
 
  result.set(raster);
  return result;
}
Float32Raster.fill = function (raster, value) {
  raster = raster || Float32Raster.FromExample(raster);
 
  raster.fill(value);
  return raster;
};
Float32Raster.min_id = function (raster) {
 
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Float32Raster.max_id = function (raster) {
 
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Float32Raster.get_nearest_value = function(raster, pos) {
 
  return raster[raster.grid.getNearestId(pos)];
}
Float32Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Float32Raster(pos_raster.grid);
 
 
 
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Float32Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Float32Raster(id_array.grid) : Float32Array(id_array.length));
 
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Float32Raster.get_mask = function(raster, mask) {
 
 
  var result = new Float32Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Float32Raster.set_ids_to_value = function(raster, id_array, value) {
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Float32Raster.set_ids_to_values = function(raster, id_array, value_array) {
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}
// example: Float32Raster.add_values_to_ids(local, local_ids_of_global_cells, global, local);
// NOTE: this differs from set_ids_to_values - 
//   in the event an id is mentioned twice in id_array, add_values_to_ids will add those values together
Float32Raster.add_values_to_ids = function(raster1, id_array, raster2, result) {
  if (raster1 !== result) {
    Float32Raster.copy(raster1, result);
  }
  var id_array_i = 0;
  for (var i=0, li=raster2.length; i<li; ++i) {
    id_array_i = id_array[i];
    result[id_array_i] = result[id_array_i] + raster2[i];
  }
  return result;
}
// Uint16Raster represents a grid where each cell contains a 32 bit floating point value
// A Uint16Raster is composed of two parts:
//    The first is a object of type Grid, representing a collection of vertices that are connected by edges
//    The second is a typed array, representing a value for each vertex within the grid
// 
// Uint16Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Uint16Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Uint16Raster class, operations on Uint16Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function Uint16Raster(grid, fill) {
  var result = new Uint16Array(grid.vertices.length);
  result.grid = grid;
  if (fill !== void 0) {
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = fill;
  }
  }
  return result;
};
Uint16Raster.OfLength = function(length, grid) {
  var result = new Uint16Array(length);
  result.grid = grid;
  return result;
}
Uint16Raster.FromBuffer = function(buffer, grid) {
  var result = new Uint16Array(buffer, 0, grid.vertices.length);
  result.grid = grid;
  return result;
}
Uint16Raster.FromUint8Raster = function(raster) {
  var result = Uint16Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint16Raster.FromUint16Raster = function(raster) {
  var result = Uint16Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint16Raster.copy = function(raster, result) {
  var result = result || Uint16Raster(raster.grid);
 
 
  result.set(raster);
  return result;
}
Uint16Raster.fill = function (raster, value) {
 
  raster.fill(value);
};
Uint16Raster.min_id = function (raster) {
 
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint16Raster.max_id = function (raster) {
 
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint16Raster.get_nearest_value = function(raster, pos) {
 
  return raster[raster.grid.getNearestId(pos)];
}
Uint16Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Uint16Raster(pos_raster.grid);
 
 
 
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Uint16Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Uint16Raster(id_array.grid) : Uint16Array(id_array.length));
 
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Uint16Raster.get_mask = function(raster, mask) {
 
 
  var result = new Uint16Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Uint16Raster.set_ids_to_value = function(raster, id_array, value) {
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Uint16Raster.set_ids_to_values = function(raster, id_array, value_array) {
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}
// Uint8Raster represents a grid where each cell contains a 32 bit floating point value
// A Uint8Raster is composed of two parts:
//    The first is a object of type Grid, representing a collection of vertices that are connected by edges
//    The second is a typed array, representing a value for each vertex within the grid
// 
// Uint8Raster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// Uint8Rasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that it can perform on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the Uint8Raster class, operations on Uint8Rasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function Uint8Raster(grid, fill) {
  var result = new Uint8Array(grid.vertices.length);
  result.grid = grid;
  if (fill !== void 0) {
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = fill;
  }
  }
  return result;
};
Uint8Raster.OfLength = function(length, grid) {
  var result = new Uint8Array(length);
  result.grid = grid;
  return result;
}
Uint8Raster.FromBuffer = function(buffer, grid) {
  var result = new Uint8Array(buffer, 0, grid.vertices.length);
  result.grid = grid;
  return result;
}
Uint8Raster.FromUint8Raster = function(raster) {
  var result = Uint8Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint8Raster.FromUint16Raster = function(raster) {
  var result = Uint8Raster(raster.grid);
  for (var i=0, li=result.length; i<li; ++i) {
      result[i] = raster[i];
  }
  return result;
}
Uint8Raster.copy = function(raster, result) {
  var result = result || Uint8Raster(raster.grid);
 
 
  result.set(raster);
  return result;
}
Uint8Raster.fill = function (raster, value) {
 
  raster.fill(value);
};
Uint8Raster.min_id = function (raster) {
 
  var max = Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value < max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint8Raster.max_id = function (raster) {
 
  var max = -Infinity;
  var max_id = 0;
  var value = 0;
  for (var i = 0, li = raster.length; i < li; i++) {
    value = raster[i];
    if (value > max) {
      max = value;
      max_id = i;
    };
  }
  return max_id;
};
Uint8Raster.get_nearest_value = function(raster, pos) {
 
  return raster[raster.grid.getNearestId(pos)];
}
Uint8Raster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || Uint8Raster(pos_raster.grid);
 
 
 
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  for (var i=0, li=ids.length; i<li; ++i) {
      result[i] = value_raster[ids[i]];
  }
  return result;
}
Uint8Raster.get_ids = function(value_raster, id_array, result) {
  result = result || (id_array.grid !== void 0? Uint8Raster(id_array.grid) : Uint8Array(id_array.length));
 
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      result[i] = value_raster[id_array[i]];
  }
  return result;
}
Uint8Raster.get_mask = function(raster, mask) {
 
 
  var result = new Uint8Array(Uint8Dataset.sum(mask));
  for (var i = 0, j = 0, li = mask.length; i < li; i++) {
    if (mask[i] > 0) {
      result[j] = raster[i];
      j++;
    }
  }
  return result;
}
Uint8Raster.set_ids_to_value = function(raster, id_array, value) {
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value;
  }
  return raster;
}
Uint8Raster.set_ids_to_values = function(raster, id_array, value_array) {
 
  for (var i=0, li=id_array.length; i<li; ++i) {
      raster[id_array[i]] = value_array[i];
  }
  return raster;
}
// VectorRaster represents a grid where each cell contains a vector value. It is a specific kind of a multibanded raster.
// A VectorRaster is composed of two parts
//         The first is a object of type Grid, representing a collection of vertices that are connected by edges
//      The second is a structure of arrays (SoA), representing a vector for each vertex within the grid. 
// 
// VectorRaster should theoretically work for any graph of vertices given the appropriate grid object,
// However tectonics.js only uses them with spherical grids.
// 
// VectorRasters can be viewed through several paradigms: vector calculus, math morphology, image editing, etc.
// Each paradigm has its own unique set of operations that can be performed on rasters objects.
// A developer needs to switch between paradigms effortlessly and efficiently, without type conversion.
// Rather than clutter the VectorRaster class, operations on VectorRasters 
// are spread out as friend functions across several namespaces. Each namespace corresponds to a paradigm. 
// This design is meant to promote separation of concerns at the expense of encapsulation.
// I want raster objects to be as bare as possible, functioning more like primitive datatypes.
function VectorRaster(grid) {
  return VectorRaster.OfLength(grid.vertices.length, grid);
}
VectorRaster.OfLength = function(length, grid) {
  var buffer = new ArrayBuffer(3 * Float32Array.BYTES_PER_ELEMENT * length);
  return {
    x: new Float32Array(buffer, 0 * Float32Array.BYTES_PER_ELEMENT * length, length),
    y: new Float32Array(buffer, 1 * Float32Array.BYTES_PER_ELEMENT * length, length),
    z: new Float32Array(buffer, 2 * Float32Array.BYTES_PER_ELEMENT * length, length),
    everything: new Float32Array(buffer),
    grid: grid
  };
}
VectorRaster.FromExample = function(raster, grid) {
  var length = 0;
  if (raster instanceof Float32Array) {
    length = raster.length;
  } else if(raster !== void 0 && raster.x instanceof Float32Array) {
    length = raster.x.length;
  } else {
    throw 'must supply a vector or scalar raster'
  }
  var result = VectorRaster.OfLength(length, raster.grid);
  return result;
}
VectorRaster.FromVectors = function(vectors, grid) {
  var result = VectorRaster.OfLength(vectors.length, grid);
  var x = result.x;
  var y = result.y;
  var z = result.z;
  for (var i=0, li=vectors.length; i<li; ++i) {
      x[i] = vectors[i].x;
      y[i] = vectors[i].y;
      z[i] = vectors[i].z;
  }
  return result;
}
VectorRaster.FromArrays = function(x, y, z, grid) {
  var result = VectorRaster.OfLength(x.length, grid);
  var ox = result.x;
  var oy = result.y;
  var oz = result.z;
  for (var i=0, li=x.length; i<li; ++i) {
      ox[i] = x[i];
      oy[i] = y[i];
      oz[i] = z[i];
  }
  return result;
}
VectorRaster.ToArray = function(vector_field) {
  var result = [];
  var x = vector_field.x;
  var y = vector_field.y;
  var z = vector_field.z;
  for (var i=0, li=x.length; i<li; ++i) {
      result.push(Vector(x[i], y[i], z[i]));
  }
  return result;
}
VectorRaster.copy = function(vector_raster, output) {
  var output = output || VectorRaster(vector_raster.grid);
 
 
  output.everything.set(vector_raster.everything);
  return output;
}
VectorRaster.fill = function (vector_raster, value) {
  raster = raster || VectorRaster.FromExample(vector_raster);
 
  vector_raster.x.fill(value.x);
  vector_raster.y.fill(value.y);
  vector_raster.z.fill(value.z);
  return vector_raster;
};
VectorRaster.min_id = function (vector_raster) {
 
  var max = Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag < max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};
VectorRaster.max_id = function (vector_raster) {
 
  var max = -Infinity;
  var max_id = 0;
  var mag = 0;
  var ix = vector_raster.x;
  var iy = vector_raster.y;
  var iz = vector_raster.z;
  for (var i = 0, li = ix.length; i < li; i++) {
    mag = ix[i] * ix[i] + iy[i] * iy[i] + iz[i] * iz[i];
    if (mag > max) {
      max = mag;
      max_id = i;
    };
  }
  return max_id;
};
VectorRaster.get_nearest_value = function(value_raster, pos) {
 
    var id = value_raster.grid.getNearestId(pos);
    return {x: value_raster.x[id], y: value_raster.y[id], z: value_raster.z[id]};
}
VectorRaster.get_nearest_values = function(value_raster, pos_raster, result) {
  result = result || VectorRaster(pos_raster.grid);
 
 
 
  var ids = pos_raster.grid.getNearestIds(pos_raster);
  return VectorRaster.get_ids(value_raster, ids, result);
}
VectorRaster.get_ids = function(value_raster, ids_raster, result) {
  result = result || VectorRaster(value_raster.grid);
 
 
  var ix = value_raster.x;
  var iy = value_raster.y;
  var iz = value_raster.z;
  var ox = result.x;
  var oy = result.y;
  var oz = result.z;
  for (var i=0, li=ids_raster.length; i<li; ++i) {
    ox[i] = ix[ids_raster[i]];
    oy[i] = iy[ids_raster[i]];
    oz[i] = iz[ids_raster[i]];
  }
  return result;
}
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Float32Raster
var Float32Dataset = {};
Float32Dataset.min = function (dataset) {
 
  return dataset[Float32Raster.min_id(dataset)];
};
Float32Dataset.max = function (dataset) {
 
  return dataset[Float32Raster.max_id(dataset)];
};
Float32Dataset.range = function (dataset) {
 
  return [Float32Dataset.min(dataset), Float32Dataset.max(dataset)];
};
Float32Dataset.sum = function (dataset) {
 
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Float32Dataset.average = function (dataset) {
 
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
Float32Dataset.median = function (dataset, scratch) {
  scratch = scratch || Float32Raster(dataset.grid);
 
 
  Float32Raster.copy(dataset, scratch);
  scratch.sort();
  return scratch[Math.floor(scratch.length/2)];
};
Float32Dataset.standard_deviation = function (dataset) {
 
  var sum = 0;
  var li=dataset.length
  for (var i=0; i<li; ++i) {
      sum += dataset[i];
  }
  var average = sum / dataset.length;
  var difference = 0;
  var sum_of_squared_differences = 0;
  for (var i=0; i<li; ++i) {
      difference = (dataset[i] - average);
      sum_of_squared_differences += difference * difference;
  }
  return Math.sqrt(sum_of_squared_differences / (li-1));
};
Float32Dataset.weighted_average = function (dataset, weights) {
 
 
  var result = 0;
  var weight_sum = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i] * weights[i];
      weight_sum += weights[i];
  }
  return result / weight_sum;
};
Float32Dataset.normalize = function(dataset, result, min_new, max_new) {
  result = result || Float32Raster(dataset.grid);
  var min_old = Float32Dataset.min(dataset);
  min_new = min_new || 0;
  var max_old = Float32Dataset.max(dataset);
  max_new = max_new || 1;
 
 
 
 
  var range = max_old - min_old;
  var range_new = max_new - min_new;
  var scaling_factor = range_new / range;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result[i] = scaling_factor * (dataset[i] - min_old) + min_new;
  }
  return result;
}
Float32Dataset.rescale = function(dataset, result, min_new, max_new, min_old, max_old) {
  result = result || Float32Raster(dataset.grid);
  var min_old = min_old || Float32Dataset.min(dataset);
  min_new = min_new || 0;
  var max_old = max_old || Float32Dataset.max(dataset);
  max_new = max_new || 1;
 
 
 
 
 
 
  var range = max_old - min_old;
  var range_new = max_new - min_new;
  var scaling_factor = range_new / range;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result[i] = scaling_factor * (dataset[i] - min_old) + min_new;
  }
  return result;
}
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Dataset = {};
Uint16Dataset.min = function (dataset) {
 
  return dataset[Uint16Raster.min_id(dataset)];
};
Uint16Dataset.max = function (dataset) {
 
  return dataset[Uint16Raster.max_id(dataset)];
};
Uint16Dataset.sum = function (dataset) {
 
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Uint16Dataset.average = function (dataset) {
 
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
// The Dataset namespaces provide operations over statistical datasets.
// All datasets are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Dataset = {};
Uint8Dataset.min = function (dataset) {
 
  return dataset[Uint8Raster.min_id(dataset)];
};
Uint8Dataset.max = function (dataset) {
 
  return dataset[Uint8Raster.max_id(dataset)];
};
Uint8Dataset.sum = function (dataset) {
 
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result;
};
Uint8Dataset.average = function (dataset) {
 
  var result = 0;
  for (var i=0, li=dataset.length; i<li; ++i) {
      result += dataset[i];
  }
  return result / dataset.length;
};
Uint8Dataset.unique = function (dataset) {
 
  var unique = {};
  for (var i=0, li=dataset.length; i<li; ++i) {
    unique[dataset[i]] = dataset[i];
  }
  return Object.values(unique);
};
// The VectorDataset namespace provides operations over raster objects
// treating them as if each cell were an entry in a statistical dataset
var VectorDataset = {};
VectorDataset.min = function (vector_dataset) {
   
    var id = VectorRaster.min_id(vector_dataset);
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;
    return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.max = function (vector_dataset) {
   
    var id = VectorRaster.max_id(vector_dataset);
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;
    return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.sum = function (vector_dataset) {
   
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;
    var sum_x = 0;
    var sum_y = 0;
    var sum_z = 0;
    for (var i=0, li=vector_dataset.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    return {x:sum_x, y:sum_y, z:sum_z};
};
VectorDataset.average = function (vector_dataset) {
   
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;
    var sum_x = 0;
    var sum_y = 0;
    var sum_z = 0;
    for (var i=0, li=vector_dataset.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    return {
        x:sum_x / vector_dataset.length,
        y:sum_y / vector_dataset.length,
        z:sum_z / vector_dataset.length
    };
};
VectorDataset.weighted_average = function (vector_dataset, weights) {
   
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;
    var sum_x = 0;
    var sum_y = 0;
    var sum_z = 0;
    var weight_sum = 0;
    for (var i=0, li=weights.length; i<li; ++i) {
        sum_x += x[i] * weights[i];
        sum_y += y[i] * weights[i];
        sum_z += z[i] * weights[i];
          weight_sum += weights[i];
    }
    return {
        x:sum_x / weight_sum,
        y:sum_y / weight_sum,
        z:sum_z / weight_sum
    };
};
// WARNING: potential gotcha!
// VectorDataset.normalize() performs statistical data normalization - it outputs a vector where minimum magnitude is always min_new
// VectorField.normalize() individually normalizes each vector within the field.
// VectorDataset.rescale() outputs a vector where minimum magnitude is scaled between 0 and max_new
VectorDataset.normalize = function(vector_dataset, result, min_new, max_new) {
    result = result || VectorRaster(vector_dataset.grid);
    var min = VectorDataset.min(vector_dataset);
    var min_mag = Math.sqrt(min.x*min.x + min.y*min.y + min.z*min.z);
    min_new = min_new || 0;
    var max = VectorDataset.max(vector_dataset);
    var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
    max_new = max_new || 1;
   
   
   
   
    var range_mag = max_mag - min_mag;
    var range_new = max_new - min_new;
    var scaling_factor = range_new / range_mag;
    var ix = vector_dataset.x;
    var iy = vector_dataset.y;
    var iz = vector_dataset.z;
    var ox = result.x;
    var oy = result.y;
    var oz = result.z;
    for (var i=0, li=ix.length; i<li; ++i) {
        ox[i] = scaling_factor * (ix[i] - min_mag) + min_new;
        oy[i] = scaling_factor * (iy[i] - min_mag) + min_new;
        oz[i] = scaling_factor * (iz[i] - min_mag) + min_new;
    }
    return result;
}
VectorDataset.rescale = function(vector_dataset, result, max_new) {
    result = result || VectorRaster(vector_dataset.grid);
    var max = VectorDataset.max(vector_dataset);
    var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
    max_new = max_new || 1;
   
   
   
    var ix = vector_dataset.x;
    var iy = vector_dataset.y;
    var iz = vector_dataset.z;
    var ox = result.x;
    var oy = result.y;
    var oz = result.z;
    var scaling_factor = max_new / max_mag;
    for (var i=0, li=ix.length; i<li; ++i) {
        ox[i] = scaling_factor * ix[i];
        oy[i] = scaling_factor * iy[i];
        oz[i] = scaling_factor * iz[i];
    }
    return result;
}
// The ScalarField namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Float32Raster
var ScalarField = {};
ScalarField.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
ScalarField.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
ScalarField.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.gte_field = function (scalar_field1, scalar_field2, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]-threshold? 1:0;
  }
  return result;
};
ScalarField.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
ScalarField.lte_field = function (scalar_field1, scalar_field2, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]+threshold? 1:0;
  }
  return result;
};
ScalarField.eq_field = function (scalar_field1, scalar_field2, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= (scalar_field2[i] + threshold) && scalar_field1[i] >= (scalar_field2[i] - threshold) ? 1:0;
  }
  return result;
};
ScalarField.ne_field = function (scalar_field1, scalar_field2, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > (scalar_field2[i] + threshold) || scalar_field1[i] < (scalar_field2[i] - threshold) ? 1:0;
  }
  return result;
};
ScalarField.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
ScalarField.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
ScalarField.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
ScalarField.gte_scalar = function (scalar_field1, scalar, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar - threshold? 1:0;
  }
  return result;
};
ScalarField.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
ScalarField.lte_scalar = function (scalar_field1, scalar, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar + threshold? 1:0;
  }
  return result;
};
ScalarField.between_scalars = function (scalar_field1, scalar1, scalar2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar1 < scalar_field1[i] && scalar_field1[i] < scalar2? 1:0;
  }
  return result;
};
ScalarField.eq_scalar = function (scalar_field1, scalar, result, threshold) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < (scalar + threshold) && scalar_field1[i] > (scalar - threshold) ? 1:0;
  }
  return result;
};
ScalarField.ne_scalar = function (scalar_field1, scalar, threshold, result) {
  threshold = threshold || 1e-4;
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > (scalar + threshold) || scalar_field1[i] < (scalar - threshold) ? 1:0;
  }
  return result;
};
ScalarField.add_field_term = function (scalar_field1, scalar_field2, scalar_field3, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
 
  var length = scalar_field3.length;
  for (var i = 0, li = result.length; i < li; i++) {
     result[i] = scalar_field1[i] + scalar_field3[i%length] * scalar_field2[i];
  }
  return result;
};
ScalarField.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
ScalarField.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
ScalarField.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
ScalarField.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
ScalarField.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
ScalarField.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Float32Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
ScalarField.inv_field = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = 1 / scalar_field[i];
  }
  return result;
};
ScalarField.sqrt_field = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);
  var sqrt = Math.sqrt;
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = sqrt(scalar_field[i]);
  }
  return result;
};
ScalarField.add_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
ScalarField.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
ScalarField.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
ScalarField.div_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  var inv_scalar = 1/scalar;
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * inv_scalar;
  }
  return result;
};
ScalarField.pow_scalar = function (scalar_field, scalar, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  var pow = Math.pow;
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = pow(scalar_field[i], scalar);
  }
  return result;
};
ScalarField.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);
 
 
  var ix = vector.x;
  var iy = vector.y;
  var iz = vector.z;
  var ox = result.x;
  var oy = result.y;
  var oz = result.z;
  for (var i = 0, li = scalar_field.length; i < li; i++) {
    ox[i] = scalar_field[i] * ix;
    oy[i] = scalar_field[i] * iy;
    oz[i] = scalar_field[i] * iz;
  }
  return result;
};
ScalarField.differential = function (scalar_field, result) {
  result = result || VectorRaster(scalar_field.grid);
 
 
  var arrows = scalar_field.grid.arrows;
  var arrow = [];
  var from = 0, to = 0;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  Float32Raster.fill(x, 0);
  Float32Raster.fill(y, 0);
  Float32Raster.fill(z, 0);
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    from = arrow[0];
    to = arrow[1];
    x[to] += scalar_field[from] - scalar_field[to];
    y[to] += scalar_field[from] - scalar_field[to];
    z[to] += scalar_field[from] - scalar_field[to];
  }
  var neighbor_lookup = scalar_field.grid.neighbor_lookup;
  var neighbor_count = 0;
  for (var i = 0, li = neighbor_lookup.length; i < li; i++) {
    neighbor_count = neighbor_lookup[i].length;
    x[i] /= neighbor_count || 1;
    y[i] /= neighbor_count || 1;
    z[i] /= neighbor_count || 1;
  }
  return result;
};
ScalarField.gradient = function (scalar_field, result, scratch, scratch2) {
  result = result || VectorRaster(scalar_field.grid);
  scratch = scratch || Float32Raster(scalar_field.grid);
  scratch2 = scratch2 || Float32Raster(scalar_field.grid);
 
 
 
 
  var pos = scalar_field.grid.pos;
  var ix = pos.x;
  var iy = pos.y;
  var iz = pos.z;
  var dpos_hat = scalar_field.grid.pos_arrow_differential_normalized;
  var dxhat = dpos_hat.x;
  var dyhat = dpos_hat.y;
  var dzhat = dpos_hat.z;
  var dpos = scalar_field.grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var arrows = scalar_field.grid.arrows;
  var arrow = [];
  var dlength = scalar_field.grid.pos_arrow_distances;
  var neighbor_count = scalar_field.grid.neighbor_count;
  var average = scratch;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  var arrow_distance = 0;
  var average_distance = scalar_field.grid.average_distance;
  var slope = 0;
  var slope_magnitude = 0;
  var from = 0;
  var to = 0;
  var max_slope_from = 0;
  var PI = Math.PI;
  //
  // NOTE: 
  // The naive implementation is to estimate the gradient based on each individual neighbor,
  //  then take the average between the estimates.
  // This is wrong! If dx, dy, or dz is very small, 
  //  then the gradient estimate along that dimension will be very big.
  // This will result in very strange behavior.
  //
  // The correct implementation is to use the Gauss-Green theorem: 
  //   ∫∫∫ᵥ ∇ϕ dV = ∫∫ₐ ϕn̂ da
  // so:
  //   ∇ϕ = 1/V ∫∫ₐ ϕn̂ da
  // so find flux out of an area, then divide by volume
  // the area/volume is calculated for a circle that reaches halfway to neighboring vertices
  Float32Raster.fill(x, 0);
  Float32Raster.fill(y, 0);
  Float32Raster.fill(z, 0);
  var difference = 0;
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    from = arrow[0];
    to = arrow[1];
    difference = (scalar_field[to] - scalar_field[from]);
    x[from] += difference * dxhat[i] * dlength[i]/neighbor_count[from] * PI;
    y[from] += difference * dyhat[i] * dlength[i]/neighbor_count[from] * PI;
    z[from] += difference * dzhat[i] * dlength[i]/neighbor_count[from] * PI;
  }
  var inverse_volume = 1 / (PI * (average_distance/2) * (average_distance/2));
  for (var i = 0, li = scalar_field.length; i < li; i++) {
    x[i] *= inverse_volume;
    y[i] *= inverse_volume;
    z[i] *= inverse_volume;
  }
  return result;
};
ScalarField.average_difference = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  var arrows = scalar_field.grid.arrows;
  var arrow
  Float32Raster.fill(result, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      result[i] /= neighbor_count[i];
  }
  return result;
};
// This function computes the laplacian of a surface. 
// The laplacian can be thought of as the average difference across space, per unit area. 
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// We assume all vertices in scalar_field.grid are equidistant on a surface. 
// 
// So for 2d: 
//
// ∇⋅∇f = ∇⋅[ (f(x+dx) - f(x-dx)) / 2dx,  
//            (f(x+dy) - f(x-dy)) / 2dy  ]
//
// ∇⋅∇f = d/dx (f(x+dx) - f(x-dx)) / 2dx  
//      + d/dy (f(x+dy) - f(x-dy)) / 2dy
//
// ∇⋅∇f =  1/4 (f(x+2dx) - f(x)) / dxdx  
//      +  1/4 (f(x-2dx) - f(x)) / dxdx  
//      +  1/4 (f(x+2dy) - f(x)) / dydy
//      +  1/4 (f(x-2dy) - f(x)) / dydy
//  
// Think of it as taking the average slope between four neighbors. 
// That means if we have an arbitrary number of neighbors,  
// we find the average difference and divide by the average area covered by a point.
ScalarField.laplacian = function (scalar_field, result) {
  result = result || Float32Raster(scalar_field.grid);
 
 
 
  var arrows = scalar_field.grid.arrows;
  var arrow
  Float32Raster.fill(result, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      result[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  var average_distance = scalar_field.grid.average_distance;
  var average_area = average_distance * average_distance;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      result[i] /= average_area * neighbor_count[i];
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_constant = function (scalar_field, constant, result, scratch) {
  result = result || Float32Raster(scalar_field.grid);
  scratch = scratch || Float32Raster(scalar_field.grid);
 
 
 
 
  var laplacian = scratch;
  var arrows = scalar_field.grid.arrows;
  var arrow
  Float32Raster.fill(laplacian, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += scalar_field[arrow[1]] - scalar_field[arrow[0]];
  }
  var neighbor_count = scalar_field.grid.neighbor_count;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      laplacian[i] /= neighbor_count[i];
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      result[i] = scalar_field[i] + constant * laplacian[i];
  }
  return result;
};
// iterates through time using the diffusion equation
ScalarField.diffusion_by_field = function (scalar_field1, scalar_field2, result, scratch) {
  result = result || Float32Raster(scalar_field1.grid);
  scratch = scratch || Float32Raster(scalar_field1.grid);
 
 
 
 
  var laplacian = scratch;
  var arrows = scalar_field1.grid.arrows;
  var arrow
  Float32Raster.fill(laplacian, 0);
  for (var i=0, li=arrows.length; i<li; ++i) {
      arrow = arrows[i];
      laplacian[arrow[0]] += scalar_field1[arrow[1]] - scalar_field1[arrow[0]];
  }
  var neighbor_count = scalar_field1.grid.neighbor_count;
  for (var i = 0, li = neighbor_count.length; i < li; i++) {
      laplacian[i] /= neighbor_count[i];
  }
  for (var i=0, li=laplacian.length; i<li; ++i) {
      result[i] = scalar_field1[i] + scalar_field2[i] * laplacian[i];
  }
  return result;
};
// The Uint16Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint16Raster
var Uint16Field = {};
Uint16Field.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint16Field.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint16Field.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.ne_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar_field2[i]? 1:0;
  }
  return result;
};
Uint16Field.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint16Field.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint16Field.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
Uint16Field.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint16Field.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
Uint16Field.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint16Field.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
Uint16Field.ne_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar? 1:0;
  }
  return result;
};
Uint16Field.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
Uint16Field.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
Uint16Field.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
Uint16Field.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint16Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
Uint16Field.add_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
Uint16Field.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
Uint16Field.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
Uint16Field.div_scalar = function (scalar_field, scalar, result) {
  result = result || Uint16Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
Uint16Field.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);
 
 
  var ix = vector.x;
  var iy = vector.y;
  var iz = vector.z;
  var ox = result.x;
  var oy = result.y;
  var oz = result.z;
  for (var i = 0, li = scalar_field.length; i < li; i++) {
    ox[i] = scalar_field[i] * ix;
    oy[i] = scalar_field[i] * iy;
    oz[i] = scalar_field[i] * iz;
  }
  return result;
};
// The Uint8Field namespace provides operations over mathematical scalar fields.
// All fields are represented by raster objects, e.g. VectorRaster or Uint8Raster
var Uint8Field = {};
Uint8Field.min_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint8Field.max_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? scalar_field1[i] : scalar_field2[i];
  }
  return result;
};
Uint8Field.gt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.gte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lt_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.lte_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.eq_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.ne_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar_field2[i]? 1:0;
  }
  return result;
};
Uint8Field.min_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint8Field.max_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? scalar_field1[i] : scalar;
  }
  return result;
};
Uint8Field.gt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] > scalar? 1:0;
  }
  return result;
};
Uint8Field.gte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] >= scalar? 1:0;
  }
  return result;
};
Uint8Field.lt_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] < scalar? 1:0;
  }
  return result;
};
Uint8Field.lte_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] <= scalar? 1:0;
  }
  return result;
};
Uint8Field.eq_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] == scalar? 1:0;
  }
  return result;
};
Uint8Field.ne_scalar = function (scalar_field1, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] != scalar? 1:0;
  }
  return result;
};
Uint8Field.add_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + field3[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.add_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar * scalar_field2[i];
  }
  return result;
};
Uint8Field.add_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] + scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_field_term = function (scalar_field1, scalar_field2, field3, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - field3[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.sub_scalar_term = function (scalar_field1, scalar_field2, scalar, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] - scalar * scalar_field2[i];
  }
  return result;
};
Uint8Field.mult_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] * scalar_field2[i];
  }
  return result;
};
Uint8Field.div_field = function (scalar_field1, scalar_field2, result) {
  result = result || Uint8Raster(scalar_field1.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field1[i] / scalar_field2[i];
  }
  return result;
};
Uint8Field.add_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] + scalar;
  }
  return result;
};
Uint8Field.sub_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] - scalar;
  }
  return result;
};
Uint8Field.mult_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] * scalar;
  }
  return result;
};
Uint8Field.div_scalar = function (scalar_field, scalar, result) {
  result = result || Uint8Raster(scalar_field.grid);
 
 
 
  for (var i = 0, li = result.length; i < li; i++) {
    result[i] = scalar_field[i] / scalar;
  }
  return result;
};
Uint8Field.mult_vector = function (scalar_field, vector, result) {
  result = result || VectorRaster(scalar_field.grid);
 
 
  var ix = vector.x;
  var iy = vector.y;
  var iz = vector.z;
  var ox = result.x;
  var oy = result.y;
  var oz = result.z;
  for (var i = 0, li = scalar_field.length; i < li; i++) {
    ox[i] = scalar_field[i] * ix;
    oy[i] = scalar_field[i] * iy;
    oz[i] = scalar_field[i] * iz;
  }
  return result;
};
Uint8Field.gradient = function (scalar_field, result) {
  result = result || VectorRaster(scalar_field.grid);
 
 
  var grid = scalar_field.grid;
  var pos = grid.pos;
  var ix = pos.x;
  var iy = pos.y;
  var iz = pos.z;
  var dpos_hat = grid.pos_arrow_differential_normalized;
  var dxhat = dpos_hat.x;
  var dyhat = dpos_hat.y;
  var dzhat = dpos_hat.z;
  var dpos = grid.pos_arrow_differential;
  var dx = dpos.x;
  var dy = dpos.y;
  var dz = dpos.z;
  var arrows = grid.arrows;
  var arrow = [];
  var dlength = grid.pos_arrow_distances;
  var neighbor_count = grid.neighbor_count;
  var x = result.x;
  var y = result.y;
  var z = result.z;
  var arrow_distance = 0;
  var average_distance = grid.average_distance;
  var slope = 0;
  var slope_magnitude = 0;
  var from = 0;
  var to = 0;
  var max_slope_from = 0;
  var PI = Math.PI;
  //
  // NOTE: 
  // The naive implementation is to estimate the gradient based on each individual neighbor,
  //  then take the average between the estimates.
  // This is wrong! If dx, dy, or dz is very small, 
  //  then the gradient estimate along that dimension will be very big.
  // This will result in very strange behavior.
  //
  // The correct implementation is to use the Gauss-Green theorem: 
  //   ∫∫∫ᵥ ∇ϕ dV = ∫∫ₐ ϕn̂ da
  // so:
  //   ∇ϕ = 1/V ∫∫ₐ ϕn̂ da
  // so find flux out of an area, then divide by volume
  // the area/volume is calculated for a circle that reaches halfway to neighboring vertices
  x.fill(0);
  y.fill(0);
  z.fill(0);
  var average_value = 0;
  for (var i = 0, li = arrows.length; i < li; i++) {
    arrow = arrows[i];
    from = arrow[0];
    to = arrow[1];
    average_value = (scalar_field[to] - scalar_field[from]);
    x[from] += average_value * dxhat[i] * PI * dlength[i]/neighbor_count[from];
    y[from] += average_value * dyhat[i] * PI * dlength[i]/neighbor_count[from];
    z[from] += average_value * dzhat[i] * PI * dlength[i]/neighbor_count[from];
  }
  var inverse_volume = 1 / (PI * (average_distance/2) * (average_distance/2));
  for (var i = 0, li = scalar_field.length; i < li; i++) {
    x[i] *= inverse_volume;
    y[i] *= inverse_volume;
    z[i] *= inverse_volume;
  }
  return result;
};
// The VectorField namespace provides operations over mathematical vector fields.
// All fields are represented on raster objects, e.g. VectorRaster or Float32Raster
var VectorField = {};
VectorField.add_scalar_term = function(vector_field1, vector_field2, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + (v[i] * scalar);
    }
    return result;
};
VectorField.add_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + v[i];
    }
    return result;
};
VectorField.sub_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] - v[i];
    }
    return result;
};
VectorField.dot_vector_field = function(vector_field1, vector_field2, result) {
    result = result || Float32Raster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var length = result.length;
    for (var i=0, li=u.length; i<li; ++i) {
        result[i%length] += u[i] * v[i];
    }
    return result;
};
VectorField.hadamard_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] * v[i];
    }
    return result;
};
VectorField.cross_vector_field = function (vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;
    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    var axi = 0;
    var ayi = 0;
    var azi = 0;
    var bxi = 0;
    var byi = 0;
    var bzi = 0;
    for (var i = 0, li=x.length; i<li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];
        x[i] = ayi*bzi - azi*byi;
        y[i] = azi*bxi - axi*bzi;
        z[i] = axi*byi - ayi*bxi;
    }
    return result;
}
VectorField.div_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] / v[i];
    }
    return result;
};
VectorField.max_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;
    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;
    var cx = result.x;
    var cy = result.y;
    var cz = result.z;
    var axi=0, ayi=0, azi=0;
    var bxi=0, byi=0, bzi=0;
    var a_mag = 0, b_mag = 0;
    var is_a_bigger = false;
    var sqrt = Math.sqrt;
    for (var i = 0, li = ax.length; i<li; i++) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        a_mag = sqrt( axi * axi +
                        ayi * ayi +
                        azi * azi );
        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];
        b_mag = sqrt( bxi * bxi +
                        byi * byi +
                        bzi * bzi );
        is_a_bigger = a_mag > b_mag;
        cx[i] = is_a_bigger? axi : bxi;
        cy[i] = is_a_bigger? ayi : byi;
        cz[i] = is_a_bigger? azi : bzi;
    }
    return result;
}
VectorField.min_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;
    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;
    var cx = result.x;
    var cy = result.y;
    var cz = result.z;
    var axi=0, ayi=0, azi=0;
    var bxi=0, byi=0, bzi=0;
    var a_mag = 0, b_mag = 0;
    var is_a_smaller = false;
    var sqrt = Math.sqrt;
    for (var i = 0, li = ax.length; i<li; i++) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        a_mag = sqrt( axi * axi +
                        ayi * ayi +
                        azi * azi );
        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];
        b_mag = sqrt( bxi * bxi +
                        byi * byi +
                        bzi * bzi );
        is_a_smaller = a_mag < b_mag;
        cx[i] = is_a_smaller? axi : bxi;
        cy[i] = is_a_smaller? ayi : byi;
        cz[i] = is_a_smaller? azi : bzi;
    }
    return result;
}
VectorField.add_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] + x2;
        y[i] = y1[i] + y2;
        z[i] = z1[i] + z2;
    }
    return result;
};
VectorField.sub_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] - x2;
        y[i] = y1[i] - y2;
        z[i] = z1[i] - z2;
    }
    return result;
};
VectorField.dot_vector = function(vector_field, vector, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;
    for (var i=0, li=x1.length; i<li; ++i) {
        result[i] = x1[i] * x2 +
                    y1[i] * y2 +
                    z1[i] * z2;
    }
    return result;
};
VectorField.hadamard_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] * x2;
        y[i] = y1[i] * y2;
        z[i] = z1[i] * z2;
    }
    return result;
};
VectorField.cross_vector = function (vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var ax = vector_field.x;
    var ay = vector_field.y;
    var az = vector_field.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    var axi = 0;
    var ayi = 0;
    var azi = 0;
    var bxi = vector.x;
    var byi = vector.y;
    var bzi = vector.z;
    for (var i = 0, li=x.length; i < li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        x[i] = ayi*bzi - azi*byi;
        y[i] = azi*bxi - axi*bzi;
        z[i] = axi*byi - ayi*bxi;
    }
    return result;
}
VectorField.div_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] / x2;
        y[i] = y1[i] / y2;
        z[i] = z1[i] / z2;
    }
    return result;
};
// NOTE: matrix is structured to match the output of THREE.Matrix3.toArray()
// i.e single array in column-major format
VectorField.mult_matrix = function (vector_field, matrix, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var ax = vector_field.x;
    var ay = vector_field.y;
    var az = vector_field.z;
    var xx = matrix[0]; var xy = matrix[3]; var xz = matrix[6];
    var yx = matrix[1]; var yy = matrix[4]; var yz = matrix[7];
    var zx = matrix[2]; var zy = matrix[5]; var zz = matrix[8];
    var x = result.x;
    var y = result.y;
    var z = result.z;
    var axi = 0;
    var ayi = 0;
    var azi = 0;
    for (var i = 0, li=x.length; i < li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        x[i] = axi * xx + ayi * xy + azi * xz ;
        y[i] = axi * yx + ayi * yy + azi * yz ;
        z[i] = axi * zx + ayi * zy + azi * zz ;
    }
    return result;
}
VectorField.add_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    var length = scalar_field.length;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + scalar_field[i%length];
    }
    return result;
};
VectorField.sub_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    var length = scalar_field.length;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] - scalar_field[i%length];
    }
    return result;
};
VectorField.mult_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] * scalar_field[i];
        y[i] = y1[i] * scalar_field[i];
        z[i] = z1[i] * scalar_field[i];
    }
    return result;
};
VectorField.div_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    var length = scalar_field.length;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] / scalar_field[i%length];
    }
    return result;
};
VectorField.add_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + scalar;
    }
    return result;
};
VectorField.sub_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] - scalar;
    }
    return result;
};
VectorField.mult_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] * scalar;
    }
    return result;
};
VectorField.div_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
   
    var u = vector_field.everything;
    var out = result.everything;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] / scalar;
    }
    return result;
};
VectorField.vector_similarity = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var ax = vector_field.x;
    var ay = vector_field.y;
    var az = vector_field.z;
    var bx = vector.x;
    var by = vector.y;
    var bz = vector.z;
    var axi = 0.;
    var ayi = 0.;
    var azi = 0.;
    var sqrt = Math.sqrt;
    for (var i=0, li=result.length; i<li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        result[i] =
         (axi*bx +
          ayi*by +
          azi*bz) / ( sqrt(axi*axi+
                               ayi*ayi+
                               azi*azi) * sqrt(bx*bx+
                                                   by*by+
                                                   bz*bz) );
    }
    return result;
};
VectorField.vector_field_similarity = function(vector_field1, vector_field2, result) {
    result = result || Float32Raster.OfLength(vector_field1.x.length, vector_field1.grid);
   
   
   
    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;
    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;
    var axi = 0.;
    var ayi = 0.;
    var azi = 0.;
    var bxi = 0.;
    var byi = 0.;
    var bzi = 0.;
    var sqrt = Math.sqrt;
    for (var i=0, li=result.length; i<li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];
        result[i] =
         (axi*bxi +
          ayi*byi +
          azi*bzi) / ( sqrt(axi*axi+
                                ayi*ayi+
                                azi*azi) * sqrt(bxi*bxi+
                                                    byi*byi+
                                                    bzi*bzi) );
    }
    return result;
};
VectorField.map = function(vector_field, fn, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;
    for (var i = 0, li = result.length; i<li; i++) {
        result[i] = fn(x[i], y[i], z[i]);
    }
    return result;
};
VectorField.magnitude = function(vector_field, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;
    var xi=0, yi=0, zi=0;
    var sqrt = Math.sqrt;
    for (var i = 0, li = result.length; i<li; i++) {
        var xi = x[i];
        var yi = y[i];
        var zi = z[i];
        result[i] = sqrt( xi * xi +
                            yi * yi +
                            zi * zi );
    }
    return result;
}
VectorField.normalize = function(vector_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;
    var ox = result.x;
    var oy = result.y;
    var oz = result.z;
    var xi=0., yi=0., zi=0.;
    var sqrt = Math.sqrt;
    var mag = 0.;
    for (var i = 0, li = x.length; i<li; i++) {
        var xi = x[i];
        var yi = y[i];
        var zi = z[i];
        mag = sqrt( xi * xi +
                    yi * yi +
                    zi * zi );
        ox[i] = xi/(mag||1);
        oy[i] = yi/(mag||1);
        oz[i] = zi/(mag||1);
    }
    return result;
}
// ∂X
// NOTE: should arrow_differential exist at all? 
// Consider moving its code to grid
VectorField.arrow_differential = function(vector_field, result) {
    result = result || VectorRaster.OfLength(vector_field.grid.arrows.length, undefined);
   
   
    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;
    var x = result.x;
    var y = result.y;
    var z = result.z;
    var arrows = vector_field.grid.arrows;
    var from = 0;
    var to = 0;
    for (var i = 0, li = arrows.length; i<li; i++) {
        from = arrows[i][0];
        to = arrows[i][1];
        x[i] = x1[to] - x1[from];
        y[i] = y1[to] - y1[from];
        z[i] = z1[to] - z1[from];
    }
    return result;
}
// This function computes the divergence of a 3d mesh. 
// The divergence can be thought of as the amount by which vectors diverge around a point
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// This implementation does not have to assume all vertices are equidistant. 
// 
// So for 2d: 
//  ∇⋅f = (fx(x+dx) - fx(x-dx)) / 2dx + 
//        (fy(x+dy) - fy(x-dy)) / 2dy  
//
//  ∇⋅f =  1/2 (fx(x+dx) - fx(x-dx)) / dx + 
//         1/2 (fy(x+dy) - fy(x-dy)) / dy  
//
// Think of it as taking the average change in projection:
// For each neighbor:
//   draw a vector to the neighbor
//   find the projection between that vector and the field, 
//   find how the projection changes along that vector
//   find the average change across all neighbors
VectorField.divergence = function(vector_field, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var dlength = vector_field.grid.pos_arrow_distances;
    var arrows = vector_field.grid.arrows;
    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;
    var arrow_pos_diff_normalized = vector_field.grid.pos_arrow_differential_normalized;
    var dxhat = arrow_pos_diff_normalized.x;
    var dyhat = arrow_pos_diff_normalized.y;
    var dzhat = arrow_pos_diff_normalized.z;
    var from = 0;
    var to = 0;
    Float32Raster.fill(result, 0);
    for (var i = 0, li = arrows.length; i<li; i++) {
        from = arrows[i][0];
        to = arrows[i][1];
        result[from] +=
          ( (x[to] - x[from]) * dxhat[i]
           +(y[to] - y[from]) * dyhat[i]
           +(z[to] - z[from]) * dzhat[i]) / dlength[i];
    }
    var neighbor_count = vector_field.grid.neighbor_count;
    for (var i = 0, li = neighbor_count.length; i < li; i++) {
        result[i] /= neighbor_count[i] || 1;
    }
    return result;
}
// This function computes the curl of a 3d mesh. 
// The curl can be thought of as the amount by which vectors curl around a point
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// This implementation does not have to assume all vertices are equidistant. 
// 
// Think of it as taking the average change in the vector rejection:
// For each neighbor:
//   draw a vector to the neighbor
//   find the vector rejection between that vector and the field, 
//   find how the vector rejection changes along that vector
//   find the average change across all neighbors
VectorField.curl = function(vector_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
   
   
    var dlength = vector_field.grid.pos_arrow_distances;
    var arrows = vector_field.grid.arrows;
    var curl_fx = result.x;
    var curl_fy = result.y;
    var curl_fz = result.z;
    var fx = vector_field.x;
    var fy = vector_field.y;
    var fz = vector_field.z;
    var arrow_pos_diff_normalized = vector_field.grid.pos_arrow_differential_normalized;
    var dxhat = arrow_pos_diff_normalized.x;
    var dyhat = arrow_pos_diff_normalized.y;
    var dzhat = arrow_pos_diff_normalized.z;
    var from = 0;
    var to = 0;
    var dfx = 0;
    var dfy = 0;
    var dfz = 0;
    Float32Raster.fill(curl_fx, 0);
    Float32Raster.fill(curl_fy, 0);
    Float32Raster.fill(curl_fz, 0);
    for (var i = 0, li = arrows.length; i<li; i++) {
        from = arrows[i][0];
        to = arrows[i][1];
        dfx = fx[to] - fx[from];
        dfy = fy[to] - fy[from];
        dfz = fz[to] - fz[from];
        curl_fx[from] += dfx - (dfx * dxhat[i] / dlength[i]);
        curl_fy[from] += dfy - (dfy * dyhat[i] / dlength[i]);
        curl_fz[from] += dfz - (dfz * dzhat[i] / dlength[i]);
    }
    var neighbor_count = vector_field.grid.neighbor_count;
    for (var i = 0, li = neighbor_count.length; i < li; i++) {
        curl_fx[i] /= neighbor_count[i] || 1;
        curl_fy[i] /= neighbor_count[i] || 1;
        curl_fz[i] /= neighbor_count[i] || 1;
    }
    return result;
}
var Float32RasterGraphics = {};
Float32RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
    result = result || Float32Raster(raster.grid);
   
   
   
   
    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? copied[i] : raster[i];
    }
    return result;
}
Float32RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
    result = result || Float32Raster(raster.grid);
   
   
   
   
    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? fill : raster[i];
    }
    return result;
}
var Uint16RasterGraphics = {};
Uint16RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
    result = result || Uint16Raster(raster.grid);
   
   
   
   
    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? copied[i] : raster[i];
    }
    return result;
}
Uint16RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
    result = result || Uint16Raster(raster.grid);
   
   
   
   
    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? fill : raster[i];
    }
    return result;
}
var Uint8RasterGraphics = {};
Uint8RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
    result = result || Uint8Raster(raster.grid);
   
   
   
   
    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? copied[i] : raster[i];
    }
    return result;
}
Uint8RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
    result = result || Uint8Raster(raster.grid);
   
   
   
   
    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? fill : raster[i];
    }
    return result;
}
// The VectorRasterGraphics namespace encompasses functionality 
// you've come to expect from a standard image editor like Gimp or MS Paint
var VectorRasterGraphics = {};
VectorRasterGraphics.magic_wand_select = function function_name(vector_raster, start_id, mask, result, scratch_ui8) {
    result = result || Uint8Raster(vector_raster.grid);
    scratch_ui8 = scratch_ui8 || Uint8Raster(vector_raster.grid);
   
   
   
   
    Uint8Raster.fill(result, 0);
    var neighbor_lookup = vector_raster.grid.neighbor_lookup;
    var similarity = Vector.similarity;
    var magnitude = Vector.magnitude;
    var x = vector_raster.x;
    var y = vector_raster.y;
    var z = vector_raster.z;
    var searching = [start_id];
    var searched = scratch_ui8;
    var grouped = result;
    searched[start_id] = 1;
    var id = 0;
    var neighbor_id = 0;
    var neighbors = [];
    var is_similar = 0;
    var threshold = Math.cos(Math.PI * 60/180);
    var start_x = x[start_id];
    var start_y = y[start_id];
    var start_z = z[start_id];
    while(searching.length > 0){
        id = searching.shift();
        is_similar = similarity (x[id], y[id], z[id],
                                 start_x, start_y, start_z) > threshold;
        if (is_similar) {
            grouped[id] = 1;
            neighbors = neighbor_lookup[id];
            for (var i=0, li=neighbors.length; i<li; ++i) {
                neighbor_id = neighbors[i];
                if (searched[neighbor_id] === 0 && mask[id] != 0) {
                    searching.push(neighbor_id);
                    searched[neighbor_id] = 1;
                }
            }
        }
    }
    return result;
}
VectorRasterGraphics.copy_into_selection = function(vector_raster, copied, selection, result) {
    result = result || Float32Raster(vector_raster.grid);
   
   
   
   
    var a = vector_raster.everything;
    var b = copied.everything;
    var c = result.everything;
    var length = selection.length;
    for (var i=0, li=a.length; i<li; ++i) {
        c[i] = selection[i%length] === 1? b[i] : a[i];
    }
    return result;
}
VectorRasterGraphics.fill_into_selection = function(vector_raster, fill, selection, result) {
    result = result || Float32Raster(vector_raster.grid);
   
   
   
    var ax = vector_raster.x;
    var ay = vector_raster.y;
    var az = vector_raster.z;
    var bx = fill.x;
    var by = fill.y;
    var bz = fill.z;
    var cx = result.x;
    var cy = result.y;
    var cz = result.z;
    var selection_i = 0;
    for (var i=0, li=vector_raster.length; i<li; ++i) {
      selection_i = selection[i];
      cx[i] = selection_i === 1? bx : ax[i];
      cy[i] = selection_i === 1? by : ay[i];
      cz[i] = selection_i === 1? bz : az[i];
    }
    return result;
}
// The FieldInterpolation namespaces provide operations commonly used in interpolation for computer graphics
// All input are raster objects, e.g. VectorRaster or Float32Raster
var Float32RasterInterpolation = {};
Float32RasterInterpolation.mix = function(a,b, x, result){
   
    result = result || Float32Raster.FromExample(x);
   
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = a + x[i]*(b-a);
    }
    return result;
}
Float32RasterInterpolation.mix_fsf = function(a,b, x, result){
   
   
    result = result || Float32Raster.FromExample(x);
   
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = a[i] + x[i] * (b-a[i]);
    }
    return result;
}
Float32RasterInterpolation.mix_sff = function(a,b, x, result){
   
   
    result = result || Float32Raster.FromExample(x);
   
    for (var i = 0, li = result.length; i < li; i++) {
        result[i] = a + x[i] * (b[i]-a);
    }
    return result;
}
Float32RasterInterpolation.clamp = function(x, min_value, max_value, result) {
   
    result = result || Float32Raster.FromExample(x);
   
    var x_i = 0.0;
    for (var i = 0, li = x.length; i < li; i++) {
        x_i = x[i];
        result[i] = x_i > max_value? max_value : x_i < min_value? min_value : x_i;
    }
    return result;
}
Float32RasterInterpolation.step = function(edge, x, result) {
   
    result = result || Float32Raster.FromExample(x);
   
    for (var i = 0, li = x.length; i < li; i++) {
        result[i] = x[i] > edge? 1. : 0.;
    }
    return result;
}
Float32RasterInterpolation.linearstep = function(edge0, edge1, x, result) {
   
    result = result || Float32Raster.FromExample(x);
   
    var fraction = 0.;
    var inverse_edge_distance = 1 / (edge1 - edge0);
    for (var i = 0, li = result.length; i < li; i++) {
        fraction = (x[i] - edge0) * inverse_edge_distance;
        result[i] = fraction > 1.0? 1.0 : fraction < 0.0? 0.0 : fraction;
    }
    return result;
}
Float32RasterInterpolation.smoothstep = function(edge0, edge1, x, result) {
   
    result = result || Float32Raster.FromExample(x);
   
    var inverse_edge_distance = 1 / (edge1 - edge0);
    var fraction = 0.;
    var linearstep = 0.;
    for (var i = 0, li = result.length; i < li; i++) {
        fraction = (x[i] - edge0) * inverse_edge_distance;
        linearstep = fraction > 1.0? 1.0 : fraction < 0.0? 0.0 : fraction;
        result[i] = linearstep*linearstep*(3-2*linearstep);
    }
    return result;
}
// NOTE: you probably don't want to use this - you should use "smoothstep", instead
// smoothstep is faster, and it uses more intuitive parameters
// smoothstep2 is only here to support legacy behavior
Float32RasterInterpolation.smoothstep2 = function(x, k, result) {
   
    result = result || Float32Raster.FromExample(x);
   
    var exp = Math.exp;
    for (var i = 0, li = result.length; i < li; i++) {
       result[i] = 2 / (1 + exp(-k*x[i])) - 1;
    }
    return result;
}
// performs Linear piecewise intERPolation:
// given a list of control points that map 1d space to 1d scalars, and a raster of 1d input, 
// it returns a scalar field where each value maps to the corresponding value on the input field
Float32RasterInterpolation.lerp = function(control_points_x, control_points_y, x, result, scratch) {
   
    result = result || Float32Raster.FromExample(x);
    scratch = scratch || Float32Raster.FromExample(x);
    var mix = Float32RasterInterpolation.mix_fsf;
    var linearstep = Float32RasterInterpolation.linearstep;
    Float32Raster.fill(result, control_points_y[0]);
    for (var i = 1; i < control_points_x.length; i++) {
        linearstep (control_points_x[i-1], control_points_x[i], x, scratch)
        mix (result, control_points_y[i], scratch, result);
    }
    return result;
}
var Float32RasterTrigonometry = {};
Float32RasterTrigonometry.cos = function(radians, result) {
  var result = result || Float32Raster(radians.grid);
  var cos = Math.cos;
  for (var i = 0; i < radians.length; i++) {
    result[i] = cos(radians[i]);
  }
  return result;
}
var ScalarTransport = {};
ScalarTransport.is_nonnegative_quantity = function(quantity) {
 
  var quantity_i = 0.0;
  for (var i=0, li=quantity.length; i<li; ++i) {
    if (quantity[i] < 0) {
      return false;
    }
  }
  return true;
}
ScalarTransport.is_conserved_quantity_delta = function(delta, threshold) {
 
  var average = Float32Dataset.average(delta);
  if (average * average > threshold * threshold) {
    return false;
  }
  return true;
}
ScalarTransport.is_nonnegative_quantity_delta = function(delta, quantity) {
 
 
  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      return false;
    }
  }
  return true;
}
ScalarTransport.fix_nonnegative_quantity = function(quantity) {
 
  ScalarField.min_scalar(quantity, 0);
}
ScalarTransport.fix_conserved_quantity_delta = function(delta, threshold) {
 
  var average = Float32Dataset.average(delta);
  if (average * average > threshold * threshold) {
    ScalarField.sub_scalar(delta, average, delta);
  }
}
ScalarTransport.fix_nonnegative_quantity_delta = function(delta, quantity) {
 
 
  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      delta[i] = -quantity[i];
    }
  }
}
ScalarTransport.fix_nonnegative_conserved_quantity_delta = function(delta, quantity, scratch) {
  return;
  var scratch = scratch || Float32Raster(delta.grid);
 
 
 
  var total_excess = 0.0;
  var total_remaining = 0.0;
  var remaining = scratch;
  // clamp delta to quantity available
  // keep tabs on excess where delta exceeds quantity
  // also keep tabs on which cells still have quantity remaining after delta is applied
  for (var i=0, li=delta.length; i<li; ++i) {
    if (-delta[i] > quantity[i]) {
      total_excess += -delta[i] - quantity[i];
      delta[i] = -quantity[i];
      remaining[i] = 0;
    }
    else {
      remaining[i] = quantity[i] + delta[i];
      total_remaining += quantity[i] + delta[i];
    }
  }
  // go back and correct the excess by taxing from the remaining quantity
  // the more remaining a cell has, the more it gets taxed
  var remaining_tax = total_excess / total_remaining;
  if (remaining_tax) {
    for (var i=0, li=delta.length; i<li; ++i) {
      delta[i] -= remaining[i] * remaining_tax;
    }
  }
}
// The VectorImageAnalysis namespace encompasses advanced functionality 
// common to image analysis
var VectorImageAnalysis = {};
// performs image segmentation
// NOTE: this uses no particular algorithm, I wrote it before I started looking into the research
// This function repeatedly uses the flood fill algorithm from VectorRasterGraphics
VectorImageAnalysis.image_segmentation = function(vector_field, segment_num, min_segment_size, result, scratch_ui8_1, scratch_ui8_2, scratch_ui8_3) {
  var scratch_ui8_1 = scratch_ui8_1 || Uint8Raster(vector_field.grid);
  var scratch_ui8_2 = scratch_ui8_2 || Uint8Raster(vector_field.grid);
  var scratch_ui8_3 = scratch_ui8_3 || Uint8Raster(vector_field.grid);
  var max_iterations = 2 * segment_num;
  var magnitude = VectorField.magnitude(vector_field);
  var segments = result || Uint8Raster(vector_field.grid);
  Uint8Raster.fill(segments, 0);
  var segment = scratch_ui8_1;
  var occupied = scratch_ui8_2;
  Uint8Raster.fill(occupied, 1);
  var fill_ui8 = Uint8RasterGraphics.fill_into_selection;
  var fill_f32 = Float32RasterGraphics.fill_into_selection;
  var magic_wand = VectorRasterGraphics.magic_wand_select;
  var sum = Uint8Dataset.sum;
  var max_id = Float32Raster.max_id;
  // step 1: run flood fill algorithm several times
  for (var i=1, j=0; i<segment_num && j<max_iterations; j++) {
    magic_wand(vector_field, max_id(magnitude), occupied, segment, scratch_ui8_3);
    fill_f32 (magnitude, 0, segment, magnitude);
    fill_ui8 (occupied, 0, segment, occupied);
    if (sum(segment) > min_segment_size) {
        fill_ui8 (segments, i, segment, segments);
        i++;
    }
  }
  return segments;
}
var BinaryMorphology = {};
BinaryMorphology.VertexTypedArray = function(grid) {
    var result = new Uint8Array(grid.vertices.length);
    result.grid = grid;
    return result;
}
BinaryMorphology.universal = function(result) {
    ;
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = 1;
    }
}
BinaryMorphology.empty = function(result) {
    ;
    for (var i=0, li=result.length; i<li; ++i) {
        result[i] = 0;
    }
}
BinaryMorphology.union = function(field1, field2, result) {
    result = result || Uint8Raster(field1.grid);
    ;
    ;
    ;
    for (var i=0, li=field1.length; i<li; ++i) {
        result[i] = (field1[i]===1 || field2[i]===1)? 1:0;
    }
    return result;
}
BinaryMorphology.intersection = function(field1, field2, result) {
    result = result || Uint8Raster(field1.grid);
    ;
    ;
    ;
    for (var i=0, li=field1.length; i<li; ++i) {
        result[i] = (field1[i]===1 && field2[i]===1)? 1:0;
    }
    return result;
}
BinaryMorphology.difference = function(field1, field2, result) {
    result = result || Uint8Raster(field1.grid);
    ;
    ;
    ;
    for (var i=0, li=field1.length; i<li; ++i) {
        result[i] = (field1[i]===1 && field2[i]===0)? 1:0;
    }
    return result;
}
BinaryMorphology.negation = function(field, result) {
    result = result || Uint8Raster(field.grid);
    ;
    ;
    for (var i=0, li=field.length; i<li; ++i) {
        result[i] = (field[i]===0)? 1:0;
    }
    return result;
}
BinaryMorphology.dilation = function(field, radius, result, scratch) {
    radius = radius || 1;
    result = result || Uint8Raster(field.grid);
    scratch = scratch || Uint8Raster(field.grid);
    ;
    ;
    var buffer1 = radius % 2 == 1? result: scratch;
    var buffer2 = radius % 2 == 0? result: scratch;
    scratch.set(field);
    var temp = buffer1;
    var neighbor_lookup = field.grid.neighbor_lookup;
    var neighbors = [];
    var buffer_i = true;
    for (var k=0; k<radius; ++k) {
        for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
            neighbors = neighbor_lookup[i];
            buffer_i = buffer2[i] === 1;
            for (var j=0, lj=neighbors.length; j<lj; ++j) {
                if (buffer_i) {
                    continue;
                }
                buffer_i = buffer_i || buffer2[neighbors[j]] === 1;
            }
            buffer1[i] = buffer_i? 1:0;
        }
        temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;
    }
    return buffer2;
}
BinaryMorphology.erosion = function(field, radius, result, scratch) {
    radius = radius || 1;
    result = result || Uint8Raster(field.grid);
    scratch = scratch || Uint8Raster(field.grid);
    ;
    ;
    var buffer1 = radius % 2 == 1? result: scratch;
    var buffer2 = radius % 2 == 0? result: scratch;
    scratch.set(field);
    var temp = buffer1;
    var neighbor_lookup = field.grid.neighbor_lookup;
    var neighbors = [];
    var buffer_i = true;
    for (var k=0; k<radius; ++k) {
        for (var i=0, li=neighbor_lookup.length; i<li; ++i) {
            neighbors = neighbor_lookup[i];
            buffer_i = buffer2[i] === 1;
            for (var j=0, lj=neighbors.length; j<lj; ++j) {
                if (!buffer_i) {
                    continue;
                }
                buffer_i = buffer_i && buffer2[neighbors[j]] === 1;
            }
            buffer1[i] = buffer_i? 1:0;
        }
        temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;
    }
    return buffer2;
}
BinaryMorphology.opening = function(field, radius) {
    var result = BinaryMorphology.erosion(field, radius);
    return BinaryMorphology.dilation(result, radius);
}
BinaryMorphology.closing = function(field, radius) {
    var result = BinaryMorphology.dilation(field, radius);
    return BinaryMorphology.erosion(result, radius);
}
BinaryMorphology.white_top_hat = function(field, radius) {
    var closing = BinaryMorphology.closing(field, radius);
    return BinaryMorphology.difference(closing, field);
}
BinaryMorphology.black_top_hat = function(field, radius) {
    var opening = BinaryMorphology.opening(field, radius);
    return BinaryMorphology.difference(field, opening);
}
// NOTE: this is not a standard concept in math morphology
// It is meant to represent the difference between a figure and its dilation
// Its name eludes to the "margin" concept within the html box model
BinaryMorphology.margin = function(field, radius, result, scratch) {
    result = result || Uint8Raster(field.grid);
    scratch = scratch || Uint8Raster(field.grid);
    ;
    ;
    ;
    if(field === result) throw ("cannot use same input for 'field' and 'result' - margin() is not an in-place function")
    var dilation = result; // reuse result raster for performance reasons
    BinaryMorphology.dilation(field, radius, dilation, scratch);
    return BinaryMorphology.difference(dilation, field, result);
}
// NOTE: this is not a standard concept in math morphology
// It is meant to represent the difference between a figure and its erosion
// Its name eludes to the "padding" concept within the html box model
BinaryMorphology.padding = function(field, radius, result, scratch) {
    result = result || Uint8Raster(field.grid);
    scratch = scratch || Uint8Raster(field.grid);
    ;
    ;
    ;
    if(field === result) throw ("cannot use same input for 'field' and 'result' - padding() is not an in-place function")
    var erosion = result; // reuse result raster for performance reasons
    BinaryMorphology.erosion(field, radius, erosion, scratch);
    return BinaryMorphology.difference(field, erosion, result, scratch);
}
//Data structure mapping 3d coordinates onto a lattice for fast lookups 
// lattice assumes that max distance to nearest neighbors will never exceed farthest_nearest_neighbor_distance
function IntegerLattice(points, getDistance, farthest_nearest_neighbor_distance){
    var lattice = [];
    var N = 3;
    var cell_width = 2*farthest_nearest_neighbor_distance;
    var max_x = Math.max.apply(null, points.map(point => point.x));
    var min_x = Math.min.apply(null, points.map(point => point.x));
    var range_x = max_x - min_x;
    var cell_num_x = range_x / cell_width;
    var max_y = Math.max.apply(null, points.map(point => point.y));
    var min_y = Math.min.apply(null, points.map(point => point.y));
    var range_y = max_y - min_y;
    var cell_num_y = range_y / cell_width;
    var max_z = Math.max.apply(null, points.map(point => point.z));
    var min_z = Math.min.apply(null, points.map(point => point.z));
    var range_z = max_z - min_z;
    var cell_num_z = range_z / cell_width;
    var ceil = Math.ceil;
    var round = Math.round;
    function cell_id(xi, yi, zi) {
        return xi * cell_num_z * cell_num_y
              + yi * cell_num_z
              + zi;
    }
    function add(id, point) {
        lattice[id] = lattice[id] || [];
        lattice[id].push(point)
    }
    var xi = 0;
    var yi = 0;
    var zi = 0;
    var point = points[0];
    for(var i=0, il = points.length; i<il; i++){
        point = points[i];
        xi = round((point.x - min_x) / cell_width);
        yi = round((point.y - min_y) / cell_width);
        zi = round((point.z - min_z) / cell_width);
        add(cell_id(xi, yi, zi), point);
        add(cell_id(xi+1, yi, zi), point);
        add(cell_id(xi, yi+1, zi), point);
        add(cell_id(xi, yi, zi+1), point);
        add(cell_id(xi+1, yi+1, zi), point);
        add(cell_id(xi, yi+1, zi+1), point);
        add(cell_id(xi+1, yi+1, zi+1), point);
    }
    function nearest(point){
        var xi = ceil((point.x - min_x) / cell_width);
        var yi = ceil((point.y - min_y) / cell_width);
        var zi = ceil((point.z - min_z) / cell_width);
        var neighbors = lattice[cell_id(xi, yi, zi)] || [];
        var neighbor = neighbors[0];
        var nearest_ = neighbors[0] || {x:NaN,y:NaN,z:NaN,i:-1};
        var nearest_distance = Infinity;
        var distance = 0.0;
        for(var i=0, il = neighbors.length; i<il; i++){
            neighbor = neighbors[i];
            var distance = getDistance(point, neighbor);
            if (distance < nearest_distance) {
                nearest_distance = distance;
                nearest_ = neighbor;
            }
        }
        return nearest_;
    }
    this.nearest = nearest;
    return this;
}
var VoronoiSphere = (function() {
    const OCTAHEDRON_SIDE_COUNT = 8; // number of sides on the data cube
    var OCTAHEDRON_SIDE_Z = VectorRaster.FromVectors([
            Vector(-1,-1,-1),
            Vector( 1,-1,-1),
            Vector(-1, 1,-1),
            Vector( 1, 1,-1),
            Vector(-1,-1, 1),
            Vector( 1,-1, 1),
            Vector(-1, 1, 1),
            Vector( 1, 1, 1)
        ]);
    VectorField.normalize(OCTAHEDRON_SIDE_Z, OCTAHEDRON_SIDE_Z);
    var OCTAHEDRON_SIDE_X = VectorField.cross_vector(OCTAHEDRON_SIDE_Z, Vector(0,0,1));
    VectorField.normalize(OCTAHEDRON_SIDE_X, OCTAHEDRON_SIDE_X);
    var OCTAHEDRON_SIDE_Y = VectorField.cross_vector_field(OCTAHEDRON_SIDE_Z, OCTAHEDRON_SIDE_X);
    VectorField.normalize(OCTAHEDRON_SIDE_Y, OCTAHEDRON_SIDE_Y);
    var OCTAHEDRON_SIDE_X = VectorRaster.ToArray(OCTAHEDRON_SIDE_X);
    var OCTAHEDRON_SIDE_Y = VectorRaster.ToArray(OCTAHEDRON_SIDE_Y);
    var OCTAHEDRON_SIDE_Z = VectorRaster.ToArray(OCTAHEDRON_SIDE_Z);
    var cell_count = function (dimensions_x, dimensions_y){
        return OCTAHEDRON_SIDE_COUNT * dimensions_x * dimensions_y;
    }
    var cell_id = function (side_id, xi, yi, dimensions_x, dimensions_y){
        return side_id * dimensions_x * dimensions_y
              + xi * dimensions_y
              + yi;
    }
    //Data structure mapping coordinates on a sphere to the nearest neighbor
    //Retrievals from the map are of O(1) complexity. The result resembles a voronoi diagram, hence the name.
    function VoronoiSphere(pos, cell_width, farthest_distance){
        var dimension_x = Math.ceil(2./cell_width)+1;
        var dimension_y = Math.ceil(2./cell_width)+1;
        var cells = new Uint16Array(cell_count(dimension_x, dimension_y));
        this.cell_width = cell_width;
        this.dimension_x = dimension_x;
        this.dimension_y = dimension_y;
        this.cells = cells;
        //Feed locations into an integer lattice for fast lookups
        var points = [];
        var x = pos.x;
        var y = pos.y;
        var z = pos.z;
        for(var i=0, il = x.length; i<il; i++){
            points.push({x:x[i], y:y[i], z:z[i], i:i});
        }
        var getDistance = function(a,b) {
                return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y) + (a.z - b.z)*(a.z - b.z);
            };
        var lattice = new IntegerLattice(points, getDistance, farthest_distance);
        var side_x = OCTAHEDRON_SIDE_X[0];
        var side_y = OCTAHEDRON_SIDE_Y[0];
        var side_z = OCTAHEDRON_SIDE_Z[0];
        var cell_x = Vector();
        var cell_y = Vector();
        var cell_z = Vector();
        var cell_pos = Vector();
        var sqrt = Math.sqrt;
        var max = Math.max;
        var x2d = 0.;
        var y2d = 0.;
        var z2d = 0.;
        // populate cells using the slower IntegerLattice implementation
        for (var side_id = 0; side_id < OCTAHEDRON_SIDE_COUNT; side_id++)
        {
            side_x = OCTAHEDRON_SIDE_X[side_id];
            side_y = OCTAHEDRON_SIDE_Y[side_id];
            side_z = OCTAHEDRON_SIDE_Z[side_id];
            for (var xi2d = 0; xi2d < dimension_x; xi2d++)
            {
                for (var yi2d = 0; yi2d < dimension_y; yi2d++)
                {
                    // get position of the cell that's projected onto the 2d grid
                    x2d = xi2d * cell_width - 1.;
                    y2d = yi2d * cell_width - 1.;
                    // reconstruct the dimension omitted from the grid using pythagorean theorem
                    z2d = sqrt(max(1. - (x2d*x2d) - (y2d*y2d), 0.));
                    Vector.mult_scalar(side_x.x, side_x.y, side_x.z, x2d, cell_x);
                    Vector.mult_scalar(side_y.x, side_y.y, side_y.z, y2d, cell_y);
                    Vector.mult_scalar(side_z.x, side_z.y, side_z.z, z2d, cell_z);
                    // reset vector
                    cell_pos.x = 0;
                    cell_pos.y = 0;
                    cell_pos.z = 0;
                    Vector.add_vector(cell_pos.x, cell_pos.y, cell_pos.z, cell_x.x, cell_x.y, cell_x.z, cell_pos);
                    Vector.add_vector(cell_pos.x, cell_pos.y, cell_pos.z, cell_y.x, cell_y.y, cell_y.z, cell_pos);
                    Vector.add_vector(cell_pos.x, cell_pos.y, cell_pos.z, cell_z.x, cell_z.y, cell_z.z, cell_pos);
                    cells[cell_id(side_id, xi2d, yi2d, dimension_x, dimension_y)] = lattice.nearest(cell_pos).i;
                }
            }
        }
    }
    VoronoiSphere.prototype.getNearestIds = function(pos_field, result) {
        result = result || new Uint16Array(pos_field.x.length);
        var cell_width = this.cell_width;
        var dimension_x = this.dimension_x;
        var dimension_y = this.dimension_y;
        var cells = this.cells;
        var side_x = OCTAHEDRON_SIDE_X[0];
        var side_y = OCTAHEDRON_SIDE_Y[0];
        var projection_x = 0;
        var projection_y = 0;
        var grid_pos_x = 0;
        var grid_pos_y = 0;
        var pos_field_xi = 0;
        var pos_field_yi = 0;
        var pos_field_zi = 0;
        var side_id = 0;
        var dot = Vector.dot_vector;
        var floor = Math.floor;
        for (var i = 0, li = pos_field.x.length; i < li; i++)
        {
            pos_field_xi = pos_field.x[i];
            pos_field_yi = pos_field.y[i];
            pos_field_zi = pos_field.z[i];
            var side_id =
              (( pos_field_xi > 0) ) +
              (( pos_field_yi > 0) << 1) +
              (( pos_field_zi > 0) << 2) ;
            side_x = OCTAHEDRON_SIDE_X[side_id];
            side_y = OCTAHEDRON_SIDE_Y[side_id];
            projection_x = dot( side_x.x, side_x.y, side_x.z, pos_field_xi, pos_field_yi, pos_field_zi );
            projection_y = dot( side_y.x, side_y.y, side_y.z, pos_field_xi, pos_field_yi, pos_field_zi );
            grid_pos_x = floor((projection_x + 1.) / cell_width);
            grid_pos_y = floor((projection_y + 1.) / cell_width);
            result[i] = cells[cell_id(side_id, grid_pos_x, grid_pos_y, dimension_x, dimension_y)];
        }
        return result;
    }
    return VoronoiSphere;
})();
// The Grid class is the one stop shop for high performance grid cell operations
// You can find grid cells by neighbor, by position, and by the index of a WebGL buffer array
// It is the lowest level data structure in the app - all raster operations under rasters/ depend on it
function Grid(parameters, options){
    options = options || {};
    var neighbor_lookup, face, points, vertex;
    this.parameters = parameters;
    // Precompute map between buffer array ids and grid cell ids
    // This helps with mapping cells within the model to buffer arrays in three.js
    // Map is created by flattening this.parameters.faces
    var faces = this.parameters.faces;
    this.faces = faces;
    var vertices = this.parameters.vertices;
    this.vertices = vertices;
 this.getParameters = function(){
  return {
   faces: faces .map(f => { return {a: f.a, b: f.b, c: f.c, vertexNormals: f.vertexNormals} } ),
   vertices: vertices.map(v => { return {x: v.x, y: v.y, z: v.z} } ),
  };
 }
    var vertex_ids = new Uint16Array(this.vertices.length);
    for (var i=0, li=vertex_ids.length; i<li; ++i) {
        vertex_ids[i] = i;
    }
    this.vertex_ids = vertex_ids;
    this.vertex_ids.grid = this;
    this.pos = VectorRaster.FromVectors(this.vertices, this);
    var buffer_array_to_cell = new Uint16Array(faces.length * 3);
    for (var i=0, i3=0, li = faces.length; i<li; i++, i3+=3) {
        var face = faces[i];
        buffer_array_to_cell[i3+0] = face.a;
        buffer_array_to_cell[i3+1] = face.b;
        buffer_array_to_cell[i3+2] = face.c;
    };
    this.buffer_array_to_cell = buffer_array_to_cell;
    //Precompute neighbors for O(1) lookups
    var neighbor_lookup = vertices.map(function(vertex) { return {}});
    for(var i=0, il = faces.length; i<il; i++){
        face = faces[i];
        neighbor_lookup[face.a][face.b] = face.b;
        neighbor_lookup[face.a][face.c] = face.c;
        neighbor_lookup[face.b][face.a] = face.a;
        neighbor_lookup[face.b][face.c] = face.c;
        neighbor_lookup[face.c][face.a] = face.a;
        neighbor_lookup[face.c][face.b] = face.b;
    }
    neighbor_lookup = neighbor_lookup.map(function(set) { return Object.values(set); });
    this.neighbor_lookup = neighbor_lookup;
    var neighbor_count = Uint8Raster(this);
    for (var i = 0, li=neighbor_lookup.length; i<li; i++) {
        neighbor_count[i] = neighbor_lookup[i].length;
    }
    this.neighbor_count = neighbor_count;
    // an "edge" in graph theory is a unordered set of vertices 
    // i.e. this.edges does not contain duplicate neighbor pairs 
    // e.g. it includes [1,2] but not [2,1] 
    var edges = [];
    var edge_lookup = [];
    // an "arrow" in graph theory is an ordered set of vertices 
    // it is also known as a directed edge 
    // i.e. this.arrows contains duplicate neighbor pairs 
    // e.g. it includes [1,2] *and* [2,1] 
    var arrows = [];
    var arrow_lookup = [];
    var neighbors = [];
    var neighbor = 0;
    //Precompute a list of neighboring vertex pairs for O(N) traversal 
    for (var i = 0, li=neighbor_lookup.length; i<li; i++) {
      neighbors = neighbor_lookup[i];
      for (var j = 0, lj=neighbors.length; j<lj; j++) {
        neighbor = neighbors[j];
        arrows.push([i, neighbor]);
        arrow_lookup[i] = arrow_lookup[i] || [];
        arrow_lookup[i].push(arrows.length-1);
        if (i < neighbor) {
          edges.push([i, neighbor]);
          edge_lookup[i] = edge_lookup[i] || [];
          edge_lookup[i].push(edges.length-1);
          edge_lookup[neighbor] = edge_lookup[neighbor] || [];
          edge_lookup[neighbor].push(edges.length-1);
        }
      }
    }
    this.edges = edges;
    this.edge_lookup = edge_lookup;
    this.arrows = arrows;
    this.arrow_lookup = arrow_lookup;
    this.pos_arrow_differential = VectorField.arrow_differential(this.pos);
    this.pos_arrow_differential_normalized = VectorRaster.OfLength(arrows.length, undefined)
    this.pos_arrow_differential_normalized = VectorField.normalize(this.pos_arrow_differential, this.pos_arrow_differential_normalized);
    this.pos_arrow_distances = Float32Raster.OfLength(arrows.length, undefined)
    VectorField.magnitude(this.pos_arrow_differential, this.pos_arrow_distances);
    this.average_distance = Float32Dataset.average(this.pos_arrow_distances);
    this.average_area = this.average_distance * this.average_distance;
    const CELLS_PER_VERTEX = 8;
    this._voronoi = new VoronoiSphere(this.pos, Float32Dataset.min(this.pos_arrow_distances)/CELLS_PER_VERTEX, Float32Dataset.max(this.pos_arrow_distances));
}
Grid.prototype.getNearestId = function(vertex) {
    return this._voronoi.getNearestId(vertex);
}
Grid.prototype.getNearestIds = function(pos_field, result) {
    result = result || Uint16Raster(pos_field.grid);
    return this._voronoi.getNearestIds(pos_field, result);
}
Grid.prototype.getNeighborIds = function(id) {
    return this.neighbor_lookup[id];
}
// Raster based methods often need to create temporary rasters that the calling function never sees
// Creating new rasters is very costly, so often several "scratch" rasters would be created once then reused multiple times
// This often led to bugs, because it was hard to track what these scratch rasters represented at any point in time
// To solve the problem, RasterStackBuffer was created.
// You can request new rasters without fear of performance penalties or referencing issues
// Additionally, you can push and pop method names to the stack so the stack knows when to deallocate rasters
// Think of it as a dedicated stack based memory for Javascript TypedArrays
function RasterStackBuffer(byte_length, buffer){
    this.buffer = buffer || new ArrayBuffer(byte_length);
    this.pos = 0;
    this.stack = [];
    this.method_names = [];
}
// allocate memory to a method
RasterStackBuffer.prototype.allocate = function(name) {
    this.stack.push(this.pos);
    this.method_names.push(name);
}
// deallocate memory reserved for a method
RasterStackBuffer.prototype.deallocate = function(name) {
    this.pos = this.stack.pop();
    var method = this.method_names.pop();
    if (method !== name) {
        throw `memory was deallocated for the method, ${name} but memory was not allocated. This indicates improper memory management.`;
    }
}
RasterStackBuffer.prototype.getFloat32Raster = function(grid) {
    var length = grid.vertices.length;
    var new_pos = this.pos + length * Float32Array.BYTES_PER_ELEMENT;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = new Float32Array(this.buffer, this.pos, length);
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.prototype.getUint8Raster = function(grid) {
    var length = grid.vertices.length;
    var new_pos = this.pos + length * Uint8Array.BYTES_PER_ELEMENT;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = new Uint8Array(this.buffer, this.pos, length);
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.prototype.getUint16Raster = function(grid) {
    var length = grid.vertices.length;
    var new_pos = this.pos + length * Uint16Array.BYTES_PER_ELEMENT;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = new Uint16Array(this.buffer, this.pos, length);
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.prototype.getVectorRaster = function(grid) {
    var length = grid.vertices.length;
    var byte_length_per_index = length * 4;
    var new_pos = this.pos + byte_length_per_index * 3;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = {
        x: new Float32Array(this.buffer, this.pos + byte_length_per_index * 0, length),
        y: new Float32Array(this.buffer, this.pos + byte_length_per_index * 1, length),
        z: new Float32Array(this.buffer, this.pos + byte_length_per_index * 2, length),
        everything: new Float32Array(this.buffer, this.pos + byte_length_per_index * 0, 3*length),
        grid: grid
    };;
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.scratchpad = new RasterStackBuffer(1e7);
// Test code:
// 
// buffer = new RasterStackBuffer(1e6)
// buffer.allocate('1')
// a = buffer.getUint8Raster({vertices:{length:1}})
// b = buffer.getUint8Raster({vertices:{length:1}})
// v = buffer.getVectorRaster({vertices:{length:1}})
// buffer.deallocate('1')
