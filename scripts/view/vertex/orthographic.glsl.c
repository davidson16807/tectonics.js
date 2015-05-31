const float OCEAN = 0.0;
const float LAND = 0.01;
const float NONE = -0.01;

attribute float displacement;
varying float vDisplacement;
varying vec4 vPosition;
uniform float sealevel;

void main() {
	vDisplacement = displacement;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
	vec4 displaced = vec4( position * (1.+height), 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displaced;
}