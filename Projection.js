var _multiline = function(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var orthographicShader = _multiline(function() {/**   

	attribute float displacement;
	varying float vDisplacement;
	uniform  float sealevel;
	varying vec4 vPosition;

	void main() {
		float NA = 0.1;
		float OCEAN = 1.02;
		float LAND = 1.04;
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 1.0 );
		
		if(displacement < 1.0){
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position * NA, 1.0 );
		} else if (displacement < sealevel){
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position * OCEAN, 1.0 );
		} else {
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position * LAND, 1.0 );
		}
	}

**/});