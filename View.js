var _hashPlate = function(plate){
	return plate.mesh.uuid
}


function View(world, style){
	this.NA = 0.1;
	this.THRESHOLD = 1.0;
	this.SUBDUCTED = 1.01;
	this.OCEAN = 1.02;
	this.SEALEVEL = 1.03;
	this.LAND = 1.04;
	this.world = world;
	this.style = style
	this.meshes = new buckets.Dictionary(_hashPlate);

	// create a scene
	this.scene = new THREE.Scene();

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.set(0, 0, 5);
	this.scene.add(this.camera);
	
	style.getWorldLayers(this);
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
	this.meshes.set(plate, this.style.getPlateLayers(this, plate));
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