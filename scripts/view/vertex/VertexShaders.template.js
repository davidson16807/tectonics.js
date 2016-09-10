
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var vertexShaders = {};
vertexShaders.equirectangular = _multiline(function() {/**   
//TEMPLATE.GLSL.C GOES HERE
//EQUIRECTANGULAR.GLSL.C GOES HERE
**/});
vertexShaders.texture = _multiline(function() {/**
//TEMPLATE.GLSL.C GOES HERE
//TEXTURE.GLSL.C GOES HERE
**/})
vertexShaders.orthographic = _multiline(function() {/**   
//TEMPLATE.GLSL.C GOES HERE
//ORTHOGRAPHIC.GLSL.C GOES HERE
**/});

vertexShaders.vectorField = _multiline(function() {/**
//VECTOR_FIELD.GLSL.C GOES HERE
**/})