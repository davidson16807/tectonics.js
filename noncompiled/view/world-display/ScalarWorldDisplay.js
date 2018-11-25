'use strict';

// ScalarWorldRenderer takes as input a ScalarRasterRenderer, and a getField function, 
// and uses it to display a raster from a given world 
function ScalarWorldDisplay(scalarRasterDisplay, getField) {
	this.scalarRasterDisplay = scalarRasterDisplay;
	this.getField = getField;
	this.field = void 0;
	this.scratch = void 0;

	this.upsert = function(scene, world, options) {

		this.field = this.field || Float32Raster(world.grid);
		this.scratch = this.scratch || Float32Raster(world.grid);

		// run getField()
		if (this.getField === void 0) {
			log_once("ScalarWorldDisplay.getField is undefined.");
			return;
		}

		var raster = this.getField(world, this.field, this.scratch);

		if (raster === void 0) {
			log_once("ScalarWorldDisplay.getField() returned undefined.");
			return;
		}
		if (raster instanceof Uint8Array) {
			raster = Float32Raster.FromUint8Raster(raster);
		}
		if (raster instanceof Uint16Array) {
			raster = Float32Raster.FromUint16Raster(raster);
		}
		if (!(raster instanceof Float32Array)) { 
			log_once("ScalarWorldDisplay.getField() did not return a TypedArray.");
			return;
		}
		if (raster !== void 0) {
			this.scalarRasterDisplay.upsert(scene, raster, options);	
		} else {
			this.field = void 0;
		}

		var mesh = this.scalarRasterDisplay.mesh;
		var material = mesh.material;
		var geometry = mesh.geometry;

		material.uniforms['sealevel'].value = world.hydrosphere.sealevel.value();
		material.uniforms['sealevel'].needsUpdate = true;

		Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
		geometry.attributes.displacement.needsUpdate = true;

	};
	this.remove = function(scene) {
		this.scalarRasterDisplay.remove(scene);
	};
}