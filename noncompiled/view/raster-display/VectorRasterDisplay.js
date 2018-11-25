'use strict';

function VectorRasterDisplay(options) {
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
