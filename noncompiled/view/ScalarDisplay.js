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
RealisticDisplay.prototype.displayWorld = function(geometry, world) {
	Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

	Float32Raster.get_ids(world.atmosphere.average_insolation, view.grid.buffer_array_to_cell, geometry.attributes.insolation.array); 
	geometry.attributes.insolation.needsUpdate = true;

	Float32Raster.get_ids(world.hydrosphere.ice_coverage.value(), view.grid.buffer_array_to_cell, geometry.attributes.ice_coverage.array); 
	geometry.attributes.ice_coverage.needsUpdate = true;

	Float32Raster.get_ids(world.biosphere.plant_coverage.value(), view.grid.buffer_array_to_cell, geometry.attributes.plant_coverage.array); 
	geometry.attributes.plant_coverage.needsUpdate = true;

}




// ScalarWorldRenderer takes as input a ScalarRasterRenderer, and a getField function, 
// and uses it to display a raster from a given world 
function ScalarWorldDisplay(scalarRasterRenderer, getField) {
	this.scalarRasterRenderer = scalarRasterRenderer;
	this.getField = getField;
	this.field = void 0;
	this.scratch = void 0;
}
ScalarWorldDisplay.prototype.addTo = function(mesh) {
	this.field = void 0;
	this.scratch = void 0;
	this.scalarRasterRenderer.addTo(mesh);
};
ScalarWorldDisplay.prototype.removeFrom = function(mesh) {
	this.scalarRasterRenderer.removeFrom(mesh);
};
ScalarWorldDisplay.prototype.displayWorld = function(geometry, world) {
	Float32Raster.get_ids(world.lithosphere.displacement.value(), view.grid.buffer_array_to_cell, geometry.attributes.displacement.array); 
	geometry.attributes.displacement.needsUpdate = true;

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
		this.scalarRasterRenderer.displayRaster(geometry, raster);
	} else {
		this.field = void 0;
	}
}


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
ScalarHeatDisplay.prototype.addTo = function(mesh) {
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
ScalarHeatDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarHeatDisplay.prototype.displayRaster = function(geometry, raster) {
	var max = this.scaling? Math.max.apply(null, raster) || 1 : 1;
	ScalarField.div_scalar(raster, max, raster);
	Float32Raster.get_ids(raster, view.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
	geometry.attributes.scalar.needsUpdate = true;
}



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
ScalarDisplay.prototype.addTo = function(mesh) {
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
ScalarDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarDisplay.prototype.displayRaster = function(geometry, raster) {
	Float32Raster.get_ids(raster, view.grid.buffer_array_to_cell, geometry.attributes.scalar.array); 
	geometry.attributes.scalar.needsUpdate = true;
}



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
