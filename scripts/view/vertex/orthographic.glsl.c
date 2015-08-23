
void main() {
	vDisplacement = displacement;
	vAge = age;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
	vec4 displaced = vec4( position * (1.+height), 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displaced;
}
//this line left intentionally empty