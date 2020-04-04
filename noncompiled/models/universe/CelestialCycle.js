'use strict';

/*
A "CelestialCycle" is a class representation of an isolated physical system driven by a cycle
it is essentially a node in a scene graph 
It is designed for on-rails physics simulation over large distances.
It offers support for constantly changing transformation matrices,
and allows arbitrary nodes to be designated as the origin of a coordinate system.
Designating arbitrary nodes as the origin is meant to resolve floating point precision issues 
that commonly occur for very distant objects, A.K.A. the "Deep Space Kraken" of Kerbal Space Program
*/
function CelestialCycle(parameters) {
    this.id = parameters.id;
    this.name = parameters.name || parameters.id;

    if (parameters.motion === void 0) {
        stop('missing parameter: "motion"');
    }
    if (parameters.motion.type === void 0) {
        stop('missing parameter: "motion.type"');
    }
    /*
    the motion that characterizes all bodies within the cycle
    motion can currently either be an "Orbit" or "Spin", although it could be any class that instantiates their methods
    */
    this.motion = {
        'orbit': () => new Orbit(parameters.motion),
        'spin': () => new Spin(parameters.motion),
    }[parameters.motion.type]();

    /*
    the body that exhibits the motion (optional)
    the position/rotation of the body is described by a coordinate basis that is designated by this node
    remember that a path need not always have a body - 
    it may for instance describe a group of objects that are gravitationally bound
    */
    this.body = parameters.body;

    /*
    the parent motion of the scene graph node (optional)
    the motion described by this.motion assumes a coordinate basis that is designated by the parent node
    TODO: maybe set this to a dependency? it is assigned by the Universe object, after all
    */
    this.parent     = parameters.parent;

    /*
    the child motions of the scene graph node (optional)
    the motions described by the children assume a coordinate basis that is designated by this node
    */
    this.children = (parameters.children || []);

    // whether or not the insolation of child bodies will change throughout this cycle's motion
    this.invariant_insolation = parameters['invariant_insolation'] || false;

    this.getParameters = function() {
        return {
            id:           this.id,
            name:         this.name,
            motion:       this.motion.getParameters(),
            body:         this.body,
            parent:       this.parent,
            children:     this.children,
            invariant_insolation: this.invariant_insolation,
        };
    }

    const mult_matrix = Matrix4x4.mult_matrix;
    
    /*
    returns a dictionary mapping body ids to transformation matrices
     indicating the position/rotation relative to this node 
    */
    this.get_body_matrices = function (config, cycles, origin) {
        origin = origin || this.id;
        const parent   = this.parent;
        const children = this.children;
        const cycle_config = (config[this.id] || 0);

        const map = {};
        if (parent !== void 0) {
            // NOTE: don't consider origin, or else an infinite recursive loop will result
            if (parent !== origin) {
                const parent_map = cycles[parent].get_body_matrices(config, cycles, this.id);
                for(let key in parent_map){
                    const parent_to_child_matrix = this.motion.get_parent_to_child_matrix(cycle_config)
                    map[key] = mult_matrix(parent_to_child_matrix , parent_map[key] )
                }
            }
        }
        for (let child of children) {
            // NOTE: don't consider origin, or else an infinite recursive loop will result
            if (child !== origin) {
                const child_map = cycles[child].get_body_matrices(config, cycles, this.id);
                const child_config = (config[child] || 0);
                for(let key in child_map){
                    const child_to_parent_matrix = cycles[child].motion.get_child_to_parent_matrix(child_config);
                    map[key] = mult_matrix(child_to_parent_matrix, child_map[key] )
                }
            }
        }
        if (this.body !== void 0) {
            map[this.body] = Matrix4x4.identity();
        }
        return map;
    }

}