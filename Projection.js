var _multiline = function(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var orthographicShader = _multiline(function() {/**   

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