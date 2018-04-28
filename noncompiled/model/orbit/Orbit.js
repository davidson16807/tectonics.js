'use strict';

function Orbit(parameters) {
	var self = this;

	// private variables
	var grid = parameters['grid'] || stop('missing parameter: "grid"');
	var sample_num = parameters['orbit_sample_num'] || 12;

	var orbital_pos = new Memo( [], 
		function (result) {
			return OrbitalMechanics.get_eliptic_coordinate_sample(1, 0, self.mean_anomaly);
		}
	); 
	var incident_radiation_fraction = new Memo( //TODO: move this to a new "Orbit" class
		Float32Raster(grid),  
		function (result) {
			return AtmosphereModeling.daily_average_incident_radiation_fraction (
				grid.pos, 
				// this is a single vector of the planet's position in heliocentric eliptic coordinates (not to be confused with "pos")
				orbital_pos.value(), 
				self.axial_tilt, 
				sample_num,
				result
			);
		}
	);

	// public variables
	var self = this;
	this.daily_averaging = false;
	this.monthly_averaging = false;
	this.yearly_averaging = false;
	this.milankovich_cycle_averaging = false;
	this.global_solar_constant = parameters['global_solar_constant'] || 1.361; // kiloWatts per m^2 
	this.mean_anomaly 	= parameters['mean_anomaly'] 	|| 0;
	this.axial_tilt 	= parameters['axial_tilt'] 		|| Math.PI * 23.5/180;
	this.angular_speed 	= parameters['angular_speed'] 	|| 460; // m/s
	this.incident_radiation = new Memo( //TODO: move this to a new "Orbit" class
		Float32Raster(grid),  
		function (result) {
			return ScalarField.mult_scalar(incident_radiation_fraction.value(), self.global_solar_constant, result);
		}
	);

	function assert_dependencies() { }

	this.setDependencies = function(dependencies) { };

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		// NOTE: we don't need to invalidate these commented-out attributes, because the underlying data doesn't change often
		// incident_radiation_fraction 		.invalidate(); 
		// global_solar_constant 			.invalidate(); // TODO: uncomment this once you have a working model for stellar evolution
		// incident_radiation 				.invalidate(); // TODO: uncomment this once you have a working model for stellar evolution
		orbital_pos							.invalidate();
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
