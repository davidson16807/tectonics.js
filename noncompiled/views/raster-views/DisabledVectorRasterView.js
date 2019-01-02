'use strict';

function DisabledVectorRasterView() {
	this.updateChart = function(data, raster, options) {};
	this.updateScene = function(gl_state, model, options) {};
	this.removeFromScene = function(gl_state) {};
	this.vertexShader = function(vertexShader) {};
	this.uniform = function(key, value) {};
	this.clone = function() {
		return new DisabledVectorRasterView();
	}
}

