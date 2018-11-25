'use strict';

function VectorWorldDisplay(options) {
	this.vectorRasterDisplay = options['vectorRasterDisplay'] || new VectorRasterDisplay({});
	this.getField = options['getField'];
	this.upsert = function(scene, world, options) {
		// run getField()
		if (this.getField === void 0) {
			log_once("VectorDisplay.getField is undefined.");
			return;
		}
		var raster = this.getField(world);

		if (raster === void 0) {
			log_once("VectorDisplay.getField() returned undefined.");
			return;
		}
		if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
			log_once("VectorDisplay.getField() did not return a VectorRaster.");
			return;
		}

		this.vectorRasterDisplay.upsert(scene, raster, options);
	};
	this.remove = function(scene) {
		this.vectorRasterDisplay.remove(scene);
	};
}
