'use strict';

function RealisticWorldView(shader_return_value) {
    this.clone = function() {
        return new RealisticWorldView(shader_return_value);
    }

    var fragmentShader = fragmentShaders.realistic;
        
    this.chartViews = []; 
    var added = false;
    var mesh = void 0;
    var grid = void 0;
    var shaderpass_uniforms = {};
    var renderpass_uniforms = {};
    var vertexShader = void 0;
    const MAX_LIGHT_COUNT = 9;
    var shaderpass = new THREE.ShaderPass({
        uniforms: {
            shaderpass_visibility:             { type: 'f', value: 0 },
            background_rgb_signal_texture:  { type: "t", value: null },
            
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
        vertexShader:   vertexShaders.passthrough,
        fragmentShader: fragmentShaders.atmosphere,
    }, 'background_rgb_signal_texture');
    shaderpass.renderToScreen = true;

    function create_mesh(world, options) {
        var grid = world.grid;
        var faces = grid.faces;
        var geometry = THREE.BufferGeometryUtils.fromGeometry({
            faces: grid.faces, 
            vertices: grid.vertices, 
            faceVertexUvs: [[]], // HACK: necessary for use with BufferGeometryUtils.fromGeometry
        });
        geometry.addAttribute('displacement',   Float32Array, faces.length*3,   1);
        geometry.addAttribute('gradient',       Float32Array, faces.length*3*3, 1);
        geometry.addAttribute('snow_coverage',   Float32Array, faces.length*3,   1);
        geometry.addAttribute('surface_temperature',   Float32Array, faces.length*3,   1);
        geometry.addAttribute('plant_coverage', Float32Array, faces.length*3,   1);
        geometry.addAttribute('scalar',         Float32Array, faces.length*3,   1);

        var material = new THREE.ShaderMaterial({
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
              map_projection_offset:     { type: 'f', value: options.map_projection_offset },
              ocean_visibility:          { type: 'f', value: options.ocean_visibility },
              sediment_visibility:       { type: 'f', value: options.sediment_visibility },
              plant_visibility:          { type: 'f', value: options.plant_visibility },
              snow_visibility:           { type: 'f', value: options.snow_visibility },
              shadow_visibility:         { type: 'f', value: options.shadow_visibility },
              specular_visibility:       { type: 'f', value: options.specular_visibility },

              // LIGHT PROPERTIES
              light_rgb_intensities:     { type: "v3v", value: options.light_rgb_intensities   },
              light_directions:          { type: "v3v", value: options.light_directions        },
              light_count:               { type: "i",   value: options.light_directions.length },
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
            vertexShader: options.vertexShader,
            fragmentShader: fragmentShader
        });
        return new THREE.Mesh( geometry, material);
    }
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
    function update_shaderpass_uniform(key, value) {
        if (shaderpass_uniforms[key] !== value) {
            shaderpass_uniforms[key] = value;
            shaderpass.uniforms[key].value = value;
            shaderpass.uniforms[key].needsUpdate = true;
        }
    }
    function update_renderpass_attribute(key, raster) {
        Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, mesh.geometry.attributes[key].array); 
        mesh.geometry.attributes[key].needsUpdate = true;
    }
    function update_renderpass_vector_attribute(key, raster) {
        var x = raster.x;
        var y = raster.y;
        var z = raster.z;
        var array = mesh.geometry.attributes[key].array;
        var buffer_array_to_cell = raster.grid.buffer_array_to_cell;
        for (var i = 0, li = buffer_array_to_cell.length; i < li; i++) {
            array[i+li*0] = x[buffer_array_to_cell[i]];
            array[i+li*1] = y[buffer_array_to_cell[i]];
            array[i+li*2] = z[buffer_array_to_cell[i]];
        }
        mesh.geometry.attributes[key].needsUpdate = true;
    }
    this.updateScene = function(gl_state, world, options) {

        if (grid !== world.grid) {
            grid = world.grid;
            this.removeFromScene(gl_state)
        }

        if (mesh === void 0) {
            mesh = create_mesh(world, options);
            renderpass_uniforms = Object.assign({}, options);
            vertexShader = options.vertexShader;
            gl_state.scene.add(mesh);

            gl_state.composer.passes.pop();
            gl_state.composer.passes.push(shaderpass);
        } 

        var projection_matrix_inverse = new THREE.Matrix4().getInverse(gl_state.camera.projectionMatrix);


        var insolation_max = Units.GLOBAL_SOLAR_CONSTANT; // Float32Dataset.max(world.atmosphere.average_insolation);

        var average_molecular_mass_of_air = 4.8e-26 * Units.KILOGRAM;
        var molecular_mass_of_water_vapor = 3.0e-26 * Units.KILOGRAM;
        var atmosphere_temperature = Float32Dataset.average(world.atmosphere.surface_temperature);
        var atmosphere_scale_height = 
            Thermodynamics.BOLTZMANN_CONSTANT * atmosphere_temperature / (world.surface_gravity * average_molecular_mass_of_air);

        // earth's surface density times fraction of atmosphere that is not ocean vapor (by mass)
        var surface_air_rayleigh_scatterer_density = 1.217*Units.KILOGRAM * (1.0 - 1.2e15/5.1e18);
        // earth's surface density times fraction of atmosphere that is ocean vapor (by mass)
        var surface_air_mie_scatterer_density      = 1.217*Units.KILOGRAM * (      1.2e15/5.1e18);
        // NOTE: NOT USED, intended to eventually represent absorption
        var surface_air_absorber_density = 0;

        var gradient = ScalarField.gradient(world.lithosphere.surface_height.value());
        VectorField.div_scalar(gradient, world.radius, gradient);

        var biosphere_memos = Biosphere.get_memos(world.biosphere, world.atmosphere, undefined);
        // RENDERPASS PROPERTIES -----------------------------------------------

        // VIEW PROPERTIES
        update_renderpass_vertex_shader(options.vertexShader);
        update_renderpass_uniform  ('projection_matrix_inverse', projection_matrix_inverse);
        update_renderpass_uniform  ('view_matrix_inverse',       gl_state.camera.matrixWorld);
        update_renderpass_uniform  ('reference_distance',        world.radius);
        update_renderpass_uniform  ('ocean_visibility',          options.ocean_visibility);
        update_renderpass_uniform  ('sediment_visibility',       options.sediment_visibility);
        update_renderpass_uniform  ('plant_visibility',          options.plant_visibility);
        update_renderpass_uniform  ('snow_visibility',           options.snow_visibility);
        update_renderpass_uniform  ('shadow_visibility',         options.shadow_visibility);
        update_renderpass_uniform  ('specular_visibility',       options.specular_visibility);
        update_renderpass_uniform  ('map_projection_offset',     options.map_projection_offset);

        // LIGHT PROPERTIES
        update_renderpass_uniform  ('light_rgb_intensities',     options.light_rgb_intensities   );
        update_renderpass_uniform  ('light_directions',          options.light_directions        );
        update_renderpass_uniform  ('light_count',               options.light_directions.length );
        update_renderpass_uniform  ('insolation_max',            insolation_max);

        // WORLD PROPERTIES
        update_renderpass_uniform  ('world_position',            new THREE.Vector3());
        update_renderpass_uniform  ('world_radius',              world.radius);
        update_renderpass_attribute('displacement',              world.lithosphere.displacement.value());
        update_renderpass_attribute('surface_temperature',       world.atmosphere.surface_temperature);
        update_renderpass_attribute('snow_coverage',             world.hydrosphere.snow_coverage.value());
        update_renderpass_attribute('plant_coverage',            biosphere_memos.plant_coverage.value());
        update_renderpass_vector_attribute('gradient',           gradient);

        // ATMOSPHERE PROPERTIES
        update_renderpass_uniform  ('atmosphere_scale_height',   atmosphere_scale_height );
        update_renderpass_uniform  ('surface_air_rayleigh_scattering_coefficients', new THREE.Vector3(5.09e-6, 1.14e-5, 2.83e-5));
        update_renderpass_uniform  ('surface_air_mie_scattering_coefficients',      new THREE.Vector3(2.1e-8,  2.1e-8,  2.1e-8 ));
        update_renderpass_uniform  ('surface_air_absorption_coefficients',          new THREE.Vector3(0));

        // SEA PROPERTIES
        update_renderpass_uniform  ('sealevel',             world.hydrosphere.sealevel.value());
        update_renderpass_uniform  ('ocean_rayleigh_scattering_coefficients', new THREE.Vector3(0.0056, 0.0125, 0.0312));
        update_renderpass_uniform  ('ocean_mie_scattering_coefficients',      new THREE.Vector3(0));
        update_renderpass_uniform  ('ocean_absorption_coefficients',          new THREE.Vector3(0.1, 0.01, 0.004));

        // SHADERPASS PROPERTIES -----------------------------------------------

        // VIEW PROPERTIES
        update_shaderpass_uniform  ('projection_matrix_inverse', projection_matrix_inverse);
        update_shaderpass_uniform  ('view_matrix_inverse',       gl_state.camera.matrixWorld);
        update_shaderpass_uniform  ('reference_distance',        world.radius);
        update_shaderpass_uniform  ('shaderpass_visibility',     (options.shaderpass_visibility * options.shadow_visibility) || 0);

        // LIGHT PROPERTIES
        update_shaderpass_uniform  ('light_rgb_intensities',     options.light_rgb_intensities   );
        update_shaderpass_uniform  ('light_directions',          options.light_directions        );
        update_shaderpass_uniform  ('light_count',               options.light_directions.length );
        update_shaderpass_uniform  ('insolation_max',            insolation_max );

        // WORLD PROPERTIES
        update_shaderpass_uniform  ('world_position',           new THREE.Vector3());
        update_shaderpass_uniform  ('world_radius',             world.radius);

        // ATMOSPHERE PROPERTIES
        update_shaderpass_uniform  ('atmosphere_scale_height',  atmosphere_scale_height  );
        update_shaderpass_uniform  ('surface_air_rayleigh_scattering_coefficients', new THREE.Vector3(5.09e-6, 1.14e-5, 2.83e-5));
        update_shaderpass_uniform  ('surface_air_mie_scattering_coefficients',      new THREE.Vector3(2.1e-8,  2.1e-8,  2.1e-8 ));
        update_shaderpass_uniform  ('surface_air_absorption_coefficients',          new THREE.Vector3(0));
    };

    this.removeFromScene = function(gl_state) {
        if (mesh !== void 0) {
            gl_state.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            mesh = void 0;
            this.mesh = void 0;

            gl_state.composer.passes.pop();
            gl_state.composer.passes.push(gl_state.shaderpass_default);
        } 
        if (grid !== void 0) {
            grid = void 0;
        } 
    };
    this.updateChart = function(data, world, options) {
        data.isEnabled = false;
    };
}
