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
    this.camera.position.set(0, 0, 5);

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

    this.shaderpass = new THREE.ShaderPass({
        uniforms: {
            "input_texture": { type: "t", value: null },
        },
        vertexShader: vertexShaders.passthrough,
        fragmentShader: fragmentShaders.passthrough,
    }, 'input_texture');
    this.shaderpass.renderToScreen = true;
    this.composer.passes.push(this.shaderpass);
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
        specular_visibility: 1.0,
        insolation_max: 0,
    };

    this.render = function() {
        gl_state.controls.update();
        gl_state.composer.render();
    };

    this.update = function(sim){
        // TODO: what if sim changed from last iteration?
        scalarProjectionView.updateScene(gl_state, sim.focus, 
                Object.assign({ subview: scalarView }, options)
            );
        vectorProjectionView.updateScene(gl_state, sim.focus, 
                Object.assign({ subview: vectorView }, options)
            );
    }
    this.print = function(value, options){
        options = options || {};
        if (value.x instanceof Float32Array || 
            value.x instanceof Uint16Array  ||
            value.x instanceof Uint8Array ) { // scalar raster
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
