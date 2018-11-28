'use strict';

function GlobeProjectionView() {
	var vertexShader = vertexShaders.orthographic;
	var subview = void 0;

	this.upsert = function(scene, model, options) {
		// update view if needed
		if (subview !== options.subview) {
			this.remove(scene);
			subview = options.subview;
		}
		// invoke subview if present
		if (subview !== void 0) {
			subview.upsert(scene, model, {...options, vertexShader:vertexShader, index: 0});
		}
	};
	this.remove = function(scene) {
		if (subview !== void 0) {
			subview.remove(scene);
		}
	};
	this.clone = function() {
		return new GlobeProjectionView();
	}
	this.updateChart = function(data, model, options) {
		subview.updateChart(data, model, options);
	};
}