var vertexShaders = {};
vertexShaders.equirectangular = `   
#include "precompiled/view/vertex/template.glsl.c"
#include "precompiled/view/vertex/equirectangular.glsl.c"
`;
vertexShaders.texture = `
#include "precompiled/view/vertex/template.glsl.c"
#include "precompiled/view/vertex/texture.glsl.c"
`;
vertexShaders.orthographic = `   
#include "precompiled/view/vertex/template.glsl.c"
#include "precompiled/view/vertex/orthographic.glsl.c"
`;

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