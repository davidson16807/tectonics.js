THREE.Object3D.prototype.clear = function(){
    var children = this.children;
    for(var i = children.length-1;i>=0;i--){
        var child = children[i];
        child.clear();
        this.remove(child);
    };
	//NOTE: the following fixes an issues with redrawing scenes where transparent objects are involved.
	renderer.render( scene, camera );
};

function View(world){
	this.NA = 0.1;
	this.THRESHOLD = 1.0;
	this.SUBDUCTED = 1.01;
	this.OCEAN = 1.02;
	this.SEALEVEL = 1.03;
	this.LAND = 1.04;
	this.world = world;
	this.meshes = {};
	for(var i=0, li = this.world.plates.length, plates = this.world.plates; i<li; i++){
		var geometry = world.grid.initializer(this.SEALEVEL);
		var material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, transparent:true, opacity:1});
		this.meshes[plates[i].mesh.uuid] = new THREE.Mesh( geometry, material ); ;
	}

	var geometry	= world.grid.initializer(this.SEALEVEL);
	var material	= new THREE.MeshBasicMaterial({color:0x0a0a32, transparent:true, opacity:0.5});
	this.ocean	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32, transparent:true, opacity:0.5}) ); 
	
	geometry	= world.grid.initializer(this.THRESHOLD);
	material	= new THREE.MeshBasicMaterial({color:0x000000, transparent:false});
	this.asthenosphere	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:false}) );
	
	this.update();
}

View.prototype.update = function(){
	for(var i=0, li = this.world.plates.length, plates = this.world.plates; i<li; i++){
		mesh = this.meshes[plates[i].mesh.uuid];
		mesh.matrix = plates[i].mesh.matrix;
		mesh.rotation.setFromRotationMatrix(mesh.matrix);
		mesh.geometry.verticesNeedUpdate = true;
		var vertices = mesh.geometry.vertices
		for(var j=0, lj = plates[i]._vertices.length, cells = plates[i]._vertices; j<lj; j++){
			var content = cells[j].content;
			if(content){
				if(content.elevation > this.world.SEALEVEL){
					vertices[j].setLength(this.LAND);
				} else if (!content.subductedBy){
					vertices[j].setLength(this.OCEAN);
				}
			} else {
				vertices[j].setLength(this.NA);
			}
		}
	}
}

View.prototype.draw = function(){
	var meshes = this.meshes;
	var length = this.world.plates.length;
	var plates = this.world.plates;
	for(var j = 0; j<length; j++){
		scene.add(meshes[plates[j].mesh.uuid]);
	}
	scene.add(this.asthenosphere);
	scene.add(this.ocean);
}