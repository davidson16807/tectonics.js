'use strict';

function Hydrosphere(grid, parameters) {

	var grid = grid || stop('missing parameter: "grid"');

	this.average_ocean_depth = parameters['average_ocean_depth'] || 2000; // meters, conserved quantity

	// public variables
	var _this = this; 
	this.sealevel = new Memo( 0,
		current_value => 
			HydrosphereModeling.solve_sealevel(
				displacement.value(), 
				_this.average_ocean_depth, 
				material_density.ocean, 
				// Float32Raster(grid) 
			),
		true,
	); 

	this.getParameters = function() {
		return { 
			average_ocean_depth: 	this.average_ocean_depth, 
		};
	}

	// height of sealevel, in meters, relative to the same datum level used by displacement
	this.epipelagic = new Memo( 0,  
		current_value => _this.sealevel.value()-200
	); 
	this.mesopelagic = new Memo( 0,  
		current_value => _this.sealevel.value()-1000
	); 
	// "elevation" is the height of the crust relative to sealevel
	this.elevation = new Memo(
		Float32Raster(grid),  
		result => ScalarField.sub_scalar(displacement.value(), _this.sealevel.value(), result)
	); 
	// "surface_height" is the height of the surface relative to sealevel - if elevation < 0, then surface_height = 0
	this.surface_height = new Memo(
		Float32Raster(grid),  
		result => HydrosphereModeling.get_surface_height(displacement.value(), _this.sealevel.value(), result)
	); 
	// "ocean_depth" is the depth of the ocean - if elevation > 0, then ocean_depth = 0; if elevation < 0, then ocean_depth > 0 
	this.ocean_depth = new Memo(
		Float32Raster(grid),  
		result => HydrosphereModeling.get_ocean_depth(displacement.value(), _this.sealevel.value(), result)
	); 
	this.ice_coverage = new Memo(
		Float32Raster(grid),  
		result => { 
			if (surface_temp === void 0) {
				Float32Raster.fill(result, 0);
				return result;
			}
			var freezing_point = 273.15; // TODO: move this to Atmosphere, and update this to reflect surface_pressure
			Float32RasterInterpolation.lerp(
					1, 0, 
					Float32RasterInterpolation.smoothstep(freezing_point-5, freezing_point, surface_temp),
					result
				);
			Float32RasterGraphics.fill_into_selection(
				result, 0.,
				ScalarField.lt_field(
					displacement.value(), 
					Float32RasterInterpolation.lerp(
						_this.mesopelagic.value(), 
						_this.epipelagic.value(),
						Float32RasterInterpolation.smoothstep(freezing_point-5, freezing_point, surface_temp)
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
			_this.sealevel.value(), 
			_this.epipelagic.value(), 
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
		// NOTE: surface_temp is not a strict requirement
		// if (surface_temp === void 0)	 { throw '"surface_temp" not provided'; }
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
