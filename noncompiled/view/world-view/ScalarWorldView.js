'use strict';

// ScalarWorldRenderer takes as input a ScalarRasterRenderer, and a getField function, 
// and uses it to View a raster from a given world 
function ScalarWorldView(scalarRasterView, getField) {
	this.getField = getField;
	var preallocated = void 0;
	var scratch = void 0;

	this.updateChart = function(data, world, options) {

		// run getField()
		if (this.getField === void 0) {
			log_once("ScalarWorldView.getField is undefined.");
			this.removeFromScene(scene);
			return;
		}

		var raster = this.getField(world, preallocated, scratch, options);

		if (raster === void 0) {
			log_once("ScalarWorldView.getField() returned undefined.");
			this.removeFromScene(scene);
			return;
		}
		if (raster instanceof Uint8Array) {
			raster = Float32Raster.FromUint8Raster(raster);
		}
		if (raster instanceof Uint16Array) {
			raster = Float32Raster.FromUint16Raster(raster);
		}
		if (!(raster instanceof Float32Array)) { 
			log_once("ScalarWorldView.getField() did not return a TypedArray.");
			this.removeFromScene(scene);
			return;
		}

		scalarRasterView.updateChart(data, raster, options);
	};
	this.updateScene = function(scene, world, options) {

		preallocated = preallocated || Float32Raster(world.grid);
		scratch = scratch || Float32Raster(world.grid);

		// run getField()
		if (this.getField === void 0) {
			log_once("ScalarWorldView.getField is undefined.");
			this.removeFromScene(scene);
			return;
		}

		var raster = this.getField(world, preallocated, scratch, options);

		if (raster === void 0) {
			log_once("ScalarWorldView.getField() returned undefined.");
			this.removeFromScene(scene);
			return;
		}
		if (raster instanceof Uint8Array) {
			raster = Float32Raster.FromUint8Raster(raster);
		}
		if (raster instanceof Uint16Array) {
			raster = Float32Raster.FromUint16Raster(raster);
		}
		if (!(raster instanceof Float32Array)) { 
			log_once("ScalarWorldView.getField() did not return a TypedArray.");
			this.removeFromScene(scene);
			return;
		}

		scalarRasterView.updateScene(scene, raster, { 
			...options, 
			sealevel: 		world.hydrosphere.sealevel.value(), 
			displacement: 	world.lithosphere.displacement.value() 
		});	

		var mesh = scalarRasterView.mesh;
	};
	this.removeFromScene = function(scene) {
		scalarRasterView.removeFromScene(scene);
		preallocated = void 0;
		scratch = void 0;
	};
	this.clone = function() {
		return new ScalarWorldView(scalarRasterView.clone(), getField);
	}
}