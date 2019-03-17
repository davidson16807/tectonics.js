'use strict';

function RealisticWorldView(shader_return_value) {
	var fragmentShader = fragmentShaders.realistic
		.replace('@UNCOVERED', shader_return_value);
	this.chartViews = []; 
	var mesh = void 0;
	var uniforms = {};
	var vertexShader = void 0;

	function create_mesh(world, options) {
		var grid = world.grid;
		var faces = grid.faces;
		var geometry = THREE.BufferGeometryUtils.fromGeometry({
			faces: grid.faces, 
			vertices: grid.vertices, 
			faceVertexUvs: [[]], // HACK: necessary for use with BufferGeometryUtils.fromGeometry
		});
		geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
		geometry.addAttribute('ice_coverage', Float32Array, faces.length*3, 1);
		geometry.addAttribute('plant_coverage', Float32Array, faces.length*3, 1);
		geometry.addAttribute('insolation', Float32Array, faces.length*3, 1);
		geometry.addAttribute('scalar', Float32Array, faces.length*3, 1);

		var material = new THREE.ShaderMaterial({
			attributes: {
			  displacement: { type: 'f', value: null },
			  ice_coverage: { type: 'f', value: null },
			  plant_coverage: { type: 'f', value: null },
			  insolation: { type: 'f', value: null },
			  scalar: { type: 'f', value: null }
			},
			uniforms: {
			  sealevel:     { type: 'f', value: options.sealevel },
			  sealevel_mod: { type: 'f', value: options.sealevel_mod },
			  darkness_mod: { type: 'f', value: options.darkness_mod },
			  ice_mod: 		{ type: 'f', value: options.ice_mod },
			  insolation_max: { type: 'f', value: options.insolation_max },
			  index: 		{ type: 'f', value: options.index },
			},
			blending: THREE.NoBlending,
			vertexShader: options.vertexShader,
			fragmentShader: fragmentShader
		});
		return new THREE.Mesh( geometry, material);
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
	function update_attribute(key, raster) {
		Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, mesh.geometry.attributes[key].array); 
		mesh.geometry.attributes[key].needsUpdate = true;
	}
	this.updateScene = function(scene, world, options) {

		if (mesh === void 0) {
			mesh = create_mesh(world, options);
			uniforms = Object.assign({}, options);
			vertexShader = options.vertexShader;
			scene.add(mesh);
		} 
		
		update_vertex_shader(options.vertexShader);
		update_uniform('sealevel_mod',		options.sealevel_mod);
		update_uniform('darkness_mod',		options.darkness_mod);
		update_uniform('ice_mod',			options.ice_mod);
		update_uniform('index',				options.index);
		update_uniform('sealevel', 			world.hydrosphere.sealevel.value());
		update_uniform('insolation_max', 	Float32Dataset.max(world.atmosphere.average_insolation));
		update_attribute('displacement', 	world.lithosphere.displacement.value());
		update_attribute('insolation', 		world.atmosphere.average_insolation);
		update_attribute('ice_coverage', 	world.hydrosphere.ice_coverage.value());
		update_attribute('plant_coverage', 	world.biosphere.plant_coverage.value());
	};

	this.removeFromScene = function(scene) {
		if (mesh !== void 0) {
			scene.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
			mesh = void 0;
		}
	};
	this.clone = function() {
		return new RealisticWorldView(shader_return_value);
	}
	this.updateChart = function(data, world, options) {
		data.isEnabled = false;
	};
}
