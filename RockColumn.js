function RockColumn(plate, elevation, densityOffset){
	this.elevation = elevation;
	this.density = densityOffset + plate.densityOffset;
}

RockColumn.prototype.isContinental = function(){
	return vertex.elevation > this.world.SEALEVEL;
}