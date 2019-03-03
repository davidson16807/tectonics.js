
varying float displacement_v;
varying float plant_coverage_v;
varying float ice_coverage_v;
varying float scalar_v;
varying vec4 position_v;

uniform float sealevel;
uniform float sealevel_visibility;

void main() {
	vec4 uncovered = mix( 
		vec4(@MINCOLOR,1.), 
		vec4(@MAXCOLOR,1.), 
		scalar_v
	);
	vec4 ocean = mix(vec4(0.), uncovered, 0.5);
	vec4 sea_covered = displacement_v < sealevel * sealevel_visibility? ocean : uncovered;
	gl_FragColor = sea_covered;
}