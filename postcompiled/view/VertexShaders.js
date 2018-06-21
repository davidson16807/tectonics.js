var vertexShaders = {};
vertexShaders.equirectangular = `   
//TEMPLATE.GLSL.C GOES HERE
const float PI = 3.14;
const float OCEAN = 0.0;
const float LAND = 0.005;
const float NONE = 0.0;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float plant_coverage;
attribute float ice_coverage;
attribute float insolation;
attribute float scalar;
attribute vec3 vector;

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float index;
//EQUIRECTANGULAR.GLSL.C GOES HERE

float lon(vec3 pos) {
	return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
	return asin(pos.y / length(pos));
}

void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vInsolation = insolation;
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
	float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
	
	float index_offset = INDEX_SPACING * index;
	float focus = lon(cameraPosition) + index_offset;
	float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI;
	float lat_focused = lat(modelPos.xyz); //+ (index*PI);
	bool is_on_edge = lon_focused >  PI*0.9 || lon_focused < -PI*0.9;
	
	vec4 displaced = vec4(
		lon_focused + index_offset,
		lat(modelPos.xyz), //+ (index*PI), 
		is_on_edge? 0. : length(position), 
		1);
	mat4 scaleMatrix = mat4(1);
	scaleMatrix[3] = viewMatrix[3];
	gl_Position = projectionMatrix * scaleMatrix * displaced;
}`;
vertexShaders.texture = `
//TEMPLATE.GLSL.C GOES HERE
const float PI = 3.14;
const float OCEAN = 0.0;
const float LAND = 0.005;
const float NONE = 0.0;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float plant_coverage;
attribute float ice_coverage;
attribute float insolation;
attribute float scalar;
attribute vec3 vector;

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float index;
//TEXTURE.GLSL.C GOES HERE

float lon(vec3 pos) {
	return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
	return asin(pos.y / length(pos));
}

void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vInsolation = 1.0; // always use "1" for textures
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
	
	float index_offset = INDEX_SPACING * index;
	float focus = lon(cameraPosition) + index_offset;
	float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
	float lat_focused = lat(modelPos.xyz); //+ (index*PI);

	float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
	gl_Position = vec4(
        lon_focused / PI,
		lat_focused / (PI/2.), 
		-height, 
		1);
}`;
vertexShaders.orthographic = `   
//TEMPLATE.GLSL.C GOES HERE
const float PI = 3.14;
const float OCEAN = 0.0;
const float LAND = 0.005;
const float NONE = 0.0;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float plant_coverage;
attribute float ice_coverage;
attribute float insolation;
attribute float scalar;
attribute vec3 vector;

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float index;
//ORTHOGRAPHIC.GLSL.C GOES HERE

void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vInsolation = insolation;
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float height = displacement > sealevel? (displacement-sealevel) / 6000e3 : OCEAN;
	vec4 displaced = vec4( ( position ) * (1.+height), 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displaced;
}`;
