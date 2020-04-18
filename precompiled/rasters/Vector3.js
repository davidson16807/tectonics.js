
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

function Vector3(x,y,z) {
  return {
    x: x || 0,
    y: y || 0,
    z: z || 0,
  };
}
Vector3.FromArray = function(array) {
  return {
    x: array[0] || 0,
    y: array[1] || 0,
    z: array[2] || 0,
  };
}
Vector3.add_vector = function(a, b, out) { 
  out = out || Vector3()

  out.x = a.x + b.x;
  out.y = a.y + b.y;
  out.z = a.z + b.z;

  return out;
} 
Vector3.sub_vector = function(a, b, out) { 
  out = out || Vector3()

  out.x = a.x - b.x;
  out.y = a.y - b.y;
  out.z = a.z - b.z;

  return out;
} 
Vector3.mult_vector = function(a, b, out) { 
  out = out || Vector3()

  out.x = a.x * b.x;
  out.y = a.y * b.y;
  out.z = a.z * b.z;

  return out;
} 
Vector3.div_vector = function(a, b, out) { 
  out = out || Vector3()

  out.x = a.x / b.x;
  out.y = a.y / b.y;
  out.z = a.z / b.z;

  return out;
} 
// TODO: rename to "cross_vector" 
Vector3.cross_vector = function(a, b, out) { 
  out = out || Vector3()

  out.x = a.y*b.z   -   a.z*b.y; 
  out.y = a.z*b.x   -   a.x*b.z; 
  out.z = a.x*b.y   -   a.y*b.x; 

  return out;
} 
Vector3.dot_vector = function(a, b) {
  var sqrt = Math.sqrt;
  return (a.x*b.x + a.y*b.y + a.z*b.z);
}
Vector3.mult_scalar = function(a, scalar, out) {
  out = out || Vector3();

  out.x = a.x * scalar;
  out.y = a.y * scalar;
  out.z = a.z * scalar;

  return out;
}
Vector3.div_scalar = function(a, scalar, out) {
  out = out || Vector3();

  out.x = a.x / scalar;
  out.y = a.y / scalar;
  out.z = a.z / scalar;

  return out;
}
Vector3.mult_matrix = function(a, matrix, out) {
  out = out || Vector3();

  var xx = matrix[0]; var xy = matrix[3]; var xz = matrix[6];
  var yx = matrix[1]; var yy = matrix[4]; var yz = matrix[7];
  var zx = matrix[2]; var zy = matrix[5]; var zz = matrix[8];

  out.x = a.x * xx    + a.y * xy     + a.z * xz;
  out.y = a.x * yx    + a.y * yy     + a.z * yz;
  out.z = a.x * zx    + a.y * zy     + a.z * zz;

  return out;
}
Vector3.mult_matrix4x4 = function(a, matrix, out) {
  out = out || Vector3();

  var xx = matrix[0]; var xy = matrix[4]; var xz = matrix[8];  var xw = matrix[12];
  var yx = matrix[1]; var yy = matrix[5]; var yz = matrix[9];  var yw = matrix[13];
  var zx = matrix[2]; var zy = matrix[6]; var zz = matrix[10]; var zw = matrix[14];
  var wx = matrix[3]; var wy = matrix[7]; var wz = matrix[11]; var ww = matrix[15];

  out.x = a.x * xx    + a.y * xy    + a.z * xz    + xw;
  out.y = a.x * yx    + a.y * yy    + a.z * yz    + yw;
  out.z = a.x * zx    + a.y * zy    + a.z * zz    + zw;

  return out;
}
Vector3.similarity = function(a, b) {
  var sqrt = Math.sqrt;
  return (a.x*b.x + 
          a.y*b.y + 
          a.z*b.z)   /   ( sqrt(a.x*a.x+
                                a.y*a.y+
                                a.z*a.z)   *   sqrt(b.x*b.x+
                                                    b.y*b.y+
                                                    b.z*b.z) );
}
Vector3.magnitude = function(a) {
  return Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
}
Vector3.normalize = function(a, out) {
  out = out || Vector3()
  var magnitude = Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
  out.x = a.x/(magnitude||1);
  out.y = a.y/(magnitude||1);
  out.z = a.z/(magnitude||1);
  return out;
}
