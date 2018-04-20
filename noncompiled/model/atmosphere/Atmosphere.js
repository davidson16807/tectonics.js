'use strict';

function Atmosphere(parameters) {

	// private variables
	var grid = parameters['grid'] || stop('missing parameter: "grid"');
	var orbit_sample_num = 12;
	var lat = new Memo(
		Float32Raster(grid),  
		function (result) {
			return Float32SphereRaster.latitude(grid.pos.y, result);
		}
	); 
	var daily_average_incident_radiation_fraction = new Memo( //TODO: move this to a new "Orbit" class
		Float32Raster(grid),  
		function (result) {
			return AtmosphereModeling.daily_average_incident_radiation_fraction (
				grid.pos, 
				// this is a single vector of the planet's position in heliocentric eliptic coordinates (not to be confused with "pos")
				orbital_pos.value(), 
				axial_tilt, 
				orbit_sample_num,
				result
			);
		}
	);
	var orbital_pos = new Memo( [],  //TODO: move this to a new "Orbit" class
		function (result) {
			return OrbitalMechanics.get_eliptic_coordinate_sample(1, 0, world.mean_anomaly);
		}
	); 

	// public variables
	var self = this;
	this.surface_temp = new Memo(
		Float32Raster(grid),  
		function (result) {
			return AtmosphereModeling.surface_air_temp(grid.pos, mean_anomaly, axial_tilt, result);
		}
	); 
	this.surface_pressure = new Memo(
		Float32Raster(grid),  
		function (result) {
			return AtmosphereModeling.surface_air_pressure(
				displacement.value(), 
				lat.value(), 
				sealevel.value(), 
				mean_anomaly, 
				axial_tilt, 
				result
			);
		}
	); 
	this.surface_wind_velocity = new Memo(
		VectorRaster(grid),  
		function (result) {
			return AtmosphereModeling.surface_air_velocity(grid.pos, surface_pressure.value(), angular_speed, result);
		}
	); 
	this.precip = new Memo(
		Float32Raster(grid),  
		function (result) {
			return AtmosphereModeling.precip(lat.value(), result);
		}
	); 

	// private variables
	var displacement 	= undefined;
	var ice_coverage 	= undefined;
	var plant_coverage 	= undefined;
	var mean_anomaly 	= undefined;
	var axial_tilt 		= undefined;
	var angular_speed 	= undefined;
	var sealevel 		= undefined;


	function assert_dependencies() {
		if (displacement === void 0)	 { throw '"displacement" not provided'; }
		if (ice_coverage === void 0)	 { throw '"ice_coverage" not provided'; }
		if (plant_coverage === void 0)	 { throw '"plant_coverage" not provided'; }
		if (mean_anomaly === void 0)	 { throw '"mean_anomaly" not provided'; }
		if (axial_tilt === void 0)		 { throw '"axial_tilt" not provided'; }
		if (angular_speed === void 0)	 { throw '"angular_speed" not provided'; }
		if (sealevel === void 0)		 { throw '"sealevel" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		displacement 	= dependencies['displacement'] 	!== void 0? 	dependencies['displacement'] 	: displacement;		
		ice_coverage 	= dependencies['ice_coverage'] 	!== void 0? 	dependencies['ice_coverage'] 	: ice_coverage;		
		plant_coverage 	= dependencies['plant_coverage']!== void 0? 	dependencies['plant_coverage'] 	: plant_coverage;	
		mean_anomaly 	= dependencies['mean_anomaly'] 	!== void 0? 	dependencies['mean_anomaly'] 	: mean_anomaly;		
		axial_tilt 		= dependencies['axial_tilt'] 	!== void 0? 	dependencies['axial_tilt'] 		: axial_tilt;		
		angular_speed 	= dependencies['angular_speed'] !== void 0? 	dependencies['angular_speed'] 	: angular_speed;	
		sealevel 		= dependencies['sealevel'] 		!== void 0? 	dependencies['sealevel'] 		: sealevel;			
	};

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		// NOTE: we don't need to invalidate these commented-out attributes, because the underlying data doesn't change often
		//daily_average_incident_radiation_fraction.invalidate(); 
		//lat 	 					.invalidate(); 
		orbital_pos					.invalidate();
		this.surface_temp 			.invalidate();
		this.surface_pressure 		.invalidate();
		this.surface_wind_velocity 	.invalidate();
		this.precip 				.invalidate();
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		
		assert_dependencies();
	};
}
