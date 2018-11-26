'use strict';

function HeatmapRasterView(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scaling = options['scaling'] || false;
	this.chartViews = options['chartViews'] || [ new SpatialPdfChartView('land') ]; 
	this.scaling = scaling;
	var fragmentShader = fragmentShaders.heatmap
		.replace('@MIN', min)
		.replace('@MAX', max);

	this.mesh = void 0;
	var mesh = void 0;
	var uniforms = {};
	var vertexShader = void 0;

	function create_mesh(raster, options) {
		var grid = raster.grid;
		var faces = grid.faces;
		var geometry = THREE.BufferGeometryUtils.fromGeometry({
			faces: grid.faces, 
			vertices: grid.vertices, 
			faceVertexUvs: [[]], // HACK: necessary for use with BufferGeometryUtils.fromGeometry
		});
		geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
		geometry.addAttribute('scalar', Float32Array, faces.length*3, 1);

		var material = new THREE.ShaderMaterial({
			attributes: {
			  displacement: { type: 'f', value: null },
			  scalar: { type: 'f', value: null }
			},
			uniforms: {
			  sealevel:     { type: 'f', value: 0 },
			  sealevel_mod: { type: 'f', value: options.sealevel_mod },
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

	this.upsert = function(scene, raster, options) {

		if (mesh === void 0) {
			mesh = create_mesh(raster, options);
			uniforms = {...options};
			vertexShader = options.vertexShader;
			scene.add(mesh);

			// HACK: we expose mesh here so WorldViews can modify as they see fit, 
			// 	  namely for displacement and sealevel attributes
			this.mesh = mesh; 
		} 

		var max = this.scaling? Math.max.apply(null, raster) || 1 : 1;
		ScalarField.div_scalar(raster, max, raster);
		update_attribute('scalar', 			raster);
				
		update_uniform('sealevel_mod',		options.sealevel_mod);
		update_uniform('index',				options.index);

		update_vertex_shader(options.vertexShader);
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
		return new  HeatmapRasterView(options);
	}
}