function Crust(world){
	this.world = world;
}

Crust.prototype.create = function(vertex, elevation, densityOffset){
	vertex.setLength(elevation);
	vertex.density = densityOffset + vertex.plate.densityOffset;
}

Crust.prototype.isContinental = function(vertex){
	return vertex.length() > this.world.SEALEVEL;
	//return vertex.density > 2800;
}

Crust.prototype._canSubduct = function(top, bottom){
	if(top.length() < bottom.length()){
		return false;
	} else if(top.plate.densityOffset > bottom.plate.densityOffset){
		return false;
	} else {
		return true;
	}
}

Crust.prototype.collide = function(vertex1, vertex2){
	var top, bottom;
	if(this._canSubduct(vertex1, vertex2)){
		top = vertex1;
		bottom = vertex2;
	} else {
		bottom = vertex1;
		top = vertex2;
	}
	if (_.isUndefined(bottom.subductedBy)){
		bottom.subductedBy = top;
	}
	var subducting = bottom.subductedBy.clone().normalize(); 
	// NOTE: bottom.subductedBy is not always equivalent to top
	var subducted = bottom.clone().normalize();
	if (true){//subducted.distanceTo(subducting) > this.world.mountainWidth / this.world.radius){
			this.destroy(bottom);
			top.setLength(this.world.LAND);
	} else {
		bottom.setLength(this.world.SUBDUCTED);
	}
}

Crust.prototype.destroy = function(vertex){
	vertex.setLength(world.NA);
	vertex.density = void 0;
	vertex.subductedBy = void 0;
}