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
OrbitalControls.State = function(matrix) {
	return {
		matrix: matrix || Matrix4x4(),
		starting_matrix: undefined,
		starting_event: undefined,
		min_zoom_distance: 1.0,
	};
}
OrbitalControls.mousedown = function ( state_in, event, state_out ) {
	state_out.starting_event = event;
	state_out.starting_matrix = state_in.matrix;
}
OrbitalControls.mousemove = function ( state_in, event, state_out ) {
	if ( state_in.starting_event === undefined ) { return; }
	var dom_element = event.currentTarget === document ? event.currentTarget.body : event.currentTarget;
	const offset = Vector2(
		(event.clientX - state_in.starting_event.clientX) / dom_element.clientWidth, 
		(event.clientY - state_in.starting_event.clientY) / dom_element.clientHeight, 
	);
	if (state_in.starting_event === undefined) {
		return;
	} else if (state_in.starting_event.button === 0) {
		Vector2.mult_scalar(offset, 2.0 * Math.PI, offset);
		ControllerMotions.orbit(state_in.starting_matrix, offset, state_out.matrix);
	} else if (state_in.starting_event.button === 1) {
		ControllerMotions.zoom(
			state_in.starting_matrix, 
			offset.y/100.0, 
			state_in.min_zoom_distance, 
			state_out.matrix
		);
	} else if ( state_in.starting_event.button === 2 ) { 
	}
}
OrbitalControls.mouseup = function ( state_in, event, state_out ) {
	state_out.starting_event = undefined;
	state_out.starting_matrix = undefined;
	console.log('mouseup', state_out.starting_event);
}
OrbitalControls.mousewheel = function ( state_in, event, state_out ) {
	ControllerMotions.zoom(
		state_in.matrix, 
		-(event.wheelDelta || -event.detail)/1000, 
		state_in.min_zoom_distance,
		state_out.matrix
	);
}

OrbitalControls.touchstart = function ( state_in, event, state_out ) {
	state_out.starting_event = event.button;
	state_out.starting_matrix = state_in.matrix;
}
OrbitalControls.touchmove = function ( state_in, event, state_out ) {
	if ( state_in.starting_event === undefined ) { return; }
	var dom_element = event.currentTarget === document ? event.currentTarget.body : event.currentTarget;
	if ( event.touches.length == 1 ) {
		if ( state_in.starting_event.touches === undefined ) { return; }
		if ( state_in.starting_event.touches.length !== 1 ) { return; }
		const offset = Vector2(
			 2.0 * Math.PI * (event.touches[0].pageX - state_in.starting_event.touches[0].pageX) / dom_element.clientWidth, 
			 2.0 * Math.PI * (event.touches[0].pageY - state_in.starting_event.touches[0].pageY) / dom_element.clientHeight, 
		);
		ControllerMotions.orbit(state_in.starting_matrix, offset, state_out.matrix);
	}
	else if ( event.touches.length == 2 ) {
		if ( state_in.starting_event.touches === undefined ) { return; }
		if ( state_in.starting_event.touches.length !== 2 ) { return; }
		var dx0 = event.touches[0].pageX - event.touches[1].pageX;
		var dy0 = event.touches[0].pageY - event.touches[1].pageY;
		var dx1 = event.touches[0].pageX - event.touches[1].pageX;
		var dy1 = event.touches[0].pageY - event.touches[1].pageY;
		var distance0 = Math.sqrt( dx0 * dx0 + dy0 * dy0 );
		var distance1 = Math.sqrt( dx1 * dx1 + dy1 * dy1 );
		ControllerMotions.zoom(
			state_in.starting_matrix, 
			distance0 / distance1, 
			state_in.min_zoom_distance, 
			state_out.matrix
		);
	}
	else if ( event.touches.length == 3 ) {
		if ( state_in.starting_event.touches === undefined ) { return; }
		if ( state_in.starting_event.touches.length !== 3 ) { return; }
	}
}
OrbitalControls.touchend = function ( state_in, event, state_out ) {
	state_out.starting_event = undefined;
	state_out.starting_matrix = undefined;
}
