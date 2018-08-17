'use strict';


function ThreeJsVectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
ThreeJsVectorDisplay.prototype.addTo = function(mesh) {};
ThreeJsVectorDisplay.prototype.removeFrom = function(mesh) {};
ThreeJsVectorDisplay.prototype.updateAttributes = function(geometry, world) {
	var geometry, displacement;
	var vector = geometry.vertices;

	var vector_model = this.getField(world);
	for(var i=0, li = vector_model.length; i<li; i++){
		var vector_i = 2*i+1;
		vector[vector_i] = vector_model[i]; 
	}
	geometry.verticesNeedUpdate = true;
}


function VectorFieldDisplay(options) {
	this.max = options['max'];
	this.getField = options['getField'];
}
VectorFieldDisplay.prototype.addTo = function(mesh) {};
VectorFieldDisplay.prototype.removeFrom = function(mesh) {};
VectorFieldDisplay.prototype.updateAttributes = function(geometry, world) {
	var offset_length = 1.02; 	// offset of arrow from surface of sphere, in radii
	var max_arrow_length = 0.1; // max arrow length, in radii

	var geometry, displacement;
	var vector = geometry.vertices;

	// run getField()
	if (this.getField === void 0) {
		log_once("VectorDisplay.getField is undefined.");
		return;
	}
	var vector_model = this.getField(world);
	if (vector_model === void 0) {
		log_once("VectorDisplay.getField() returned undefined.");
		return;
	}
	if (!(vector_model.x !== void 0) && !(vector_model.x instanceof Float32Array)) { 
		log_once("VectorDisplay.getField() did not return a VectorRaster.");
		return;
	}

	var max = this.max ||  Math.max.apply(null, VectorField.magnitude(vector_model));
		log_once(vector)
	var scaling = max_arrow_length / max;

	var pos = world.grid.pos;
	for(var i=0, li = vector_model.x.length; i<li; i++){
		var start = vector[2*i];
		start.x = offset_length * pos.x[i];
		start.y = offset_length * pos.y[i];
		start.z = offset_length * pos.z[i];
		var end = vector[2*i+1];
		end.x = vector_model.x[i] * scaling + start.x;
		end.y = vector_model.y[i] * scaling + start.y;
		end.z = vector_model.z[i] * scaling + start.z;
	}
	// geometry.vertices.needsUpdate = true;
	geometry.verticesNeedUpdate = true;
}


function DisabledVectorDisplay(options) {}
DisabledVectorDisplay.prototype.addTo = function(mesh) {
	var vector = mesh.geometry.vertices;
	for(var i=0, li = vector.length; i<li; i++){
		vector[i].x = 0;
		vector[i].y = 0;
		vector[i].z = 0;
	}
};
DisabledVectorDisplay.prototype.removeFrom = function(mesh) {};
DisabledVectorDisplay.prototype.updateAttributes = function(material, world) {}







var vectorDisplays = {};
vectorDisplays.disabled	= new DisabledVectorDisplay( {  } );
vectorDisplays.asthenosphere_velocity = new VectorFieldDisplay( { 
		getField: function (world, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = LithosphereModeling.get_asthenosphere_pressure(world.lithosphere.density.value(), pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			return gradient;
		} 
	} );
vectorDisplays.pos	= new VectorFieldDisplay( { 
	getField: function (world) {
		var pos = world.grid.pos;
		return pos;
	}
} );
vectorDisplays.pos2	= new VectorFieldDisplay( { 
	getField: function (world) {
		var rotationMatrix = Matrix3x3.RotationAboutAxis(world.eulerPole.x, world.eulerPole.y, world.eulerPole.z, 1);
		var pos = VectorField.mult_matrix(world.grid.pos, rotationMatrix);
		return pos;
	}
} );
vectorDisplays.aesthenosphere_velocity	= new VectorFieldDisplay( { 
		getField: world => world.lithosphere.aesthenosphere_velocity.value()
	} );

vectorDisplays.surface_air_velocity = new VectorFieldDisplay( {
		getField: world => world.atmosphere.surface_wind_velocity.value()
	} );


vectorDisplays.plate_velocity = new VectorFieldDisplay( {  
		getField: world => world.lithosphere.plate_velocity.value()
  	} ); 

