
void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
	vec4 displaced = vec4( ( position ) * (1.+height), 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displaced;
}