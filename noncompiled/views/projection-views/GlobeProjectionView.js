'use strict';

function GlobeProjectionView() {
	var vertexShader = vertexShaders.orthographic;
	var subview = void 0;

	this.updateScene = function(gl_state, model, options) {
		// update view if needed
		if (subview !== options.subview) {
			this.removeFromScene(gl_state);
			subview = options.subview;
		}
		// invoke subview if present
		if (subview !== void 0) {
			subview.updateScene(gl_state, model, {
				...options, 
				vertexShader: 	vertexShader, 
				index: 			0,
			});
		}
	};
	this.removeFromScene = function(gl_state) {
		if (subview !== void 0) {
			subview.removeFromScene(gl_state);
		}
	};
	this.clone = function() {
		return new GlobeProjectionView();
	}
	this.updateChart = function(data, model, options) {
		subview.updateChart(data, model, options);
	};
}