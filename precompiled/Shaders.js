var vertexShaders = {};
vertexShaders.equirectangular = `   
#include "precompiled/shaders/vertex/equirectangular.glsl"
`;
vertexShaders.texture = `
#include "precompiled/shaders/vertex/texture.glsl"
`;
vertexShaders.orthographic = `   
#include "precompiled/shaders/vertex/orthographic.glsl"
`;
vertexShaders.passthrough = `   
#include "precompiled/shaders/vertex/passthrough.glsl"
`;

var fragmentShaders = {};
fragmentShaders.atmosphere = `
#include "precompiled/shaders/fragment/atmosphere.glsl"
`;
fragmentShaders.heatmap = `
#include "precompiled/shaders/fragment/heatmap.glsl"
`;
fragmentShaders.colorscale = `
#include "precompiled/shaders/fragment/colorscale.glsl"
`;
fragmentShaders.passthrough = `
#include "precompiled/shaders/fragment/passthrough.glsl"
`;
fragmentShaders.realistic = `
#include "precompiled/shaders/fragment/realistic.glsl"
`;
fragmentShaders.surface_normal_map = `
#include "precompiled/shaders/fragment/surface_normal_map.glsl"
`;
fragmentShaders.topographic = `
#include "precompiled/shaders/fragment/topographic.glsl"
`;
fragmentShaders.vector_field = `
#include "precompiled/shaders/fragment/vector_field.glsl"
`;