
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.realistic = `
//REALISTIC.GLSL.C GOES HERE

`;

fragmentShaders.generic = `
//GENERIC.GLSL.C GOES HERE

`;

fragmentShaders.debug = `
//DEBUG.GLSL.C GOES HERE

`;

fragmentShaders.vectorField = `
//VECTOR_FIELD.GLSL.C GOES HERE

`;