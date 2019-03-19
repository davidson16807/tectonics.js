'use strict';

// ScalarWorldRenderer takes as input a ScalarRasterRenderer, and a getField function, 
// and uses it to View a raster from a given world 
function ScalarWorldView(scalarRasterView, getField) {
    this.getField = getField;
    var preallocated = void 0;
    var scratch = void 0;

    this.clone = function() {
        return new ScalarWorldView(scalarRasterView.clone(), getField);
    }
    this.updateChart = function(data, world, options) {

        // run getField()
        if (this.getField === void 0) {
            log_once("ScalarWorldView.getField is undefined.");
            this.removeFromScene(gl_state);
            return;
        }

        var raster = this.getField(world, preallocated, scratch, options);

        if (raster === void 0) {
            log_once("ScalarWorldView.getField() returned undefined.");
            this.removeFromScene(gl_state);
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
            this.removeFromScene(gl_state);
            return;
        }

        scalarRasterView.updateChart(data, raster, options);
    };
    this.updateScene = function(gl_state, world, options) {

        preallocated = preallocated || Float32Raster(world.grid);
        scratch = scratch || Float32Raster(world.grid);

        // run getField()
        if (this.getField === void 0) {
            log_once("ScalarWorldView.getField is undefined.");
            this.removeFromScene(gl_state);
            return;
        }

        var raster = this.getField(world, preallocated, scratch, options);

        if (raster === void 0) {
            log_once("ScalarWorldView.getField() returned undefined.");
            this.removeFromScene(gl_state);
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
            this.removeFromScene(gl_state);
            return;
        }

		scalarRasterView.updateScene(gl_state, raster, Object.assign({
			sealevel: world.hydrosphere.sealevel.value(),
			displacement: world.lithosphere.displacement.value(),
            world_radius: world.radius,
		}, options));	

        var mesh = scalarRasterView.mesh;
    };
    this.removeFromScene = function(gl_state) {
        scalarRasterView.removeFromScene(gl_state);
        preallocated = void 0;
        scratch = void 0;
    };
}