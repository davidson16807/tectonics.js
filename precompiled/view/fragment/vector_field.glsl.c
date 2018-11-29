const float PI = 3.14159265358979;

uniform float animation_phase_angle;

varying float vVectorFractionTraversed;

void main() {
	(cos(2.*PI*vVectorFractionTraversed - animation_phase_angle) + 1.) / 2.
	float state = gaussian(vVectorFractionTraversed - );
	gl_FragColor = vec4(state) * vec4(vec3(0.8),0.) + vec4(vec3(0.2),0.);
}