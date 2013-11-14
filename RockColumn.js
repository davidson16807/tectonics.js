function RockColumn(elevation, thickness, density){
	this.elevation = elevation;
	this.displacement = void 0;
	this.thickness = thickness;
	this.density = density;
}

RockColumn.prototype.isContinental = function(){
	return this.elevation > this.world.SEALEVEL;
}