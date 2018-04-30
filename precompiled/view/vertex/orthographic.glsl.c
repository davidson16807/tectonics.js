
void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vScalar = scalar;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float height = displacement > sealevel? (displacement-sealevel) / 6000e3 : OCEAN;
	vec4 displaced = vec4( ( position ) * (1.+height), 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displaced;
}