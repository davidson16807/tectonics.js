'use strict';

function Biosphere(parameters) {
	var grid = parameters['grid'] || stop('missing parameter: "grid"');
	var growth_factor 	= parameters['growth_factor'] || 1; // This is something I haven't bothered parameterizing. If c=1/∞, then npp∝lai
	var npp_max 		= parameters['npp_max'] || 1;
	var lai_max 		= parameters['lai_max'] || 1;

	// public variables
	var self = this;
	this.npp = new Memo(
		Float32Raster(grid),  
		result => {
			return BiosphereModeling.net_primary_productivity(long_term_surface_temp.value(), precip.value(), npp_max, result)
		}
	); 
	this.lai = new Memo(
		Float32Raster(grid),  
		result => BiosphereModeling.leaf_area_index(self.npp.value(), npp_max, lai_max, result, growth_factor)
	); 
	this.plant_coverage = new Memo(
		Float32Raster(grid),  
		result => Float32RasterInterpolation.smoothstep(0, 1, self.lai.value(), result)
	); 

	// private variables
	var npp_refresh = Float32Raster(grid);
	var lai_refresh = Float32Raster(grid);
	var plant_coverage_refresh = Float32Raster(grid);

	var long_term_surface_temp = undefined;
	var precip = undefined;

	function calculate_deltas(world, timestep) { }

	function apply_deltas(world) { }

	function assert_dependencies() {
		if (long_term_surface_temp === void 0)	{ throw '"long_term_surface_temp" not provided'; }
		if (precip === void 0)	 		{ throw '"precip" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		long_term_surface_temp 	= dependencies['long_term_surface_temp'] 	!== void 0? 	dependencies['long_term_surface_temp'] 	: long_term_surface_temp;
		precip 			= dependencies['precip'] 		!== void 0? 	dependencies['precip'] 			: precip;
	}

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		this.npp.invalidate();
		this.lai.invalidate();
		this.plant_coverage.invalidate();
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();

		calculate_deltas(this, timestep); 	// this creates a world map of all additions and subtractions rasters
	}

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		
		assert_dependencies();

		apply_deltas(this); 	// this applies additions and subtractions to rasters
	}
}