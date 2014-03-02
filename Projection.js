
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var vertexShaders = {};
vertexShaders.equirectangular = _multiline(function() {/**   
	const float PI = 3.14;
	const float OCEAN = 0.0;
	const float LAND = 0.01;
	const float NONE = -0.01;
	
	attribute float displacement;
	varying float vDisplacement;
	varying vec4 vPosition;
	uniform float sealevel;

	float lat(vec3 pos) {
		return atan(-pos.z, pos.x) + PI;
	}
	float lon(vec3 pos) {
		return asin(pos.y / length(pos));
	}

	void main() {
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 1.0 );

		
		vec4 modelPos = modelMatrix * vec4( position, 1.0 );
		float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
		vec4 displaced = vec4(
			mod(lat(modelPos.xyz) - lat(cameraPosition), 2.*PI) - PI,
			lon(modelPos.xyz), 
			height, 
			1);
		mat4 scaleMatrix = mat4(1);
		scaleMatrix[3] = viewMatrix[3];
		gl_Position = projectionMatrix * scaleMatrix * displaced;
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