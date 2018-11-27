'use strict';

function ColorscaleRasterView(options) {
	var minColor = options['minColor'] || 0x000000;
	var maxColor = options['maxColor'] || 0xffffff;
	var min = options['min'] || 0.;
	var max = options['max'] || 1.;
	var scaling = options['scaling'] || false;
	this.chartViews = options['chartViews'] || [ new SpatialPdfChartView('land') ]; 
	function hex_color_to_glsl_string_color(color) {
		var rIntValue = ((color / 256 / 256) % 256) / 255.0;
		var gIntValue = ((color / 256      ) % 256) / 255.0;
		var bIntValue = ((color            ) % 256) / 255.0;
		return rIntValue.toString()+","+gIntValue.toString()+","+bIntValue.toString();
	}
	var minColor_str = hex_color_to_glsl_string_color(minColor);
	var maxColor_str = hex_color_to_glsl_string_color(maxColor);
	var fragmentShader = fragmentShaders.monochromatic
		.replace('@MINCOLOR', minColor_str)
		.replace('@MAXCOLOR', maxColor_str)
		.replace('@MIN', '0.')
		.replace('@MAX', '1.');

	this.mesh = void 0;
	var mesh = void 0;
	var uniforms = {};
	var vertexShader = void 0;
	var scaled = void 0;

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
		if (raster === void 0) {
			this.remove(scene);
		}

		if (scaled === void 0 || scaled.grid !== raster.grid) {
			scaled = Float32Raster(raster.grid);
		}

		if (scaling) {
			Float32Dataset.normalize(raster, scaled, 0., 1.);
		} else {
			ScalarField.sub_scalar(raster, min, 		scaled);
			ScalarField.div_scalar(scaled, max-min, 	scaled);
			ScalarField.add_scalar(scaled, min, 		scaled);
		}

		if (mesh === void 0) {
			mesh = create_mesh(scaled, options);
			uniforms = {...options};
			vertexShader = options.vertexShader;
			scene.add(mesh);

			// HACK: we expose mesh here so WorldViews can modify as they see fit, 
			// 	  namely for displacement and sealevel attributes
			this.mesh = mesh; 
		} 

		update_attribute('scalar', 			scaled);
				
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
		scaled = void 0;
	};
	this.clone = function() {
		return new ColorscaleRasterView(options);
	}
}
