
function Cell(plate, pos, id, content){
	this.world = plate.world;
	this.plate = plate;
	this.pos = pos;
	this.id = id;
	this.content = content;
}

Cell.prototype.create = function(template, invalid){
	this.content = new RockColumn(this.world,
		template.elevation, template.thickness, template.density);
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