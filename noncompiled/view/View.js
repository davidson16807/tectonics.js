'use strict';

function View(innerWidth, innerHeight, scalarView, vectorView, projectionView) {
	var scalarProjectionView = projectionView.clone();
	var vectorProjectionView = projectionView.clone();

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
		scalarProjectionView.upsert(this_.scene, world, 
				{
					...uniforms, 
					subview: scalarView
				}
			);
		vectorProjectionView.upsert(this_.scene, world, 
				{
					...uniforms, 
					subview: vectorView
				}
			);
	}

	this.update = function(sim){
		// TODO: what if sim changed from last iteration?
		update_world(sim.focus);
	}

	this.updateChart = function(data, sim, options) {
		scalarProjectionView.updateChart(data, sim.focus, options);
	};

	this.getDomElement = function() {
		return this.renderer.domElement;
	};

	this.getScreenshotDataURL = function() {
		return THREEx.Screenshot.toDataURL(this.renderer);
	};

	this.setScalarView = function(value) {
		if(scalarView === value){
			return;
		}
		if(scalarView !== void 0){
			scalarView.remove(this.scene);
		}
		scalarView = value;
	};

	this.setVectorView = function(value) {
		if(vectorView === value){
			return;
		}
		if(vectorView !== void 0){
			vectorView.remove(this.scene);
		}
		vectorView = value;
	};

	this.setProjectionView = function(value){
		if(projectionView === value){
			return;
		}
		if(projectionView !== void 0){
			scalarProjectionView.remove(this.scene);
			vectorProjectionView.remove(this.scene);
		}
		projectionView = value;
		scalarProjectionView = value.clone();
		vectorProjectionView = value.clone();
	}

	this.uniform = function(key, value){
		uniforms[key] = value;
	}

}
