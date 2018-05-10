'use strict';

function Orbit(parameters) {
	var self = this;

	// private variables
	var grid = parameters['grid'] || stop('missing parameter: "grid"');
	var sample_num = parameters['orbit_sample_num'] || 12;

	var orbital_pos = new Memo( [], 
		function (result) {
			return OrbitalMechanics.get_self_centric_to_parent_centric_offset(self.mean_anomaly, 1.);
		}
	); 


    // This calculates the fraction of the global solar constant that's felt by the surface of a planet. 
	// This fraction is the cosine of solar zenith angle, as seen in Lambert's law. 
	// The fraction is calculated as a daily average for every region on the globe 
	// 
	// Q: Why calculate the fraction in a separate function? Why not just calculate incident radiation? 
	// A:  The fraction stays constant over time because we assume the planet's orbit is stable, 
	//     but the global solar constant changes over time due to stellar aging. 
	//     It takes much longer to recompute the fraction than it does the global solar constant. 
	//     We calculate the fraction in a separate function so we can store the result for later. 
	this.incident_radiation = new Memo( //TODO: move this to a new "Orbit" class
		Float32Raster(grid),  
		function (result) { 

			// TODO: need scratch for these 
			var surface_normal = VectorRaster(grid); 
			var incident_radiation_sample = Float32Raster(grid); 
			var incident_radiation_sum  = Float32Raster(grid); 

			var add = ScalarField.add_field; 

			var PI = Math.PI; 
			var equatorial_to_ecliptic_matrix = undefined; 
			var rotation_angle = 0.;  
			var heliocentric_ecliptic_pos = 
				OrbitalMechanics.get_self_centric_to_parent_centric_offset( 
					self.mean_anomaly,
					self.semi_major_axis, 
					self.eccentricity, 
					self.inclination,
					self.argument_of_periapsis,
					self.longitude_of_ascending_node
				); 
			for (var i=0; i<sample_num; ++i) { 
				rotation_angle = i * 2*PI/sample_num; 
				equatorial_to_ecliptic_matrix = 
					OrbitalMechanics.get_equatorial_to_ecliptic_matrix( 
						rotation_angle,  
						self.axial_tilt,  
						self.precession_angle 
					); 

				// find surface normal, i.e. vector that points straight up from the ground 
				VectorField.mult_matrix(
					grid.pos, 
					equatorial_to_ecliptic_matrix, 
					surface_normal 
				); 

				OrbitalMechanics.incident_radiation(
					surface_normal,
					heliocentric_ecliptic_pos,
					self.stellar_luminosity, 
					incident_radiation_sample,
				); 

				add      (incident_radiation_sum, incident_radiation_sample,   	incident_radiation_sum); 
			} 
			ScalarField.div_scalar(incident_radiation_sum, sample_num, result); 
			return result; 
		}
	);

	// public variables
	var self = this;
	this.mean_anomaly 				= parameters['mean_anomaly'] 				|| 0;
	this.semi_major_axis			= parameters['semi_major_axis'] 			|| OrbitalMechanics.ASTRONOMICAL_UNIT;
	this.stellar_luminosity			= parameters['stellar_luminosity'] 			|| OrbitalMechanics.SOLAR_LUMINOSITY;
	this.eccentricity				= parameters['eccentricity'] 				|| 0;
	this.inclination				= parameters['inclination'] 				|| 0;
	this.argument_of_periapsis		= parameters['argument_of_periapsis'] 		|| 0;
	this.longitude_of_ascending_node= parameters['longitude_of_ascending_node'] || 0;
	this.precession_angle			= parameters['precession_angle'] 			|| 0;
	this.axial_tilt 				= parameters['axial_tilt'] 					|| Math.PI * 23.5/180;
	this.angular_speed 				= parameters['angular_speed'] 				|| 460; // m/s

	function assert_dependencies() { }

	this.setDependencies = function(dependencies) { };

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		// NOTE: we don't need to invalidate these commented-out attributes, because the underlying data doesn't change often
		orbital_pos							.invalidate();
		// global_solar_constant 			.invalidate(); // TODO: uncomment this once you have a working model for stellar evolution
		this.incident_radiation				.invalidate();
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
