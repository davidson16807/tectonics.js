
var fragmentShaders = {};

fragmentShaders.realistic = `
#include "precompiled/view/fragment/realistic.glsl.c"
`;

fragmentShaders.monochromatic = `
#include "precompiled/view/fragment/monochromatic.glsl.c"
`;

fragmentShaders.heatmap = `
#include "precompiled/view/fragment/heatmap.glsl.c"
`;

fragmentShaders.vectorField = `
#include "precompiled/view/fragment/vector_field.glsl.c"
`;