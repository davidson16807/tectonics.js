OrbitalControls.zoom = function(matrix_in, motion_outward, min_distance, matrix_out) {
	const position = Matrix4x4.get_translation(matrix_in);
	const distance = Vector3.magnitude(position.x, position.y, position.z);
	const height = distance - min_distance;
	const scale_factor = (height * Math.pow(2, motion_outward) + min_distance) / distance;
	Vector.mult_scalar(position.x, position.y, position.z, scale_factor, position);
	return Matrix4x4.set_translation(matrix_in, position, matrix_out);
}
OrbitalControls.orbit = function(matrix_in, motion_over_screen, matrix_out, scratch) {
    let rotation = scratch || Matrix4x4();
    Matrix4x4.from_rotation(1,0,0, mouse_motion.y, rotation);
    Matrix4x4.mult_matrix(matrix_in, rotation, matrix_out);
    Matrix4x4.from_rotation(0,1,0, mouse_motion.z, rotation);
    Matrix4x4.mult_matrix(matrix_in, rotation, matrix_out);
    return matrix_out;
}

const CONTROL_STATE = {
	matrix: Matrix4x4();
	mouse_click_type: undefined,
	touch_type: undefined,
}

function mousedown( state_in, event, state_out ) {
	state_out.mouse_click_type = event.button;
}
function mousemove( state_in, event, state_out ) {
	const motion = Vector(event.clientX, event.clientY);
	var element = CANVAS_TAG === document ? CANVAS_TAG.body : CANVAS_TAG;
	if ( state === MODE.ORBIT ) {
		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );
		// rotating across whole screen goes 360 degrees around
		scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
		// rotating up and down along whole screen attempts to go 360, but limited to 180
		scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );
		rotateStart.copy( rotateEnd );
	} else if ( state === MODE.DOLLY ) {
		dollyEnd.set( event.clientX, event.clientY );
		dollyDelta.subVectors( dollyEnd, dollyStart );
		if ( dollyDelta.y > 0 ) {
			scope.dollyIn();
		} else {
			scope.dollyOut();
		}
		dollyStart.copy( dollyEnd );
	} else if ( state === MODE.PAN ) { }
	// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
	scope.update();
}
function mouseup( state_in, event, state_out ) {
	state_out.mode = MOTION.NONE;
}
function mousewheel( state_in, event, state_out ) {
	OrbitalControls.zoom(state_in.matrix, ( event.wheelDelta || -event.detail ), state_out.matrix);
}

function touchstart( state_in, event, state_out ) {
	if ( scope.enabled === false ) { return; }
	if ( event.touches.length == 1 ) {
		state = MODE.TOUCH_ROTATE;
		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
	}
	if ( event.touches.length == 2 ) {
		state = MODE.TOUCH_DOLLY;
		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
		var distance = Math.sqrt( dx * dx + dy * dy );
		dollyStart.set( 0, distance );
	}
	if ( event.touches.length == 3 ) {
	}
}
function touchmove( state_in, event, state_out ) {
	var element = CANVAS_TAG === document ? CANVAS_TAG.body : CANVAS_TAG;
	if ( event.touches.length == 1 ) {
		if ( state !== MODE.TOUCH_ROTATE ) { return; }
		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );
		// rotating across whole screen goes 360 degrees around
		scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
		// rotating up and down along whole screen attempts to go 360, but limited to 180
		scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );
		rotateStart.copy( rotateEnd );
	}
	else if ( event.touches.length == 2 ) {
		if ( state !== MODE.TOUCH_DOLLY ) { return; }
		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
		var distance = Math.sqrt( dx * dx + dy * dy );
		dollyEnd.set( 0, distance );
		dollyDelta.subVectors( dollyEnd, dollyStart );
		if ( dollyDelta.y > 0 ) {
			scope.dollyOut();
		} else {
			scope.dollyIn();
		}
		dollyStart.copy( dollyEnd );
	}
	else if ( event.touches.length == 3 ) {
		if ( state !== MODE.TOUCH_PAN ) { return; }
		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		panDelta.subVectors( panEnd, panStart );
		
		scope.pan( panDelta );
		panStart.copy( panEnd );
	}
}
function touchend( state_in, event, state_out ) {
	state = MODE.NONE;
}
CANVAS_TAG.addEventListener( 
		'contextmenu', 
		function ( event ) { 
			event.preventDefault(); 
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'mousedown', 
		function ( event ) { 
			event.preventDefault();
			mousedown(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'mousewheel', 
		function ( event ) { 
			mousewheel(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'DOMMouseScroll', 
		function ( event ) { 
			mousewheel(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	); // firefox
CANVAS_TAG.addEventListener(
		'mousemove', 
		function ( event ) { 
			mousemove.preventDefault(); 
			mousedown(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'mouseup', 
		function ( event ) { 
			mouseup(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'keydown', 
		function ( event ) { 
			keydown(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'touchstart',  
		function ( event ) { 
			touchstart(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'touchend',  
		function ( event ) { 
			touchend(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
CANVAS_TAG.addEventListener(
		'touchmove',
		function ( event ) { 
			event.preventDefault();
			event.stopPropagation();
			touchmove(CONTROL_STATE, event, CONTROL_STATE);
		}, 
		false 
	);
