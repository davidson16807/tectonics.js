'use strict';

// ScalarWorldRenderer takes as input a ScalarRasterRenderer, and a getField function, 
// and uses it to View a raster from a given world 
function ScalarWorldView(scalarRasterView, getField) {
	this.getField = getField;
	this.field = void 0;
	var scratch = void 0;

	this.upsert = function(scene, world, options) {

		this.field = this.field || Float32Raster(world.grid);
		scratch = scratch || Float32Raster(world.grid);

		// run getField()
		if (this.getField === void 0) {
			log_once("ScalarWorldView.getField is undefined.");
			this.remove(scene);
			return;
		}

		var raster = this.getField(world, this.field, scratch, options);

		if (raster === void 0) {
			log_once("ScalarWorldView.getField() returned undefined.");
			this.remove(scene);
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
			this.remove(scene);
			return;
		}

		scalarRasterView.upsert(scene, raster, options);	

		var mesh = scalarRasterView.mesh;

		mesh.material.uniforms['sealevel'].value = world.hydrosphere.sealevel.value();
		mesh.material.uniforms['sealevel'].needsUpdate = true;

		Float32Raster.get_ids(world.lithosphere.displacement.value(), world.grid.buffer_array_to_cell, mesh.geometry.attributes.displacement.array); 
		mesh.geometry.attributes.displacement.needsUpdate = true;

	};
	this.remove = function(scene) {
		scalarRasterView.remove(scene);
		this.field = void 0;
		scratch = void 0;
	};
	this.clone = function() {
		return new ScalarWorldView(scalarRasterView.clone(), getField);
	}
}