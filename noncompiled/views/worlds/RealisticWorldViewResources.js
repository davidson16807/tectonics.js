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
function RealisticWorldViewResources(initial_view_state) {
    const grid = initial_view_state.grid;
    const shaderpass_uniforms = Object.assign({}, initial_view_state);
    const renderpass_uniforms = Object.assign({}, initial_view_state);
    const MAX_LIGHT_COUNT = 9;
    const shaderpass = new THREE.ShaderPass({
        uniforms: {
            shaderpass_visibility:         { type: 'f', value: 0 },
            background_rgb_signal_texture: { type: "t", value: null },
            
            projection_matrix_inverse:  { type: "m4",  value: new THREE.Matrix4()         },
            view_matrix_inverse:        { type: "m4",  value: new THREE.Matrix4()         },
            reference_distance:         { type: "f",   value: Units.EARTH_RADIUS          },

            light_rgb_intensities:      { type: "v3v", value: []                          },
            light_directions:           { type: "v3v", value: []                          },
            light_count:                { type: "i",   value: 0                           },
            insolation_max:             { type: 'f',   value: Units.GLOBAL_SOLAR_CONSTANT },

            world_position:             { type: "v3",  value: new THREE.Vector3()         },
            world_radius:               { type: "f",   value: Units.EARTH_RADIUS          },

            atmosphere_scale_height:    { type: "f", value: 0. },
            surface_air_rayleigh_scattering_coefficients: { type: "v3", value: new THREE.Vector3() },
            surface_air_mie_scattering_coefficients:      { type: "v3", value: new THREE.Vector3() },
            surface_air_absorption_coefficients:          { type: "v3", value: new THREE.Vector3() },
        },
        vertexShader:   window.VERTEX_SHADERS.passthrough,
        fragmentShader: window.FRAGMENT_SHADERS.atmosphere,
    }, 'background_rgb_signal_texture');
    shaderpass.renderToScreen = true;
    
    const geometry = grid.getBufferGeometry();
    geometry.addAttribute('displacement',   { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('gradient',       { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 3 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('snow_coverage',  { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('surface_temperature', { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('plant_coverage', { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });
    geometry.addAttribute('scalar',         { itemSize: 1, array: new Float32Array( grid.faces.length * 3 * 1 ), __proto__: THREE.BufferAttribute.prototype });

    const material = new THREE.ShaderMaterial({
        attributes: {
          displacement: { type: 'f', value: null },
          gradient:     { type: 'v3',value: null },
          snow_coverage: { type: 'f', value: null },
          surface_temperature: { type: 'f', value: null },
          plant_coverage: { type: 'f', value: null },
          scalar: { type: 'f', value: null }
        },
        uniforms: {
          // VIEW PROPERTIES
          projection_matrix_inverse: { type: "m4",value: new THREE.Matrix4() },
          view_matrix_inverse:       { type: "m4",value: new THREE.Matrix4() },
          reference_distance:        { type: 'f', value: world.radius },
          map_projection_offset:     { type: 'f', value: initial_view_state.map_projection_offset },
          ocean_visibility:          { type: 'f', value: initial_view_state.ocean_visibility },
          sediment_visibility:       { type: 'f', value: initial_view_state.sediment_visibility },
          plant_visibility:          { type: 'f', value: initial_view_state.plant_visibility },
          snow_visibility:           { type: 'f', value: initial_view_state.snow_visibility },
          shadow_visibility:         { type: 'f', value: initial_view_state.shadow_visibility },
          specular_visibility:       { type: 'f', value: initial_view_state.specular_visibility },

          // LIGHT PROPERTIES
          light_rgb_intensities:     { type: "v3v", value: initial_view_state.light_rgb_intensities   },
          light_directions:          { type: "v3v", value: initial_view_state.light_directions        },
          light_count:               { type: "i",   value: initial_view_state.light_directions.length },
          insolation_max:            { type: 'f',   value: Units.GLOBAL_SOLAR_CONSTANT     },

          // WORLD PROPERTIES
          world_position:            { type: "v3",value: new THREE.Vector3() },
          world_radius:              { type: "f", value: Units.EARTH_RADIUS  },

          // ATMOSPHERE PROPERTIES
          atmosphere_scale_height:                      { type: "f", value: 0. },
          surface_air_rayleigh_scattering_coefficients: { type: "v3", value: new THREE.Vector3() },
          surface_air_mie_scattering_coefficients:      { type: "v3", value: new THREE.Vector3() },
          surface_air_absorption_coefficients:          { type: "v3", value: new THREE.Vector3() },

          // SEA PROPERTIES
          sealevel:                                     { type: 'f', value: 0 },
          ocean_rayleigh_scattering_coefficients:       { type: "v3", value: new THREE.Vector3() },
          ocean_mie_scattering_coefficients:            { type: "v3", value: new THREE.Vector3() },
          ocean_absorption_coefficients:                { type: "v3", value: new THREE.Vector3() },

        },
        blending: THREE.NoBlending,
        vertexShader: initial_view_state.world_view_vertex_shader,
        fragmentShader: window.FRAGMENT_SHADERS.realistic,
    });
    const mesh = new THREE.Mesh( geometry, material);


    function update_renderpass_vertex_shader(value) {
        if (vertexShader !== value) {
            vertexShader = value;
            mesh.material.vertexShader = value; 
            mesh.material.needsUpdate = true; 
        }
    }
    function update_renderpass_uniform(key, value) {
        if (renderpass_uniforms[key] !== value) {
            renderpass_uniforms[key] = value;
            mesh.material.uniforms[key].value = value;
            mesh.material.uniforms[key].needsUpdate = true;
        }
    }
    function update_renderpass_scalar_attribute(key, raster) {
        Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, mesh.geometry.attributes[key].array); 
        mesh.geometry.attributes[key].needsUpdate = true;
    }
    function update_renderpass_vector_attribute(key, raster) {
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
    function update_shaderpass_uniform(key, value) {
        if (shaderpass_uniforms[key] !== value) {
            shaderpass_uniforms[key] = value;
            shaderpass.uniforms[key].value = value;
            shaderpass.uniforms[key].needsUpdate = true;
        }
    }


    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    */
    this.needsRemoval = function(world, view_state) {
        return world === void 0 ||
               world.grid !== grid;
    }
    /*
    Modifies a given gl_state to include the ViewResource.
    This modifies the state elsewhere, so it must be kept separate from the constructor.
    */
    this.addToScene = function(gl_state) {
        gl_state.scene.add(mesh);
        gl_state.composer.passes.pop();
        gl_state.composer.passes.push(shaderpass);
    };
    /*
    Updates the ViewResource to reflect the most current state of the model and view state.
    `raster` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.updateScene = function(gl_state, world, view_state) {

        const projection_matrix_inverse = new THREE.Matrix4().getInverse(gl_state.camera.projectionMatrix);
        const insolation_max = Units.GLOBAL_SOLAR_CONSTANT; // Float32Dataset.max(world.atmosphere.average_insolation);
        const average_molecular_mass_of_air = 4.8e-26 * Units.KILOGRAM;
        const molecular_mass_of_water_vapor = 3.0e-26 * Units.KILOGRAM;
        const atmosphere_temperature = Float32Dataset.average(world.atmosphere.surface_temperature);
        const atmosphere_scale_height = 
            Thermodynamics.BOLTZMANN_CONSTANT * atmosphere_temperature / (world.surface_gravity * average_molecular_mass_of_air);

        // earth's surface density times fraction of atmosphere that is not ocean vapor (by mass)
        const surface_air_rayleigh_scatterer_density = 1.217*Units.KILOGRAM * (1.0 - 1.2e15/5.1e18);
        // earth's surface density times fraction of atmosphere that is ocean vapor (by mass)
        const surface_air_mie_scatterer_density      = 1.217*Units.KILOGRAM * (      1.2e15/5.1e18);
        // NOTE: NOT USED, intended to eventually represent absorption
        const surface_air_absorber_density = 0;

        const gradient = ScalarField.gradient(world.lithosphere.surface_height.value());
        VectorField.div_scalar(gradient, world.radius, gradient);

        // RENDERPASS PROPERTIES -----------------------------------------------

        // VIEW PROPERTIES
        update_renderpass_vertex_shader(view_state.world_view_vertex_shader);
        update_renderpass_uniform  ('projection_matrix_inverse', projection_matrix_inverse);
        update_renderpass_uniform  ('view_matrix_inverse',       gl_state.camera.matrixWorld);
        update_renderpass_uniform  ('reference_distance',        world.radius);
        update_renderpass_uniform  ('ocean_visibility',          view_state.ocean_visibility);
        update_renderpass_uniform  ('sediment_visibility',       view_state.sediment_visibility);
        update_renderpass_uniform  ('plant_visibility',          view_state.plant_visibility);
        update_renderpass_uniform  ('snow_visibility',           view_state.snow_visibility);
        update_renderpass_uniform  ('shadow_visibility',         view_state.shadow_visibility);
        update_renderpass_uniform  ('specular_visibility',       view_state.specular_visibility);
        update_renderpass_uniform  ('map_projection_offset',     view_state.map_projection_offset);

        // LIGHT PROPERTIES
        update_renderpass_uniform  ('light_rgb_intensities',     view_state.light_rgb_intensities   );
        update_renderpass_uniform  ('light_directions',          view_state.light_directions        );
        update_renderpass_uniform  ('light_count',               view_state.light_directions.length );
        update_renderpass_uniform  ('insolation_max',            insolation_max);

        // WORLD PROPERTIES
        update_renderpass_uniform  ('world_position',            new THREE.Vector3());
        update_renderpass_uniform  ('world_radius',              world.radius);
        update_renderpass_scalar_attribute('displacement',       world.lithosphere.displacement.value());
        update_renderpass_scalar_attribute('surface_temperature',world.atmosphere.surface_temperature);
        update_renderpass_scalar_attribute('snow_coverage',      world.hydrosphere.snow_coverage.value());
        update_renderpass_scalar_attribute('plant_coverage',     world.biosphere.plant_coverage.value());
        update_renderpass_vector_attribute('gradient',           gradient);

        // ATMOSPHERE PROPERTIES
        update_renderpass_uniform  ('atmosphere_scale_height',   atmosphere_scale_height );
        update_renderpass_uniform  ('surface_air_rayleigh_scattering_coefficients', new THREE.Vector3(5.20e-6, 1.21e-5, 2.96e-5));
        update_renderpass_uniform  ('surface_air_mie_scattering_coefficients',      new THREE.Vector3(2.1e-8,  2.1e-8,  2.1e-8 ));
        update_renderpass_uniform  ('surface_air_absorption_coefficients',          new THREE.Vector3(0));

        // SEA PROPERTIES
        update_renderpass_uniform  ('sealevel',             world.hydrosphere.sealevel.value());
        update_renderpass_uniform  ('ocean_rayleigh_scattering_coefficients', new THREE.Vector3(0.005, 0.01, 0.03));
        update_renderpass_uniform  ('ocean_mie_scattering_coefficients',      new THREE.Vector3(0));
        update_renderpass_uniform  ('ocean_absorption_coefficients',          new THREE.Vector3(3e-1, 1e-1, 2e-2));

        // SHADERPASS PROPERTIES -----------------------------------------------

        // VIEW PROPERTIES
        update_shaderpass_uniform  ('projection_matrix_inverse', projection_matrix_inverse);
        update_shaderpass_uniform  ('view_matrix_inverse',       gl_state.camera.matrixWorld);
        update_shaderpass_uniform  ('reference_distance',        world.radius);
        update_shaderpass_uniform  ('shaderpass_visibility',     (view_state.shaderpass_visibility * view_state.shadow_visibility) || 0);

        // LIGHT PROPERTIES
        update_shaderpass_uniform  ('light_rgb_intensities',     view_state.light_rgb_intensities   );
        update_shaderpass_uniform  ('light_directions',          view_state.light_directions        );
        update_shaderpass_uniform  ('light_count',               view_state.light_directions.length );
        update_shaderpass_uniform  ('insolation_max',            insolation_max );

        // WORLD PROPERTIES
        update_shaderpass_uniform  ('world_position',           new THREE.Vector3());
        update_shaderpass_uniform  ('world_radius',             world.radius);

        // ATMOSPHERE PROPERTIES
        update_shaderpass_uniform  ('atmosphere_scale_height',  atmosphere_scale_height  );
        update_shaderpass_uniform  ('surface_air_rayleigh_scattering_coefficients', new THREE.Vector3(5.20e-6, 1.21e-5, 2.96e-5));
        update_shaderpass_uniform  ('surface_air_mie_scattering_coefficients',      new THREE.Vector3(2.1e-8,  2.1e-8,  2.1e-8 ));
        update_shaderpass_uniform  ('surface_air_absorption_coefficients',          new THREE.Vector3(0));

    };
    /*
    Modifies a given gl_state to remove references to the ViewResource and disposes resources
    */
    this.removeFromScene = function(gl_state) {
        gl_state.scene.remove(mesh);
        // mesh.geometry.dispose(); // do not dispose because we got it from grid in order to save memory
        mesh.material.dispose();
        gl_state.composer.passes.pop();
        gl_state.composer.passes.push(gl_state.shaderpass_default);
    };
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['RealisticWorldViewResources'] = RealisticWorldViewResources;
