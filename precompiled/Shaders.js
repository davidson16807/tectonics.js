window.VERTEX_SHADERS = {};
window.VERTEX_SHADERS.equirectangular = `   
#include "precompiled/shaders/vertex/equirectangular.glsl"
`;
window.VERTEX_SHADERS.texture = `
#include "precompiled/shaders/vertex/texture.glsl"
`;
window.VERTEX_SHADERS.orthographic = `   
#include "precompiled/shaders/vertex/orthographic.glsl"
`;
window.VERTEX_SHADERS.passthrough = `   
#include "precompiled/shaders/vertex/passthrough.glsl"
`;

window.FRAGMENT_SHADERS = {};
window.FRAGMENT_SHADERS.atmosphere = `
#include "precompiled/shaders/fragment/atmosphere.glsl"
`;
window.FRAGMENT_SHADERS.colorscale = `
#include "precompiled/shaders/fragment/colorscale.glsl"
`;
window.FRAGMENT_SHADERS.passthrough = `
#include "precompiled/shaders/fragment/passthrough.glsl"
`;
window.FRAGMENT_SHADERS.realistic = `
#include "precompiled/shaders/fragment/realistic.glsl"
`;
window.FRAGMENT_SHADERS.surface_normal_map = `
#include "precompiled/shaders/fragment/surface_normal_map.glsl"
`;
window.FRAGMENT_SHADERS.vector_field = `
#include "precompiled/shaders/fragment/vector_field.glsl"
`;