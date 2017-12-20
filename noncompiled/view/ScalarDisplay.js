'use strict';

var scalarDisplays = {};


function RealisticDisplay(shader_return_value) {
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
}
RealisticDisplay.prototype.addTo = function(mesh) {
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
RealisticDisplay.prototype.removeFrom = function(mesh) {
	
};
RealisticDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement, scalar;
	displacement = geometry.attributes.displacement.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var displacement_model = plate.displacement; 
	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		displacement[j] = displacement_model[buffer_array_index]; 
	}
	geometry.attributes.displacement.needsUpdate = true;
}
scalarDisplays.satellite = new RealisticDisplay('canopy');
scalarDisplays.soil = new RealisticDisplay('soil');
scalarDisplays.bedrock = new RealisticDisplay('bedrock');



function ScalarDisplay(options) {
	var color = options['color'] || 0x000000;
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scalar = options['scalar'] || 'vScalar';
	this.field = void 0;
	this.scratch = void 0;
	this.getField = options['getField'];
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(OCEAN, uncovered, 0.5);
			vec4 sea_covered 	= vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			gl_FragColor = sea_covered;
			**/}))
		.replace('@UNCOVERED', 'mix( vec4(1), vec4(color,1.), smoothstep(@MIN, @MAX, @SCALAR) )')
		.replace('@MIN', min)
		.replace('@MAX', max)
		.replace('@SCALAR', scalar);
	this._color = new THREE.Color(color);
}
ScalarDisplay.prototype.addTo = function(mesh) {
	this.field = void 0;
	this.scratch = void 0;

	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;

	mesh.material.uniforms.color.value = this._color;
	mesh.material.uniforms.color.needsUpdate = true;
};
ScalarDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement, scalar;
	displacement = geometry.attributes.displacement.array;
	scalar = geometry.attributes.scalar.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var displacement_model = plate.displacement; 
	this.field = this.field || Float32Raster(plate.grid);
	this.scratch = this.scratch || Float32Raster(plate.grid);

	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		displacement[j] = displacement_model[buffer_array_index]; 
	}
	geometry.attributes.displacement.needsUpdate = true;

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

	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		scalar[j] = scalar_model[buffer_array_index]; 
	}
	if (scalar_model !== void 0) {
		geometry.attributes.scalar.needsUpdate = true;
		if (scalar_model !== this.field) {
			Float32Raster.copy(scalar_model, this.field);
		}
	} else {
		this.field = void 0;
	}
}
scalarDisplays.npp 	= new ScalarDisplay( { color: 0x00ff00, min: '0.', max: '1.',  
		getField: function (world, result) {
			var temp = AtmosphericModeling.surface_air_temp(world.grid.pos, world.meanAnomaly, Math.PI*23.5/180);
			var lat = Float32SphereRaster.latitude(world.grid.pos.y);
			var precip = AtmosphericModeling.precip(lat);
			var npp = BiosphereModeling.net_primary_productivity(temp, precip, 1, result);
			return npp;
		} 
	} );
scalarDisplays.alt 	= new ScalarDisplay( {color: 0x000000, min:'sealevel', max:'maxheight', 
		getField: function (world, result) {
			ScalarField.sub_scalar(world.displacement, world.SEALEVEL, result);
			return result
		} 
	} );



function ScalarHeatDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scaling = options['scaling'] || false;
	var scalar = options['scalar'] || 'vScalar';
	this.getField = options['getField'];
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
	var geometry, displacement, scalar;
	displacement = geometry.attributes.displacement.array;
	scalar = geometry.attributes.scalar.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var displacement_model = plate.displacement; 
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
	
	var max = this.scaling? Math.max.apply(null, scalar_model) || 1 : 1;
	if (scalar_model !== void 0) {
		for(var j=0, lj = displacement.length; j<lj; j++){ 
			buffer_array_index = buffer_array_to_cell[j];
			displacement[j] = displacement_model[buffer_array_index]; 
				scalar[j] = scalar_model[buffer_array_index] / max; 
		}
	}
	geometry.attributes.displacement.needsUpdate = true;
	if (scalar_model !== void 0) {
		geometry.attributes.scalar.needsUpdate = true;
		if (scalar_model !== this.field) {
			Float32Raster.copy(scalar_model, this.field);
		}
	} else {
		this.field = void 0;
	}
}
scalarDisplays.plates 	= new ScalarHeatDisplay( { min: '0.', max: '7.', 
		getField: function (world) {
			return world.plate_map;
		} 	
	} );
scalarDisplays.plate_count 	= new ScalarHeatDisplay( { min: '0.', max: '3.',  
		getField: function (world) {
			return world.plate_count;
		} 
	} );
scalarDisplays.temp 	= new ScalarHeatDisplay( { min: '-25.', max: '30.',  
		getField: function (crust) {
			var temp = AtmosphericModeling.surface_air_temp(crust.grid.pos, crust.meanAnomaly, Math.PI*23.5/180);
			// convert to Celcius
			ScalarField.add_scalar(temp, -273.15, temp);
			return temp;
		} 
	} );
scalarDisplays.precip 	= new ScalarHeatDisplay( { min: '2000.', max: '1.',  
		getField: function (crust) {
			var lat = Float32SphereRaster.latitude(world.grid.pos.y);
			return AtmosphericModeling.precip(lat);
		} 
	} );
scalarDisplays.age 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		getField: function (crust) {
			return crust.age;
		} 
	} );
scalarDisplays.subductable 	= new ScalarHeatDisplay( { min: '0.', max: '7900.',  
		getField: function (crust) {
			return crust.subductable;
		} 
	} );
scalarDisplays.unsubductable 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (crust) {
			return crust.unsubductable;
		} 
	} );
scalarDisplays.thickness 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (crust) {
			return crust.thickness;
		} 
	} );
scalarDisplays.density 	= new ScalarHeatDisplay( { min: '2700.', max: '3300.',  
		getField: function (crust) {
			return crust.density;
		} 
	} );
scalarDisplays.displacement 	= new ScalarHeatDisplay( { min: '3682.', max: '12000.',  
		getField: function (crust) {
			return crust.displacement;
		}
	} );
scalarDisplays.subductability = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust) {
			return crust.subductability;
		}
	} );
scalarDisplays.asthenosphere_pressure = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, output, scratch, iterations) {
			return TectonicsModeling.get_asthenosphere_pressure(crust.subductability, output, scratch);
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
