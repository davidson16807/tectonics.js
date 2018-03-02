'use strict';

var vectorDisplays = {};

function ThreeJsVectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
ThreeJsVectorDisplay.prototype.addTo = function(mesh) {};
ThreeJsVectorDisplay.prototype.removeFrom = function(mesh) {};
ThreeJsVectorDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement;
	var vector = geometry.vertices;

	var vector_model = this.getField(plate);
	for(var i=0, li = vector_model.length; i<li; i++){
		var vector_i = 2*i+1;
		vector[vector_i] = vector_model[i]; 
	}
	geometry.verticesNeedUpdate = true;
}
vectorDisplays.angularVelocity	= new ThreeJsVectorDisplay( { 
	getField: function (plate) {
		var field = [];
		var pos = plate.grid.pos;
		var vector = plate.eulerPole.clone().multiplyScalar(1/17);
		for (var i=0, li=pos.length; i<li; ++i) {
		    field.push(vector);
		}
		return field;
	}
} );
vectorDisplays.velocity	= new ThreeJsVectorDisplay( { 
	getField: function (plate) {
		var field = [];
		var positions_model = plate.grid.pos;
		for (var i=0, li=positions_model.length; i<li; ++i) {
			var velocity = plate.eulerPole
				.clone()
				.cross(positions_model[i])
				.normalize()
				.multiplyScalar(0.17) 
		    field.push(velocity);
		}
		return field;
	}
} );


function VectorFieldDisplay(options) {
	this.max = options['max'];
	this.getField = options['getField'];
}
VectorFieldDisplay.prototype.addTo = function(mesh) {};
VectorFieldDisplay.prototype.removeFrom = function(mesh) {};
VectorFieldDisplay.prototype.updateAttributes = function(geometry, plate) {
	var offset_length = 1.02; 	// offset of arrow from surface of sphere, in radii
	var max_arrow_length = 0.1; // max arrow length, in radii

	var geometry, displacement;
	var vector = geometry.vertices;

	// run getField()
	if (this.getField === void 0) {
		log_once("VectorDisplay.getField is undefined.");
		return;
	}
	var vector_model = this.getField(plate);
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

	var pos = plate.grid.pos;
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
vectorDisplays.pos	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var pos = plate.grid.pos;
		return pos;
	}
} );
vectorDisplays.pos2	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var rotationMatrix = Matrix.RotationAboutAxis(plate.eulerPole.x, plate.eulerPole.y, plate.eulerPole.z, 1);
		var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix);
		return pos;
	}
} );
vectorDisplays.displacement_gradient	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var displacement = plate.displacement;
		var gradient = ScalarField.gradient(displacement);
		return gradient;
	}
} );
vectorDisplays.age_gradient	= new VectorFieldDisplay( { 
	getField: function (plate) {
		return ScalarField.gradient(plate.age);
	}
} );
vectorDisplays.pos_gradient	= new VectorFieldDisplay( { 
	getField: function (plate) {
		return ScalarField.gradient(plate.grid.pos);
	}
} );
vectorDisplays.density_gradient	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var density = plate.density;
		var gradient = ScalarField.gradient(density);
		return gradient;
	}
} );
vectorDisplays.density_smoothed = new VectorFieldDisplay( { 
		getField: function (plate) {
			var field = getdensitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			return gradient;
		} 
	} );

vectorDisplays.aesthenosphere_velocity	= new VectorFieldDisplay( { 
		getField: function (crust) {
			return crust.aesthenosphere_velocity;
		}
	} );

vectorDisplays.surface_air_velocity = new VectorFieldDisplay( {
		getField: function (world) {
			var lat = Float32SphereRaster.latitude(world.grid.pos.y);
			var pressure = AtmosphericModeling.surface_air_pressure(world.displacement, lat, world.SEALEVEL, world.meanAnomaly, Math.PI*23.5/180);
			var velocity = AtmosphericModeling.surface_air_velocity(world.grid.pos, pressure, ANGULAR_SPEED);
			return velocity;
		} 
	} );


vectorDisplays.plate_velocity = new VectorFieldDisplay( {  
    getField: function (world) { 
      var grid = world.grid; 
      var plates = world.plates; 
      var plate_map = world.plate_map; 
      var plate_velocity = VectorRaster(grid); 
      var all_velocities = VectorRaster(grid); 
      var add_term = VectorField.add_vector_field_and_scalar_field_term; 
      var cross = VectorField.cross_vector; 
      var eq = Uint8Field.eq_scalar;
      var pos = grid.pos; 
      var is_plate = Uint8Raster(grid); 
      var plate; 
      for (var i=0, li=plates.length; i<li; ++i) { 
        plate = plates[i]; 
        cross(pos, plate.eulerPole, plate_velocity); 
        eq(plate_map, i, is_plate); 
        add_term(all_velocities, plate_velocity, is_plate, all_velocities); 
      } 
      return all_velocities; 
    }  
  } ); 

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
DisabledVectorDisplay.prototype.updateAttributes = function(material, plate) {}
vectorDisplays.disabled	= new DisabledVectorDisplay( {  } );
