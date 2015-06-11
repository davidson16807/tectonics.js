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

	// first, we generate matrices expressing direction of continent centers
	// Only the z axis is used to determine distance to a continent's center,
	// so we discard all but the row representing the z axis
	// this row is stored as a vector, and we take the dot product with the cell pos 
	// to find the z axis relative to the continent center 
	var zDotMultipliers = [];
	for (var i = 0; i < 1000; i++) {
		var basis = Sphere.getRandomBasis();
		var zDotMultiplier = new THREE.Vector3()
			.fromArray(basis.toArray().slice(8,11))
			.multiplyScalar(random.random());
		zDotMultipliers.push(zDotMultiplier);
	};

	// Now, we iterate through the cells and find their "height rank".
	// This value doesn't translate directly elevation. 
	// It only represents how cells would rank if sorted by elevation.
	// This is done so we can later derive elevations that are consistent with earth's.
	var plate = new Plate(world);
	for(var i=0, length = plate.cells.length; i<length; i++) {
		var cell = plate.cells[i];
		var height_rank = 0;
		for (var j = 0, lj = zDotMultipliers.length; j < lj; j++) {
			var z = cell.pos.clone().dot(zDotMultipliers[j]);
			height_rank += heaviside_approximation(z, 15);
		};
		cell.height_rank = height_rank;
	}

	// order cells by this new found  "height rank"
	cells = plate.cells
		.slice(0)
		.sort(function(a, b) { return a.height_rank - b.height_rank });

	// 70% of earth is covered by water
	// we'll use this fact until we can flesh out the rest of the algorithm.

	for (var i = 0, li = cells.length; i < li; i++) {
		var cell = cells[i];
		if(i < li * 0.25){
			cell.create(world.land);
		} else {
			cell.create(world.ocean);
		}

		cell.content.isostasy();
	};

	// Next we find elevations whose magnitude and frequency match those of earth's.
	// To do this, we generate a second dataset of equal size that represents actual elevations.
	// This dataset is generated from statistical distributions matching those found on earth. 
	// We sort the elevations and map each one to a cell from our height-rank sorted list.

	// Our model does not work directly with elevation.
	// We must express elevation in terms of thickness/density
	// To do this, we start off with a set of rock column templates expressing
	// what thickness/density should look like at a given density.
	// We then use B-splines to interpolate between these templated values.

	plate.densityOffset = plate.getDensityOffset();
	world.plates = [plate];
}