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


// what follows is an implementation of the terrain generation algorithm discussed by
// Hugo Elias here: http://freespace.virgin.net/hugo.elias/models/m_landsp.htm
// the algorithm is specifically made to generate terrain on a sphere.
// It does this by iteratively splitting the world in
// half and adding some random amount of landmass to one of the sides.
// It does this until an attractive landmass results.
// 
// Its a bit more sophisticated in that it uses spherical harmonics of degree 1 
// instead of an immediate drop off between sides. 
// This is done to produce smoother terrain using fewer iterations 
EliasWorldGenerator = {}
EliasWorldGenerator.generate = function (world, optional) {
	var optional = {};
	var exp = Math.exp;

	function heaviside_approximation (x, k) {
		return 2 / (1 + exp(-k*x)) - 1;
	}


	var zDotMultipliers = [];
	for (var i = 0; i < 50; i++) {
		var basis = Sphere.getRandomBasis();
		var zDotMultiplier = new THREE.Vector3().fromArray(basis.toArray().slice(8,11));
		zDotMultipliers.push(zDotMultiplier);
	};
	console.log(zDotMultipliers)

	var plate = new Plate(world);
	for(var i=0, length = plate.cells.length; i<length; i++) {
		var cell = plate.cells[i];
		var height = 0;
		for (var j = 0, lj = zDotMultipliers.length; j < lj; j++) {
			var z = cell.pos.clone().dot(zDotMultipliers[j]);
			height += heaviside_approximation(z, 15);
		};
		console.log(height)
		if(height > 0){
			cell.create(world.land);
		} else {
			cell.create(world.ocean);
		}

		cell.content.isostasy();
	}
	plate.densityOffset = plate.getDensityOffset();
	world.plates = [plate];
}