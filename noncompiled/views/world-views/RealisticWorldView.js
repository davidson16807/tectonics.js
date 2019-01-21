'use strict';

function RealisticWorldView(shader_return_value) {
	var fragmentShader = fragmentShaders.realistic
		.replace('@UNCOVERED', shader_return_value);
	this.chartViews = []; 
	var added = false;
	var mesh = void 0;
	var uniforms = {};
	var vertexShader = void 0;
	var shaderpass = new THREE.ShaderPass({
		uniforms: {
			"surface_light":  			{ type: "t", value: null },
			"projection_matrix_inverse":{ type: "m4",value: new THREE.Matrix4() },
			"view_matrix_inverse"      :{ type: "m4",value: new THREE.Matrix4() },
			"world_position": 			{ type: "v3",value: new THREE.Vector3() },
			"world_radius":   			{ type: "f", value: Units.EARTH_RADIUS  },
			"reference_distance": 		{ type: "f", value: Units.EARTH_RADIUS  },
		},
		vertexShader: 	vertexShaders.passthrough,
		fragmentShader: fragmentShaders.atmosphere,
	}, 'surface_light');
	shaderpass.renderToScreen = true;

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
		geometry.addAttribute('surface_temp', Float32Array, faces.length*3, 1);
		geometry.addAttribute('plant_coverage', Float32Array, faces.length*3, 1);
		geometry.addAttribute('scalar', Float32Array, faces.length*3, 1);

		var material = new THREE.ShaderMaterial({
			attributes: {
			  displacement: { type: 'f', value: null },
			  ice_coverage: { type: 'f', value: null },
			  surface_temp: { type: 'f', value: null },
			  plant_coverage: { type: 'f', value: null },
			  scalar: { type: 'f', value: null }
			},
			uniforms: {
			  field_of_view:      { type: 'f', value: 0 },
			  aspect_ratio:       { type: 'f', value: 0 },
			  world_radius:       { type: 'f', value: world.radius },
			  reference_distance: { type: 'f', value: world.radius },
			  sealevel:           { type: 'f', value: 0 },
			  sealevel_mod:       { type: 'f', value: options.sealevel_mod },
			  ice_mod: 		      { type: 'f', value: options.ice_mod },
			  darkness_mod:       { type: 'f', value: options.darkness_mod },
			  insolation_max:     { type: 'f', value: options.insolation_max },
			  index: 		      { type: 'f', value: options.index },
			},
			blending: THREE.NoBlending,
			vertexShader: options.vertexShader,
			fragmentShader: fragmentShader
		});
		return new THREE.Mesh( geometry, material);
	}
	function update_vertex_shader(material, value) {
		if (vertexShader !== value) {
			vertexShader = value;
			material.vertexShader = value; 
			material.needsUpdate = true; 
		}
	}
	function update_uniform(material, key, value) {
		if (uniforms[key] !== value) {
			uniforms[key] = value;
			material.uniforms[key].value = value;
			material.uniforms[key].needsUpdate = true;
		}
	}
	function update_attribute(geometry, key, raster) {
		Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, geometry.attributes[key].array); 
		geometry.attributes[key].needsUpdate = true;
	}
	this.updateScene = function(gl_state, world, options) {

		if (!added) {
			mesh = create_mesh(world, options);
			uniforms = {...options};
			vertexShader = options.vertexShader;
			gl_state.scene.add(mesh);

			gl_state.composer.passes.pop();
			gl_state.composer.passes.push(shaderpass);

			added = true;
		} 

		update_vertex_shader(mesh.material, options.vertexShader);
		update_uniform  (mesh.material, 'sealevel_mod',			options.sealevel_mod);
		update_uniform  (mesh.material, 'darkness_mod',			options.darkness_mod);
		update_uniform  (mesh.material, 'ice_mod',				options.ice_mod);
		update_uniform  (mesh.material, 'index',				options.index);
		update_uniform  (mesh.material, 'world_radius',			world.radius);
		update_uniform  (mesh.material, 'reference_distance',	world.radius);
		update_uniform  (mesh.material, 'sealevel', 			world.hydrosphere.sealevel.value());
		update_uniform  (mesh.material, 'insolation_max', 		Float32Dataset.max(world.atmosphere.average_insolation));
		update_attribute(mesh.geometry, 'displacement', 		world.lithosphere.displacement.value());
		update_attribute(mesh.geometry, 'ice_coverage', 		world.hydrosphere.ice_coverage.value());
		update_attribute(mesh.geometry, 'surface_temp', 		world.atmosphere.surface_temp);
		update_attribute(mesh.geometry, 'plant_coverage', 		world.biosphere.plant_coverage.value());

		 gl_state.camera.projectionMatrix
		update_uniform  (shaderpass,    'projection_matrix_inverse',new THREE.Matrix4().getInverse(gl_state.camera.projectionMatrix));
		update_uniform  (shaderpass,    'view_matrix_inverse',		gl_state.camera.matrixWorld);
		update_uniform  (shaderpass,    'world_position', 			new THREE.Vector3());
		update_uniform  (shaderpass,    'world_radius',				world.radius);
		update_uniform  (shaderpass,    'reference_distance',		world.radius);
		update_uniform  (shaderpass, 	'insolation_max', 			Float32Dataset.max(world.atmosphere.average_insolation));
	};

	this.removeFromScene = function(gl_state) {
		if (added) {

			gl_state.scene.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
			mesh = void 0;

			gl_state.composer.passes.pop();
			gl_state.composer.passes.push(gl_state.shaderpass);

			added = false;
		}
	};
	this.clone = function() {
		return new RealisticWorldView(shader_return_value);
	}
	this.updateChart = function(data, world, options) {
		data.isEnabled = false;
	};
}
