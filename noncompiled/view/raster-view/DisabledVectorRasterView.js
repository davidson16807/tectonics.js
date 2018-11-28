'use strict';

function DisabledVectorRasterView() {
	this.upsert = function(scene, model, options) {};
	this.remove = function(scene) {};
	this.vertexShader = function(vertexShader) {};
	this.uniform = function(key, value) {};
	this.clone = function() {
		return new DisabledVectorRasterView();
	}
	this.updateChart = function(data, raster, options) {};
}

