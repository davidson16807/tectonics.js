'use strict';

var _hashPlate = function(plate){
	return plate.uuid
}

function View(fragmentShader, vertexShader){
	this.THRESHOLD = 0.99;
	this.SEALEVEL = 1.0;
	this._fragmentShader = fragmentShader;
	this._vertexShader = vertexShader;

	this._uniforms = {
		sealevel_mod: 1.0
	};
	this.geometries = new buckets.Dictionary(_hashPlate);
	this.meshes = new buckets.MultiDictionary(_hashPlate);

	// create a scene
	this.scene = new THREE.Scene();

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, 10000 );
	this.camera.position.set(0, 0, 5);
	this.scene.add(this.camera);

	var this_ = this;
	Publisher.subscribe('plate', 'update', function (plate) {
		this_.update(plate);
	});
	Publisher.subscribe('plate', 'create', function (plate) {
		console.log('create')
		this_.add(plate);
	});
	Publisher.subscribe('plate', 'delete', function (plate) {
		console.log('delete')
		this_.remove(plate);
	});
	// Publisher.subscribe('world', 'delete', function (world) {
	// 	var plates = world.plates;
	// 	for (var i = 0, li = plates.length; i < li; i++) {
	// 		this.remove(plates[i])
	// 	};
	// });
	// Publisher.subscribe('world', 'create', function (world) {
	// 	var plates = world.plates;
	// 	for (var i = 0, li = plates.length; i < li; i++) {
	// 		this.add(plates[i]);
	// 	};
	// });
}

View.prototype.fragmentShader = function(fragmentShader){
	if(this._fragmentShader == fragmentShader){
		return;
	}
	this._fragmentShader = fragmentShader;
	var meshes, mesh;
	meshes = this.meshes.values();
	for (var i = 0, li = meshes.length; i < li; i++) {
		mesh = meshes[i];
		mesh.material.fragmentShader = fragmentShader;
		mesh.material.needsUpdate = true;
	};
}

View.prototype.vertexShader = function(vertexShader){
	if(this._vertexShader == vertexShader){
		return;
	}
	this._vertexShader = vertexShader;
	var meshes, mesh;
	meshes = this.meshes.values();
	for (var i = 0, li = meshes.length; i < li; i++) {
		mesh = meshes[i];
		mesh.material.vertexShader = vertexShader;
		mesh.material.needsUpdate = true;
	};
}

View.prototype.uniform = function(key, value){
	if(this._uniforms[key] == value){
		return;
	}
	this._uniforms[key] = value;
 	var meshes, mesh;
	meshes = this.meshes.values();
	for (var i = 0, li = meshes.length; i < li; i++) {
		mesh = meshes[i];
		mesh.material.uniforms[key].value = value;
		mesh.material.uniforms[key].needsUpdate = true;
	};
}

View.prototype.update = function(plate){
	if(_.isUndefined(plate.world)){
		return;
	}
	if(_.isUndefined(plate.mesh)){
		return;
	}
	var meshes = this.meshes.get(plate);
	if (meshes.length < 1) {
		console.log('warning: no meshes in view!')
		return;
	};

	var faces = plate.world.grid.template.faces;
	var meshes, mesh, geometry, content, face, displacement;
	for (var j = meshes.length - 1; j >= 0; j--) {
		mesh = meshes[j];
		mesh.matrix = plate.mesh.matrix;
		mesh.rotation.setFromRotationMatrix(mesh.matrix);
	}

	geometry = this.geometries.get(plate);
	displacement = geometry.attributes.displacement.array;
	for(var j=0, j3=0, lj = faces.length, cells = plate._cells; j<lj; j++, j3+=3){
		face = faces[j];
		content = cells[face.a].content;
		displacement[j3] = content? content.displacement : 0;
		content = cells[face.b].content;
		displacement[j3+1] = content? content.displacement : 0;
		content = cells[face.c].content;
		displacement[j3+2] = content? content.displacement : 0;
	}
	geometry.attributes.displacement.needsUpdate = true;
}

View.prototype.add = function(plate){
	var faces, geometry, mesh, material;
	var faces = plate.world.grid.template.faces;
	var geometry = THREE.BufferGeometryUtils.fromGeometry(plate.world.grid.template);
	geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
	this.geometries.set(plate, geometry);

	var color = new THREE.Color(Math.random() * 0xffffff);
	var sealevel_mod = this._uniforms.sealevel_mod;
	material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: null }
		},
		uniforms: {
		  sealevel: { type: 'f', value: plate.world.SEALEVEL },
		  sealevel_mod: { type: 'f', value: sealevel_mod },
		  color: 	    { type: 'c', value: color },
		  index: 		{ type: 'f', value: -1 },
		},
		blending: THREE.NoBlending,
		vertexShader: this._vertexShader,
		fragmentShader: this._fragmentShader
	});
	mesh = new THREE.Mesh( geometry, material);
	this.scene.add(mesh);
	this.meshes.set(plate, mesh);

	material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: null }
		},
		uniforms: {
		  sealevel: { type: 'f', value: plate.world.SEALEVEL },
		  sealevel_mod: { type: 'f', value: sealevel_mod },
		  color: 	    { type: 'c', value: color },
		  index: 		{ type: 'f', value: 1 }
		},
		blending: THREE.NoBlending,
		vertexShader: this._vertexShader,
		fragmentShader: this._fragmentShader
	});
	mesh = new THREE.Mesh( geometry, material);
	this.scene.add(mesh);
	this.meshes.set(plate, mesh);
}

View.prototype.remove = function(plate){
	var meshes = this.meshes.get(plate);
	if(meshes.length < 1){
		return;
	}
	this.meshes.remove(plate);
	this.geometries.remove(plate);
	
	var mesh;
	for (var i = meshes.length - 1; i >= 0; i--) {
		var mesh = meshes[i];
		this.scene.remove(mesh);
		mesh.material.dispose();
		mesh.geometry.dispose();
	};
}