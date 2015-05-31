
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var vertexShaders = {};
vertexShaders.equirectangular = _multiline(function() {/**   
//EQUIRECTANGULAR.GLSL.C GOES HERE
**/});
vertexShaders.texture = _multiline(function() {/**
//TEXTURE.GLSL.C GOES HERE
**/})
vertexShaders.orthographic = _multiline(function() {/**   
//ORTHOGRAPHIC.GLSL.C GOES HERE
**/});