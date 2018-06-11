
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
	var ids_by_period = this
		.descendants()
		.sort((a,b) => a.motion.period() - b.motion.period())
		.reverse()
		.map(x => x.name);
	var bodies = this
		.descendants()
		.map(x => x.body)
		.filter(x => x !== void 0);

	var mult_matrix = Matrix4x4.mult_matrix;


	//given a cycle configuration, "advance()" returns the cycle configuration that would occur after a given amount of time
	this.advance = function(config, timestep, output, min_frames_per_cycle, max_frames_per_cycle) {
		output = output || {};
		// number of frames below which user could no longer perceive the effects of a cycle, in seconds
		min_frames_per_cycle = min_frames_per_cycle || 30/2; // half a second
		// number of frames above which user could no longer perceive the effects of a cycle, in seconds
		max_frames_per_cycle = max_frames_per_cycle || 60*60*24*30; // 1 day worth at 30fps

		for(id in id_to_descendant_map){
			if (id_to_descendant_map[id] === void 0) { continue; }
			var period = id_to_descendant_map[id].motion.period();
			// default to current value, if present
			if (config[id]) { output[id] = config[id]};
			// if cycle completes too fast for the user to perceive, don't simulate 
			if (timestep / period > 1/(min_frames_per_cycle) ) 	{ continue; }
			// if cycle completes too slow for the user to perceive, don't simulate
			if (timestep / period < 1/(max_frames_per_cycle) ) 	{ continue; }
			output[id] = ((config[id] || 0) + 2*Math.PI * (timestep / period)) % (2*Math.PI);
		}

		return output;
	}
	// given a cycle configuration and timestep, 
	// "sample()" generates a list of cycle configurations that are representative of that timestep
	// this is useful for finding, e.g. mean daily solar radiation
	// the function will not generate more than a given number of samples per cycle
	this.samples = function(config, timestep, samples_per_cycle, min_frames_per_cycle) {
		// number of frames below which user could no longer perceive the effects of a cycle, in seconds
		min_frames_per_cycle = min_frames_per_cycle || 30/2; // half a second

		// list of configs to sample across, starting with a clone of config
		var samples = [Object.assign({}, config)];
		// for each imperceptably small cycle:
		for(id of ids_by_period) {
			if (id_to_descendant_map[id] === void 0) { continue; }
			var period = id_to_descendant_map[id].motion.period();
			// if the cycle takes more than a given number of frames to complete, 
			// then it can be perceived by the user, so don't sample across it
			if (period / timestep > min_frames_per_cycle ) 	{ continue; }
			debugger
			// sample across the cycle's period and add results to `samples`
			var period = id_to_descendant_map[id].motion.period();
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
		for (child of children) {
			// NOTE: don't consider origin, or else an infinite recursive loop will result
			if (child !== origin) {
				var child_map = child.get_body_matrices(config, this);
				var child_config = (config[child.name] || 0);
				for(var key in child_map){
					map[key] = mult_matrix( child.motion.get_child_to_parent_matrix(child_config), child_map[key] )
				}
			}
		}
		if (this.body !== void 0) {
			map[this.body.name] = Matrix4x4.identity();
		}
		return map;
	}

	this.get_insolation = function(config, origin, surface_normal, insolation) {
		var body_matrices = this.get_body_matrices(config, origin);
		var insolation_sample = Float32Raster(insolation.grid);
		var total_insolation = insolation; // double duty
		// clear out result
		Float32Raster.fill(insolation, 0);
		var stars = bodies.filter(body => body instanceof Star);
		for (star of stars) {
			var star = body;
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
}