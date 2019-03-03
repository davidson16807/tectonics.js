'use strict';

function MapProjectionView(vertexShader) {
	var subview1 = void 0;
	var subview2 = void 0;
	this.clone = function() {
		return new MapProjectionView(vertexShader);
	}

	this.updateScene = function(gl_state, model, options) {
		// update view if needed
		if (subview1 !== options.subview) {
			this.removeFromScene(gl_state);
			subview1 = options.subview;
			subview2 = options.subview.clone();
		}
		// invoke subview if present
		if (subview1 !== void 0) {
			subview1.updateScene(gl_state, model, {
				...options, 
				vertexShader: 		vertexShader, 
				map_projection_offset: 				-0.75*Math.PI,
			});
			subview2.updateScene(gl_state, model, {
				...options, 
				vertexShader: 		vertexShader, 
				map_projection_offset:  			0.75*Math.PI,
			});
		}
	};
	this.removeFromScene = function(gl_state) {
		if (subview1 !== void 0) {
			subview1.removeFromScene(gl_state);
			subview2.removeFromScene(gl_state);
		}
	};
	this.updateChart = function(data, model, options) {
		subview1.updateChart(data, model, options);
	};
}