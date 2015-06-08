CratonWorldGenerator = {}
CratonWorldGenerator.generate = function (world, optional) {
	var optional = {};
	var continentRadius = (optional['continentRadius'] || 1250) / world.radius;
	var shield = world.getRandomPoint();

	var plate = new Plate(world);
	for(var i=0, length = plate.cells.length; i<length; i++) {
		var cell = plate.cells[i];
		if(shield.distanceTo(cell.pos) < continentRadius ) { 
			cell.create(world.land);
		} else {
			cell.create(world.ocean);
		}
		cell.content.isostasy();
	}
	plate.densityOffset = plate.getDensityOffset();
	world.plates = [plate];
}