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
	this.ocean	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32}) ); 
	this.ocean.renderDepth = -2;
	this.scene.add(this.ocean);
}

View.prototype.update = function(){
	for(var i=0, li = this.world.plates.length, plates = world.plates; i<li; i++){
		layers = this.meshes.get(plates[i]);
		for(var j=0; j<layers.length; j++){
			layers[j].update(plates[i]);
		}
	}
}

View.prototype.add = function(plate){
	var sealevel = this.world.SEALEVEL
	var epipelagic = sealevel - 200;
	var mountain = sealevel + 5000;
	var land = new Layer(this, 1.05, 
		new THREE.MeshBasicMaterial({color: 0x506e1e}), 
		function(cell){return cell.content.displacement > sealevel});
	var ice = new Layer(this, 1.06, 
		new THREE.MeshBasicMaterial({color: 0xffffff}), 
		function(cell){return cell.content.displacement > epipelagic && Math.abs(plate.mesh.localToWorld(cell.clone()).y) > 0.8});
	var shallow = new Layer(this, 1.04, 
		new THREE.MeshBasicMaterial({color: 0x0a968c}), 
		function(cell){return cell.content.displacement > epipelagic});
	
	this.meshes.set(plate, [land, ice, shallow]);
}

View.prototype.remove = function(plate){
	var layers = this.meshes.get(plate);
	if(!layers){return;}
	this.meshes.remove(plate);
	for(var i=0; i<layers.length; i++){
		mesh = layers[i].mesh;
		layers[i].mesh = void 0;
		layers[i].vertices = void 0;
		this.scene.remove(mesh);
		mesh.material.dispose();
		mesh.geometry.dispose();
		delete mesh;
	}
}