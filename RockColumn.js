function RockColumn(world, elevation, thickness, density){
	this.world = world;
	this.elevation = elevation;
	this.displacement = void 0;
	this.thickness = thickness;
	this.density = density;
}

RockColumn.prototype.isContinental = function(){
	return this.elevation > this.world.SEALEVEL;
}

RockColumn.prototype.isostacy = function(){
	//Calculates elevation as a function of crust density.
	//This was chosen as it only requires knowledge of crust density and thickness, 
	//which are relatively well known.
	thickness = this.thickness
	rootDepth = thickness * this.density / this.world.mantleDensity
	displacement = thickness - rootDepth
	this.displacement = displacement 
}