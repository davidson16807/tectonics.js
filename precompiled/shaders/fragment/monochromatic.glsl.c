
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_visibility;

void main() {
	vec4 uncovered = mix( 
		vec4(@MINCOLOR,1.), 
		vec4(@MAXCOLOR,1.), 
		vScalar
	);
	vec4 ocean = mix(vec4(0.), uncovered, 0.5);
	vec4 sea_covered = vDisplacement < sealevel * sealevel_visibility? ocean : uncovered;
	gl_FragColor = sea_covered;
}