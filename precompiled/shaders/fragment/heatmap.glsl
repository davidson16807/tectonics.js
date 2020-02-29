
varying float displacement_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying vec4 position_v;

uniform float sealevel;
uniform float ocean_visibility;

//converts float from 0-1 to a heat map visualtion
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
vec4 heat (float v) {
    float value = 1.-v;
    return (0.5+0.5*smoothstep(0.0, 0.1, value))*vec4(
        smoothstep(0.5, 0.3, value),
        value < 0.3 ? smoothstep(0.0, 0.3, value) : smoothstep(1.0, 0.6, value),
        smoothstep(0.4, 0.6, value),
        1
    );
}

void main() {
    vec4 color_without_ocean         = heat( scalar_v );
    vec4 color_with_ocean     = displacement_v < sealevel * ocean_visibility? mix(vec4(0.), color_without_ocean, 0.5) : color_without_ocean;
    gl_FragColor = color_with_ocean;
}