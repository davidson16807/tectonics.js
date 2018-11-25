'use strict';

function ColorscaleRasterDisplay(options) {
	var minColor = options['minColor'] || 0x000000;
	var maxColor = options['maxColor'] || 0xffffff;
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.chartDisplays = options['chartDisplays'] || [ new SpatialPdfChartDisplay('land') ]; 
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
		.replace('@MIN', min)
		.replace('@MAX', max);
	this.mesh = void 0;

	this.upsert = function(scene, raster, options) {
		
		if (this.mesh === void 0) {
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
			var mesh = new THREE.Mesh( geometry, material);
			scene.add(mesh);

			this.mesh = mesh;
		}
		
		var mesh = this.mesh;
		var material = mesh.material;
		var geometry = mesh.geometry;

		Float32Raster.get_ids(raster, view.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
		geometry.attributes.scalar.needsUpdate = true;
	};
	this.remove = function(scene) {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.mesh = undefined;
	};
}
