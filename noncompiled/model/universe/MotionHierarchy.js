
// A "MotionHierarchy" is a variant on the "scene graph" game design pattern.
// Unlike the scene graph, it is tailor made for on-rails physics simulation over large distances.
// It offers support for constantly changing transformation matrices,
// and allows arbitrary nodes to be designated as the origin of a coordinate system.
// Designating arbitrary nodes as the origin is meant to resolve floating point precision issues 
// that commonly occur for very distant objects, A.K.A. the "Deep Space Kraken" of Kerbal Space Program
function MotionHierarchy(parameters) {
	// the motion that describes the transformation matrix of the scene graph node
	this.motion 	= parameters['motion'] || stop('missing parameter: "motion"');
	// the parent motion of the scene graph node (optional)
	// the motion described by this.motion assumes a coordinate basis that is designated by the parent node
	this.parent 	= parameters['parent'];
	// the child motions of the scene graph node (optional)
	// the motions described by the children assume a coordinate basis that is designated by this node
	this.children 	= parameters['children'] || [];
	// the body that exhibits the motion (optional)
	// the position/rotation of the body is described by a coordinate basis that is designated by this node
	// remember that a path need not always have a body - 
	// it may for instance describe a group of objects that are gravitationally bound
	this.body		= parameters['body'];
	// returns a dictionary mapping body ids to transformation matrices
	//  indicating the position/rotation relative to this node 
	this.get_parent_relative_matrices = function (origin) {
		var parent 	 = this.parent;
		var children = this.children;

		map = {};
		if (parent !== void 0 && parent !== origin) {
			// NOTE: don't consider origin, or else an infinite recursive loop will result
			map.push.apply(parent.get_parent_relative_matrices(this)
				.map(pair => 
					{
						'body':   pair.body, 
						'matrix': Matrix4x4.mult_matrix(parent.motion.get_parent_to_child_matrix(), pair.matrix)
					}
				)
			);
		}
		for (var i = 0; i < children.length; i++) {
			if (children[i] === origin) {
				continue;
			}
			// NOTE: don't consider origin, or else an infinite recursive loop will result
			map.push.apply(children[i].get_parent_relative_matrices(this)
				.map(pair=>
					{
						'body':   pair.body, 
						'matrix': Matrix4x4.mult_matrix(this.motion.get_child_to_parent_matrix(), pair.matrix)
					}
				)
			);
		}
		if (body !== void 0) {
			map.push(
					{
						'body':   this.body, 
						'matrix': this.motion.get_child_to_parent_matrix()
					}
			);
		}
		return map;
	}
}