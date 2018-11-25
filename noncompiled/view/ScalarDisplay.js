'use strict';



function RealisticDisplay(shader_return_value) {
	this._fragmentShader = fragmentShaders.realistic
		.replace('@UNCOVERED', shader_return_value);
	this.chartDisplays = []; 
	this.mesh = undefined;
}
RealisticDisplay.prototype.upsert = function(scene, world, options) {

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
			fragmentShader: this._fragmentShader
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
RealisticDisplay.prototype.remove = function(scene) {
	scene.remove(this.mesh);
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
	this.mesh = undefined;
};




// ScalarWorldRenderer takes as input a ScalarRasterRenderer, and a getField function, 
// and uses it to display a raster from a given world 
function ScalarWorldDisplay(scalarRasterDisplay, getField) {
	this.scalarRasterDisplay = scalarRasterDisplay;
	this.getField = getField;
	this.field = void 0;
	this.scratch = void 0;
}
ScalarWorldDisplay.prototype.upsert = function(scene, world, options) {

	this.field = this.field || Float32Raster(world.grid);
	this.scratch = this.scratch || Float32Raster(world.grid);

	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarWorldDisplay.getField is undefined.");
		return;
	}

	var raster = this.getField(world, this.field, this.scratch);

	if (raster === void 0) {
		log_once("ScalarWorldDisplay.getField() returned undefined.");
		return;
	}
	if (raster instanceof Uint8Array) {
		raster = Float32Raster.FromUint8Raster(raster);
	}
	if (raster instanceof Uint16Array) {
		raster = Float32Raster.FromUint16Raster(raster);
	}
	if (!(raster instanceof Float32Array)) { 
		log_once("ScalarWorldDisplay.getField() did not return a TypedArray.");
		return;
	}
	if (raster !== void 0) {
		this.scalarRasterDisplay.upsert(scene, raster, options);	
	} else {
		this.field = void 0;
	}

	var material = this.scalarRasterDisplay.mesh.material;
	material.uniforms['sealevel'].value = world.hydrosphere.sealevel.value();
	material.uniforms['sealevel'].needsUpdate = true;

	var geometry = this.scalarRasterDisplay.mesh.geometry;
	Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

};
ScalarWorldDisplay.prototype.remove = function(scene) {
	this.scalarRasterDisplay.remove(scene);
};


function ScalarHeatDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scaling = options['scaling'] || false;
	this.chartDisplays = options['chartDisplays'] || [ new SpatialPdfChartDisplay('land') ]; 
	this.scaling = scaling;
	this._fragmentShader = fragmentShaders.heatmap
		.replace('@MIN', min)
		.replace('@MAX', max);
}
ScalarHeatDisplay.prototype.upsert = function(scene, raster, options) {
	if (this.mesh === void 0) {
		var grid = raster.grid;
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
			fragmentShader: this._fragmentShader
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
	Float32Raster.get_ids(raster, view.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
	geometry.attributes.scalar.needsUpdate = true;

};
ScalarHeatDisplay.prototype.remove = function(scene) {
	scene.remove(this.mesh);
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
	this.mesh = undefined;
};



function ScalarDisplay(options) {
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
	this._fragmentShader = fragmentShaders.monochromatic
		.replace('@MINCOLOR', minColor_str)
		.replace('@MAXCOLOR', maxColor_str)
		.replace('@MIN', min)
		.replace('@MAX', max);
}
ScalarDisplay.prototype.upsert = function(scene, raster, options) {
	
	if (this.mesh === void 0) {
		var grid = raster.grid;
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
			fragmentShader: this._fragmentShader
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
ScalarHeatDisplay.prototype.remove = function(scene) {
	scene.remove(this.mesh);
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
	this.mesh = undefined;
};



var scalarDisplays = {};
scalarDisplays.satellite = new RealisticDisplay('canopy');
scalarDisplays.soil = new RealisticDisplay('soil');
scalarDisplays.bedrock = new RealisticDisplay('bedrock');

scalarDisplays.npp 	= new ScalarWorldDisplay( 
		new ScalarDisplay( { minColor: 0xffffff, maxColor: 0x00ff00, min: '0.', max: '1.' }),
		world => world.biosphere.npp.value()
	);
scalarDisplays.alt 	= new ScalarWorldDisplay( 
		new ScalarDisplay( { minColor: 0x000000, maxColor: 0xffffff, min:'0.', max:'10000.' }),
		world => world.hydrosphere.surface_height.value()
	);
scalarDisplays.plates 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '7.' }),
		world => world.lithosphere.top_plate_map
	);
scalarDisplays.plate_count 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '3.' }),
		world => world.lithosphere.plate_count
	);
scalarDisplays.temp 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '-50.', max: '30.' }),
		(world, result) => ScalarField.add_scalar(world.atmosphere.surface_temp, -273.15, result)
	);
scalarDisplays.precip 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '2000.', max: '1.' }),
		world => world.atmosphere.precip.value()
	);
scalarDisplays.age 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '250.', max: '0.' }),
		world => world.lithosphere.top_crust.age
	);
scalarDisplays.mafic_volcanic 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '7000.' }),
		world => world.lithosphere.top_crust.mafic_volcanic
	);
scalarDisplays.felsic_plutonic 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '70000.' }),
		world => world.lithosphere.top_crust.felsic_plutonic
	);
scalarDisplays.felsic_plutonic_erosion 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '100.' }),
		world => world.lithosphere.top_crust.felsic_plutonic_erosion
	);
scalarDisplays.sediment 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment
	);
scalarDisplays.sediment_erosion 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment_erosion
	);
scalarDisplays.sediment_weathering 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment_weathering
	);
scalarDisplays.sedimentary 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '10000.' }),
		world => world.lithosphere.top_crust.sedimentary
	);
scalarDisplays.metamorphic 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '10000.' }),
		world => world.lithosphere.top_crust.metamorphic
	);
scalarDisplays.thickness 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '70000.' }),
		world => world.lithosphere.thickness
	);
scalarDisplays.density 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '2.700', max: '3.300' }),
		world => world.lithosphere.density.value()
	);
scalarDisplays.elevation 	= new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '10000.' }),
		world => world.lithosphere.elevation.value()
	);
scalarDisplays.ice_coverage = new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '1.' }),
		world => world.hydrosphere.ice_coverage.value()
	);
scalarDisplays.land_coverage = new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '1.' }),
		world => world.lithosphere.land_coverage.value()
	);
scalarDisplays.ocean_coverage = new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '1.' }),
		world => world.hydrosphere.ocean_coverage.value()
	);
scalarDisplays.plant_coverage = new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '0.', max: '1.' }),
		world => world.biosphere.plant_coverage.value()
	);
scalarDisplays.asthenosphere_pressure = new ScalarWorldDisplay( 
		new ScalarHeatDisplay(  { min: '1.', max: '0.'  }),
		function (world, output, scratch, iterations) {return TectonicsModeling.get_asthenosphere_pressure(world.lithosphere.density, output, scratch);}
	);

scalarDisplays.surface_air_pressure = new ScalarWorldDisplay( 
		new ScalarHeatDisplay( { min: '980000.', max: '1030000.' }),
		world => world.atmosphere.surface_pressure.value()
	);
