
float lon(vec3 pos) {
	return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
	return asin(pos.y / length(pos));
}

void main() {
	vDisplacement = displacement;
	vAge = age;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	vec4 modelPos = modelMatrix * vec4( position, 1.0 );
	float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
	
	float index_offset = INDEX_SPACING * index;
	float focus = lon(cameraPosition) + index_offset;
	float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
	float lat_focused = lat(modelPos.xyz); //+ (index*PI);

	vec4 displaced = vec4(
		lon_focused,
		lat(modelPos.xyz), //+ (index*PI), 
		height, 
		1);
	mat4 scaleMatrix = mat4(1);
	scaleMatrix[3] = viewMatrix[3];
	gl_Position = projectionMatrix * scaleMatrix * displaced;
}
//this line left intentionally empty