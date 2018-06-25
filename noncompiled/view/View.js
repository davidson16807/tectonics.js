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

	var faces, scalar_field_geometry, scalar_field_mesh, scalar_field_material;
	var faces = this.grid.template.faces;
	var scalar_field_geometry = THREE.BufferGeometryUtils.fromGeometry(this.grid.template);

	scalar_field_geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
	scalar_field_geometry.addAttribute('ice_coverage', Float32Array, faces.length*3, 1);
	scalar_field_geometry.addAttribute('plant_coverage', Float32Array, faces.length*3, 1);
	scalar_field_geometry.addAttribute('insolation', Float32Array, faces.length*3, 1);
	scalar_field_geometry.addAttribute('scalar', Float32Array, faces.length*3, 1);
	this.scalar_field_geometry = scalar_field_geometry;

	scalar_field_material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: null },
		  ice_coverage: { type: 'f', value: null },
		  plant_coverage: { type: 'f', value: null },
		  insolation: { type: 'f', value: null },
		  scalar: { type: 'f', value: null }
		},
		uniforms: {
		  sealevel:     { type: 'f', value: 0 },
		  sealevel_mod: { type: 'f', value: this._uniforms.sealevel_mod },
		  darkness_mod: { type: 'f', value: this._uniforms.darkness_mod },
		  ice_mod: 		{ type: 'f', value: this._uniforms.ice_mod },
		  insolation_max: { type: 'f', value: this._uniforms.insolation_max },
		  index: 		{ type: 'f', value: -1 },
		},
		blending: THREE.NoBlending,
		vertexShader: this._vertexShader,
		fragmentShader: this._scalarDisplay._fragmentShader
	});
	scalar_field_mesh = new THREE.Mesh( scalar_field_geometry, scalar_field_material);
	this.scene.add(scalar_field_mesh);
	this.scalar_field_mesh1 = scalar_field_mesh;

	scalar_field_material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: null },
		  ice_coverage: { type: 'f', value: null },
		  plant_coverage: { type: 'f', value: null },
		  insolation: { type: 'f', value: null },
		  scalar: { type: 'f', value: null }
		},
		uniforms: {
		  sealevel:     { type: 'f', value: 0 },
		  sealevel_mod: { type: 'f', value: this._uniforms.sealevel_mod },
		  darkness_mod: { type: 'f', value: this._uniforms.darkness_mod },
		  ice_mod: 		{ type: 'f', value: this._uniforms.ice_mod },
		  insolation_max: { type: 'f', value: this._uniforms.insolation_max },
		  index: 		{ type: 'f', value: 1 },
		},
		blending: THREE.NoBlending,
		vertexShader: this._vertexShader,
		fragmentShader: this._scalarDisplay._fragmentShader
	});
	scalar_field_mesh = new THREE.Mesh( scalar_field_geometry, scalar_field_material);
	this.scene.add(scalar_field_mesh);
	this.scalar_field_mesh2 = scalar_field_mesh;


	var vector_field_geometry = new THREE.Geometry();
	for (var i=0, li=grid.vertices.length; i<li; ++i) {
	    vector_field_geometry.vertices.push( grid.vertices[i].clone() );
	    vector_field_geometry.vertices.push( grid.vertices[i].clone() );
	    // vector_field_material.attributes.vector.value.push( new THREE.Vector3() );
	    // vector_field_material.attributes.vector.value.push( new THREE.Vector3() );
	}
	this.vector_field_geometry = vector_field_geometry;

	var vector_field_material, vector_field_mesh;
	var positions = grid.pos;

	vector_field_material = new THREE.ShaderMaterial({
	        vertexShader: 	this._vertexShader,
	        fragmentShader: fragmentShaders.vectorField,
	        attributes: {
	        },
	        uniforms: { 
		  		index: 		{ type: 'f', value: -1 }
	        }
	    });
	vector_field_mesh = new THREE.Line( vector_field_geometry, vector_field_material, THREE.LinePieces);
	this.scene.add(vector_field_mesh);
	this.vector_field_mesh1 = vector_field_mesh;

	vector_field_material = new THREE.ShaderMaterial({
	        vertexShader: 	this._vertexShader,
	        fragmentShader: fragmentShaders.vectorField,
	        attributes: {
	        },
	        uniforms: { 
		  		index: 		{ type: 'f', value: 1 }
	        }
	    });
	vector_field_mesh = new THREE.Line( vector_field_geometry, vector_field_material, THREE.LinePieces);
	this.scene.add(vector_field_mesh);
	this.vector_field_mesh2 = vector_field_mesh;
}

View.prototype.render = function() {
	return this.renderer.render( this.scene, this.camera );
};

View.prototype.update = function(world){
	this.uniform('sealevel', world.hydrosphere.sealevel.value()); 
	this.uniform('insolation_max', Float32Dataset.max(world.atmosphere.average_insolation)); 

	this._scalarDisplay.updateAttributes(this.scalar_field_geometry, world);
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
	this._scalarDisplay.removeFrom(this.scalar_field_mesh1);
	this._scalarDisplay.removeFrom(this.scalar_field_mesh2);

	this._scalarDisplay = display;

	this._scalarDisplay.addTo(this.scalar_field_mesh1);
	this._scalarDisplay.addTo(this.scalar_field_mesh2);
};

View.prototype.setVectorDisplay = function(display) {
	if(this._vectorDisplay === display){
		return;
	}
	this._vectorDisplay.removeFrom(this.vector_field_mesh1);
	this._vectorDisplay.removeFrom(this.vector_field_mesh2);

	this._vectorDisplay = display;

	this._vectorDisplay.addTo(this.vector_field_mesh1);
	this._vectorDisplay.addTo(this.vector_field_mesh2);
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
