const float PI = 3.14159265358979;

uniform float animation_phase_angle;

varying float vVectorFractionTraversed;

void main() {
	float state = sin(animation_phase_angle + vVectorFractionTraversed * 1.*PI );
	gl_FragColor = vec4(state) * vec4(0.5,0.5,0.5,1) + 0.5;
}