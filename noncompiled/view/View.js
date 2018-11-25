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

	this._vertexShader = vertexShader;
	this._scalarWorldView = scalarWorldView;
	this._vectorWorldView = vectorWorldView;
	this._uniforms = {
		sealevel_mod: 1.0,
		darkness_mod: 1.0,
		ice_mod: 1.0,
		insolation_max: 0,
	};
}

View.prototype.render = function() {
	return this.renderer.render( this.scene, this.camera );
};

View.prototype.displaySim = function(sim){
	// TODO: what if sim changed from last iteration?
	this.displayWorld(sim.focus);
}

View.prototype.displayWorld = function(world){
	this.world = world;
	this._scalarWorldView.upsert(this.scene, world, 
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
	this._vectorWorldView.upsert(this.scene, world, 
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
}

View.prototype.getDomElement = function() {
	return this.renderer.domElement;
};

View.prototype.getScreenshotDataURL = function() {
	return THREEx.Screenshot.toDataURL(this.renderer);
};

View.prototype.setScalarWorldView = function(display) {
	if(this._scalarWorldView === display){
		return;
	}

	this._scalarWorldView.remove(this.scene);
	this._scalarWorldView = display;

	if(this._scalarWorldView === void 0){
		return;
	}

	if (this.world === void 0) {
		return;
	}

	this._scalarWorldView.upsert(this.scene, this.world,
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
};

View.prototype.setVectorWorldView = function(display) {
	if(this._vectorWorldView === display){
		return;
	}

	this._vectorWorldView.remove(this.scene);
	this._vectorWorldView = display;

	if(this._vectorWorldView === void 0){
		return;
	}
	
	if (this.world === void 0) {
		return;
	}

	this._vectorWorldView.upsert(this.scene, this.world,
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
};

View.prototype.vertexShader = function(vertexShader){
	if(this._vertexShader === vertexShader){
		return;
	}
	this._vertexShader = vertexShader;
	this._scalarWorldView.upsert(this.scene, this.world,
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
	this._vectorWorldView.upsert(this.scene, this.world,
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
}

View.prototype.uniform = function(key, value){
	if(this._uniforms[key] === value){
		return;
	}
	
	this._uniforms[key] = value;
	this._scalarWorldView.upsert(this.scene, this.world,
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
	this._vectorWorldView.upsert(this.scene, this.world,
			{
				...this._uniforms, 
				index: 0, 
				vertexShader: this._vertexShader
			}
		);
}
