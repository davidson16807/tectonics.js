'use strict';

function VectorRasterView(options) {
	this.max = options['max'];


	this.mesh = void 0;
	var mesh = void 0;
	var vertexShader = void 0;
	var uniforms = {};

	function create_mesh(raster, options_) {
		var grid = raster.grid;
		var geometry = new THREE.Geometry();
		var material = new THREE.ShaderMaterial({
		        vertexShader: 	options_.vertexShader,
		        fragmentShader: fragmentShaders.vectorField,
		        attributes: {
					vector_fraction_traversed: { type: 'f', value: [] },
		        },
		        uniforms: { 
			  		index: 		{ type: 'f', value: options_.index },
			  		animation_phase_angle: 		{ type: 'f', value: 0 }
		        }
		    });
		var v = {x:0, y:0, z:0};
		for (var i=0, li=grid.vertices.length; i<li; ++i) {
			v = grid.vertices[i];
		    geometry.vertices.push({x:v.x, y:v.y, z:v.z});
		    geometry.vertices.push({x:v.x, y:v.y, z:v.z});
		    material.attributes.vector_fraction_traversed.value.push(0);
		    material.attributes.vector_fraction_traversed.value.push(1);
		}
		return new THREE.Line( geometry, material, THREE.LinePieces);
	}
	function update_vertex_shader(value) {
		if (vertexShader !== value) {
			vertexShader = value;
			mesh.material.vertexShader = value; 
			mesh.material.needsUpdate = true; 
		}
	}
	function update_uniform(key, value) {
		if (uniforms[key] !== value) {
			uniforms[key] = value;
			mesh.material.uniforms[key].value = value;
			mesh.material.uniforms[key].needsUpdate = true;
		}
	}

	this.updateScene = function(scene, raster, options_) {

		if (mesh === void 0) {
			mesh = create_mesh(raster, options_);
			vertexShader = options_.vertexShader;
			uniforms = Object.assign({}, options_);
			scene.add(mesh);

			// HACK: we expose mesh here so WorldViews can modify as they see fit, 
			// 	  namely for displacement and sealevel attributes
			this.mesh = mesh; 
		} 

		update_vertex_shader(options_.vertexShader);
		update_uniform('index',	options_.index);
		update_uniform('animation_phase_angle',	(mesh.material.uniforms.animation_phase_angle.value + 1e-1)%(2*3.14));

		var offset_length = 1.02; 	// offset of arrow from surface of sphere, in radii
		var vector = mesh.geometry.vertices;

		var overlap_factor = 2;
		var max = this.max ||  Math.max.apply(null, VectorField.magnitude(raster));
		var scaling = overlap_factor * raster.grid.average_distance / max;

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
	this.removeFromScene = function(scene) {
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
	this.updateChart = function(data, raster, options) {
		data.isEnabled = false;
	};
}
