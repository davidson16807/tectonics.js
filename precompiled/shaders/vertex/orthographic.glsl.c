
void main() {
	vDisplacement = displacement;
	vGradient = gradient;
	vPlantCoverage = plant_coverage;
	vIceCoverage = ice_coverage;
	vSurfaceTemp = surface_temp;
	vScalar = scalar;
	vVectorFractionTraversed = vector_fraction_traversed;
	vPosition = modelMatrix * vec4( position, 1.0 );
	
	float surface_height = max(displacement - sealevel, 0.);
	vec4 displacement = vec4( position * (world_radius + surface_height) / reference_distance, 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * displacement;
	
    vec2 clipspace = gl_Position.xy / gl_Position.w;
    vViewDirection = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    vViewOrigin = view_matrix_inverse[3].xyz * reference_distance;
}