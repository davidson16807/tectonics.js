const float PI = 3.14159265358979;

uniform float animation_phase_angle;

varying float vector_fraction_traversed_v;

void main() {
    float state = (cos(2.*PI*vector_fraction_traversed_v - animation_phase_angle) + 1.) / 2.;
    gl_FragColor = vec4(state) * vec4(vec3(0.8),0.) + vec4(vec3(0.2),0.);
}