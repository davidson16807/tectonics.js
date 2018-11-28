'use strict';

function VectorWorldView(options) {
	var vectorRasterView = options['vectorRasterView'] || new VectorRasterView({});
	this.getField = options['getField'];
	this.field = void 0;
	var scratch = void 0;

	this.upsert = function(scene, world, options) {

		this.field = this.field || VectorRaster(world.grid);
		scratch = scratch || VectorRaster(world.grid);
		
		// run getField()
		if (this.getField === void 0) {
			log_once("VectorView.getField is undefined.");
			this.remove(scene);
			return;
		}

		var raster = this.getField(world, this.field, scratch, options);

		if (raster === void 0) {
			log_once("VectorView.getField() returned undefined.");
			this.remove(scene);
			return;
		}
		if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
			log_once("VectorView.getField() did not return a VectorRaster.");
			this.remove(scene);
			return;
		}

		vectorRasterView.upsert(scene, raster, options);
	};
	this.remove = function(scene) {
		vectorRasterView.remove(scene);
		this.field = void 0;
		scratch = void 0;
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
