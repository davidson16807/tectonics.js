
varying float vDisplacement;
varying vec3  vGradient;
varying vec4  vPosition;

uniform float sealevel;
uniform float sealevel_mod;

void main() {
    // CODE to generate a tangent-space normal map:

	// "n" is the surface normal for a perfectly smooth sphere
    vec3 n = normalize(vPosition.xyz);
    // "N" is the actual surface normal as reported by the gradient of displacement
    vec3 N = normalize(n + vGradient);
    // "j" is coordinate basis for the y axis
    vec3 j = vec3(0,1,0);
    // "u" is the left/right axis on a uv map
    vec3 u = normalize(cross(n, j));
    // "v" is the up/down axis on a uv map
    vec3 v = normalize(cross(n, u));
    // to find the tangent-space normal map, we simply have to map N to the u/v/n coordinate space
    // in other words, we take the dot product between n and the respective u/v/n coordinate bases.
    gl_FragColor = vec4((2.*vec3(dot(N, u), dot(N, v), dot(N, n))-1.), 1);
}