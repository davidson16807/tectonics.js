'use strict';

// This class encapsulates all state within Three.js
function ThreeJsState() {
	// create the renderer
	this.renderer = new THREE.WebGLRenderer({
		antialias		: true,	// to get smoother output
		preserveDrawingBuffer	: true	// to allow screenshot
	});
	this.renderer.setClearColor( 0x000000, 1 );
	this.renderer.setSize( innerWidth, innerHeight );

	this.composer = new THREE.EffectComposer(this.renderer);

	// put a camera in the scene

	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, Units.EARTH_RADIUS * 10 );
	this.camera.position.set(0, 0, Units.EARTH_RADIUS * 5);

	// transparently support window resize
	THREEx.WindowResize.bind(this.renderer, this.camera);

	// create a camera contol
	this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

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

	var scalarProjectionView = projectionView.clone();
	var vectorProjectionView = projectionView.clone();

	var options = {
		sealevel_mod: 1.0,
		darkness_mod: 1.0,
		ice_mod: 1.0,
		insolation_max: 0,
	};

	this.render = function() {
		gl_state.controls.update();
		gl_state.composer.render();
	};

	this.update = function(sim){
		// TODO: what if sim changed from last iteration?
		scalarProjectionView.updateScene(gl_state, sim.focus, 
				{
					...options, 
					subview: scalarView
				}
			);
		vectorProjectionView.updateScene(gl_state, sim.focus, 
				{
					...options, 
					subview: vectorView
				}
			);
	}
	this.print = function(raster){
		if (raster.x === void 0) {
			scalarProjectionView.updateScene(gl_state, raster, 
					{
						...options, 
						subview: scalarView
					}
				);
		} else {
			vectorProjectionView.updateScene(gl_state, raster, 
					{
						...options, 
						subview: vectorView
					}
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

}
