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
	// Publisher.subscribe('plate.cells', 'update', function (content) {
	// 	this_.cell_update(content.uuid, content.value);
	// });
	Publisher.subscribe('world.plates', 'update', function (content) {
		var plate;
		for (var i=0, li=world.plates.length; i<li; ++i) {
		    var plate = world.plates[i];
			this_.cell_update(plate.uuid, plate); 
		}
		// HACK: ideally should not make reference to "world",
		//  but pass the values relevant to the subscriber function
		//  This is so we will be eventually able to implement parallel processing
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

function lerp(a,b, x){
	return a + x*(b-a);
}
function smoothstep (edge0, edge1, x) {
	var fraction = (x - edge0) / (edge1 - edge0);
	return clamp(fraction, 0.0, 1.0);
	// return t * t * (3.0 - 2.0 * t);
}
function clamp (x, minVal, maxVal) {
	return Math.min(Math.max(x, minVal), maxVal);
}
function heaviside_approximation (x, k) {
	return 2 / (1 + Math.exp(-k*x)) - 1;
	return x>0? 1: 0; 
}
function subductability (rock) {
	var continent = smoothstep(2800, 3000, rock.density);
	var density = 	rock.density * (1-continent) 	+ 
					lerp(rock.density, 3300, smoothstep(0,280, rock.age)) * continent
	return heaviside_approximation( density - 3000, 1/111 );
}
View.prototype.cell_update = function(uuid, plate){
	var geometry, displacement, age;
	geometry = this.geometries.get(uuid);
	displacement = geometry.attributes.displacement.array;
	age = geometry.attributes.age.array;
	var buffer_array_to_cell = this.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var is_member_model = plate.is_member; 
	var displacement_model = plate.displacement; 
	var age_model = plate.age; 
	var is_member;
	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		is_member = is_member_model[buffer_array_index]
		displacement[j] = is_member * displacement_model[buffer_array_index]; 
		age[j] = is_member * age_model[buffer_array_index]; 
	}
	geometry.attributes.displacement.needsUpdate = true;
	geometry.attributes.age.needsUpdate = true;
}

View.prototype.add = function(plate){
	var faces, geometry, mesh, material;
	var faces = this.grid.template.faces;
	var geometry = THREE.BufferGeometryUtils.fromGeometry(this.grid.template);
	geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
	geometry.addAttribute('age', Float32Array, faces.length*3, 1);
	this.geometries.set(_hashPlate(plate), geometry);

	var color = new THREE.Color(Math.random() * 0xffffff);
	var sealevel_mod = this._uniforms.sealevel_mod;
	material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: null },
		  age: { type: 'f', value: null }
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
		  displacement: { type: 'f', value: null },
		  age: { type: 'f', value: null }
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