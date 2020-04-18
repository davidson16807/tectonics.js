'use strict';

// All global resources that are used within this file are listed below:
window.FRAGMENT_SHADERS = window.FRAGMENT_SHADERS || {};
window.VERTEX_SHADERS = window.VERTEX_SHADERS || {};

/*
A "ViewResources" class seals off the resources that are needed by a graphics 
library to allow view state to be managed statelessly elsewhere. 
It practices strict encapsulation. Absolutely no state here is to be made publicly accessible.
This is offered as a guarantee to the rest of the code base,
and any attempt to circumvent this behavior will severely cripple your ability 
to reason with the rest of the code base. 
It practices resource allocation as initialization (RAII) 
to avoid painful issues involving the management of internal state.
It practices polymorphism so that a common frame of mind can be reused 
amongst similar ViewResources despite differences in internal state.
*/
function VectorRasterViewResources(initial_view_state) {
    const uniforms = Object.assign({}, initial_view_state);
    const grid = initial_view_state.grid;

    const geometry = new THREE.Geometry();
    const material = new THREE.ShaderMaterial({
        vertexShader:   initial_view_state.world_view_vertex_shader,
        fragmentShader: fragmentShaders.vector_field,
        attributes: {
            vector_fraction_traversed: { type: 'f', value: [] },
        },
        uniforms: { 
              reference_distance:    { type: 'f', value: initial_view_state.reference_distance || Units.EARTH_RADIUS },
              world_radius:          { type: 'f', value: initial_view_state.world_radius || Units.EARTH_RADIUS },
              reference_radius:      { type: 'f', value: initial_view_state.reference_radius || Units.EARTH_RADIUS },
              map_projection_offset: { type: 'f', value: initial_view_state.map_projection_offset },
              animation_phase_angle: { type: 'f', value: 0 }
        }
    });
    let v = {x:0, y:0, z:0}; 
    for (let i=0, li=grid.vertices.length; i<li; ++i) { 
        v = grid.vertices[i]; 
        geometry.vertices.push({x:v.x, y:v.y, z:v.z}); 
        geometry.vertices.push({x:v.x, y:v.y, z:v.z}); 
        material.attributes.vector_fraction_traversed.value.push(0); 
        material.attributes.vector_fraction_traversed.value.push(1); 
    } 
    const mesh = THREE.Line( geometry, material, THREE.LinePieces);

    function update_uniform(key, value) {
        if (uniforms[key] !== value) {
            uniforms[key] = value;
            if (mesh.material.uniforms[key] !== void 0) {
                mesh.material.uniforms[key].value = value;
                mesh.material.uniforms[key].needsUpdate = true;
            }
        }
    }
    function update_vertex_shader(value) {
        if (mesh.material.vertexShader !== value) {
            mesh.material.vertexShader = value; 
            mesh.material.needsUpdate = true; 
        }
    }

    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    */
    this.needsRemoval = function(raster, view_state) {
        return raster === void 0 ||
               raster.x.length !== grid.vertices.length;
    }
    /*
    Modifies a given gl_state to include the ViewResource.
    This modifies the state elsewhere, so it must be kept separate from the constructor.
    */
    this.addToScene = function(gl_state) {
        gl_state.scene.add(mesh);
    };
    /*
    Updates the ViewResource to reflect the most current state of the raster and view_state
    `raster` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.updateScene = function(gl_state, raster, view_state) {

        update_uniform('reference_distance',    view_state.reference_distance || Units.EARTH_RADIUS );
        update_uniform('world_radius',          view_state.world_radius || Units.EARTH_RADIUS );
        update_uniform('reference_radius',      view_state.reference_radius || Units.EARTH_RADIUS );
        update_uniform('map_projection_offset', view_state.map_projection_offset );
        update_uniform('animation_phase_angle', (mesh.material.uniforms.animation_phase_angle.value + 1e-1)%(2*3.14));
        update_vertex_shader(view_state.world_view_vertex_shader);

        const offset_length = 1.02;     // offset of arrow from surface of sphere, in radii
        const vector = mesh.geometry.vertices;

        const overlap_factor = 2;
        const max = view_state['max'] ||  Math.max.apply(null, VectorField.magnitude(raster));
        const scaling = overlap_factor * raster.grid.average_distance / max;

        const pos = raster.grid.pos;
        for (let i=0, li = raster.x.length; i<li; i++){
            const start = vector[2*i];
            start.x = offset_length * pos.x[i];
            start.y = offset_length * pos.y[i];
            start.z = offset_length * pos.z[i];
            const end = vector[2*i+1];
            end.x = raster.x[i] * scaling + start.x;
            end.y = raster.y[i] * scaling + start.y;
            end.z = raster.z[i] * scaling + start.z;
        }
        mesh.geometry.verticesNeedUpdate = true;

    };
    /*
    Modifies a given gl_state to remove references to the ViewResource and disposes resources
    */
    this.removeFromScene = function(gl_state) {
        gl_state.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    };
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['VectorRasterViewResources'] = VectorRasterViewResources;
