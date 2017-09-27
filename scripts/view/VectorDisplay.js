'use strict';

var vectorDisplays = {};

function ThreeJsVectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
ThreeJsVectorDisplay.prototype.addTo = function(mesh) {};
ThreeJsVectorDisplay.prototype.removeFrom = function(mesh) {};
ThreeJsVectorDisplay.prototype.updateAttributes = function(material, plate) {
	var material, displacement;
	var vector = material.attributes.vector.value;

	var vector_model = this.getField(plate);
	for(var i=0, li = vector_model.length; i<li; i++){
		var vector_i = 2*i+1;
		vector[vector_i] = vector_model[i]; 
	}
	material.attributes.vector.needsUpdate = true;
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
VectorFieldDisplay.prototype.updateAttributes = function(material, plate) {
	var offset_length = 0.02; 	// offset of arrow from surface of sphere, in radii
	var max_arrow_length = 0.1; // max arrow length, in radii

	var material, displacement;
	var vector = material.attributes.vector.value;

	var vector_model = this.getField(plate);
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
	material.attributes.vector.needsUpdate = true;
}
vectorDisplays.pos	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var pos = plate.grid.pos;
		return pos;
	}
} );
vectorDisplays.pos2	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationAxis( plate.eulerPole, 1 );
		var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix.toArray());
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
vectorDisplays.subductability_gradient	= new VectorFieldDisplay( { 
	getField: function (plate) {
		var subductability = plate.subductability;
		var gradient = ScalarField.gradient(subductability);
		return gradient;
	}
} );
vectorDisplays.subductability_smoothed = new VectorFieldDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			return gradient;
		} 
	} );

vectorDisplays.aesthenosphere_velocity	= new VectorFieldDisplay( { 
		getField: function (crust) {
			return crust.aesthenosphere_velocity;
		}
	} );

var last_x = void 0;
function log_unique(x) {
	if(x !== last_x){
		console.log(x);
	}
}
function log_once(x) {
	console.log(x);
	log_once = function(x){};
}
function DisabledVectorDisplay(options) {}
DisabledVectorDisplay.prototype.addTo = function(mesh) {
	var vector = mesh.material.attributes.vector.value;
	for(var i=0, li = vector.length; i<li; i++){
		vector[i] = new THREE.Vector3(); 
	}
};
DisabledVectorDisplay.prototype.removeFrom = function(mesh) {};
DisabledVectorDisplay.prototype.updateAttributes = function(material, plate) {}
vectorDisplays.disabled	= new DisabledVectorDisplay( {  } );
