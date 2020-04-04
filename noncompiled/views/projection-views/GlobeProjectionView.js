'use strict';

function GlobeProjectionView() {
    const vertexShader = vertexShaders.orthographic;
    let subview = void 0;
    this.clone = function() {
        return new GlobeProjectionView();
    }

    this.updateScene = function(gl_state, model, options) {
        // update view if needed
        if (subview !== options.subview) {
            this.removeFromScene(gl_state);
            subview = options.subview;
        }
        // invoke subview if present
        if (subview !== void 0) {
            subview.updateScene(gl_state, model, 
                Object.assign({
                    vertexShader:     vertexShader, 
                    shaderpass_visibility: 1,
                    map_projection_offset: 0,
                }, options), 
            );
        }
    };
    this.removeFromScene = function(gl_state) {
        if (subview !== void 0) {
            subview.removeFromScene(gl_state);
        }
    };
    this.updateChart = function(data, model, options) {
        subview.updateChart(data, model, options);
    };
}