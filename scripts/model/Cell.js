'use strict';

function Cell(plate, pos, id, content){
	this.plate = plate;
	this.world = plate.world;
	this._grid = plate.grid;
	this.pos = pos;
	this.id = id;
	this.content = content;
}

Cell.prototype.create = function(template, invalid){
	this.content = new RockColumn(this.world, {
		elevation: 	template.elevation, 
		thickness: 	template.thickness, 
		density: 	template.density
	});
}

Cell.prototype.isContinental = function(invalid){
	return this.content && this.content.isContinental()
}

Cell.prototype._canSubduct = function(subducted, invalid){
	if(this.plate.densityOffset > subducted.plate.densityOffset){
		return false;
	} else {
		return true;
	}
}

Cell.prototype.collide = function(other, invalid){
	var top, bottom;
	if(this._canSubduct(other)){
		top = this;
		bottom = other;
	} else {
		bottom = this;
		top = other;
	}
	if (true){//subducted.distanceTo(subducting) > this.world.mountainWidth / this.world.radius){
		if(bottom.isContinental() && top.isContinental()){
			top.dock(bottom);
		} else {
			top.content.accrete(bottom.content);
			bottom.destroy();
		}
	}
}

Cell.prototype._canDock = function(subjugated, invalid){
	if(this.plate.densityOffset > subjugated.plate.densityOffset){
		return false;
	} else {
		return true;
	}
}

Cell.prototype.dock = function(other, invalid){
	var subjugating, subjugated;
	if(this._canDock(other)){
		subjugating = this;
		subjugated = other;
	} else {
		subjugating = other;
		subjugated = this;
	}
	subjugating.plate.dock(subjugated);
}

Cell.prototype.replace = function(replacement, invalid){
	this.content = replacement.content;
	this.subductedBy = void 0;
}

Cell.prototype.destroy = function(){
	this.content = void 0;
	this.subductedBy = void 0;
}

Cell.prototype.getIntersections = function(plates, getIntersection){
	var parent = this.plate;
	var grid = this._grid;
	var absolute_pos = this.plate.localToWorld(this.pos.clone());
	for(var j=0, lj = plates.length; j<lj; j++){
		var plate = plates[j];
		var relative = plate.worldToLocal(absolute_pos.clone());
		var id = grid.getNearestId(relative);
		var intersection = getIntersection(id, plate);
		if(intersection) {
			parent._neighbors.splice(j, 1);
			parent._neighbors.unshift(plate);
			return intersection; 
		}
	}
}
