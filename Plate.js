
function Plate(world, center, eulerPole, angularSpeed)
{
	this.world = world;
	this.center = center; // TODO: remove
	this.eulerPole = eulerPole;
	this.angularSpeed = angularSpeed;
	
	//efficiency attributes, AKA attributes of attributes:
	this._geometry = world.grid.initializer(world.NA);
	this._vertices = this._geometry.vertices;
	this._material	= new THREE.MeshBasicMaterial({color: 0x506e1e, transparent:false, opacity:1});
	this.mesh	= new THREE.Mesh( this._geometry, this._material ); 
	
	for(var i = 0, length = this._vertices.length, vertices = this._vertices; i<length; i++){
		vertices[i].plate = this;
		vertices[i].id = i;
	}
}
Plate.prototype.get = function(i){
	return this._vertices[i];
}
Plate.prototype.getSize = function(){
	return this._vertices.filter(function(vertex){return vertex.length() > this.world.THRESHOLD}).length;
}
Plate.prototype.move = function(timestep){
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationAxis( this.eulerPole, this.angularSpeed * timestep );
	rotationMatrix.multiply( this.mesh.matrix ); 
	this.mesh.matrix = rotationMatrix;
	this.mesh.rotation.setFromRotationMatrix( this.mesh.matrix );
}
