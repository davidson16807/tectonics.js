'use strict';

// This class encapsulates all state within Three.js
function ThreeJsState() {
    // create the renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias        : true,    // to get smoother output
        preserveDrawingBuffer    : true    // to allow screenshot
    });
    this.renderer.setClearColor( 0x000000, 1 );
    this.renderer.setSize( innerWidth, innerHeight );

    this.composer = new THREE.EffectComposer(this.renderer);

    // put a camera in the scene

    this.camera    = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, 100000 );
    this.camera.position.set(-4, 2, 4);

    // transparently support window resize
    THREEx.WindowResize.bind(this.renderer, this.camera);

    // create a camera contol
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.noPan = false;

    // create a scene
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    this.renderpass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.passes.push(this.renderpass);

    this.shaderpass_default = new THREE.ShaderPass({
        uniforms: {
            "input_texture": { type: "t", value: null },
        },
        vertexShader: vertexShaders.passthrough,
        fragmentShader: fragmentShaders.passthrough,
    }, 'input_texture');
    this.shaderpass_default.renderToScreen = true;
    this.composer.passes.push(this.shaderpass_default);
}

function View(innerWidth, innerHeight, scalarView, vectorView, projectionView) {
    var gl_state = new ThreeJsState();
    this.gl_state = gl_state;

    var scalarProjectionView = projectionView.clone();
    var vectorProjectionView = projectionView.clone();

    var options = {
        ocean_visibility: 1.0,
        sediment_visibility: 1.0,
        plant_visibility: 1.0,
        snow_visibility: 1.0,
        shadow_visibility: 1.0,
        insolation_max: 0,
    };

    this.render = function() {
        gl_state.controls.update();
        gl_state.composer.render();
    };

    this.update = function(sim){

        var universe = sim.model();
        var body = sim.focus();
        var stars = universe.stars;
        var star_sample_positions_map_ = universe.star_sample_positions_map(universe.config, body.id, sim.speed/2, 9);

        var light_rgb_intensities = [];
        var light_directions = [];
        for (var star_id in stars){
            var star = stars[star_id];
            var star_memos = Star.get_memos(star);
            var star_sample_positions = star_sample_positions_map_[star_id];
            for (var star_sample_position of star_sample_positions) {
                var light_distance = Vector.magnitude(
                    star_sample_position.x,
                    star_sample_position.y,
                    star_sample_position.z
                );
                var light_direction = Vector.normalize(
                    star_sample_position.x,
                    star_sample_position.y,
                    star_sample_position.z
                );
                var light_rgb_intensity = Thermodynamics.solve_rgb_intensity_of_light_emitted_by_black_body(star_memos.surface_temperature.value());
                var light_attenuation = SphericalGeometry.get_surface_area(star_memos.radius.value()) / SphericalGeometry.get_surface_area(light_distance);
                var light_exposure = 1/star_sample_positions.length;
                light_rgb_intensity.x *= light_attenuation * light_exposure;
                light_rgb_intensity.y *= light_attenuation * light_exposure;
                light_rgb_intensity.z *= light_attenuation * light_exposure;

                light_rgb_intensities.push(light_rgb_intensity);
                light_directions.push(light_direction);
            }
        }

        // TODO: what if sim changed from last iteration?
        scalarProjectionView.updateScene(gl_state, body, 
                Object.assign({ 
                    subview: scalarView, 
                    light_rgb_intensities: light_rgb_intensities,
                    light_directions:      light_directions,
                    specular_visibility:   light_directions.length == stars.length? 1.:0.
                }, options)
            );
        vectorProjectionView.updateScene(gl_state, body, 
                Object.assign({ 
                    subview: vectorView, 
                    light_rgb_intensities: light_rgb_intensities,
                    light_directions:      light_directions, 
                    specular_visibility:   light_directions.length == stars.length? 1.:0.
                }, options)
            );
    }
    this.print = function(value, options){
        options = options || {};
        if (value instanceof Float32Array || 
            value instanceof Uint16Array  ||
            value instanceof Uint8Array ) { // scalar raster
            scalarProjectionView.updateScene(gl_state, value, 
                    Object.assign({ subview: scalarView }, options)
                );
        } else if (value.x instanceof Float32Array){ // vector raster
            vectorProjectionView.updateScene(gl_state, value, 
                    Object.assign({ subview: vectorView }, options)
                );
        } else {
            gl_state.scene.add(
                new THREE.ArrowHelper( 
                    new THREE.Vector3(value[0] , value[1], value[2]), 
                    new THREE.Vector3(0 , 0, 0), 
                    2, 
                    options.color || 0xffffff 
                )
            );
        }
    }

    this.updateChart = function(data, sim, options) {
        scalarProjectionView.updateChart(data, sim.focus, options);
    };

    this.getDomElement = function() {
        return gl_state.renderer.domElement;
    };

    this.getScreenshotDataURL = function() {
        return THREEx.Screenshot.toDataURL(gl_state.renderer);
    };

    this.setScalarView = function(value) {
        if(scalarView === value){
            return;
        }
        if(scalarView !== void 0){
            scalarView.removeFromScene(gl_state);
        }
        scalarView = value;
    };

    this.setVectorView = function(value) {
        if(vectorView === value){
            return;
        }
        if(vectorView !== void 0){
            vectorView.removeFromScene(gl_state);
        }
        vectorView = value;
    };

    this.setProjectionView = function(value){
        if(projectionView === value){
            return;
        }
        if(projectionView !== void 0){
            scalarProjectionView.removeFromScene(gl_state);
            vectorProjectionView.removeFromScene(gl_state);
        }
        projectionView = value;
        scalarProjectionView = value.clone();
        vectorProjectionView = value.clone();
    }

    this.uniform = function(key, value){
        options[key] = value;
    }

    this.toggleControls = function() {
        
    }

}
