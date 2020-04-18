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
Vector.add_vector = function(ax, ay, az, bx, by, bz, out) { 
  out = out || Vector()

  out.x = ax + bx;
  out.y = ay + by;
  out.z = az + bz;

  return out;
} 
Vector.sub_vector = function(ax, ay, az, bx, by, bz, out) { 
  out = out || Vector()

  out.x = ax - bx;
  out.y = ay - by;
  out.z = az - bz;

  return out;
} 
Vector.mult_vector = function(ax, ay, az, bx, by, bz, out) { 
  out = out || Vector()

  out.x = ax * bx;
  out.y = ay * by;
  out.z = az * bz;

  return out;
} 
Vector.div_vector = function(ax, ay, az, bx, by, bz, out) { 
  out = out || Vector()

  out.x = ax / bx;
  out.y = ay / by;
  out.z = az / bz;

  return out;
} 
// TODO: rename to "cross_vector" 
Vector.cross_vector = function(ax, ay, az, bx, by, bz, out) { 
  out = out || Vector()

  out.x = ay*bz   -   az*by; 
  out.y = az*bx   -   ax*bz; 
  out.z = ax*by   -   ay*bx; 

  return out;
} 
Vector.dot_vector = function(ax, ay, az, bx, by, bz) {
  var sqrt = Math.sqrt;
  return (ax*bx + ay*by + az*bz);
}
Vector.mult_scalar = function(x, y, z, scalar, out) {
  out = out || Vector();

  out.x = x * scalar;
  out.y = y * scalar;
  out.z = z * scalar;

  return out;
}
Vector.div_scalar = function(x, y, z, scalar, out) {
  out = out || Vector();

  out.x = x / scalar;
  out.y = y / scalar;
  out.z = z / scalar;

  return out;
}
Vector.mult_matrix = function(x, y, z, matrix, out) {
  out = out || Vector();

  var xx = matrix[0]; var xy = matrix[3]; var xz = matrix[6];
  var yx = matrix[1]; var yy = matrix[4]; var yz = matrix[7];
  var zx = matrix[2]; var zy = matrix[5]; var zz = matrix[8];

  out.x = x * xx    + y * xy     + z * xz;
  out.y = x * yx    + y * yy     + z * yz;
  out.z = x * zx    + y * zy     + z * zz;

  return out;
}
Vector.mult_matrix4x4 = function(x, y, z, matrix, out) {
  out = out || Vector();

  var xx = matrix[0]; var xy = matrix[4]; var xz = matrix[8];  var xw = matrix[12];
  var yx = matrix[1]; var yy = matrix[5]; var yz = matrix[9];  var yw = matrix[13];
  var zx = matrix[2]; var zy = matrix[6]; var zz = matrix[10]; var zw = matrix[14];
  var wx = matrix[3]; var wy = matrix[7]; var wz = matrix[11]; var ww = matrix[15];

  out.x = x * xx    + y * xy    + z * xz    + xw;
  out.y = x * yx    + y * yy    + z * yz    + yw;
  out.z = x * zx    + y * zy    + z * zz    + zw;

  return out;
}
Vector.similarity = function(ax, ay, az, bx, by, bz) {
  var sqrt = Math.sqrt;
  return (ax*bx + 
          ay*by + 
          az*bz)   /   ( sqrt(ax*ax+
                              ay*ay+
                              az*az)   *   sqrt(bx*bx+
                                          by*by+
                                          bz*bz) );
}
Vector.magnitude = function(x, y, z) {
  return Math.sqrt(x*x + y*y + z*z);
}
Vector.normalize = function(x, y, z, out) {
  out = out || Vector()
  var magnitude = Math.sqrt(x*x + y*y + z*z);
  out.x = x/(magnitude||1);
  out.y = y/(magnitude||1);
  out.z = z/(magnitude||1);
  return out;
}



