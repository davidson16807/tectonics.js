

// NOTE: matrices are always represented as column-major order list
// Lists are used instead of params because performance gain is negligible for our purposes
// This is done to match standards with Three.js
var Matrix = {};
Matrix.row_major_order = function(list) {

  var xx = list[0]; var xy = list[1]; var xz = list[2];
  var yx = list[3]; var yy = list[4]; var yz = list[5];
  var zx = list[6]; var zy = list[7]; var zz = list[8];

  result = [];
  result[0] = xx; result[4] = xy; result[8] = xz;
  result[1] = yx; result[5] = yy; result[9] = yz;
  result[2] = zx; result[6] = zy; result[10]= zz;

  return result;
}
Matrix.column_major_order = function(list) {
  return list; //matrices are standardized to column major order, already
}
Matrix.rotation_about_axis = function(axis_x, axis_y, axis_z, angle) {
  var θ = angle,
      cθ = Math.cos(θ),
      sθ = Math.sin(θ),
      vθ = 1 - cθ,      // aka versine of θ
      x = axis_x,
      y = axis_y,
      z = axis_z,
      vθx = vθ*x,
      vθy = vθ*y;
  return [
    vθx*x+cθ,   vθx*y+sθ*z, vθx*z-sθ*y, 
    vθx*y-sθ*z, vθy*y+cθ,   vθy*z+sθ*x,  
    vθx*z+sθ*y, vθy*z-sθ*x, vθ*z*z+cθ
  ];
}
Matrix.mult_matrix = function(ae, be, te) {
  te = te || [];

  var a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
  var a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
  var a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

  var b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
  var b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
  var b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

  te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
  te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
  te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

  te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
  te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
  te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

  te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
  te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
  te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

  return te;
}
