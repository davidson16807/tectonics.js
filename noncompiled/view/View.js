'use strict';

function View(innerWidth, innerHeight, scalarWorldView1, vectorWorldView1, vertexShader) {
	var scalarWorldView2 = scalarWorldView1.clone();
	var vectorWorldView2 = vectorWorldView1.clone();

	var this_ = this;
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

	function update_world(world){
		if(scalarWorldView1 !== void 0){
			scalarWorldView1.upsert(this_.scene, world, 
					{
						...uniforms, 
						index: 1, 
						vertexShader: vertexShader
					}
				);
		}
		if(scalarWorldView2 !== void 0){
			scalarWorldView2.upsert(this_.scene, world, 
					{
						...uniforms, 
						index: -1, 
						vertexShader: vertexShader
					}
				);
		}
		if(vectorWorldView1 !== void 0){
			vectorWorldView1.upsert(this_.scene, world, 
					{
						...uniforms, 
						index: 1, 
						vertexShader: vertexShader
					}
				);
		}
		if(vectorWorldView2 !== void 0){
			vectorWorldView2.upsert(this_.scene, world, 
					{
						...uniforms, 
						index: -1, 
						vertexShader: vertexShader
					}
				);
		}
	}

	this.update = function(sim){
		// TODO: what if sim changed from last iteration?
		update_world(sim.focus);
	}

	this.getDomElement = function() {
		return this.renderer.domElement;
	};

	this.getScreenshotDataURL = function() {
		return THREEx.Screenshot.toDataURL(this.renderer);
	};

	this.setScalarWorldView = function(value) {
		if(scalarWorldView1 === value){
			return;
		}
		if(scalarWorldView1 !== void 0){
			scalarWorldView1.remove(this.scene);
		}
		if(scalarWorldView2 !== void 0){
			scalarWorldView2.remove(this.scene);
		}
		scalarWorldView1 = value;
		scalarWorldView2 = value.clone();
	};

	this.setVectorWorldView = function(value) {
		if(vectorWorldView1 === value){
			return;
		}
		if(vectorWorldView1 !== void 0){
			vectorWorldView1.remove(this.scene);
		}
		if(vectorWorldView2 !== void 0){
			vectorWorldView2.remove(this.scene);
		}
		vectorWorldView1 = value;
		vectorWorldView2 = value.clone();
	};

	this.vertexShader = function(value){
		vertexShader = value;
	}

	this.uniform = function(key, value){
		uniforms[key] = value;
	}

}
