'use strict';

function VectorRasterView(options) {
	this.max = options['max'];


	this.mesh = void 0;
	var mesh = void 0;
	var vertexShader = void 0;

	function create_mesh(raster, options) {
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
			  		index: 		{ type: 'f', value: 0 }
		        }
		    });
		return new THREE.Line( geometry, material, THREE.LinePieces);
	}
	function update_vertex_shader(value) {
		if (vertexShader !== value) {
			vertexShader = value;
			mesh.material.vertexShader = value; 
			mesh.material.needsUpdate = true; 
		}
	}

	this.upsert = function(scene, raster, options) {

		if (mesh === void 0) {
			mesh = create_mesh(raster, options);
			vertexShader = options.vertexShader;
			scene.add(mesh);

			// HACK: we expose mesh here so WorldViews can modify as they see fit, 
			// 	  namely for displacement and sealevel attributes
			this.mesh = mesh; 
		} 

		update_vertex_shader(options.vertexShader);

		var offset_length = 1.02; 	// offset of arrow from surface of sphere, in radii
		var max_arrow_length = 0.1; // max arrow length, in radii
		var vector = mesh.geometry.vertices;

		var max = this.max ||  Math.max.apply(null, VectorField.magnitude(raster));
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
		mesh.geometry.verticesNeedUpdate = true;
	};
	this.remove = function(scene) {
		if (mesh !== void 0) {
			scene.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
			mesh = void 0;
			this.mesh = void 0;
		}
	};
	this.clone = function() {
		return new VectorRasterView(options);
	}
}
