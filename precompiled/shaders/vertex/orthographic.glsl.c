
void main() {
	vDisplacement = displacement;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vSurfaceTemp = surface_temp;
	vScalar = scalar;
	vVectorFractionTraversed = vector_fraction_traversed;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float surface_height = max(displacement - sealevel, 0.);
	vec4 displacement = vec4( position * (world_radius + surface_height) / reference_distance, 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displacement;

	vClipspace = gl_Position.xyz / gl_Position.w; //perspective divide/normalize
}