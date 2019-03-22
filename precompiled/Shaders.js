var vertexShaders = {};
vertexShaders.equirectangular = `   
#include "precompiled/shaders/vertex/equirectangular.glsl.c"
`;
vertexShaders.texture = `
#include "precompiled/shaders/vertex/texture.glsl.c"
`;
vertexShaders.orthographic = `   
#include "precompiled/shaders/vertex/orthographic.glsl.c"
`;
vertexShaders.passthrough = `   
#include "precompiled/shaders/vertex/passthrough.glsl.c"
`;

var fragmentShaders = {};
fragmentShaders.atmosphere = `
#include "precompiled/shaders/fragment/atmosphere.glsl.c"
`;
fragmentShaders.heatmap = `
#include "precompiled/shaders/fragment/heatmap.glsl.c"
`;
fragmentShaders.colorscale = `
#include "precompiled/shaders/fragment/colorscale.glsl.c"
`;
fragmentShaders.passthrough = `
#include "precompiled/shaders/fragment/passthrough.glsl.c"
`;
fragmentShaders.realistic = `
#include "precompiled/shaders/fragment/realistic.glsl.c"
`;
fragmentShaders.surface_normal_map = `
#include "precompiled/shaders/fragment/surface_normal_map.glsl.c"
`;
fragmentShaders.topographic = `
#include "precompiled/shaders/fragment/topographic.glsl.c"
`;
fragmentShaders.vector_field = `
#include "precompiled/shaders/fragment/vector_field.glsl.c"
`;