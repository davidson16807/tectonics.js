'use strict';

function VectorWorldView(options) {
	var vectorRasterView = options['vectorRasterView'] || new VectorRasterView({});
	this.getField = options['getField'];

	this.updateScene = function(scene, world, options) {

		// run getField()
		if (this.getField === void 0) {
			log_once("VectorView.getField is undefined.");
			this.removeFromScene(scene);
			return;
		}

		var raster = this.getField(world);

		if (raster === void 0) {
			log_once("VectorView.getField() returned undefined.");
			this.removeFromScene(scene);
			return;
		}
		if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
			log_once("VectorView.getField() did not return a VectorRaster.");
			this.removeFromScene(scene);
			return;
		}

		vectorRasterView.updateScene(scene, raster, options);
	};
	this.removeFromScene = function(scene) {
		vectorRasterView.removeFromScene(scene);
	};
	this.clone = function() {
		return new VectorWorldView({ 
			vectorRasterView: vectorRasterView.clone(), 
			getField: options.getField,
		});
	}
	this.updateChart = function(data, world, options) {
		data.isEnabled = false;
	};
}
