
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_mod;

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
	float epipelagic = sealevel - 200.0;
	float mesopelagic = sealevel - 1000.0;
	float abyssopelagic = sealevel - 4000.0;
	float maxheight = sealevel + 15000.0; 
	
	@OUTPUT
}