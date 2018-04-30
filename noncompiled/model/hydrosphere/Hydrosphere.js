'use strict';

function Hydrosphere(parameters) {

	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	// public variables
	var self = this; 
	this.average_ocean_depth = 0;
	// height of sealevel, in meters, relative to the same datum level used by displacement
	this.sealevel = new Memo(
		parameters['sealevel'] || 3682,  
		current_value => 
			HydrosphereModeling.solve_sealevel(
				displacement.value(), 
				self.average_ocean_depth, 
				material_density.ocean, 
				// Float32Raster(grid)
			),
		false
	); 
	this.epipelagic = new Memo( 0,  
		current_value => self.sealevel.value()-200
	); 
	this.mesopelagic = new Memo( 0,  
		current_value => self.sealevel.value()-1000
	); 
	this.surface_height = new Memo(
		Float32Raster(grid),  
		result => HydrosphereModeling.get_surface_height(displacement.value(), self.sealevel.value(), result)
	); 
	this.ocean_depth = new Memo(
		Float32Raster(grid),  
		result => HydrosphereModeling.get_ocean_depth(displacement.value(), self.sealevel.value(), result)
	); 
	this.ice_coverage = new Memo(
		Float32Raster(grid),  
		result => { 
			var freezing_point = 273.15; // TODO: move this to Atmosphere, and update this to reflect surface_pressure
			Float32RasterInterpolation.lerp(
					1, 0, 
					Float32RasterInterpolation.smoothstep(freezing_point-10, freezing_point, surface_temp.value()),
					result
				);
			Float32RasterGraphics.fill_into_selection(
				result, 0.,
				ScalarField.lt_field(
					displacement.value(), 
					Float32RasterInterpolation.lerp(
						self.mesopelagic.value(), 
						self.epipelagic.value(),
						Float32RasterInterpolation.smoothstep(freezing_point-10, freezing_point, surface_temp.value())
					)
				),
				result
			);
			return result;
		},
		false
	);
	this.ocean_coverage = new Memo(
		Float32Raster(grid),  
		result => Float32RasterInterpolation.smoothstep(
			self.sealevel.value(), 
			self.epipelagic.value(), 
			displacement.value(), 
			result
		)
	); 

	this.invalidate = function() {
		this.sealevel		.invalidate();
		this.epipelagic		.invalidate();
		this.mesopelagic	.invalidate();
		this.surface_height	.invalidate();
		this.ocean_depth	.invalidate();
		this.ice_coverage	.invalidate();
		this.ocean_coverage	.invalidate();
	}

	// private variables
	var surface_temp = undefined;
	var displacement = undefined;
	var material_density = undefined;

	function assert_dependencies() {
		if (surface_temp === void 0)	 { throw '"surface_temp" not provided'; }
		if (displacement === void 0)	 { throw '"displacement" not provided'; }
		if (material_density === void 0) { throw '"material_density" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		surface_temp 	= dependencies['surface_temp'] 		!== void 0? dependencies['surface_temp'] 		: surface_temp;
		displacement 	= dependencies['displacement'] 		!== void 0? dependencies['displacement'] 		: displacement;
		material_density= dependencies['material_density'] 	!== void 0? dependencies['material_density'] 	: material_density;
	}

	this.initialize = function() {
		assert_dependencies();
		this.average_ocean_depth = Float32Dataset.average(this.ocean_depth.value());
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();
	};

	this.applyChanges = function(timestep) {
		if (timestep === 0) {
			return;
		};

		assert_dependencies();
	};
}
