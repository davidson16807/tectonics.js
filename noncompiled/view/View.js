'use strict';

function View(innerWidth, innerHeight, scalarWorldView, vectorWorldView, vertexShader) {

	// create the renderer
	this.renderer = new THREE.WebGLRenderer({
		antialias		: true,	// to get smoother output
		preserveDrawingBuffer	: true	// to allow screenshot
	});
	this.renderer.setClearColor( 0x000000, 1 );
	this.renderer.setSize( innerWidth, innerHeight );

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, 10000 );
	this.camera.position.set(0, 0, 5);

	// transparently support window resize
	THREEx.WindowResize.bind(this.renderer, this.camera);

	// create a scene
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);

	var uniforms = {
		sealevel_mod: 1.0,
		darkness_mod: 1.0,
		ice_mod: 1.0,
		insolation_max: 0,
	};

	this.render = function() {
		return this.renderer.render( this.scene, this.camera );
	};

	this.displaySim = function(sim){
		// TODO: what if sim changed from last iteration?
		this.displayWorld(sim.focus);
	}

	this.displayWorld = function(world){
		this.world = world;
		scalarWorldView.upsert(this.scene, world, 
				{
					...uniforms, 
					index: 0, 
					vertexShader: vertexShader
				}
			);
		vectorWorldView.upsert(this.scene, world, 
				{
					...uniforms, 
					index: 0, 
					vertexShader: vertexShader
				}
			);
	}

	this.getDomElement = function() {
		return this.renderer.domElement;
	};

	this.getScreenshotDataURL = function() {
		return THREEx.Screenshot.toDataURL(this.renderer);
	};

	this.setScalarWorldView = function(display) {
		if(scalarWorldView === display){
			return;
		}

		scalarWorldView.remove(this.scene);
		scalarWorldView = display;

		if(scalarWorldView === void 0){
			return;
		}

		if (this.world === void 0) {
			return;
		}

		scalarWorldView.upsert(this.scene, this.world,
				{
					...uniforms, 
					index: 0, 
					vertexShader: vertexShader
				}
			);
	};

	this.setVectorWorldView = function(display) {
		if(vectorWorldView === display){
			return;
		}

		vectorWorldView.remove(this.scene);
		vectorWorldView = display;

		if(vectorWorldView === void 0){
			return;
		}
		
		if (this.world === void 0) {
			return;
		}

		vectorWorldView.upsert(this.scene, this.world,
				{
					...uniforms, 
					index: 0, 
					vertexShader: vertexShader
				}
			);
	};

	this.vertexShader = function(value){
		if(vertexShader === value){
			return;
		}
		vertexShader = value;
	}

	this.uniform = function(key, value){
		if(uniforms[key] === value){
			return;
		}
		
		uniforms[key] = value;
	}

}
