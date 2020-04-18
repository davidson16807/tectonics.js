'use strict';

// All global resources that are used within this file are listed below:
window.FRAGMENT_SHADERS = window.FRAGMENT_SHADERS || {};
window.VERTEX_SHADERS = window.VERTEX_SHADERS || {};

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
    window.addEventListener('resize', function(){
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        // this.camera.aspect   = window.innerWidth / window.innerHeight;
        // this.camera.updateProjectionMatrix();
    }.bind(this), false);

    // create a scene
    this.scene = new THREE.Scene();
    // this.scene.add(this.camera);

    this.renderpass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.passes.push(this.renderpass);

    this.shaderpass_default = new THREE.ShaderPass({
        uniforms: {
            "input_texture": { type: "t", value: null },
        },
        vertexShader: window.VERTEX_SHADERS.passthrough,
        fragmentShader: window.FRAGMENT_SHADERS.passthrough,
    }, 'input_texture');
    this.shaderpass_default.renderToScreen = true;
    this.composer.passes.push(this.shaderpass_default);
}