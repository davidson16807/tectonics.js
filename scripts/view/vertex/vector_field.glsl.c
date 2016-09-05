attribute vec3 vector;

void main() {
	vec4 displaced = vec4( position + vector, 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displaced;
}
//this line left intentionally empty