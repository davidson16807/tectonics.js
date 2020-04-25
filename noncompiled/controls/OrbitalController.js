'use strict';

/*
"OrbitalController" is a small class whose only job is to seal off
private event handlers for the control scheme described within the 
"OrbitalControls" namespace. 
This comprises everything which cannot otherwise be made pure or stateless.
*/
function OrbitalController(state, matrix) {
	function contextmenu( event ) { 
		event.preventDefault(); 
	};
	function mousedown( event ) { 
		event.preventDefault();
		OrbitalControls.mousedown(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	};
	function mousemove( event ) { 
		event.preventDefault(); 
		OrbitalControls.mousemove(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	};
	function mouseup( event ) { 
		OrbitalControls.mouseup(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	}
	function mousewheel( event ) { 
		OrbitalControls.mousewheel(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	};
	function touchstart( event ) { 
		OrbitalControls.touchstart(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	};
	function touchmove( event ) { 
		event.preventDefault();
		event.stopPropagation();
		OrbitalControls.touchmove(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	};
	function touchend( event ) { 
		OrbitalControls.touchend(state, event, state);
		OrbitalControls.State.get_view_matrix(state, matrix);
	};
	this.addToDomElement = function(domElement) {
		domElement.addEventListener   ('contextmenu',    contextmenu, false);
		domElement.addEventListener   ('mousedown',      mousedown,   false);
		domElement.addEventListener   ('mousemove',      mousemove,   false);
		domElement.addEventListener   ('mouseup',        mouseup,     false);
		domElement.addEventListener   ('mousewheel',     mousewheel,  false);
		domElement.addEventListener   ('DOMMouseScroll', mousewheel,  false);
		domElement.addEventListener   ('touchstart',     touchstart,  false);
		domElement.addEventListener   ('touchmove',      touchmove,   false);
		domElement.addEventListener   ('touchend',       touchend,    false);
	};
	this.removeFromDomElement = function(domElement) {
		domElement.removeEventListener('contextmenu',    contextmenu, false);
		domElement.removeEventListener('mousedown',      mousedown,   false);
		domElement.removeEventListener('mousemove',      mousemove,   false);
		domElement.removeEventListener('mouseup',        mouseup,     false);
		domElement.removeEventListener('mousewheel',     mousewheel,  false);
		domElement.removeEventListener('DOMMouseScroll', mousewheel,  false);
		domElement.removeEventListener('touchstart',     touchstart,  false);
		domElement.removeEventListener('touchmove',      touchmove,   false);
		domElement.removeEventListener('touchend',       touchend,    false);
	
	}
};