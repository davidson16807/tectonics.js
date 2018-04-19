'use strict';

function Atmosphere(parameters) {

	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	// public variables
	this.insolation = Float32Raster(grid);
	this.surface_temp = Float32Raster(grid);
	this.surface_pressure = Float32Raster(grid);
	this.surface_wind_velocity = VectorRaster(grid);
	this.precip = Float32Raster(grid);

	// private variables
	var surface_temp_refresh = Float32Raster(grid);
	var surface_pressure_refresh = Float32Raster(grid);
	var surface_wind_velocity_refresh = VectorRaster(grid);
	var precip_refresh = Float32Raster(grid);

	var displacement 	= undefined;
	var ice_coverage 	= undefined;
	var plant_coverage 	= undefined;
	var mean_anomaly 	= undefined;
	var axial_tilt 		= undefined;
	var sealevel 		= undefined;

	function calculate_deltas(world, timestep) { }

	function apply_deltas(world) { }

	function assert_dependencies() {
		if (displacement === void 0)	 { throw '"displacement" not provided'; }
		if (ice_coverage === void 0)	 { throw '"ice_coverage" not provided'; }
		if (plant_coverage === void 0)	 { throw '"plant_coverage" not provided'; }
		if (mean_anomaly === void 0)	 { throw '"mean_anomaly" not provided'; }
		if (axial_tilt === void 0)		 { throw '"axial_tilt" not provided'; }
		if (sealevel === void 0)		 { throw '"sealevel" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		displacement 	= dependencies['displacement'] 	!== void 0? 	dependencies['displacement'] 	: displacement;
		ice_coverage 	= dependencies['ice_coverage'] 	!== void 0? 	dependencies['ice_coverage'] 	: ice_coverage;
		plant_coverage 	= dependencies['plant_coverage']!== void 0? 	dependencies['plant_coverage'] 	: plant_coverage;
		mean_anomaly 	= dependencies['mean_anomaly'] 	!== void 0? 	dependencies['mean_anomaly'] 	: mean_anomaly;
		axial_tilt 		= dependencies['axial_tilt'] 	!== void 0? 	dependencies['axial_tilt'] 		: axial_tilt;
		sealevel 		= dependencies['sealevel'] 		!== void 0? 	dependencies['sealevel'] 		: sealevel;
	};

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();

		calculate_deltas(this, timestep); 	// this creates a world map of all additions and subtractions rasters
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		
		assert_dependencies();

		apply_deltas(this); 	// this applies additions and subtractions to rasters
	};
}
