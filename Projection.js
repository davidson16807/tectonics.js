var _multiline = function(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

vertexShaders = {};
vertexShaders.equirectangular = _multiline(function() {/**   
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
		
		vec4 modelPos = modelMatrix * vec4( position, 1.0 );
		float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
		vec4 displaced = vec4(
			atan(-modelPos.z, modelPos.x), 
			asin(modelPos.y / length(modelPos))*2., 
			height, 
			1);
		mat4 viewMatrixMod = mat4(1.);
		viewMatrixMod[3] = viewMatrix[3];
		gl_Position = projectionMatrix * viewMatrixMod * displaced;
	}

**/});
vertexShaders.orthographic = _multiline(function() {/**   

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

**/});