
// A "System" is a class representation of an isolated physical system
// it is essentially a node in a scene graph 
// It is designed for on-rails physics simulation over large distances.
// It offers support for constantly changing transformation matrices,
// and allows arbitrary nodes to be designated as the origin of a coordinate system.
// Designating arbitrary nodes as the origin is meant to resolve floating point precision issues 
// that commonly occur for very distant objects, A.K.A. the "Deep Space Kraken" of Kerbal Space Program
function System(parent, parameters) {
	// name of the cycle induced by the system
	this.name 		= parameters['name'];

	if (parameters.motion === void 0) {
		stop('missing parameter: "motion"');
	}
	if (parameters.motion.type === void 0) {
		stop('missing parameter: "motion.type"');
	}
	// the motion that characterizes all bodies within the system
	// motion can currently either be an "Orbit" or "Spin", although it could be any class that instantiates their methods
	this.motion = {
		'orbit': () => new Orbit(parameters.motion),
		'spin': () => new Spin(parameters.motion),
	}[parameters.motion.type]();

	// the body that exhibits the motion (optional)
	// the position/rotation of the body is described by a coordinate basis that is designated by this node
	// remember that a path need not always have a body - 
	// it may for instance describe a group of objects that are gravitationally bound
	this.body = undefined;
	if (parameters.body !== void 0) {
		if (parameters.body.type === void 0) {
			stop('missing parameter: "body.type"');
		}
		this.body = {
			'world': () => new World(parameters.body),
			'star': () => new Star(parameters.body),
		}[parameters.body.type]();
	}

	// the parent motion of the scene graph node (optional)
	// the motion described by this.motion assumes a coordinate basis that is designated by the parent node
	// TODO: maybe set this to a dependency? it is assigned by the Universe object, after all
	this.parent 	= parent;

	// the child motions of the scene graph node (optional)
	// the motions described by the children assume a coordinate basis that is designated by this node
	this.children = (parameters.children || []).map(child_parameters => new System(this, child_parameters));

	// whether or not the insolation of child bodies will change throughout this system's motion
	this.invariant_insolation = parameters['invariant_insolation'] || false;

	this.getParameters = function() {
		return {
			name: 		this.name,
			motion: 	this.motion  .getParameters(),
			body: 		this.body === void 0? 	undefined : this.body.getParameters(),
			children: 	this.children.map(	child => child.getParameters()	),
			invariant_insolation: this.invariant_insolation,
		};
	}

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

}