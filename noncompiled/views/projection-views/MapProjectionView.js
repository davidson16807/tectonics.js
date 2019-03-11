'use strict';

function MapProjectionView(vertexShader) {
	var subview1 = void 0;
	var subview2 = void 0;

	this.updateScene = function(scene, model, options) {
		// update view if needed
		if (subview1 !== options.subview) {
			this.removeFromScene(scene);
			subview1 = options.subview;
			subview2 = options.subview.clone();
		}
		// invoke subview if present
		if (subview1 !== void 0) {
			subview1.updateScene(scene, model, Object.assign({vertexShader:vertexShader, index: -1}, options));
			subview2.updateScene(scene, model, Object.assign({vertexShader:vertexShader, index:  1}, options));
		}
	};
	this.removeFromScene = function(scene) {
		if (subview1 !== void 0) {
			subview1.removeFromScene(scene);
			subview2.removeFromScene(scene);
		}
	};
	this.clone = function() {
		return new MapProjectionView(vertexShader);
	}
	this.updateChart = function(data, model, options) {
		subview1.updateChart(data, model, options);
	};
}