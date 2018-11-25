'use strict';



function VectorWorldDisplay(options) {
	this.vectorRasterDisplay = options['vectorRasterDisplay'] || new VectorFieldDisplay({});
	this.getField = options['getField'];
	this.upsert = function(scene, world, options) {
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

		this.vectorRasterDisplay.upsert(scene, raster, options);
	};
	this.remove = function(scene) {
		this.vectorRasterDisplay.remove(scene);
	};
}



function VectorFieldDisplay(options) {
	this.max = options['max'];
	this.mesh = void 0;
	this.upsert = function(scene, raster, options) {

		if (this.mesh === void 0) {
			var grid = raster.grid;
			var geometry = new THREE.Geometry();
			for (var i=0, li=grid.vertices.length; i<li; ++i) {
			    geometry.vertices.push( grid.vertices[i].clone() );
			    geometry.vertices.push( grid.vertices[i].clone() );
			}
			var material = new THREE.ShaderMaterial({
			        vertexShader: 	options.vertexShader,
			        fragmentShader: fragmentShaders.vectorField,
			        attributes: {
			        },
			        uniforms: { 
				  		index: 		{ type: 'f', value: 1 }
			        }
			    });
			var mesh = new THREE.Line( geometry, material, THREE.LinePieces);
			scene.add(mesh);
			this.mesh = mesh;
		}

		var mesh = this.mesh;
		var material = mesh.material;
		var geometry = mesh.geometry;

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
	};
	this.remove = function(scene) {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.mesh = undefined;
	};
}


function DisabledVectorDisplay() {}
DisabledVectorDisplay.prototype.upsert = function(scene, model, options) {};
DisabledVectorDisplay.prototype.remove = function(scene) {};







var vectorDisplays = {};
vectorDisplays.disabled	= new DisabledVectorDisplay();
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

