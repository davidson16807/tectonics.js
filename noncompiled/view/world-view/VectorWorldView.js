'use strict';

function VectorWorldView(options) {
	var vectorRasterView = options['vectorRasterView'] || new VectorRasterView({});
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

		vectorRasterView.upsert(scene, raster, options);
	};
	this.remove = function(scene) {
		vectorRasterView.remove(scene);
	};
	this.vertexShader = function(vertexShader) {
		vectorRasterView.vertexShader(vertexShader);
	}
	this.uniform = function(key, value) {
		vectorRasterView.uniform(key, value);
	}
	this.clone = function() {
		return new VectorWorldView({ vectorRasterView: vectorRasterView.clone() });
	}
}
