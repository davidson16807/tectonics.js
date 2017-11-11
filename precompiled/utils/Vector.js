
// NOTE: vectors are always represented using independant xyz params where possible,
// This is done for performance reasons.
// Vectors are represented as object when returned from functions, instead of lists.
// This is done for clarity.
var Vector = {};
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
Vector.dot = function(ax, ay, az, bx, by, bz) {
  var sqrt = Math.sqrt;
  return (ax*bx + ay*by + az*bz);
}
Vector.magnitude = function(x, y, z) {
  return Math.sqrt(x*x + y*y + z*z);
}
Vector.cross = function(ax, ay, az, bx, by, bz) { 
  var x = ay*bz   -   az*by; 
  var y = az*bx   -   ax*bz; 
  var z = ax*by   -   ay*bx; 
  return {x:x,y:y,z:z}; 
} 