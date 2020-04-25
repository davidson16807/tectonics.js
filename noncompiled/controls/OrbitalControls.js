/*
"OrbitalControls" is a namespace of pure functions that reflect a control scheme
where the user controls an object focused around another. 
For most practical purposes, the object is a camera, which is focused on its subject.
All functions represent the transformation of state in reponse to controller events. 
All functions accept as input the controller state and a dom api event,
and output controller state as it would appear after the event takes place. 
All functions are pure: if any state is required by the control scheme,
it must be represented by a controller state object and passed as input/output.
*/
const OrbitalControls = {};
OrbitalControls.State = function(options) {
	options = options || {};
	return {
		// closest distance to origin
		min_zoom_distance: options.min_zoom_distance || 0,
		// height above the min_zoom_distance
		height: options.height || 0,
		// latitude/longitude of geographic coordinates indicating position over world
		angular_position: options.angular_position || Vector2(0,0),
		// altitude/azimuth of horizontal coordinates indicating direction of viewer relative to "up" axis
		angular_direction: options.angular_direction || Vector2(0,0),
		original_event: options.original_event,
	};
}
OrbitalControls.State.get_view_matrix = function(state, matrix_out, scratch1, scratch2) {
	matrix_out = Matrix4x4.identity(matrix_out);
	scratch1 = Matrix4x4.identity(scratch1);
	Matrix4x4.set_translation(matrix_out, 0, 0, -(state.height + state.min_zoom_distance), matrix_out);
	Matrix4x4.from_rotation(1,0,0, state.angular_position.y, scratch1);
	Matrix4x4.mult_matrix(matrix_out, scratch1, matrix_out);
	Matrix4x4.from_rotation(0,1,0, state.angular_position.x, scratch1);
	Matrix4x4.mult_matrix(matrix_out, scratch1, matrix_out);
	Matrix4x4.from_rotation(1,0,0, state.angular_direction.y, scratch1);
	Matrix4x4.mult_matrix(scratch1, matrix_out, matrix_out);
	Matrix4x4.from_rotation(0,1,0, state.angular_direction.x, scratch1);
	Matrix4x4.mult_matrix(scratch1, matrix_out, matrix_out);
	return matrix_out;
}
OrbitalControls.State.copy = function(state_in, state_out) {
	state_out = state_out || State(state_in);
	state_out.height = state_in.height;
	state_out.angular_position = state_in.angular_position;
	state_out.angular_direction = state_in.angular_direction;
	state_out.original_event = state_in.original_event;
	state_out.min_zoom_distance = state_in.min_zoom_distance;
	return state_out;
}
OrbitalControls.State.zoom = function(state_in, outward_motion, state_out) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	const EPSILON = 0.01;
	state_out.height = Math.max(state_in.height * Math.exp(outward_motion), EPSILON);
	return state_out;
}


OrbitalControls.mousedown = function ( state_in, event, state_out ) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	state_out.original_event = event;
}
OrbitalControls.mousemove = function ( state_in, event, state_out ) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	var dom_element = event.currentTarget === document ? event.currentTarget.body : event.currentTarget;
	const motion = Vector2(
		2.0 * Math.PI * (event.movementX) / dom_element.clientWidth, 
		2.0 * Math.PI * (event.movementY) / dom_element.clientHeight, 
	);
	if (state_in.original_event === undefined) {
		return;
	} else if (state_in.original_event.button === 0) {
		Vector2.add_vector(state_in.angular_position, motion, state_out.angular_position);
		state_out.angular_position.y = Math.min(Math.max(state_out.angular_position.y, -Math.PI/2), Math.PI/2)
	} else if (state_in.original_event.button === 1) {
		if (Math.abs(motion.y) > Math.abs(motion.x)) {
			OrbitalControls.State.zoom(state_in, -10.0*motion.y, state_out);
		}
	} else if ( state_in.original_event.button === 2 ) { 
		Vector2.add_vector(state_in.angular_direction, motion, state_out.angular_direction);
		state_out.angular_direction.y = Math.min(Math.max(state_out.angular_direction.y, -Math.PI/2), Math.PI/2)
	}
}
OrbitalControls.mouseup = function ( state_in, event, state_out ) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	state_out.original_event = undefined;
}
OrbitalControls.mousewheel = function ( state_in, event, state_out ) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	OrbitalControls.State.zoom(state_in, -(event.wheelDelta || -event.detail)/1000, state_out);
}

OrbitalControls.touchstart = function ( state_in, event, state_out ) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	state_out.original_event = event;
}
OrbitalControls.touchmove = function ( state_in, event, state_out ) {
	if ( state_in !== state_out ) { OrbitalControls.State.copy(state_in, state_out) };
	if ( state_in.original_event === undefined ) { return; } 
	if ( state_in.original_event.touches === undefined ) { return; }
	if ( state_in.original_event.touches.length < 1 ) { return; }
	var dom_element = event.currentTarget === document ? event.currentTarget.body : event.currentTarget;
	const motion = Vector2(
		 2.0 * Math.PI * (event.touches[0].pageX - state_in.original_event.touches[0].pageX) / dom_element.clientWidth / 30., 
		 1.0 * Math.PI * (event.touches[0].pageY - state_in.original_event.touches[0].pageY) / dom_element.clientHeight / 30., 
	);
	if ( event.touches.length == 1 ) {
		Vector2.add_vector(state_in.angular_position, motion, state_out.angular_position);
		state_out.angular_position.y = Math.min(Math.max(state_out.angular_position.y, -Math.PI/2), Math.PI/2)
	}
	else if ( event.touches.length == 2 ) {
		if ( state_in.original_event.touches.length !== 2 ) { return; }
		var dx0 = event.touches[0].pageX - event.touches[1].pageX;
		var dy0 = event.touches[0].pageY - event.touches[1].pageY;
		var dx1 = event.touches[0].pageX - event.touches[1].pageX;
		var dy1 = event.touches[0].pageY - event.touches[1].pageY;
		var distance0 = Math.sqrt( dx0 * dx0 + dy0 * dy0 );
		var distance1 = Math.sqrt( dx1 * dx1 + dy1 * dy1 );
		OrbitalControls.State.zoom(state_in, Math.log(distance0/distance1), state_out);
	}
	else if ( event.touches.length == 3 ) {
		if ( state_in.original_event.touches.length !== 3 ) { return; }
		Vector2.add_vector(state_in.angular_direction, motion, state_out.angular_direction);
		state_out.angular_direction.y = Math.min(Math.max(state_out.angular_direction.y, -Math.PI/2), Math.PI/2)
	}
}
OrbitalControls.touchend = function ( state_in, event, state_out ) {
	if (state_in !== state_out) { OrbitalControls.State.copy(state_in, state_out) };
	state_out.original_event = undefined;
}
