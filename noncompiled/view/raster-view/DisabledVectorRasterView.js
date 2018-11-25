'use strict';

function DisabledVectorRasterView() {
	this.upsert = function(scene, model, options) {};
	this.remove = function(scene) {};
	this.vertexShader = function(vertexShader) {}
	this.uniform = function(key, value) {}
}

