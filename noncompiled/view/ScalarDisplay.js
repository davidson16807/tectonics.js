'use strict';



function RealisticDisplay(shader_return_value) {
	this._fragmentShader = fragmentShaders.realistic
		.replace('@UNCOVERED', shader_return_value);
	this.chartDisplays = []; 
}
RealisticDisplay.prototype.addTo = function(mesh) {
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
RealisticDisplay.prototype.removeFrom = function(mesh) {
	
};
RealisticDisplay.prototype.updateAttributes = function(geometry, world) {
	Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;
	Float32Raster.get_ids(world.hydrosphere.ice_coverage.value(), view.grid.buffer_array_to_cell, geometry.attributes.ice_coverage.array); 
	geometry.attributes.ice_coverage.needsUpdate = true;
	Float32Raster.get_ids(world.biosphere.plant_coverage.value(), view.grid.buffer_array_to_cell, geometry.attributes.plant_coverage.array); 
	geometry.attributes.plant_coverage.needsUpdate = true;
}


function ScalarDisplay(options) {
	var minColor = options['minColor'] || 0x000000;
	var maxColor = options['maxColor'] || 0xffffff;
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scalar = options['scalar'] || 'vScalar';
	this.field = void 0;
	this.scratch = void 0;
	this.getField = options['getField'];
	this.chartDisplays = options['chartDisplays'] || [ new SpatialPdfChartDisplay('land') ]; 
	function hex_color_to_glsl_string_color(color) {
		var rIntValue = ((color / 256 / 256) % 256) / 255.0;
		var gIntValue = ((color / 256      ) % 256) / 255.0;
		var bIntValue = ((color            ) % 256) / 255.0;
		return rIntValue.toString()+","+gIntValue.toString()+","+bIntValue.toString();
	}
	var minColor_str = hex_color_to_glsl_string_color(minColor);
	var maxColor_str = hex_color_to_glsl_string_color(maxColor);
	this._fragmentShader = fragmentShaders.generic
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(vec4(0.), uncovered, 0.5);
			vec4 sea_covered 	= vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			gl_FragColor = sea_covered;
			**/}))
		.replace('@UNCOVERED', 'mix( vec4(@MINCOLOR,1.), vec4(@MAXCOLOR,1.), smoothstep(@MIN, @MAX, @SCALAR) )')
		.replace('@MINCOLOR', minColor_str)
		.replace('@MAXCOLOR', maxColor_str)
		.replace('@MIN', min)
		.replace('@MAX', max)
		.replace('@SCALAR', scalar);
}
ScalarDisplay.prototype.addTo = function(mesh) {
	this.field = void 0;
	this.scratch = void 0;

	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
ScalarDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarDisplay.prototype.updateAttributes = function(geometry, world) {
	Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

	this.field = this.field || Float32Raster(world.grid);
	this.scratch = this.scratch || Float32Raster(world.grid);

	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}
	var scalar_model = this.getField(world, this.field, this.scratch);
	if (scalar_model === void 0) {
		log_once("ScalarDisplay.getField() returned undefined.");
		return;
	}
	if (!(scalar_model instanceof Float32Array || scalar_model instanceof Uint16Array || scalar_model instanceof Uint8Array)) { 
		log_once("ScalarDisplay.getField() did not return a TypedArray.");
		return;
	}
	if (scalar_model instanceof Uint8Array) {
		scalar_model = Float32Raster.FromUint8Raster(scalar_model);
	}
	if (scalar_model instanceof Uint16Array) {
		scalar_model = Float32Raster.FromUint16Raster(scalar_model);
	}

	if (scalar_model !== void 0) {
		if (scalar_model !== this.field) {
			Float32Raster.copy(scalar_model, this.field);
		}
		
		Float32Raster.get_ids(scalar_model, view.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
		geometry.attributes.scalar.needsUpdate = true;

	} else {
		this.field = void 0;
	}
}



function ScalarHeatDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scaling = options['scaling'] || false;
	var scalar = options['scalar'] || 'vScalar';
	this.getField = options['getField'];
	this.chartDisplays = options['chartDisplays'] || [ new SpatialPdfChartDisplay('land') ]; 
	this.scaling = scaling;
	this.field = void 0;
	this.scratch = void 0;
	this._fragmentShader = fragmentShaders.generic
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(vec4(0.), uncovered, 0.5);
			vec4 sea_covered 	= vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			gl_FragColor = sea_covered;
			**/}))
		.replace('@UNCOVERED', 'heat( smoothstep(@MIN, @MAX, @SCALAR) )')
		.replace('@MIN', min)
		.replace('@MAX', max)
		.replace('@SCALAR', scalar);
}
ScalarHeatDisplay.prototype.addTo = function(mesh) {
	this.field = void 0;
	this.scratch = void 0;
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
ScalarHeatDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarHeatDisplay.prototype.updateAttributes = function(geometry, world) {
	Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}

	this.field = this.field || Float32Raster(world.grid);
	this.scratch = this.scratch || Float32Raster(world.grid);
	
	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}
	var scalar_model = this.getField(world, this.field, this.scratch);
	if (scalar_model === void 0) {
		log_once("ScalarDisplay.getField() returned undefined.");
		return;
	}
	if (!(scalar_model instanceof Float32Array || scalar_model instanceof Uint16Array || scalar_model instanceof Uint8Array)) { 
		log_once("ScalarDisplay.getField() did not return a TypedArray.");
		return;
	}
	if (scalar_model instanceof Uint8Array) {
		scalar_model = Float32Raster.FromUint8Raster(scalar_model);
	}
	if (scalar_model instanceof Uint16Array) {
		scalar_model = Float32Raster.FromUint16Raster(scalar_model);
	}
	
	var max = this.scaling? Math.max.apply(null, scalar_model) || 1 : 1;
	if (scalar_model !== void 0) {
		if (scalar_model !== this.field) {
			Float32Raster.copy(scalar_model, this.field);
		}

		ScalarField.div_scalar(scalar_model, max, scalar_model);
		Float32Raster.get_ids(scalar_model, view.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
		geometry.attributes.scalar.needsUpdate = true;
	} else {
		this.field = void 0;
	}
}




var scalarDisplays = {};
scalarDisplays.satellite = new RealisticDisplay('canopy');
scalarDisplays.soil = new RealisticDisplay('soil');
scalarDisplays.bedrock = new RealisticDisplay('bedrock');

scalarDisplays.npp 	= new ScalarDisplay( { minColor: 0xffffff, maxColor: 0x00ff00, min: '0.', max: '1.',
		getField: world => world.biosphere.npp.value()
	} );
scalarDisplays.alt 	= new ScalarDisplay( { minColor: 0x000000, maxColor: 0xffffff, min:'0.', max:'10000.', 
		getField: world => world.hydrosphere.surface_height.value()
	} );
scalarDisplays.plates 	= new ScalarHeatDisplay( { min: '0.', max: '7.', 
		getField: world => world.lithosphere.top_plate_map
	} );
scalarDisplays.plate_count 	= new ScalarHeatDisplay( { min: '0.', max: '3.',  
		getField: world => world.lithosphere.plate_count
	} );
scalarDisplays.temp 	= new ScalarHeatDisplay( { min: '-50.', max: '30.',  
		// NOTE: convert to Celcius
		getField: (world, result) => 
			ScalarField.add_scalar(world.atmosphere.surface_temp, -273.15, result)
	} );
scalarDisplays.precip 	= new ScalarHeatDisplay( { min: '2000.', max: '1.',  
		getField: world => world.atmosphere.precip.value()
	} );
scalarDisplays.age 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		getField: world => world.lithosphere.top_crust.age
	} );
scalarDisplays.mafic_volcanic 	= new ScalarHeatDisplay( { min: '0.', max: '7000.',  
		getField: world => world.lithosphere.top_crust.mafic_volcanic
	} );
scalarDisplays.felsic_plutonic 	= new ScalarHeatDisplay( { min: '0.', max: '70000.',  
		getField: world => world.lithosphere.top_crust.felsic_plutonic
	} );
scalarDisplays.felsic_plutonic_erosion 	= new ScalarHeatDisplay( { min: '0.', max: '100.',  
		getField: world => world.lithosphere.top_crust.felsic_plutonic_erosion
	} );
scalarDisplays.sediment 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: world => world.lithosphere.top_crust.sediment
	} );
scalarDisplays.sediment_erosion 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: world => world.lithosphere.top_crust.sediment_erosion
	} );
scalarDisplays.sediment_weathering 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: world => world.lithosphere.top_crust.sediment_weathering
	} );
scalarDisplays.sedimentary 	= new ScalarHeatDisplay( { min: '0.', max: '10000.',  
		getField: world => world.lithosphere.top_crust.sedimentary
	} );
scalarDisplays.metamorphic 	= new ScalarHeatDisplay( { min: '0.', max: '10000.',  
		getField: world => world.lithosphere.top_crust.metamorphic
	} );
scalarDisplays.thickness 	= new ScalarHeatDisplay( { min: '0.', max: '70000.',  
		getField: world => world.lithosphere.thickness
	} );
scalarDisplays.density 	= new ScalarHeatDisplay( { min: '2.700', max: '3.300',  
		getField: world => world.lithosphere.density.value()
	} );
scalarDisplays.elevation 	= new ScalarHeatDisplay( { min: '0.', max: '10000.',  
		getField: world => world.lithosphere.elevation.value()
	} );
scalarDisplays.ice_coverage = new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: world => world.hydrosphere.ice_coverage.value()
	} );
scalarDisplays.land_coverage = new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: world => world.lithosphere.land_coverage.value()
	} );
scalarDisplays.ocean_coverage = new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: world => world.hydrosphere.ocean_coverage.value()
	} );
scalarDisplays.plant_coverage = new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: world => world.biosphere.plant_coverage.value()
	} );
scalarDisplays.asthenosphere_pressure = new ScalarHeatDisplay(  { min: '1.', max: '0.',
		// getField: world => world.lithosphere.asthenosphere_pressure.value()
		getField: function (world, output, scratch, iterations) {
			return TectonicsModeling.get_asthenosphere_pressure(world.lithosphere.density, output, scratch);
		}
	} );

scalarDisplays.surface_air_pressure = new ScalarHeatDisplay( { min: '980000.', max: '1030000.', 
		getField: world => world.atmosphere.surface_pressure.value()
	} );
