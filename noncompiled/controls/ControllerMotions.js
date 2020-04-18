/*
"ControllerMotions" is a namespace of pure functions 
representing all elementary operations that can be performed by an input device 
to transform the position and rotation of an in-game object. 
All functions accept position and rotation information as input in the form of a matrix,
and output another matrix representing position and rotation after the operation is performed.
All functions are pure: if any state is required by the control scheme,
it must be passed in as a parameter and managed elsewhere.
*/
const ControllerMotions = {};
ControllerMotions.zoom = function(matrix_in, motion_outward, min_zoom_distance, matrix_out) {
	const EPSILON = 0.01;
	const position = Matrix4x4.get_translation(matrix_in);
	// determine distance to origin
	const distance_in = Vector3.magnitude(position);
	// convert distance to height above `min_zoom_distance`
	const height_in = distance_in - min_zoom_distance;
	const height_out = (
		// `motion_outward` expresses the fraction of `height_in` to zoom to, on a natural log scale
		  height_in * Math.exp(motion_outward) 
		// offset result by a fraction of `distance_in` if zooming out from within min_zoom_distance
		+ 1/(1+Math.exp(-motion_outward))/(1+Math.exp(height_in))
	);
	const distance_out = height_out + min_zoom_distance;
	const scale_factor = distance_out / Math.max(distance_in, EPSILON);
	position.x -= distance_in < EPSILON? EPSILON : 0.0;
	// console.log('motion_outward', motion_outward)
	// console.log('distance_in', distance_in)
	// console.log('height_in', height_in)
	console.log('height_out', height_out)
	// console.log('distance_out', distance_out)
	// console.log('scale_factor', scale_factor)
	// console.log('position1', position)
	Vector3.mult_scalar(position, scale_factor, position);
	// console.log('position2', position)
	return Matrix4x4.set_translation(matrix_in, position.x, position.y, position.z, matrix_out);
}
ControllerMotions.orbit = function(matrix_in, motion_over_screen, matrix_out, scratch) {
	const position = Matrix4x4.get_translation(matrix_in);
	const latitude0 = Math.atan2(position.y, Math.sqrt(position.x*position.x + position.z*position.z));
	const latitude1 = Interpolation.clamp(latitude0 + motion_over_screen.y, -Math.PI/2, Math.PI);
    let rotation = scratch || Matrix4x4();
    Matrix4x4.from_rotation(1,0,0, latitude1 - latitude0, rotation);
    Matrix4x4.mult_matrix(matrix_in, rotation, matrix_out);
    Matrix4x4.from_rotation(0,1,0, motion_over_screen.z, rotation);
    Matrix4x4.mult_matrix(matrix_out, rotation, matrix_out);
    return matrix_out;
}
