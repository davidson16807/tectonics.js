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

RockColumn.prototype.erupt = function(){
	//Attempts to erupt a volcano on the surface of crust.
	//Height calculation based upon model by Ben-Avraham & Nur (1980),
	//which was chosen due to its simplicity.
	//The following assumptions apply:
	//* Density of melted crust is equivalent to that of continental crust.
	//  Observed densities seem close to this assumption,
	//  and the assumption assures continental crust does not become
	//  more dense over time.
	//* Melt source for volcano always occurs where subducted crust 
	//  detaches from subducting crust, i.e. at a depth defined by the 
	//  subducting crust's thickness.
	
	meltDensity = this.world.land.density
	rockDensity = this.world.ocean.density
	waterDensity = this.world.waterDensity
	thickness = this.thickness
	density = this.density
	elevation = this.displacement - this.world.SEALEVEL 
	if (elevation < 0) {
		thickness = thickness - ((meltDensity-waterDensity)/(density-meltDensity)) * Math.abs(this.displacement )
		height = thickness * ((density - meltDensity) 
							  / meltDensity)
		heightChange = height + Math.abs(elevation)
	} else {
		heightChange = thickness * ((density - meltDensity) 
									/ meltDensity)
	}
	pressure = (thickness*density) +
			   (heightChange*density)
	density  = pressure / (thickness + heightChange)
	
	this.thickness += heightChange
	this.density = density
	this.isostacy();
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