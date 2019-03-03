
varying float displacement_v;
varying float plant_coverage_v;
varying float ice_coverage_v;
varying float scalar_v;
varying vec4 position_v;

uniform float sealevel;
uniform float sealevel_visibility;

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
	vec4 uncovered 		= heat( scalar_v );
	vec4 ocean 			= mix(vec4(0.), uncovered, 0.5);
	vec4 sea_covered 	= displacement_v < sealevel * sealevel_visibility? ocean : uncovered;
	gl_FragColor = sea_covered;
}