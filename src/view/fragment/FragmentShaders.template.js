
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.template = `
//TEMPLATE.GLSL.C GOES HERE

`;

fragmentShaders.debug = `
//DEBUG.GLSL.C GOES HERE

`;

fragmentShaders.vectorField = `
//VECTOR_FIELD.GLSL.C GOES HERE

`;