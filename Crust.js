function Crust(world){
	this.world = world;
}

Crust.prototype.create = function(vertex, elevation, densityOffset){
	vertex.setLength(elevation);
	vertex.density = densityOffset + vertex.plate.densityOffset;
}