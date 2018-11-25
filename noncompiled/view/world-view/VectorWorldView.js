'use strict';

function VectorWorldView(options) {
	this.vectorRasterView = options['vectorRasterView'] || new VectorRasterView({});
	this.getField = options['getField'];
	this.upsert = function(scene, world, options) {
		// run getField()
		if (this.getField === void 0) {
			log_once("VectorView.getField is undefined.");
			return;
		}
		var raster = this.getField(world);

		if (raster === void 0) {
			log_once("VectorView.getField() returned undefined.");
			return;
		}
		if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
			log_once("VectorView.getField() did not return a VectorRaster.");
			return;
		}

		this.vectorRasterView.upsert(scene, raster, options);
	};
	this.remove = function(scene) {
		this.vectorRasterView.remove(scene);
	};
}
