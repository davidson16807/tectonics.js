'use strict';



function VectorWorldDisplay(options) {
	this.vectorRasterRenderer = options['vectorRasterRenderer'] || new VectorFieldDisplay({});
	this.getField = options['getField'];
}
VectorWorldDisplay.prototype.addTo = function(mesh) {
	this.vectorRasterRenderer.addTo(mesh);
};
VectorWorldDisplay.prototype.removeFrom = function(mesh) {
	this.vectorRasterRenderer.removeFrom(mesh);
};
VectorWorldDisplay.prototype.updateUniforms = function(material, world) {};
VectorWorldDisplay.prototype.updateAttributes = function(geometry, world) {
	// run getField()
	if (this.getField === void 0) {
		log_once("VectorDisplay.getField is undefined.");
		return;
	}
	var raster = this.getField(world);

	if (raster === void 0) {
		log_once("VectorDisplay.getField() returned undefined.");
		return;
	}
	if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
		log_once("VectorDisplay.getField() did not return a VectorRaster.");
		return;
	}
	this.vectorRasterRenderer.displayRaster(geometry, raster);
}



function VectorFieldDisplay(options) {
	this.max = options['max'];
}
VectorFieldDisplay.prototype.addTo = function(mesh) {};
VectorFieldDisplay.prototype.removeFrom = function(mesh) {
	var vector = mesh.geometry.vertices;
	for(var i=0, li = vector.length; i<li; i++){
		vector[i].x = 0;
		vector[i].y = 0;
		vector[i].z = 0;
	}
};
VectorFieldDisplay.prototype.updateUniforms = function(material, raster) {};
VectorFieldDisplay.prototype.updateAttributes = function(geometry, raster) {
	var offset_length = 1.02; 	// offset of arrow from surface of sphere, in radii
	var max_arrow_length = 0.1; // max arrow length, in radii
	var vector = geometry.vertices;

	var max = this.max ||  Math.max.apply(null, VectorField.magnitude(raster));
		log_once(vector)
	var scaling = max_arrow_length / max;

	var pos = raster.grid.pos;
	for(var i=0, li = raster.x.length; i<li; i++){
		var start = vector[2*i];
		start.x = offset_length * pos.x[i];
		start.y = offset_length * pos.y[i];
		start.z = offset_length * pos.z[i];
		var end = vector[2*i+1];
		end.x = raster.x[i] * scaling + start.x;
		end.y = raster.y[i] * scaling + start.y;
		end.z = raster.z[i] * scaling + start.z;
	}
	// geometry.vertices.needsUpdate = true;
	geometry.verticesNeedUpdate = true;
}


function DisabledVectorDisplay(options) {}
DisabledVectorDisplay.prototype.addTo = function(mesh) {};
DisabledVectorDisplay.prototype.removeFrom = function(mesh) {};
DisabledVectorDisplay.prototype.updateUniforms = function(material, world) {}
DisabledVectorDisplay.prototype.updateAttributes = function(geometry, world) {}







var vectorDisplays = {};
vectorDisplays.disabled	= new DisabledVectorDisplay( {  } );
vectorDisplays.asthenosphere_velocity = new VectorWorldDisplay( { 
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
vectorDisplays.pos	= new VectorWorldDisplay( { 
	getField: function (world) {
		var pos = world.grid.pos;
		return pos;
	}
} );
vectorDisplays.pos2	= new VectorWorldDisplay( { 
	getField: function (world) {
		var rotationMatrix = Matrix3x3.RotationAboutAxis(world.eulerPole.x, world.eulerPole.y, world.eulerPole.z, 1);
		var pos = VectorField.mult_matrix(world.grid.pos, rotationMatrix);
		return pos;
	}
} );
vectorDisplays.aesthenosphere_velocity	= new VectorWorldDisplay( { 
		getField: world => world.lithosphere.aesthenosphere_velocity.value()
	} );

vectorDisplays.surface_air_velocity = new VectorWorldDisplay( {
		getField: world => world.atmosphere.surface_wind_velocity.value()
	} );


vectorDisplays.plate_velocity = new VectorWorldDisplay( {  
		getField: world => world.lithosphere.plate_velocity.value()
  	} ); 

