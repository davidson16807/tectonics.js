'use strict';

// a universe is a collection of celestial bodies that interact with one another
// the data structure is designed to allow for:
//  * iterative physics simulation
//  * "on-rails" simulation, ala Kerbal Space Program
//  * arbitrary assignment of cycle states from the user
// design principles:
//  * must be able to easily traverse through and update the state of all spins and orbits
//  * must be able to easily traverse through and update the state of all bodies
//  * must be able to easily track the position and orientation of all bodies
//  * must be able to easily find the incident radiation incurred on all bodies from all stars
//
//
// [
// 	{
// 		type: 'system'
// 		sma: 4.7e20,
// 		components: [
// 			{
// 				type: 'body'
// 				axial_tilt: ...
// 				body: sun
// 			},

// 			{
// 				type: 'system'
// 				sma: 1,
// 				components: [
// 					{
// 						axial_tilt: ...
// 						body: earth
// 					}
// 				]
// 			},
// 		]
// 	},
// ]
//
//
//
function Universe(parameters) {
	var self = this;

	this.stars = parameters['stars'] | [];
	this.bodies = {};
	this.body_absolute_positions = {};

	this.orbits = {};
	this.orbit_relative_positions = {};

	this.spins = [];

    // This calculates the incident radiation received by a celestial_body from all the light sources in the system
	this.incident_radiation = function (celestial_body, result) { 
		var grid = celestial_body.grid;

		body = celestial_body;
		var celestial_lineage = [body];
		while (body.orbit.parent){
			body = body.orbit.parent;
			celestial_lineage.push(body);
		}

		var celestial_cycles = celestial_lineage.map( body => body.orbit.cycle())

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

	function assert_dependencies() { }

	this.setDependencies = function(dependencies) { };

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
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
