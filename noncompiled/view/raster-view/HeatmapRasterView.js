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

		var max = this.scaling? Math.max.apply(null, raster) || 1 : 1;
		ScalarField.div_scalar(raster, max, raster);
		Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
		geometry.attributes.scalar.needsUpdate = true;

	};
	this.remove = function(scene) {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.mesh = undefined;
	};
	this.vertexShader = function(vertexShader) {
		this.mesh.material.vertexShader = vertexShader; 
		this.mesh.material.needsUpdate = true; 
	}
	this.uniform = function(key, value) {
		this.mesh.material.uniforms[key].value = value;
		this.mesh.material.uniforms[key].needsUpdate = true;
	}
}