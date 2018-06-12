'use strict';

// a universe is a collection of celestial bodies that interact with one another
// the data structure is designed to allow for:
//  * iterative physics simulation
//  * "on-rails" simulation, ala Kerbal Space Program
//  * arbitrary assignment of cycle states from the user (since the system is ergodic - any state is likely occur within a single million year timestep)
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


function Universe(hierarchy, config) {
	config = config || {};

	var id_to_node_map = this
		.descendants()
		.reduce((acc, x) => { acc[x.name] = x; return acc; }, {} );
	var nodes_by_period = this
		.descendants()
		.sort((a,b) => a.motion.period() - b.motion.period())
		.reverse();
	var bodies = this
		.descendants()
		.filter(x => x.body !== void 0)
		.map(x => x.body);
	var body_id_to_node_map = this
		.descendants()
		.filter(x => x.body !== void 0)
		.reduce((acc, x) => { acc[x.body.name] = x; return acc; }, {} );

	//given a cycle configuration, "advance()" returns the cycle configuration that would occur after a given amount of time
	function advance(config, timestep, output, min_frames_per_cycle, max_frames_per_cycle) {
		output = output || {};
		// number of frames below which user could no longer perceive the effects of a cycle, in seconds
		min_frames_per_cycle = min_frames_per_cycle || 30/2; // half a second
		// number of frames above which user could no longer perceive the effects of a cycle, in seconds
		max_frames_per_cycle = max_frames_per_cycle || 60*60*24*30; // 1 day worth at 30fps

		for(id in id_to_node_map){
			if (id_to_node_map[id] === void 0) { continue; }
			var period = id_to_node_map[id].motion.period();
			// default to current value, if present
			if (config[id]) { output[id] = config[id]};
			// if cycle completes too fast for the user to perceive, don't simulate 
			if (period / timestep > min_frames_per_cycle ) 	{ continue; }
			// if cycle completes too slow for the user to perceive, don't simulate
			if (period / timestep < max_frames_per_cycle ) 	{ continue; }
			output[id] = ((config[id] || 0) + 2*Math.PI * (timestep / period)) % (2*Math.PI);
		}

		return output;
	}

	// given a cycle configuration and timestep, 
	// "sample()" generates a list of cycle configurations that are representative of that timestep
	// this is useful for finding, e.g. mean daily solar radiation
	// the function will not generate more than a given number of samples per cycle
	function samples(config, timestep, samples_per_cycle, min_frames_per_cycle) {
		// number of frames below which user could no longer perceive the effects of a cycle, in seconds
		min_frames_per_cycle = min_frames_per_cycle || 30/2; // half a second

		// list of configs to sample across, starting with a clone of config
		var samples = [Object.assign({}, config)];
		// for each imperceptably small cycle:
		for(node of nodes_by_period) {
			if (node === void 0) { continue; }
			var period = node.motion.period();
			// if the cycle takes more than a given number of frames to complete, 
			// then it can be perceived by the user, so don't sample across it
			if (period / timestep > min_frames_per_cycle ) 	{ continue; }
			// sample across the cycle's period and add results to `samples`
			var period = node.motion.period();
			var subsamples = [];
			for (sample of samples) {
				for (var j = 0; j < samples_per_cycle; j++) {
					subsamples.push(this.advance(sample, j*period/samples_per_cycle, {}, 1));
				}
			}
			samples = subsamples;
		}
		return samples;
	}

	function insolation(config, body, insolation) {
		var insolation = insolation || Float32Raster(body.grid);
		var insolation_sample = Float32Raster(body.grid);

		var origin = body_id_to_node_map[body.name];
		var surface_normal = body.grid.pos;

		var body_matrices = origin.get_body_matrices(config);
		// clear out result
		Float32Raster.fill(insolation, 0);
		var stars = bodies.filter(body => body instanceof Star);
		for (star of stars) {
			var star_matrix = body_matrices[star.name];
			var star_pos = Matrix4x4.get_translation(star_matrix);
			// calculate insolation effects of a single star
			Optics.incident_radiation(
				surface_normal,
				star_pos, 
				star.luminosity,
				insolation_sample
			);
			// TODO: add effects of occlusion, e.g. moons around gas giants
			ScalarField.add_field(insolation, insolation_sample, insolation);
		}
		return insolation;
	}

	this.average_insolation(body, timestep, samples_per_cycle, min_frames_per_cycle){
		var insolation_sample = Float32Raster(body.grid);

		min_frames_per_cycle = 100;
		var samples_ = samples(config, timestep, samples_per_cycle, min_frames_per_cycle);
		for (sample of samples_){
			insolation(sample, body, insolation_sample);
			
		}
	}

//
//	this.setDependencies = function(dependencies) {
//
//	}
//
	this.initialize = function() {

	}

	this.invalidate = function() {

	}

	this.calcChanges = function(timestep) {
		if (timestep === 0) {
			return;
		};
	};

	this.applyChanges = function(timestep) {
		if (timestep === 0) {
			return;
		};

		hierarchy.advance(config, timestep, config); 
	};
}
