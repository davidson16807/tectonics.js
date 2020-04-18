'use strict';

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
function SurfaceNormalMapRasterViewResources(initial_view_state) {
    const uniforms = Object.assign({}, initial_view_state);
    const grid = initial_view_state.grid;
    const geometry = grid.getBufferGeometry();
    geometry.addAttribute('displacement', { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('gradient',     { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 3 ), __proto__: THREE.BufferAttribute.prototype });

    const material = new THREE.ShaderMaterial({
        attributes: {
          displacement: { type: 'f', value: null },
          gradient:     { type: 'v3',value: null },
        },
        uniforms: {
          reference_distance:    { type: 'f', value: initial_view_state.reference_distance || Units.EARTH_RADIUS },
          world_radius:          { type: 'f', value: initial_view_state.world_radius || Units.EARTH_RADIUS },
          sealevel:              { type: 'f', value: initial_view_state.sealevel },
          ocean_visibility:      { type: 'f', value: initial_view_state.ocean_visibility },
          map_projection_offset: { type: 'f', value: initial_view_state.map_projection_offset },
        },
        blending: THREE.NoBlending,
        vertexShader: initial_view_state.world_view_vertex_shader,
        fragmentShader: fragmentShader
    });
    const mesh = new THREE.Mesh( geometry, material);

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
    function update_scalar_attribute(key, raster) {
        Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, mesh.geometry.attributes[key].array); 
        mesh.geometry.attributes[key].needsUpdate = true;
    }
    function update_vector_attribute(key, raster) {
        const x = raster.x;
        const y = raster.y;
        const z = raster.z;
        const array = mesh.geometry.attributes[key].array;
        const buffer_array_to_cell = raster.grid.buffer_array_to_cell;
        for (let i = 0, li = buffer_array_to_cell.length; i < li; i++) {
            array[i+li*0] = x[buffer_array_to_cell[i]];
            array[i+li*1] = y[buffer_array_to_cell[i]];
            array[i+li*2] = z[buffer_array_to_cell[i]];
        }
        mesh.geometry.attributes[key].needsUpdate = true;
    }


    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    */
    this.needsRemoval = function(raster, view_state) {
        return raster === void 0 ||
               raster.length !== grid.vertices.length;
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
        if (raster instanceof Uint8Array) {
            raster = Float32Raster.FromUint8Raster(raster);
        }
        if (raster instanceof Uint16Array) {
            raster = Float32Raster.FromUint16Raster(raster);
        }

        const gradient = ScalarField.gradient(raster);
        const world_radius = view_state.world_radius || Units.EARTH_RADIUS;
        const exaggeration_factor = view_state['exaggeration_factor'] || 100.0;
        VectorField.mult_scalar(gradient, exaggeration_factor/world_radius, gradient);

        update_vector_attribute('gradient',     gradient);
        update_scalar_attribute('displacement', raster);
        update_uniform('reference_distance',    view_state.reference_distance || Units.EARTH_RADIUS );
        update_uniform('world_radius',          view_state.world_radius || Units.EARTH_RADIUS );
        update_uniform('sealevel',              view_state.sealevel );
        update_uniform('ocean_visibility',      view_state.ocean_visibility );
        update_uniform('map_projection_offset', view_state.map_projection_offset );
        update_vertex_shader(view_state.world_view_vertex_shader:);

        if (view_state.displacement !== void 0) {
            update_uniform('sealevel',         view_state.sealevel);
        }
    };
    /*
    Modifies a given gl_state to remove references to the ViewResource and disposes resources
    */
    this.removeFromScene = function(gl_state) {
        gl_state.scene.remove(mesh);
        // mesh.geometry.dispose(); // do not dispose because we got it from grid in order to save memory
        mesh.material.dispose();
    };
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['SurfaceNormalMapRasterViewResources'] = SurfaceNormalMapRasterViewResources;


