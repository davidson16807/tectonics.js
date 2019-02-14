'use strict';

function RealisticWorldView(shader_return_value) {
    var fragmentShader = fragmentShaders.realistic
        .replace('@UNCOVERED', shader_return_value);
    this.chartViews = []; 
    var added = false;
    var mesh = void 0;
    var uniforms = {};
    var vertexShader = void 0;
    var shaderpass = new THREE.ShaderPass({
        uniforms: {
            surface_light:              { type: "t", value: null },
            
            projection_matrix_inverse:  { type: "m4",value: new THREE.Matrix4() },
            view_matrix_inverse:        { type: "m4",value: new THREE.Matrix4() },
            reference_distance:         { type: "f", value: Units.EARTH_RADIUS  },

            light_rgb_intensity:        { type: "v3",value: new THREE.Vector3() },
            light_direction:            { type: "v3",value: new THREE.Vector3() },

            world_position:             { type: "v3",value: new THREE.Vector3() },
            world_radius:               { type: "f", value: Units.EARTH_RADIUS  },

            atmosphere_scale_height: { type: "f", value: 0. },
            atmosphere_surface_rayleigh_scattering_coefficients: { type: "v3", value: new THREE.Vector3() },
            atmosphere_surface_mie_scattering_coefficients:      { type: "v3", value: new THREE.Vector3() },
            atmosphere_surface_absorption_coefficients:          { type: "v3", value: new THREE.Vector3() },
        },
        vertexShader:   vertexShaders.passthrough,
        fragmentShader: fragmentShaders.atmosphere,
    }, 'surface_light');
    shaderpass.renderToScreen = true;

    function create_mesh(world, options) {
        var grid = world.grid;
        var faces = grid.faces;
        var geometry = THREE.BufferGeometryUtils.fromGeometry({
            faces: grid.faces, 
            vertices: grid.vertices, 
            faceVertexUvs: [[]], // HACK: necessary for use with BufferGeometryUtils.fromGeometry
        });
        geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
        geometry.addAttribute('ice_coverage', Float32Array, faces.length*3, 1);
        geometry.addAttribute('surface_temp', Float32Array, faces.length*3, 1);
        geometry.addAttribute('plant_coverage', Float32Array, faces.length*3, 1);
        geometry.addAttribute('scalar', Float32Array, faces.length*3, 1);

        var material = new THREE.ShaderMaterial({
            attributes: {
              displacement: { type: 'f', value: null },
              ice_coverage: { type: 'f', value: null },
              surface_temp: { type: 'f', value: null },
              plant_coverage: { type: 'f', value: null },
              scalar: { type: 'f', value: null }
            },
            uniforms: {
              projection_matrix_inverse2:  { type: "m4",value: new THREE.Matrix4() },
              view_matrix_inverse2:        { type: "m4",value: new THREE.Matrix4() },
              reference_distance:         { type: "f", value: Units.EARTH_RADIUS  },
              field_of_view:      { type: 'f', value: 0 },
              aspect_ratio:       { type: 'f', value: 0 },
              world_radius:       { type: 'f', value: world.radius },
              reference_distance: { type: 'f', value: world.radius },
              sealevel:           { type: 'f', value: 0 },
              sealevel_mod:       { type: 'f', value: options.sealevel_mod },
              ice_mod:            { type: 'f', value: options.ice_mod },
              darkness_mod:       { type: 'f', value: options.darkness_mod },
              insolation_max:     { type: 'f', value: options.insolation_max },
              index:              { type: 'f', value: options.index },
              light_rgb_intensity:{ type: "v3",value: new THREE.Vector3() },
              light_direction:    { type: "v3",value: new THREE.Vector3() },
            },
            blending: THREE.NoBlending,
            vertexShader: options.vertexShader,
            fragmentShader: fragmentShader
        });
        return new THREE.Mesh( geometry, material);
    }
    function update_vertex_shader(material, value) {
        if (vertexShader !== value) {
            vertexShader = value;
            material.vertexShader = value; 
            material.needsUpdate = true; 
        }
    }
    function update_uniform(material, key, value) {
        if (uniforms[key] !== value) {
            uniforms[key] = value;
            material.uniforms[key].value = value;
            material.uniforms[key].needsUpdate = true;
        }
    }
    function update_attribute(geometry, key, raster) {
        Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, geometry.attributes[key].array); 
        geometry.attributes[key].needsUpdate = true;
    }
    this.updateScene = function(gl_state, world, options) {

        if (!added) {
            mesh = create_mesh(world, options);
            uniforms = {...options};
            vertexShader = options.vertexShader;
            gl_state.scene.add(mesh);

            gl_state.composer.passes.pop();
            gl_state.composer.passes.push(shaderpass);

            added = true;
        } 

        // get intensity of sunlight
        // vec3  light_offset    = light_position - world_position;
        // vec3  light_direction = normalize(light_offset);
        // float light_distance  = length(light_offset);
        var light_rgb_intensity = Thermodynamics.get_rgb_intensity_of_emitted_light_from_black_body(Units.SOLAR_TEMPERATURE);
        var light_attenuation = SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT);
        light_rgb_intensity.x *= light_attenuation;
        light_rgb_intensity.y *= light_attenuation;
        light_rgb_intensity.z *= light_attenuation;

        var projection_matrix_inverse = new THREE.Matrix4().getInverse(gl_state.camera.projectionMatrix);

        update_vertex_shader(mesh.material, options.vertexShader);
        update_uniform  (mesh.material, 'projection_matrix_inverse2',projection_matrix_inverse);
        update_uniform  (mesh.material, 'view_matrix_inverse2',  gl_state.camera.matrixWorld);
        update_uniform  (mesh.material, 'reference_distance',   world.radius);
        update_uniform  (mesh.material, 'sealevel_mod',         options.sealevel_mod);
        update_uniform  (mesh.material, 'darkness_mod',         options.darkness_mod);
        update_uniform  (mesh.material, 'ice_mod',              options.ice_mod);
        update_uniform  (mesh.material, 'index',                options.index);
        update_uniform  (mesh.material, 'world_radius',         world.radius);
        update_uniform  (mesh.material, 'sealevel',             world.hydrosphere.sealevel.value());
        update_uniform  (mesh.material, 'insolation_max',       Float32Dataset.max(world.atmosphere.average_insolation));
        update_uniform  (mesh.material, 'light_rgb_intensity',  new THREE.Vector3(light_rgb_intensity.x, light_rgb_intensity.y, light_rgb_intensity.z));
        update_uniform  (mesh.material, 'light_direction',      new THREE.Vector3(1,0,0));
        update_attribute(mesh.geometry, 'displacement',         world.lithosphere.displacement.value());
        update_attribute(mesh.geometry, 'ice_coverage',         world.hydrosphere.ice_coverage.value());
        update_attribute(mesh.geometry, 'surface_temp',         world.atmosphere.surface_temp);
        update_attribute(mesh.geometry, 'plant_coverage',       world.biosphere.plant_coverage.value());



        // SHADERPASS PROPERTIES -----------------------------------------------

        update_uniform  (shaderpass,    'projection_matrix_inverse',projection_matrix_inverse);
        update_uniform  (shaderpass,    'view_matrix_inverse',      gl_state.camera.matrixWorld);
        update_uniform  (shaderpass,    'reference_distance',       world.radius);

        update_uniform  (shaderpass,    'light_rgb_intensity',      new THREE.Vector3(light_rgb_intensity.x, light_rgb_intensity.y, light_rgb_intensity.z));
        update_uniform  (shaderpass,    'light_direction',          new THREE.Vector3(1,0,0));

        update_uniform  (shaderpass,    'world_position',           new THREE.Vector3());
        update_uniform  (shaderpass,    'world_radius',             world.radius);

        var average_molecular_mass_of_air = 4.8e-26 * Units.KILOGRAM;
        var molecular_mass_of_water_vapor = 3.0e-26 * Units.KILOGRAM;
        var atmosphere_temperature = Float32Dataset.average(world.atmosphere.surface_temp);
        update_uniform  (shaderpass,    'atmosphere_scale_height', 
            Thermodynamics.BOLTZMANN_CONSTANT * atmosphere_temperature / (world.surface_gravity * average_molecular_mass_of_air)
        );

        // earth's surface density times fraction of atmosphere that is not water vapor (by mass)
        var atmosphere_surface_rayleigh_scatterer_density = 1.217*Units.KILOGRAM * (1.0 - 1.2e15/5.1e18);
        // earth's surface density times fraction of atmosphere that is water vapor (by mass)
        var atmosphere_surface_mie_scatterer_density      = 1.217*Units.KILOGRAM * (      1.2e15/5.1e18);
        // NOTE: NOT USED, intended to eventually represent absorption
        var atmosphere_surface_absorber_density = 0;

        update_uniform  (shaderpass, 'atmosphere_surface_rayleigh_scattering_coefficients', new THREE.Vector3(5.20e-6, 1.21e-5, 2.96e-5));
        update_uniform  (shaderpass, 'atmosphere_surface_mie_scattering_coefficients',      new THREE.Vector3(2.1e-9,  2.1e-9,  2.1e-9 ));
        update_uniform  (shaderpass, 'atmosphere_surface_absorption_coefficients',          new THREE.Vector3(0));
    };

    this.removeFromScene = function(gl_state) {
        if (added) {

            gl_state.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            mesh = void 0;

            gl_state.composer.passes.pop();
            gl_state.composer.passes.push(gl_state.shaderpass);

            added = false;
        }
    };
    this.clone = function() {
        return new RealisticWorldView(shader_return_value);
    }
    this.updateChart = function(data, world, options) {
        data.isEnabled = false;
    };
}
