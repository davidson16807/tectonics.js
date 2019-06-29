'use strict';

function SurfaceNormalMapRasterView(options) {
    var invariant_options = options || {};
    this.clone = function() {
        return new SurfaceNormalMapRasterView(invariant_options);
    }
    var exaggeration_factor = invariant_options['exaggeration_factor'] || 100.0;
    var fragmentShader = fragmentShaders.surface_normal_map;

    this.mesh = void 0;
    var mesh = void 0;
    var grid = void 0;
    var uniforms = {};
    var vertexShader = void 0;

    function create_mesh(raster, options) {
        var grid = raster.grid;
        var faces = grid.faces;
        var geometry = THREE.BufferGeometryUtils.fromGeometry({
            faces: grid.faces, 
            vertices: grid.vertices, 
            faceVertexUvs: [[]], // HACK: necessary for use with BufferGeometryUtils.fromGeometry
        });
        geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
        geometry.addAttribute('gradient',     Float32Array, faces.length*3*3, 1);

        var material = new THREE.ShaderMaterial({
            attributes: {
              displacement: { type: 'f', value: null },
              gradient:     { type: 'v3',value: null },
            },
            uniforms: {
              reference_distance: { type: 'f', value: options.reference_distance || Units.EARTH_RADIUS },
                world_radius: { type: 'f', value: options.world_radius || Units.EARTH_RADIUS },
              sealevel:     { type: 'f', value: options.sealevel },
              ocean_visibility: { type: 'f', value: options.ocean_visibility },
              map_projection_offset:         { type: 'f', value: options.map_projection_offset },
            },
            blending: THREE.NoBlending,
            vertexShader: options.vertexShader,
            fragmentShader: fragmentShader
        });
        return new THREE.Mesh( geometry, material);
    }
    function update_vertex_shader(value) {
        if (vertexShader !== value) {
            vertexShader = value;
            mesh.material.vertexShader = value; 
            mesh.material.needsUpdate = true; 
        }
    }
    function update_uniform(key, value) {
        if (uniforms[key] !== value) {
            uniforms[key] = value;
            mesh.material.uniforms[key].value = value;
            mesh.material.uniforms[key].needsUpdate = true;
        }
    }
    function update_scalar_attribute(key, raster) {
        Float32Raster.get_ids(raster, raster.grid.buffer_array_to_cell, mesh.geometry.attributes[key].array); 
        mesh.geometry.attributes[key].needsUpdate = true;
    }
    function update_vector_attribute(key, raster) {
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

    this.updateScene = function(gl_state, raster, options) {

        if (grid !== raster.grid) {
            grid = raster.grid;
            this.removeFromScene(gl_state)
        }

        if (raster === void 0) {
            this.removeFromScene(gl_state);
            return;
        }

        if (raster instanceof Uint8Array) {
            raster = Float32Raster.FromUint8Raster(raster);
        }
        if (raster instanceof Uint16Array) {
            raster = Float32Raster.FromUint16Raster(raster);
        }

        if (mesh === void 0) {
            mesh = create_mesh(raster, options);
            uniforms = Object.assign({}, options);
            vertexShader = options.vertexShader;
            gl_state.scene.add(mesh);

            // HACK: we expose mesh here so WorldViews can modify as they see fit, 
            //       namely for displacement and sealevel attributes
            this.mesh = mesh; 
        } 
        
        var world_radius = options.world_radius || Units.EARTH_RADIUS;
        var gradient = ScalarField.gradient(raster);
        VectorField.mult_scalar(gradient, exaggeration_factor/world_radius, gradient);

        update_vector_attribute('gradient',      gradient);
        update_scalar_attribute('displacement',  raster);
        update_uniform('world_radius',        options.world_radius || Units.EARTH_RADIUS);
        update_uniform('ocean_visibility',        options.ocean_visibility);
        update_uniform('map_projection_offset',                options.map_projection_offset);
        update_vertex_shader(options.vertexShader);

        if (options.displacement !== void 0) {
            update_uniform('sealevel',         options.sealevel);
        }
    };
    this.removeFromScene = function(gl_state) {
        if (mesh !== void 0) {
            gl_state.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            mesh = void 0;
            this.mesh = void 0;
        } 
        if (grid !== void 0) {
            grid = void 0;
        } 
    };
    this.updateChart = function(data, raster, options) {}
}
