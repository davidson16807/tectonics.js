'use strict';

function Biosphere(parameters) {
	var self = this;
	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	// public variables
	var self = this;
	this.npp = new Memo(
		Float32Raster(grid),  
		result => BiosphereModeling.net_primary_productivity(surface_temp.value(), precip.value(), npp_max, result)
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

	var surface_temp = undefined;
	var precip = undefined;
	var growth_factor 	= parameters['growth_factor'] || 1; // This is something I haven't bothered parameterizing. If c=1/∞, then npp∝lai
	var npp_max 		= parameters['npp_max'] || 1;
	var lai_max 		= parameters['lai_max'] || 1;

	function calculate_deltas(world, timestep) { }

	function apply_deltas(world) { }

	function assert_dependencies() {
		if (surface_temp === void 0)	{ throw '"surface_temp" not provided'; }
		if (precip === void 0)	 		{ throw '"precip" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		surface_temp 	= dependencies['surface_temp'] 	!== void 0? 	dependencies['surface_temp'] 	: surface_temp;
		precip 			= dependencies['precip'] 		!== void 0? 	dependencies['precip'] 			: precip;
		growth_factor 	= dependencies['growth_factor'] !== void 0? 	dependencies['growth_factor'] 	: growth_factor;
		npp_max 		= dependencies['npp_max'] 		!== void 0? 	dependencies['npp_max'] 		: npp_max;
		lai_max 		= dependencies['lai_max'] 		!== void 0? 	dependencies['lai_max'] 		: lai_max;
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