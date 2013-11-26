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
	this.asthenosphere	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x000000}) );
	this.asthenosphere.renderDepth = -1;
	this.scene.add(this.asthenosphere);
	
	var geometry	= world.grid.initializer(this.SEALEVEL);
	this.ocean	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32, transparent:true, opacity:0.5}) ); 
	this.ocean.renderDepth = -2;
	this.scene.add(this.ocean);
}

View.prototype.update = function(){
	for(var i=0, li = this.world.plates.length, plates = world.plates; i<li; i++){
		meshes = this.meshes.get(plates[i]);
		for(var key in meshes){
			var mesh = meshes[key]
			mesh.matrix = plates[i].mesh.matrix;
			mesh.rotation.setFromRotationMatrix(mesh.matrix);
			mesh.geometry.verticesNeedUpdate = true;
		}
		plateMesh = plates[i].mesh;
		for(var j=0, lj = plates[i]._vertices.length, cells = plates[i]._vertices; j<lj; j++){
			var content = cells[j].content;
			if(content){
				if(content.displacement > this.world.SEALEVEL){
					meshes.land.geometry.vertices[j].setLength(this.LAND);
				} else if (!content.subductedBy){
					meshes.land.geometry.vertices[j].setLength(this.OCEAN);
				} else {
					meshes.land.geometry.vertices[j].setLength(this.NA);
				}
				if(content.displacement > this.world.SEALEVEL && Math.abs(plateMesh.localToWorld(cells[j].clone()).y) > 0.7){
					meshes.ice.geometry.vertices[j].setLength(1.05);
				} else {
					meshes.ice.geometry.vertices[j].setLength(this.OCEAN);
				}
			} else {
				meshes.land.geometry.vertices[j].setLength(this.NA);
				meshes.ice.geometry.vertices[j].setLength(this.NA);
			}
		}
	}
}

View.prototype.add = function(plate){
	var geometry = world.grid.initializer(this.NA);
	var material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff});
	var land = new THREE.Mesh( geometry, material );
	this.scene.add(land);
	
	var geometry = world.grid.initializer(this.NA);
	var material = new THREE.MeshBasicMaterial({color: 0xffffff});
	var ice = new THREE.Mesh( geometry, material );
	this.scene.add(ice);
	
	this.meshes.set(plate, {land: land, ice: ice});
}

View.prototype.remove = function(plate){
	var meshes = this.meshes.get(plate);
	if(!meshes){return;}
	this.meshes.remove(plate);
	for(var key in meshes){
		var mesh = meshes[key]
		meshes[key] = void 0;
		this.scene.remove(mesh);
		mesh.material.dispose();
		mesh.geometry.dispose();
		delete mesh;
	}
}