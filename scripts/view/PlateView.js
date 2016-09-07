'use strict';

function PlateView(scene, plate, uniforms, vertexShader, fragmentShader) {
	var faces, geometry, mesh, material;
	var faces = plate.grid.template.faces;

	this.scene = scene;
	this.grid = plate.grid;
	this._uniforms = {
		sealevel_mod: uniforms.sealevel_mod
	};
	this._fragmentShader = fragmentShader;
	this._vertexShader = vertexShader;

	geometry = THREE.BufferGeometryUtils.fromGeometry(this.grid.template);
	geometry.addAttribute('displacement', Float32Array, faces.length*3, 1);
	geometry.addAttribute('age', Float32Array, faces.length*3, 1);
	this.geometry = geometry;

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
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});
	mesh = new THREE.Mesh( geometry, material);
	this.scene.add(mesh);
	this.mesh1 = mesh;

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
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});
	mesh = new THREE.Mesh( geometry, material);
	this.scene.add(mesh);
	this.mesh2 = mesh;
}

PlateView.prototype.matrix_update = function(matrix) {
	var mesh = this.mesh1;
	mesh.matrix = matrix;
	mesh.rotation.setFromRotationMatrix(mesh.matrix);

	var mesh = this.mesh2;
	mesh.matrix = matrix;
	mesh.rotation.setFromRotationMatrix(mesh.matrix);
};

PlateView.prototype.cell_update = function(cells){
	var geometry, content, displacement, age;
	var geometry = this.geometry;
	displacement = geometry.attributes.displacement.array;
	age = geometry.attributes.age.array;
	var buffer_array_to_cell = this.grid.buffer_array_to_cell;
	var buffer_array_index, content;
	for(var j=0, lj = displacement.length, cells = cells; j<lj; j++){
		buffer_array_index = buffer_array_to_cell[j];
		content = cells[buffer_array_index].content;
		displacement[j] = content !== void 0? content.displacement : 0;
		age[j] = content !== void 0? content.age : 0;
	}
	geometry.attributes.displacement.needsUpdate = true;
	geometry.attributes.age.needsUpdate = true;
}

PlateView.prototype.fragmentShader = function(fragmentShader){
	if(this._fragmentShader === fragmentShader){
		return;
	}
	this._fragmentShader = fragmentShader;

	var meshes, mesh;

	mesh = this.mesh1;
	mesh.material.fragmentShader = fragmentShader;
	mesh.material.needsUpdate = true;

	mesh = this.mesh2;
	mesh.material.fragmentShader = fragmentShader;
	mesh.material.needsUpdate = true;
}

PlateView.prototype.vertexShader = function(vertexShader){
	if(this._vertexShader === vertexShader){
		return;
	}
	this._vertexShader = vertexShader;

	var meshes, mesh;

	mesh = this.mesh1
	mesh.material.vertexShader = vertexShader;
	mesh.material.needsUpdate = true;

	mesh = this.mesh2;
	mesh.material.vertexShader = vertexShader;
	mesh.material.needsUpdate = true;
}

PlateView.prototype.uniform = function(key, value){
	console.log(this._uniforms[key], value)
	if(this._uniforms[key] === value){
		return;
	}
	this._uniforms[key] = value;

 	var meshes, mesh;

 	mesh = this.mesh1;
 	mesh.material.uniforms[key].value = value;
 	mesh.material.uniforms[key].needsUpdate = true;

 	mesh = this.mesh2;
 	mesh.material.uniforms[key].value = value;
 	mesh.material.uniforms[key].needsUpdate = true;
}

PlateView.prototype.destroy = function() {
	var mesh;

	this.scene.remove(this.mesh1);
	this.scene.remove(this.mesh2);

	mesh = this.mesh1;
	mesh.material.dispose();
	mesh.geometry.dispose();

	mesh = this.mesh2;
	mesh.material.dispose();
	mesh.geometry.dispose();
};