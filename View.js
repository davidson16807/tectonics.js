var _hashPlate = function(plate){
	return plate.mesh.uuid
}

function View(world){
	this.NA = 0.1;
	this.THRESHOLD = 1.0;
	this.SUBDUCTED = 1.01;
	this.OCEAN = 1.02;
	this.SEALEVEL = 1.03;
	this.LAND = 1.04;
	this.world = world;
	this.meshes = new buckets.Dictionary(_hashPlate);

	// create a scene
	this.scene = new THREE.Scene();

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.set(0, 0, 5);
	this.scene.add(this.camera);
	
	var geometry	= world.grid.initializer(this.THRESHOLD);
	this.asthenosphere	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32}) );
	this.asthenosphere.renderDepth = -1;
	this.scene.add(this.asthenosphere);
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
				if(content.displacement > this.world.SEALEVEL){
					vertices[j].setLength(this.LAND);
				} else {
					vertices[j].setLength(this.OCEAN);
				}
				displacement[j] = content.displacement;
			} else {
				vertices[j].setLength(this.NA);
				displacement[j] = 0.0;
			}
		}
		mesh.material.attributes.displacement.needsUpdate = true;
	}
}

View.prototype.add = function(plate){
	var geometry = world.grid.initializer(this.SEALEVEL);
	var material = new THREE.ShaderMaterial({
		attributes: {
		  displacement: { type: 'f', value: [] }
		},
		uniforms: {
		  sealevel: 	{ type: 'f', value: this.world.SEALEVEL }
		},
		vertexShader: $('#vertexshader').text(),
		fragmentShader: $('#fragmentshader').text()
	  })
	var mesh = new THREE.Mesh( geometry, material );
	
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