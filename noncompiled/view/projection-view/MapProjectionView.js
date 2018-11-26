'use strict';

function MapProjectionView(vertexShader) {
	var subview1 = void 0;
	var subview2 = void 0;

	this.upsert = function(scene, model, options) {
		// update view if needed
		if (subview1 !== options.subview) {
			this.remove(scene);
			subview1 = options.subview;
			subview2 = options.subview.clone();
		}
		// invoke subview if present
		if (subview1 !== void 0) {
			subview1.upsert(scene, model, {...options, vertexShader:vertexShader, index: -1});
			subview2.upsert(scene, model, {...options, vertexShader:vertexShader, index:  1});
		}
	};
	this.remove = function(scene) {
		if (subview1 !== void 0) {
			subview1.remove(scene);
			subview2.remove(scene);
		}
	};
	this.clone = function() {
		return new MapProjectionView(vertexShader);
	}
}