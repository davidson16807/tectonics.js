
float lon(vec3 pos) {
	return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
	return asin(pos.y / length(pos));
}

void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vSurfaceTemp = surface_temp;
	vIceCoverage = ice_coverage;
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
	float height = displacement > sealevel? 0.005 : 0.0;
	
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
	scaleMatrix[3] = viewMatrix[3] * reference_distance / world_radius;
	gl_Position = projectionMatrix * scaleMatrix * displaced;
}