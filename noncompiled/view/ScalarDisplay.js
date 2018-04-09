'use strict';




var scalarDisplays = {};


function RealisticDisplay(shader_return_value, chartDisplays) {
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 ocean 				= mix(OCEAN, SHALLOW, smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement));
			vec4 bedrock			= mix(MAFIC, FELSIC, felsic_fraction);
			vec4 soil				= mix(bedrock, mix(SAND, PEAT, organic_fraction), mineral_fraction);
			vec4 canopy 			= mix(soil, JUNGLE, npp);
			
			vec4 uncovered = @UNCOVERED;
			vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			vec4 ice_covered = mix(sea_covered, SNOW, ice_fraction);
			gl_FragColor = ice_covered;
			**/}))
		.replace('@UNCOVERED', shader_return_value);
	this.chartDisplays = chartDisplays || [];
}
RealisticDisplay.prototype.addTo = function(mesh) {
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
RealisticDisplay.prototype.removeFrom = function(mesh) {
	
};
RealisticDisplay.prototype.updateAttributes = function(geometry, plate) {
	Float32Raster.get_ids(plate.displacement, view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;
}
scalarDisplays.satellite = new RealisticDisplay('canopy');
scalarDisplays.soil = new RealisticDisplay('soil');
scalarDisplays.bedrock = new RealisticDisplay('bedrock');



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
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(NONE, uncovered, 0.5);
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
ScalarDisplay.prototype.updateAttributes = function(geometry, plate) {
	Float32Raster.get_ids(plate.displacement, view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

	this.field = this.field || Float32Raster(plate.grid);
	this.scratch = this.scratch || Float32Raster(plate.grid);

	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}
	var scalar_model = this.getField(plate, this.field, this.scratch);
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
scalarDisplays.npp 	= new ScalarDisplay( { minColor: 0xffffff, maxColor: 0x00ff00, min: '0.', max: '1.',
		getField: function (world, result) {
			var temp = AtmosphericModeling.surface_air_temp(world.grid.pos, world.meanAnomaly, Math.PI*23.5/180);
			var lat = Float32SphereRaster.latitude(world.grid.pos.y);
			var precip = AtmosphericModeling.precip(lat);
			var npp = BiosphereModeling.net_primary_productivity(temp, precip, 1, result);
			return npp;
		} 
	} );
scalarDisplays.alt 	= new ScalarDisplay( { minColor: 0x000000, maxColor: 0xffffff, min:'0.', max:'10000.', 
		getField: function (world, result) {
			return (scalarDisplayVue.ocean)?(ScalarField.max_scalar(world.displacement, world.SEALEVEL)):
			                                (world.displacement);
		}
	} );



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
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(OCEAN, uncovered, 0.5);
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
ScalarHeatDisplay.prototype.updateAttributes = function(geometry, plate) {
	Float32Raster.get_ids(plate.displacement, view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}

	this.field = this.field || Float32Raster(plate.grid);
	this.scratch = this.scratch || Float32Raster(plate.grid);
	
	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}
	var scalar_model = this.getField(plate, this.field, this.scratch);
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
scalarDisplays.plates 	= new ScalarHeatDisplay( { min: '0.', max: '7.', 
		getField: function (world) {
			return world.top_plate_map;
		} 	
	} );
scalarDisplays.plate_count 	= new ScalarHeatDisplay( { min: '0.', max: '3.',  
		getField: function (world) {
			return world.plate_count;
		} 
	} );
scalarDisplays.temp 	= new ScalarHeatDisplay( { min: '-25.', max: '30.',  
		getField: function (world) {
			var temp = AtmosphericModeling.surface_air_temp(world.grid.pos, world.meanAnomaly, Math.PI*23.5/180);
			// convert to Celcius
			ScalarField.add_scalar(temp, -273.15, temp);
			return temp;
		} 
	} );
scalarDisplays.precip 	= new ScalarHeatDisplay( { min: '2000.', max: '1.',  
		getField: function (world) {
			var lat = Float32SphereRaster.latitude(world.grid.pos.y);
			return AtmosphericModeling.precip(lat);
		} 
	} );
scalarDisplays.age 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		getField: function (world) {
			return world.top_crust.age;
		} 
	} );
scalarDisplays.mafic_volcanic 	= new ScalarHeatDisplay( { min: '0.', max: '7000.',  
		getField: function (world) {
			return world.top_crust.mafic_volcanic;
		} 
	} );
scalarDisplays.felsic_plutonic 	= new ScalarHeatDisplay( { min: '0.', max: '70000.',  
		getField: function (world) {
			return world.top_crust.felsic_plutonic;
		} 
	} );
scalarDisplays.felsic_plutonic_erosion 	= new ScalarHeatDisplay( { min: '0.', max: '100.',  
		getField: function (world) {
			return world.erosion.felsic_plutonic;
		} 
	} );
scalarDisplays.sediment 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: function (world) {
			return world.top_crust.sediment;
		} 
	} );
scalarDisplays.sediment_erosion 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: function (world) {
			return world.erosion.sediment;
		} 
	} );
scalarDisplays.sediment_weathering 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: function (world) {
			return world.weathering.sediment;
		} 
	} );
scalarDisplays.sedimentary 	= new ScalarHeatDisplay( { min: '0.', max: '10000.',  
		getField: function (world) {
			return world.top_crust.sedimentary;
		} 
	} );
scalarDisplays.metamorphic 	= new ScalarHeatDisplay( { min: '0.', max: '10000.',  
		getField: function (world) {
			return world.top_crust.metamorphic;
		} 
	} );
scalarDisplays.thickness 	= new ScalarHeatDisplay( { min: '0.', max: '70000.',  
		getField: function (world) {
			return world.thickness;
		} 
	} );
scalarDisplays.density 	= new ScalarHeatDisplay( { min: '2.700', max: '3.300',  
		getField: function (world) {
			return world.density;
		} 
	} );
scalarDisplays.elevation 	= new ScalarHeatDisplay( { min: '0.', max: '10000.',  
		getField: function (world) {
			return ScalarField.sub_scalar(world.displacement, -3682);
		}
	} );
scalarDisplays.asthenosphere_pressure = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (world, output, scratch, iterations) {
			return TectonicsModeling.get_asthenosphere_pressure(world.density, output, scratch);
		}
	} );

scalarDisplays.surface_air_pressure = new ScalarHeatDisplay( { min: '980000.', max: '1030000.', 
		getField: function (world, pressure, scratch) {
			console.log(world.meanAnomaly);
			var lat = Float32SphereRaster.latitude(world.grid.pos.y);
			AtmosphericModeling.surface_air_pressure(world.displacement, lat, world.SEALEVEL, world.meanAnomaly, Math.PI*23.5/180, pressure, scratch);
			return pressure;
		}
	} );
