'use strict';

function RealisticWorldDisplay(shader_return_value) {
	var fragmentShader = fragmentShaders.realistic
		.replace('@UNCOVERED', shader_return_value);
	this.chartDisplays = []; 
	this.mesh = void 0;

	this.upsert = function(scene, world, options) {

		if (this.mesh === void 0) {
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
				  sealevel:     { type: 'f', value: 0 },
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
			var mesh = new THREE.Mesh( geometry, material);
			scene.add(mesh);

			this.mesh = mesh;
		}
		
		var mesh = this.mesh;
		var material = mesh.material;
		var geometry = mesh.geometry;

		material.uniforms['sealevel'].value = world.hydrosphere.sealevel.value();
		material.uniforms['sealevel'].needsUpdate = true;

		material.uniforms['insolation_max'].value = Float32Dataset.max(world.atmosphere.average_insolation);
		material.uniforms['insolation_max'].needsUpdate = true;

		Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
		geometry.attributes.displacement.needsUpdate = true;

		Float32Raster.get_ids(world.atmosphere.average_insolation, view.grid.buffer_array_to_cell, geometry.attributes.insolation.array); 
		geometry.attributes.insolation.needsUpdate = true;

		Float32Raster.get_ids(world.hydrosphere.ice_coverage.value(), view.grid.buffer_array_to_cell, geometry.attributes.ice_coverage.array); 
		geometry.attributes.ice_coverage.needsUpdate = true;

		Float32Raster.get_ids(world.biosphere.plant_coverage.value(), view.grid.buffer_array_to_cell, geometry.attributes.plant_coverage.array); 
		geometry.attributes.plant_coverage.needsUpdate = true;
	};

	this.remove = function(scene) {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.mesh = void 0;
	};
}
