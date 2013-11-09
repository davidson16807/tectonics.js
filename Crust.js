

function Crust(plate, id, elevation, densityEffect){
	this.plate = plate;
	this.world = plate.world;
	
	this.id = id;
	this.elevation = elevation;
	this.density = densityEffect + plate.densityEffect;
}

Crust.prototype.isContinental = function(){
	return this.elevation > this.world.SEALEVEL;
	//return vertex.density > 2800;
}

_canSubduct = function(top, bottom){
	if(top.elevation < bottom.elevation){
		return false;
	} else if(top.plate.densityEffect > bottom.plate.densityEffect){
		return false;
	} else {
		return true;
	}
}

Crust.prototype.collide = function(other){
	var top, bottom;
	if(_canSubduct(this, other)){
		top = this;
		bottom = other;
	} else {
		bottom = this;
		top = other;
	}
	if (_.isUndefined(bottom.subductedBy)){
		bottom.subductedBy = top;
	}
	//var subducting = bottom.subductedBy.clone().normalize(); 
	// NOTE: bottom.subductedBy is not always equivalent to top
	//var subducted = bottom.clone().normalize();
	if (true){//subducted.distanceTo(subducting) > this.world.mountainWidth / this.world.radius){
		if(bottom.isContinental() && top.isContinental()){
			top.dock(bottom);
		} else {
			bottom.destroy();
			top.elevation = this.world.LAND;
		}
	} else {
		bottom.elevation = this.world.SUBDUCTED;
	}
}

_canDock = function(dockingContinent, dockedToContinent){
	if(dockedToContinent.size() > dockingContinent.size()){
		return true;
	} else {
		return false;
	}
}

Crust.prototype.dock = function(other){
	var topContinent = this.plate.getContinent(this);
	var bottomContinent = other.plate.getContinent(other);
	var smallContinent, smallPlate, large, small;
	if(_canDock(bottomContinent, topContinent)){
		large = this;
		small = other;
		smallContinent = bottomContinent;
	} else {
		large = other;
		small = this;
		smallContinent = topContinent;
	}
	large.plate.dock(large, small.plate, smallContinent);
}

Crust.prototype.destroy = function(){
	this.plate.crust[this.id] = void 0;
}