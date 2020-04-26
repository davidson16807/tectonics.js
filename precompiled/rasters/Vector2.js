
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

function Vector2(x,y) {
  return {
    x: x || 0,
    y: y || 0,
  };
}
Vector2.copy = function(a, out) {
  out = out || Vector2()
  out.x = a.x;
  out.y = a.y;
  return out;
}
Vector2.FromArray = function(array) {
  return {
    x: array[0] || 0,
    y: array[1] || 0,
  };
}
Vector2.add_vector = function(a, b, out) { 
  out = out || Vector2()

  out.x = a.x + b.x;
  out.y = a.y + b.y;

  return out;
} 
Vector2.sub_vector = function(a, b, out) { 
  out = out || Vector2()

  out.x = a.x - b.x;
  out.y = a.y - b.y;

  return out;
} 
Vector2.mult_vector = function(a, b, out) { 
  out = out || Vector2()

  out.x = a.x * b.x;
  out.y = a.y * b.y;

  return out;
} 
Vector2.div_vector = function(a, b, out) { 
  out = out || Vector2()

  out.x = a.x / b.x;
  out.y = a.y / b.y;

  return out;
} 
// TODO: rename to "cross_vector" 
Vector2.cross_vector = function(a, b, out) { 
  return a.x*b.y   -   a.y*b.x; 
} 
Vector2.dot_vector = function(a, b) {
  return (a.x*b.x + a.y*b.y);
}
Vector2.mult_scalar = function(a, scalar, out) {
  out = out || Vector2();

  out.x = a.x * scalar;
  out.y = a.y * scalar;

  return out;
}
Vector2.div_scalar = function(a, scalar, out) {
  out = out || Vector2();

  out.x = a.x / scalar;
  out.y = a.y / scalar;

  return out;
}
Vector2.mult_matrix = function(a, matrix, out) {
  out = out || Vector2();

  var xx = matrix[0]; var xy = matrix[3];
  var yx = matrix[1]; var yy = matrix[4];

  out.x = a.x * xx    + a.y * xy;
  out.y = a.x * yx    + a.y * yy;

  return out;
}
Vector2.similarity = function(a, b) {
  var sqrt = Math.sqrt;
  return (a.x*b.x + 
          a.y*b.y)   /   ( sqrt(a.x*a.x+
                                a.y*a.y)   *   sqrt(b.x*b.x+
                                                    b.y*b.y) );
}
Vector2.magnitude = function(a) {
  return Math.sqrt(a.x*a.x + a.y*a.y);
}
Vector2.normalize = function(a, out) {
  out = out || Vector2()
  var magnitude = Math.sqrt(a.x*a.x + a.y*a.y);
  out.x = a.x/(magnitude||1);
  out.y = a.y/(magnitude||1);
  return out;
}
