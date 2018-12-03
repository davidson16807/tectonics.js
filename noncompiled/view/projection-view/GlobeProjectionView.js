'use strict';

function GlobeProjectionView() {
	var vertexShader = vertexShaders.orthographic;
	var subview = void 0;

	this.updateScene = function(scene, model, options) {
		// update view if needed
		if (subview !== options.subview) {
			this.removeFromScene(scene);
			subview = options.subview;
		}
		// invoke subview if present
		if (subview !== void 0) {
			subview.updateScene(scene, model, {...options, vertexShader:vertexShader, index: 0});
		}
	};
	this.removeFromScene = function(scene) {
		if (subview !== void 0) {
			subview.removeFromScene(scene);
		}
	};
	this.clone = function() {
		return new GlobeProjectionView();
	}
	this.updateChart = function(data, model, options) {
		subview.updateChart(data, model, options);
	};
}