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
Vector.cross = function(ax, ay, az, bx, by, bz, result) { 
  result = result || Vector()

  result.x = ay*bz   -   az*by; 
  result.y = az*bx   -   ax*bz; 
  result.z = ax*by   -   ay*bx; 

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

  result.x = x * xx    + y * xy     + z * xz;
  result.y = x * yx    + y * yy     + z * yz;
  result.z = x * zx    + y * zy     + z * zz;

  return result;
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
Vector.normalize = function(x, y, z, result) {
  result = result || Vector()
  var magnitude = Math.sqrt(x*x + y*y + z*z);
  result.x = x/(magnitude||1);
  result.y = y/(magnitude||1);
  result.z = z/(magnitude||1);
  return result;
}
