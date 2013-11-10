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
	if(top.elevation > bottom.elevation){
		return true;
	} else if(top.density < bottom.density){
		return true;
	} else {
		return false;
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
	if (subducted.distanceTo(subducting) > this.world.mountainWidth / this.world.radius){
		if(this.isContinental(bottom) && this.isContinental(top)){
			this.dock(top, bottom);
		} else {
			this.destroy(bottom);
			top.setLength(this.world.LAND);
		}
	} else {
		bottom.setLength(this.world.SUBDUCTED);
	}
}

Crust.prototype._canDock = function(dockingContinent, dockedToContinent){
	if(dockedToContinent.size() > dockingContinent.size()){
		return true;
	} else {
		return false;
	}
}

Crust.prototype.dock = function(top, bottom){
	var topContinent = top.plate.getContinent(top);
	var bottomContinent = bottom.plate.getContinent(bottom);
	var smallContinent, smallPlate, large, small;
	if(this._canDock(bottomContinent, topContinent)){
		large = top;
		small = bottom;
		smallContinent = bottomContinent;
	} else {
		large = bottom;
		small = top;
		smallContinent = topContinent;
	}
	large.plate.dock(large, small.plate, smallContinent);
}

Crust.prototype.replace = function(replaced, replacement){
	replaced.setLength(replacement.length());
	replaced.density = replacement.density;
	replaced.subductedBy = void 0;
}

Crust.prototype.destroy = function(vertex){
	vertex.setLength(world.NA);
	vertex.density = void 0;
	vertex.subductedBy = void 0;
}