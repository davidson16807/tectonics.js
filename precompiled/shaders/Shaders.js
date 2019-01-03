var vertexShaders = {};
vertexShaders.equirectangular = `   
#include "precompiled/shaders/vertex/template.glsl.c"
#include "precompiled/shaders/vertex/equirectangular.glsl.c"
`;
vertexShaders.texture = `
#include "precompiled/shaders/vertex/template.glsl.c"
#include "precompiled/shaders/vertex/texture.glsl.c"
`;
vertexShaders.orthographic = `   
#include "precompiled/shaders/vertex/template.glsl.c"
#include "precompiled/shaders/vertex/orthographic.glsl.c"
`;
vertexShaders.passthrough = `   
#include "precompiled/shaders/vertex/passthrough.glsl.c"
`;

var fragmentShaders = {};
fragmentShaders.realistic = `
#include "precompiled/shaders/fragment/realistic.glsl.c"
`;
fragmentShaders.monochromatic = `
#include "precompiled/shaders/fragment/monochromatic.glsl.c"
`;
fragmentShaders.heatmap = `
#include "precompiled/shaders/fragment/heatmap.glsl.c"
`;
fragmentShaders.topographic = `
#include "precompiled/shaders/fragment/topographic.glsl.c"
`;
fragmentShaders.vectorField = `
#include "precompiled/shaders/fragment/vector_field.glsl.c"
`;
fragmentShaders.atmosphere = `
#include "precompiled/shaders/fragment/atmosphere.glsl.c"
`;
fragmentShaders.passthrough = `
#include "precompiled/shaders/fragment/passthrough.glsl.c"
`;