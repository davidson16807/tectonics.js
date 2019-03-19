'use strict';

function VectorWorldView(options) {
    var vectorRasterView = options['vectorRasterView'] || new VectorRasterView({});
    this.getField = options['getField'];

    this.clone = function() {
        return new VectorWorldView({ 
            vectorRasterView: vectorRasterView.clone(), 
            getField: options.getField,
        });
    }
    this.updateScene = function(gl_state, world, options) {

        // run getField()
        if (this.getField === void 0) {
            log_once("VectorView.getField is undefined.");
            this.removeFromScene(gl_state);
            return;
        }

        var raster = this.getField(world);

        if (raster === void 0) {
            log_once("VectorView.getField() returned undefined.");
            this.removeFromScene(gl_state);
            return;
        }
        if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
            log_once("VectorView.getField() did not return a VectorRaster.");
            this.removeFromScene(gl_state);
            return;
        }

        vectorRasterView.updateScene(gl_state, raster, options);
    };
    this.removeFromScene = function(gl_state) {
        vectorRasterView.removeFromScene(gl_state);
    };
    this.updateChart = function(data, world, options) {
        data.isEnabled = false;
    };
}
