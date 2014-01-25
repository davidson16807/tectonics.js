var _hashPlate = function(plate){
	return plate.mesh.uuid
}

function View(world, fragmentShader, vertexShader){
	this.THRESHOLD = 0.99;
	this.SEALEVEL = 1.0;
	this.world = world;
	this._fragmentShader = fragmentShader;
	this._vertexShader = vertexShader;
	this.meshes = new buckets.Dictionary(_hashPlate);

	// create a scene
	this.scene = new THREE.Scene();

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, 10000 );
	this.camera.position.set(0, 0, 5);
	this.scene.add(this.camera);
	
	this.asthenosphere	= new THREE.Mesh( 
		world.grid.initializer(this.THRESHOLD), 
		new THREE.MeshBasicMaterial({color:0x0a0a32}));
	this.asthenosphere.renderDepth = -1;
	//this.scene.add(this.asthenosphere);
}

View.prototype.fragmentShader = function(fragmentShader){
	if(this._fragmentShader != fragmentShader){
		this._fragmentShader = fragmentShader;
		for(var i=0, li = this.world.plates.length, plates = world.plates; i<li; i++){
			mesh = this.meshes.get(plates[i]);
			mesh.material.fragmentShader = fragmentShader;
			mesh.material.needsUpdate = true;
		}
	}
}

View.prototype.vertexShader = function(vertexShader){
	if(this._vertexShader != vertexShader){
		this._vertexShader = vertexShader;
		for(var i=0, li = this.world.plates.length, plates = world.plates; i<li; i++){
			mesh = this.meshes.get(plates[i]);
			mesh.material.vertexShader = vertexShader;
			mesh.material.needsUpdate = true;
		}
	}
}

View.prototype.update = function(){
	for(var i=0, li = this.world.plates.length, plates = world.plates; i<li; i++){
		mesh = this.meshes.get(plates[i]);
		mesh.matrix = plates[i].mesh.matrix;
		mesh.rotation.setFromRotationMatrix(mesh.matrix);
		mesh.geometry.verticesNeedUpdate = true;
		var vertices = mesh.geometry.vertices
		var displacement = mesh.material.attributes.displacement.value;
		for(var j=0, lj = plates[i]._vertices.length, cells = plates[i]._vertices; j<lj; j++){
			var content = cells[j].content;
			if(content){
				displacement[j] = content.displacement;
			} else {
				displacement[j] = 0;
			}
		}
		mesh.material.attributes.displacement.needsUpdate = true;
	}
}

View.prototype.add = function(plate){
	var material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: [] }
		},
		uniforms: {
		  sealevel: 	{ type: 'f', value: this.world.SEALEVEL },
		  color: 	    { type: 'c', value: new THREE.Color(Math.random() * 0xffffff) },
		},
		blending: THREE.NoBlending,
		vertexShader: this._vertexShader,
		fragmentShader: this._fragmentShader
	});
	var mesh = new THREE.Mesh( 
		world.grid.initializer(this.SEALEVEL), 
		material);
	
	this.scene.add(mesh);
	this.meshes.set(plate, mesh);
}

View.prototype.remove = function(plate){
	var mesh = this.meshes.get(plate);
	if(!mesh){return;}
	this.meshes.remove(plate);
	
	this.scene.remove(mesh);
	mesh.material.dispose();
	mesh.geometry.dispose();
	delete mesh;
}