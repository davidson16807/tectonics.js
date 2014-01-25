var _multiline = function(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

vertexShaders = {};
vertexShaders.equirectangular = _multiline(function() {/**   

	const float PI = 3.141592653589793238462;
	const float OCEAN = 0.005;
	const float LAND = 0.01;
	
	attribute float displacement;
	varying float vDisplacement;
	varying vec4 vPosition;
	uniform float sealevel;
	uniform float dropoff;

	void main() {
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 0.0 );
		
		vec4 displaced =  modelMatrix * vec4( position, 1.0 );
		displaced = vec4(
			atan(-displaced.z, displaced.x) / PI, 
			asin(displaced.y / length(displaced)) / (PI/2.), 
			displacement > sealevel? LAND : displacement > 1.0? OCEAN : 0., 
			1);
		mat4 viewMatrix2 = mat4(1.);
		viewMatrix2[3] = viewMatrix[3];
		gl_Position = projectionMatrix * viewMatrix2 * displaced;
	}

**/});
vertexShaders.orthographic = _multiline(function() {/**   

	const float OCEAN = 1.00;
	const float LAND = 1.01;
	
	attribute float displacement;
	varying float vDisplacement;
	varying vec4 vPosition;
	uniform float sealevel;
	uniform float dropoff;

	void main() {
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 1.0 );
		
		vec4 displaced;
		if(displacement < 1.0){
			displaced = vec4( position * dropoff, 1.0 );
		} else if (displacement < sealevel){
			displaced = vec4( position * OCEAN, 1.0 );
		} else {
			displaced = vec4( position * LAND, 1.0 );
		}
		gl_Position = projectionMatrix * modelViewMatrix * displaced;
	}

**/});