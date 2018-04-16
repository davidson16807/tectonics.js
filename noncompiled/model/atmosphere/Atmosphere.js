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
	var land_coverage 	= undefined;
	var ice_coverage 	= undefined;
	var plant_coverage 	= undefined;
	var mean_anomaly 	= undefined;
	var axial_tilt 		= undefined;
	var sealevel 		= undefined;

	function calculate_deltas(world, timestep) { }
	function calculate_refresh(world) { }

	function apply_deltas(world) { }
	function apply_refresh(world) { }

	function assert_dependencies() {
		if (mean_anomaly === void 0) { stop('"mean_anomaly" not provided'); }

		displacement 	= displacement 	|| stop('"displacement" not provided');
		land_coverage 	= land_coverage || stop('"land_coverage" not provided');
		ice_coverage 	= ice_coverage 	|| stop('"ice_coverage" not provided');
		plant_coverage 	= plant_coverage|| stop('"plant_coverage" not provided');
		axial_tilt 		= axial_tilt 	|| stop('"axial_tilt" not provided');
		sealevel 		= sealevel 		|| stop('"sealevel" not provided');
	}

	this.setDependencies = function(dependencies) {
		if (dependencies['mean_anomaly'] !== void 0) { mean_anomaly = dependencies['mean_anomaly']; }
		
		displacement 	= dependencies['displacement'] 	|| displacement;
		land_coverage 	= dependencies['land_coverage'] || land_coverage;
		ice_coverage 	= dependencies['ice_coverage'] 	|| ice_coverage;
		plant_coverage 	= dependencies['plant_coverage']|| plant_coverage;
		mean_anomaly 	= dependencies['mean_anomaly'] 	|| mean_anomaly;
		axial_tilt 		= dependencies['axial_tilt'] 	|| axial_tilt;
		sealevel 		= dependencies['sealevel'] 		|| sealevel;
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
