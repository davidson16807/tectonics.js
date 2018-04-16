'use strict';

function Biosphere(parameters) {

	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	// public variables
	this.npp = Float32Raster(grid);
	this.lai = Float32Raster(grid);
	this.plant_coverage = Float32Raster(grid);

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
	function calculate_refresh(world) { }

	function apply_deltas(world) { }
	function apply_refresh(world) { }

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
	};

	this.initialize = function() {
		assert_dependencies();

	}

	this.calcChanges = function(timestep) {
		assert_dependencies();

		calculate_deltas(this, timestep); 	// this creates a world map of all additions and subtractions rasters
		calculate_refresh(this); 			// this calculates the updated state of the model to reflect the most recent changes to derived attributes
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		
		assert_dependencies();

		apply_deltas(this); 	// this applies additions and subtractions to rasters
		apply_refresh(this); 	// this applies the updated state of the model to reflect the most recent changes to derived attributes
	};
}