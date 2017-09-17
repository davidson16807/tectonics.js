
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.template = _multiline(function() {/**   
//TEMPLATE.GLSL.C GOES HERE

**/});

fragmentShaders.debug = _multiline(function() {/**   
//DEBUG.GLSL.C GOES HERE

**/});

fragmentShaders.debug = _multiline(function() {/**   
//VECTOR_FIELD.GLSL.C GOES HERE

**/});