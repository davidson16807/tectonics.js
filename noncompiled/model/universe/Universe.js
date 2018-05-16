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
//  4. must be able to easily find the incident radiation incurred on all bodies from all stars, **for an arbitrary cycle configuration**
//  4. must be able to easily find the gravity induced on all bodies from all other bodies
//  5. must be able to enumerate all bodies to for easy selection by the user
// conclusions:
//  a. must contain a nested structure of all bodies, since this reflects the underlying data
//  b. from 1.), must contain an easily traversed structure of all motions
//  c. from 2.), must contain an easily traversed structure of all bodies
//  d. from 3.), must contain a function that returns a map between bodies and their transformation matrices
//  e. from 4.), must contain an easily traversed structure of all stars
//  d. from 4.), must **not store cycle configuration as an attribute of motion!** Cycle configuration must be stored in a separate structure
//  e. from d.), must have a way to map between motions in a hierarchy and state within a cycle configuration structure, i.e. a unique key for each motion
// 
// so we have the following:
// 
//motion hierarchy
//	ancestors(hierarchy, node)
//		returns a hierarchy containing only immediate ancestors of a given node 
//	descendants(hierarchy, node)
//		returns a hierarchy containing only immediate descendants of a given node 
//	zip(hierarchy1, hierarchy2)
//		zips two hierarchies into one
//	prune(hierarchy, nodes)
//		returns a hierarchy containing only cycles relating to a list of given nodes
//		effectively zip(ancestors(node1), ancestors(node2), ...)
//		usage for insolation is: prune(star1, star2, planet)
//	matrices(hierarchy, state, origin)
//		returns a dict mapping bodies to matrices that represent body position/rotation relative to origin node
//	iterate(hierarchy, state, timestep)
//		returns a state object representing cycle state after a given timestep
//	insolation(hierarchy, state)
//		returns a scalar field representing insolation at a well defined state
//	insolation(hierarchy, state, averaging_window_size, sample_num)
//		returns a scalar field representing average insolation across a averaging_window_size
//		we simply average between the fields and hope no resonance exists between cycles
//		can use several methods:
//			successively iterate() through averaging_window_size by 1.61 times period of shortest cycle
//			successively iterate() by 1.61^n that approximates averaging_window_size / sample_num
//			successively iterate() by averaging_window_size / sample_num
//
//'galactic revolution': {
//	motion:{sma: 4.7e20,}
//	parent: undefined
//	children: ['solar rotation', 'earth revolution']
//},
//'solar rotation': {
//	motion: { axial_tilt: 0, }
//	parent : 'galactic revolution'
//	children: []
//	body: 'sun'
//},
//'earth revolution': {
//	motion: { sma: 4.7e10, }
//	parent : 'galactic revolution'
//	children: ['earth rotation', 'moon revolution']
//},
//'earth rotation': {
//	motion: { axial_tilt: 0, }
//	parent : 'earth revolution'
//	children: []
//	body: 'earth'
//},
//'moon revolution': {
//	motion: { sma: 4.7e10, }
//	parent : 'earth revolution'
//	children: ['moon rotation']
//}
//'moon rotation': {
//	motion: { axial_tilt: 4.7e10, }
//	parent : 'moon revolution'
//	children: []
//	body: 'moon'
//}
//
//state:
//{
//	'galactic revolution': 0.5,
//	'sun rotation': 0.2,
//	'earth revolution': 0.3,
//	'earth rotation': undefined,
//	'moon revolution': 0.3,
//	'moon rotation': 0.3,
//}
//
//matrices:
//{
//	'sun': Matrix4x4(...),
//	'earth': Matrix4x4(...),
//	'moon': Matrix4x4(...),
//}
//


function Universe(motion_hierarchy) {
	var self = this;

	var motion_hierarchy = motion_hierarchy;

	var motion_hierarchy_nodes = motion_hierarchy.descendants();

	var star_nodes = 
		this.motion_hierarchy_nodes
			.filter	(node => node.body)
			.filter	(node => node.body instanceof Star)
			.map	(node => node.body)

	var body_nodes = 
		this.motion_hierarchy_nodes
			.filter	(node => node.body)
			// .map	(node => node.body)

	var body_nodes_lookup = 
		this.motion_hierarchy_nodes
			.filter	(node => node.body)
			.reduce	((map, node) => ({ ...map, [node.body.name]: node.body }), {}); // convert to dict
			// .map	(node => node.body)

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

    // This calculates the incident radiation received by a celestial body from all the light sources in the system
	this.incident_radiation = function (body, cycle_states, result) { 
		var grid = body.grid;

		var add = ScalarField.add_field; 
		var get_incident_radiation = Optics.incident_radiation;

		var body_node = body_nodes_lookup[body.name];
		var body_matrix_lookup = body_node.get_parent_relative_matrices();
		var body_surface_normal = grid.pos; 
		var incident_radiation_star = Float32Raster(grid); 
		// TODO: take the average of cycles whose period is small enough
		for (var i = 0; i < star_nodes.length; i++) {
			var star = star_nodes[i].body;
			var star_matrix = body_matrix_lookup[star.name];
			var star_pos = Vector.mult_matrix4x4(0,0,0, star_matrix);
			var star_pos = Vector.normalize(star_pos.x, star_pos.y, star_pos.z);
			get_incident_radiation(
				body_surface_normal,
				star_pos,
				star.stellar_luminosity, 
				incident_radiation_star,
			); 
			add (incident_radiation_star, incident_radiation_stars, incident_radiation_stars);
		}
		// TODO: need scratch for these 
		var incident_radiation_sum  = Float32Raster(grid); 


		ScalarField.div_scalar(incident_radiation_sum, sample_num, result); 
		return result; 
	}
}
