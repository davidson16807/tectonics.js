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
