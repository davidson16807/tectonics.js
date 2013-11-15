
function Crust(world){
	this.world = world;
}

Crust.prototype.create = function(vertex, template){
	vertex.content = new RockColumn(this.world,
		template.elevation, template.thickness, template.density + vertex.plate.densityOffset);
}

Crust.prototype.isContinental = function(vertex){
	return vertex.content && vertex.content.isContinental()
}

Crust.prototype._canSubduct = function(top, bottom){
	if(top.content.density > bottom.content.density){
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
	if (subducted.distanceTo(subducting) > this.world.mountainWidth / this.world.radius){
		if(this.isContinental(bottom) && this.isContinental(top)){
			this.dock(top, bottom);
		} else {
			top.content.accrete(bottom.content);
			this.destroy(bottom);
		}
	}
}

Crust.prototype._canDock = function(dockingContinent, dockedToContinent){
	if(dockedToContinent.plate.densityOffset < dockingContinent.plate.densityOffset){
		return true;
	} else {
		return false;
	}
}

Crust.prototype.dock = function(top, bottom){
	var smallContinent, dockedTo, docking;
	if(this._canDock(bottom, top)){
		dockedTo = top;
		docking = bottom;
		dockingContinent = bottom.plate.getContinent(bottom);;
	} else {
		dockedTo = bottom;
		docking = top;
		dockingContinent = top.plate.getContinent(top);;
	}
	dockedTo.plate.dock(dockedTo, docking.plate, dockingContinent);
}

Crust.prototype.replace = function(replaced, replacement){
	replaced.content = replacement.content;
	replaced.subductedBy = void 0;
}

Crust.prototype.destroy = function(vertex){
	vertex.content = void 0;
	vertex.subductedBy = void 0;
}