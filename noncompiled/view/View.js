'use strict';

function View(innerWidth, innerHeight, grid, scalarDisplay, vectorDisplay, vertexShader) {

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

	this.grid = grid;
	this._vertexShader = vertexShader;
	this._scalarDisplay = scalarDisplay;
	this._vectorDisplay = vectorDisplay;
	this._uniforms = {
		sealevel_mod: 1.0,
		darkness_mod: 1.0,
		ice_mod: 1.0,
		insolation_max: 0,
	};

	var scalar_field_mesh = this._scalarDisplay.createMesh(
		grid,
		{
			...this._uniforms, 
			index: 1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(scalar_field_mesh);
	this.scalar_field_mesh1 = scalar_field_mesh;

	var scalar_field_mesh = this._scalarDisplay.createMesh(
		grid,
		{
			...this._uniforms, 
			index: -1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(scalar_field_mesh);
	this.scalar_field_mesh2 = scalar_field_mesh;


	var vector_field_mesh = this._vectorDisplay.createMesh(
		grid,
		{
			...this._uniforms, 
			index: 1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(vector_field_mesh);
	this.vector_field_mesh1 = vector_field_mesh;


	var vector_field_mesh = this._vectorDisplay.createMesh(
		grid,
		{
			...this._uniforms, 
			index: -1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(vector_field_mesh);
	this.vector_field_mesh2 = vector_field_mesh;
}

View.prototype.render = function() {
	return this.renderer.render( this.scene, this.camera );
};

View.prototype.displaySim = function(sim){
	// TODO: what if sim changed from last iteration?
	this.displayWorld(sim.focus);
}

View.prototype.displayWorld = function(world){
	this._scalarDisplay.updateUniforms(this.scalar_field_mesh1.material, world);
	this._scalarDisplay.updateUniforms(this.scalar_field_mesh2.material, world);
	this._scalarDisplay.updateAttributes(this.scalar_field_mesh1.geometry, world);
	this._scalarDisplay.updateAttributes(this.scalar_field_mesh2.geometry, world);
	
	this._vectorDisplay.updateUniforms(this.vector_field_mesh1.material, world);
	this._vectorDisplay.updateUniforms(this.vector_field_mesh2.material, world);
	this._vectorDisplay.updateAttributes(this.vector_field_mesh1.geometry, world);	
	this._vectorDisplay.updateAttributes(this.vector_field_mesh2.geometry, world);	
}

View.prototype.displayScalarRaster = function(raster){
	this._scalarDisplay.updateAttributes(this.scalar_field_mesh1.geometry, raster);
}
View.prototype.displayVectorRaster = function(raster){
	this._vectorDisplay.updateAttributes(this.vector_field_geometry, world);	
}

View.prototype.getDomElement = function() {
	return this.renderer.domElement;
};

View.prototype.getScreenshotDataURL = function() {
	return THREEx.Screenshot.toDataURL(this.renderer);
};

View.prototype.setScalarDisplay = function(display) {
	if(this._scalarDisplay === display){
		return;
	}

	this.scene.remove(this.scalar_field_mesh1);
	this.scalar_field_mesh1.geometry.dispose();
	this.scalar_field_mesh1.material.dispose();
	this.scalar_field_mesh1 = undefined;

	this.scene.remove(this.scalar_field_mesh2);
	this.scalar_field_mesh2.geometry.dispose();
	this.scalar_field_mesh2.material.dispose();
	this.scalar_field_mesh2 = undefined;

	this._scalarDisplay = display;

	var scalar_field_mesh = this._scalarDisplay.createMesh(
		this.grid,
		{
			...this._uniforms, 
			index: 1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(scalar_field_mesh);
	this.scalar_field_mesh1 = scalar_field_mesh;

	var scalar_field_mesh = this._scalarDisplay.createMesh(
		this.grid,
		{
			...this._uniforms, 
			index: -1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(scalar_field_mesh);
	this.scalar_field_mesh2 = scalar_field_mesh;
};

View.prototype.setVectorDisplay = function(display) {
	if(this._vectorDisplay === display){
		return;
	}

	this.scene.remove(this.vector_field_mesh1);
	this.vector_field_mesh1.geometry.dispose();
	this.vector_field_mesh1.material.dispose();
	this.vector_field_mesh1 = undefined;

	this.scene.remove(this.vector_field_mesh2);
	this.vector_field_mesh2.geometry.dispose();
	this.vector_field_mesh2.material.dispose();
	this.vector_field_mesh2 = undefined;

	this._vectorDisplay = display;

	var vector_field_mesh = this._vectorDisplay.createMesh(
		this.grid,
		{
			...this._uniforms, 
			index: 1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(vector_field_mesh);
	this.vector_field_mesh1 = vector_field_mesh;

	var vector_field_mesh = this._vectorDisplay.createMesh(
		this.grid,
		{
			...this._uniforms, 
			index: -1, 
			vertexShader: this._vertexShader
		}
	);
	this.scene.add(vector_field_mesh);
	this.vector_field_mesh2 = vector_field_mesh;
};

View.prototype.vertexShader = function(vertexShader){
	if(this._vertexShader === vertexShader){
		return;
	}
	this._vertexShader = vertexShader;

	var meshes, mesh;

	mesh = this.scalar_field_mesh1
	mesh.material.vertexShader = vertexShader;
	mesh.material.needsUpdate = true;

	mesh = this.scalar_field_mesh2;
	mesh.material.vertexShader = vertexShader;
	mesh.material.needsUpdate = true;

	mesh = this.vector_field_mesh1;
	mesh.material.vertexShader = vertexShader;
	mesh.material.needsUpdate = true;

	mesh = this.vector_field_mesh2;
	mesh.material.vertexShader = vertexShader;
	mesh.material.needsUpdate = true;
}

View.prototype.uniform = function(key, value){
	if(this._uniforms[key] === value){
		return;
	}
	
	this._uniforms[key] = value;

 	var meshes, mesh;

 	mesh = this.scalar_field_mesh1;
 	if (mesh.material.uniforms[key] !== void 0) {
	 	mesh.material.uniforms[key].value = value;
	 	mesh.material.uniforms[key].needsUpdate = true;
 	}

 	mesh = this.scalar_field_mesh2;
 	if (mesh.material.uniforms[key] !== void 0) {
	 	mesh.material.uniforms[key].value = value;
	 	mesh.material.uniforms[key].needsUpdate = true;
 	}

 	mesh = this.vector_field_mesh1;
 	if (mesh.material.uniforms[key] !== void 0) {
 		mesh.material.uniforms[key].value = value;
 		mesh.material.uniforms[key].needsUpdate = true;
 	}

 	mesh = this.vector_field_mesh2;
 	if (mesh.material.uniforms[key] !== void 0) {
	 	mesh.material.uniforms[key].value = value;
	 	mesh.material.uniforms[key].needsUpdate = true;
 	}
}
