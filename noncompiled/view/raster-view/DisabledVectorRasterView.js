'use strict';

function DisabledVectorRasterView() {
	this.updateChart = function(data, raster, options) {};
	this.updateScene = function(scene, model, options) {};
	this.removeFromScene = function(scene) {};
	this.vertexShader = function(vertexShader) {};
	this.uniform = function(key, value) {};
	this.clone = function() {
		return new DisabledVectorRasterView();
	}
}

