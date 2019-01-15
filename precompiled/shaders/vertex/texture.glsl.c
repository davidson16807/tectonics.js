uniform float insolation_max;

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
	vInsolation = insolation_max; // always use "insolation_max" for textures
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
	
	float index_offset = INDEX_SPACING * index;
	float focus = lon(cameraPosition) + index_offset;
	float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
	float lat_focused = lat(modelPos.xyz); //+ (index*PI);

	float height = displacement > sealevel? 0.005 : 0.0;
	gl_Position = vec4(
        lon_focused / PI,
		lat_focused / (PI/2.), 
		-height, 
		1);
}