'use strict';

// All global resources that are used within this file are listed below:
window.FRAGMENT_SHADERS = window.FRAGMENT_SHADERS || {};

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
function ColorscaleRasterViewResources(initial_view_state) {
    function hex_color_to_three_js_vector(color) {
        const rIntValue = ((color / 256 / 256) % 256) / 255.0;
        const gIntValue = ((color / 256      ) % 256) / 255.0;
        const bIntValue = ((color            ) % 256) / 255.0;
        return new THREE.Vector3(rIntValue, gIntValue, bIntValue);
    }
    const uniforms = Object.assign({}, initial_view_state);
    const grid = initial_view_state.grid;
    const scaled_raster = Float32Raster(grid);
    const geometry = grid.getBufferGeometry();
    geometry.addAttribute('displacement', { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('scalar',       { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });

    const material = new THREE.ShaderMaterial({
        attributes: {
          displacement: { type: 'f', value: null },
          scalar:       { type: 'f', value: null }
        },
        uniforms: {
          reference_distance: { type: 'f', value: initial_view_state.reference_distance || Units.EARTH_RADIUS },
          world_radius:       { type: 'f', value: initial_view_state.world_radius || Units.EARTH_RADIUS },
          sealevel:           { type: 'f', value: initial_view_state.sealevel },
          min_color:          { type: 'v3',value: hex_color_to_three_js_vector(initial_view_state.min_color || 0x000000 ) },
          max_color:          { type: 'v3',value: hex_color_to_three_js_vector(initial_view_state.max_color || 0xffffff ) },
          builtin_colorscale: { type: 'i', value: initial_view_state.builtin_colorscale || 0 },
          sealevel:           { type: 'f', value: initial_view_state.sealevel },
          ocean_visibility:   { type: 'f', value: initial_view_state.ocean_visibility },
          map_projection_offset: { type: 'f', value: initial_view_state.map_projection_offset },
        },
        blending: THREE.NoBlending,
        vertexShader: initial_view_state.world_view_vertex_shader,
        fragmentShader: window.FRAGMENT_SHADERS.colorscale
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

    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
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
        const min = view_state['min'] || 0.;
        const max = view_state['max'] || 1.;
        const scaling = view_state['scaling'] || (!view_state['min'] && !view_state['max']);

        if (raster instanceof Uint8Array) {
            raster = Float32Raster.FromUint8Raster(raster);
        }
        if (raster instanceof Uint16Array) {
            raster = Float32Raster.FromUint16Raster(raster);
        }
        if (scaling) {
            Float32Dataset.rescale(raster, scaled_raster, 0., 1.);
        } else {
            Float32Dataset.rescale(raster, scaled_raster, 0., 1., min, max);
        }

        update_scalar_attribute('scalar',              scaled_raster);
        update_scalar_attribute('displacement',        view_state.displacement);
                
        update_uniform('reference_distance',    view_state.reference_distance || Units.EARTH_RADIUS );
        update_uniform('world_radius',          view_state.world_radius || Units.EARTH_RADIUS );
        update_uniform('sealevel',              view_state.sealevel );
        update_uniform('min_color',             hex_color_to_three_js_vector(view_state.min_color || 0.) );
        update_uniform('max_color',             hex_color_to_three_js_vector(view_state.max_color || 0.) );
        update_uniform('sealevel',              view_state.sealevel );
        update_uniform('ocean_visibility',      view_state.ocean_visibility );
        update_uniform('map_projection_offset', view_state.map_projection_offset );

        update_vertex_shader(view_state.world_view_vertex_shader);
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
window.VIEW_RESOURCES['ColorscaleRasterViewResources'] = ColorscaleRasterViewResources;

