'use strict';

// a universe is a collection of celestial bodies that interact with one another
// the data structure is designed to allow for:
//  * iterative physics simulation
//  * "on-rails" simulation, ala Kerbal Space Program
//  * arbitrary assignment of cycle states from the user (since any state is likely occur within a single million year timestep)
// design principles:
//  1. must be able to easily update the state of all "on-rails" motions
//  2. must be able to easily update the state of all bodies
//  3. must be able to easily track the position and orientation of all bodies relative to any other body
//  4. must be able to easily find the incident radiation incurred on all bodies from all stars
//  4. must be able to easily find the gravity induced on all bodies from all other bodies
//  5. must be able to enumerate all bodies to for easy selection by the user
// conclusions:
//  a. must contain a nested structure of all bodies, since this reflects the underlying data
//  b. from 1.), must contain an easily traversed structure of all motions
//  c. from 2.), must contain an easily traversed structure of all bodies
//  d. from 3.), must contain a function return a map between all bodies and their position/rotation matrices
//  e. from 4.), must contain an easily traversed structure of all stars
//  f. in order to accomplih 5.) using the data structures for a.), d.), and e.), the data structures must be index by a key
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
function Universe(motion_hierarchy) {
	var self = this;

	var motion_hierarchy = motion_hierarchy;
	
	var motion_hierarchy_nodes = motion_hierarchy.descendants();

	var body_nodes = 
		this.motion_hierarchy_nodes
			.filter	(node => node.body)
			// .map	(node => node.body)

	var body_nodes_lookup = 
		this.motion_hierarchy_nodes
			.filter	(node => node.body)
			.reduce	((map, node) => ({ ...map, [node.body.name]: node.body }), {}); // convert to dict
			// .map	(node => node.body)

	var star_nodes = 
		this.motion_hierarchy_nodes
			.filter	(node => node.body)
			.filter	(node => node.body instanceof Star)
			.map	(node => node.body)

//	this.invalidate = function() {
//
//	}
//
//	this.setDependencies = function(dependencies) {
//
//	}
//
//	this.initialize = function() {
//
//	}

	this.calcChanges = function(timestep) {
		if (timestep === 0) {
			return;
		};

		for (var i = 0; i < motion_hierarchy_nodes.length; i++) {
			motion_hierarchy_nodes[i].calcChanges(timestep);
		}
		for (var i = 0; i < body_nodes.length; i++) {
			body_nodes[i].body.calcChanges(timestep);
		}
	};

	this.applyChanges = function(timestep) {
		if (timestep === 0) {
			return;
		};

		for (var i = 0; i < motion_hierarchy_nodes.length; i++) {
			motion_hierarchy_nodes[i].applyChanges(timestep);
		}
		for (var i = 0; i < body_nodes.length; i++) {
			body_nodes[i].body.applyChanges(timestep);
		}
	};

    // This calculates the incident radiation received by a celestial_body from all the light sources in the system
	this.incident_radiation = function (celestial_body, result) { 
		var grid = celestial_body.grid;

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
}
