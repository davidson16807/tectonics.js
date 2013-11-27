
function Layer(view, height, material, condition) { 
	this.height = height;
	this.condition = condition;
	
	geometry = world.grid.initializer(0.1);
	this.mesh = new THREE.Mesh( geometry, material );
	this.vertices = geometry.vertices;
	view.scene.add(this.mesh);
}
Layer.prototype.update = function(plate){
	var mesh = this.mesh;
	var vertices = this.vertices;
	mesh.matrix = plate.mesh.matrix;
	mesh.rotation.setFromRotationMatrix(mesh.matrix);
	mesh.geometry.verticesNeedUpdate = true;
	
	for(var j=0, lj = plate._vertices.length, cells = plate._vertices; j<lj; j++){
		if(cells[j].content && this.condition(cells[j])){
			vertices[j].setLength(this.height);
		} else if (cells[j].content){
			vertices[j].setLength(1.02);
		} else {
			vertices[j].setLength(0.1);
		}
	}
}
Layer.prototype.destroy = function(){
	mesh = this.mesh;
	this.mesh = void 0;
	this.vertices = void 0;
	this.view.scene.remove(mesh);
	mesh.material.dispose();
	mesh.geometry.dispose();
	delete mesh;
}