
// A "System" is a class representation of an isolated physical system
// it is essentially a node in a scene graph 
// It is designed for on-rails physics simulation over large distances.
// It offers support for constantly changing transformation matrices,
// and allows arbitrary nodes to be designated as the origin of a coordinate system.
// Designating arbitrary nodes as the origin is meant to resolve floating point precision issues 
// that commonly occur for very distant objects, A.K.A. the "Deep Space Kraken" of Kerbal Space Program
function System(parameters) {
	// name of the cycle induced by the system
	this.name 		= parameters['name'];

	// the motion that characterizes all bodies within the system
	// motion can currently either be an "Orbit" or "Spin", although it could be any class that instantiates their methods
	this.motion 	= parameters['motion'] || stop('missing parameter: "motion"');

	// the parent motion of the scene graph node (optional)
	// the motion described by this.motion assumes a coordinate basis that is designated by the parent node
	this.parent 	= parameters['parent'];

	// the child motions of the scene graph node (optional)
	// the motions described by the children assume a coordinate basis that is designated by this node
	this.children 	= parameters['children'] || [];

	// iterate through children and assign their parents
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].parent = this;
	}

	// the body that exhibits the motion (optional)
	// the position/rotation of the body is described by a coordinate basis that is designated by this node
	// remember that a path need not always have a body - 
	// it may for instance describe a group of objects that are gravitationally bound
	this.body		= parameters['body'];

	// gets a list of all nodes at or below this one in the hierarchy
	this.ancestors = function () {
		return [
			...(this.parent === void 0? [] : this.parent.ancestors()), 
			this
		];
	}
	// gets a list of all nodes at or below this one in the hierarchy
	this.descendants = function () {
		return [
			this, 
			...this.children
				.map(child => child.descendants())
				.reduce((acc, e) => acc.concat(e), [])
		];
	}

	var id_to_descendant_map = this
		.descendants()
		.reduce((acc, x) => { acc[x.name] = x; return acc; }, {} );

	var mult_matrix = Matrix4x4.mult_matrix;

	// returns a dictionary mapping body ids to transformation matrices
	//  indicating the position/rotation relative to this node 
	this.get_body_matrices = function (config, origin) {
		origin = origin || this;
		var parent 	 = this.parent;
		var children = this.children;
		var system_config = (config[this.name] || 0);

		var map = {};
		if (parent !== void 0) {
			// NOTE: don't consider origin, or else an infinite recursive loop will result
			if (parent !== origin) {
				var parent_map = parent.get_body_matrices(config, this);
				for(var key in parent_map){
					map[key] = mult_matrix( this.motion.get_parent_to_child_matrix(system_config), parent_map[key] )
				}
			}
		}
		for (var i = 0; i < children.length; i++) {
			// NOTE: don't consider origin, or else an infinite recursive loop will result
			if (children[i] !== origin) {
				var child_map = children[i].get_body_matrices(config, this);
				var child_config = (config[children[i].name] || 0);
				for(var key in child_map){
					map[key] = mult_matrix( children[i].motion.get_child_to_parent_matrix(child_config), child_map[key] )
				}
			}
		}
		if (this.body !== void 0) {
			map[this.body.name] = Matrix4x4.identity();
		}
		return map;
	}

	// amount of real-world time below which user could no longer perceive the effects of a cycle, in seconds
	IMPERCEPTABLY_SMALL_TIME = 1/2; // half a second
	// amount of real-world time above which user could no longer perceive the effects of a cycle, in seconds
	IMPERCEPTABLY_LARGE_TIME = 60*60*24; // 1 day

	// find all resonances that must be considered for a given timestep
	var find_resonances = function(timestep) {
		resonances = [];
		fps = fps || 60;

		// if two cycles are out of sync, they form a larger cycle
		// if the sim needs to run more than a day to see the effects of that larger cycle, don't bother simulating it.

		for(cycle1 in id_to_descendant_map){
			for(cycle2 in id_to_descendant_map){
				var period1 = id_to_descendant_map[cycle1].motion.period();
				var period2 = id_to_descendant_map[cycle2].motion.period();

				// only consider where larger period is first
				if (period1 > period2) { continue; }
				var period_ratio = period1 / period2;

				// NOTE: resonances with whole numbers greater than 10 are not noticeable enough to consider
				// e.g. 3/4 is ok, but not 11/15
				for (var i = 0; i < 10; i++) {
					// offset from whole number after i iterations of cycle1
					var mismatch_after_i_periods = (period_ratio * i) % 1.

					// number of cycle1 iterations that are needed for mismatches to compound into a half turn
					var randomization_cycle_count = 1/(2*mismatch_after_shared_cycle)
					var randomization_time = randomization_cycle_count * i * period1;
					if (timestep / randomization_time > IMPERCEPTABLY_SMALL_TIME) {
						resonances.push({ 
							large_cycle: cycle1, 
							large_cycle_iterations: i, 
							small_cycle: cycle2, 
							small_cycle_iterations: i * period_ratio, 
							ratio: period_ratio,
							randomization_time: randomization_time
						});
					}
				}
			}
		}
	}

	//given a cycle configuration, "advance()" returns the cycle configuration that would occur after a given amount of time
	this.advance = function(config, timestep, output, fps) {
		output = output || {};
		fps = fps || 60;

		for(id in id_to_descendant_map){
			if (id_to_descendant_map[id] === void 0) { continue; }
			var period = id_to_descendant_map[id].motion.period();
			// if cycle completes too fast for the user to perceive, don't simulate 
			if (timestep / period > 1/(fps*IMPERCEPTABLY_SMALL_TIME) ) 	{ continue; } 
			// if cycle completes too slow for the user to perceive, don't simulate
			if (timestep / period < 1/(fps*IMPERCEPTABLY_LARGE_TIME) ) 	{ continue; } 
			output[id] = ((config[id] || 0) + 2*Math.PI * (timestep / period)) % (2*Math.PI);
		}

		return output;
	}
	// given a cycle configuration with undefined cycle states, 
	// "sample()" generates list of cycle configurations that sample over each cycle with undefined states
	// this is useful for finding, e.g. mean daily solar radiation
	// the function will not generate more than a given number of samples per cycle
	this.sample = function(config, samples_per_cycle) {
		for(id in config){
			
		}
	}
}