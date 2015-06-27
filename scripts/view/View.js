'use strict';

var _hashPlate = function(plate){
	return plate.uuid;
}

function View(grid, fragmentShader, vertexShader){
	this.grid = grid;
	this.THRESHOLD = 0.99;
	this.SEALEVEL = 1.0;
	this._fragmentShader = fragmentShader;
	this._vertexShader = vertexShader;

	this._uniforms = {
		sealevel_mod: 1.0
	};
	this.geometries = new buckets.Dictionary();
	this.meshes = new buckets.MultiDictionary();

	// create a scene
	this.scene = new THREE.Scene();

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, 10000 );
	this.camera.position.set(0, 0, 5);
	this.scene.add(this.camera);

	var this_ = this;
	Publisher.subscribe('plate.matrix', 'update', function (content){
		this_.matrix_update(content.uuid, content.value)
	});
	Publisher.subscribe('plate.cells', 'update', function (content) {
		this_.cell_update(content.uuid, content.value);
	});
	Publisher.subscribe('world.plates', 'add', function (content) {
		console.log('world.plates.add')
		this_.add(content.value);
	});
	Publisher.subscribe('world.plates', 'remove', function (content) {
		console.log('world.plates.remove')
		this_.remove(content.value);
	});
	Publisher.subscribe('model.world', 'add', function (content) {
		console.log('model.world.add');
		var world = content.value;
		var plates = world.plates;
		for (var i = 0, li = plates.length; i < li; i++) {
			this_.add(plates[i]);
		};
	});
	Publisher.subscribe('model.world', 'remove', function (content) {
		console.log('model.world.remove');
		var world = content.value;
		var plates = world.plates;
		for (var i = 0, li = plates.length; i < li; i++) {
			this_.remove(plates[i])
		};
	});
	// Publisher.subscribe('model.world', 'update;', function (content) {
	// 	var world = content.value;
	// });
}

View.prototype.fragmentShader = function(fragmentShader){
	if(this._fragmentShader === fragmentShader){
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
	if(this._vertexShader === vertexShader){
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
	if(this._uniforms[key] === value){
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
View.prototype.matrix_update = function(uuid, matrix) {
	var meshes = this.meshes.get(uuid);
	if (meshes.length < 1) {
		console.log('warning: no meshes in view!')
		return;
	};

	var meshes, mesh;
	for (var j = meshes.length - 1; j >= 0; j--) {
		mesh = meshes[j];
		mesh.matrix = matrix;
		mesh.rotation.setFromRotationMatrix(mesh.matrix);
	}
};
View.prototype.cell_update = function(uuid, cells){
	var geometry, content, displacement;
	geometry = this.geometries.get(uuid);
	displacement = geometry.attributes.displacement.array;
	var buffer_array_to_cell = this.grid.buffer_array_to_cell;
	var buffer_array_index, content;
	for(var j=0, lj = displacement.length, cells = cells; j<lj; j++){
		buffer_array_index = buffer_array_to_cell[j];
		content = cells[buffer_array_index].content;
		displacement[j] = content !== void 0? content.displacement : 0;
	}
	geometry.attributes.displacement.needsUpdate = true;
}

View.prototype.add = function(plate){
	var faces, geometry, mesh, material;
	var faces = this.grid.template.faces;
	var geometry = THREE.BufferGeometryUtils.fromGeometry(this.grid.template);
	geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
	this.geometries.set(_hashPlate(plate), geometry);

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
	this.meshes.set(_hashPlate(plate), mesh);

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
	this.meshes.set(_hashPlate(plate), mesh);
}

View.prototype.remove = function(plate){
	var meshes = this.meshes.get(_hashPlate(plate));
	if(meshes.length < 1){
		return;
	}
	this.meshes.remove(plate);
	this.geometries.remove(_hashPlate(plate));
	
	var mesh;
	for (var i = meshes.length - 1; i >= 0; i--) {
		var mesh = meshes[i];
		this.scene.remove(mesh);
		mesh.material.dispose();
		mesh.geometry.dispose();
	};
}