
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.realistic = `
#include "precompiled/view/fragment/realistic.glsl.c"
`;

fragmentShaders.generic = `
#include "precompiled/view/fragment/generic.glsl.c"
`;

fragmentShaders.heatmap = `
#include "precompiled/view/fragment/heatmap.glsl.c"
`;

fragmentShaders.vectorField = `
#include "precompiled/view/fragment/vector_field.glsl.c"
`;