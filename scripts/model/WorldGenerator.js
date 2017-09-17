

// what follows is an implementation of the terrain generation algorithm discussed by
// Hugo Elias here: http://freespace.virgin.net/hugo.elias/models/m_landsp.htm
// the algorithm is specifically made to generate terrain on a sphere.
// It does this by iteratively splitting the world in
// half and adding some random amount of landmass to one of the sides.
// It does this until an attractive landmass results.
// 
// Its a bit more sophisticated in that it uses a smooth function
// instead of an immediate drop off between sides. 
// This is done to produce smoother terrain using fewer iterations 
var EliasHeightMapGenerator = {};
EliasHeightMapGenerator.generate = function (grid, optional) {
	var optional = {};
	var exp = Math.exp;

	function heaviside_approximation (x, k) {
		return 2 / (1 + exp(-k*x)) - 1;
		return x>0? 1: 0; 
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
	// This value doesn't translate directly to elevation. 
	// It only represents how cells would rank if sorted by elevation.
	// This is done so we can later derive elevations that are consistent with earth's.
	var positions = grid.vertices;
	var height_ranks = Float32Raster(grid);
	for(var i=0, length = height_ranks.length; i<length; i++) {
		var height_rank = 0;
		var pos = positions[i];
		for (var j = 0, lj = zDotMultipliers.length; j < lj; j++) {
			var z = pos.dot(zDotMultipliers[j]);
			height_rank += heaviside_approximation(z, 300);
		};
		height_ranks[i] = height_rank;
	}

	return height_ranks;
}


var WorldGenerator = {};
WorldGenerator.generate = function (world, height_ranks, hypsography, control_points) {
	function clamp (x, minVal, maxVal) {
		return Math.min(Math.max(x, minVal), maxVal);
	}
	function smoothstep (edge0, edge1, x) {
		var fraction = (x - edge0) / (edge1 - edge0);
		return clamp(fraction, 0.0, 1.0);
    	// return t * t * (3.0 - 2.0 * t);
	}

	// order cells by this new found  "height rank"
	var cell_ids = new Uint16Array(height_ranks.length);
	for(var i=0, length = cell_ids.length; i<length; i++) {
		cell_ids[i] = i;
	}
	cell_ids.sort(function(a, b) { return height_ranks[a] - height_ranks[b]; });

	// Next we find elevations whose magnitude and frequency match those of earth's.
	// To do this, we generate a second dataset of equal size that represents actual elevations.
	// This dataset is generated from statistical distributions matching those found on earth. 
	// We sort the elevations and map each one to a cell from our height-rank sorted list.
	heights = new Float32Array(cell_ids.length);
	for (var i = 0, li = heights.length; i < li; i++) {
		heights[i] = hypsography();
	};
	heights.sort(function(a,b) { return a-b; });
 	
	// Our model does not work directly with elevation.
	// We must express elevation in terms of thickness/density
	// To do this, we start off with a set of rock column templates expressing
	// what thickness/density should look like at a given density.
	// We then interpolate between these templated values.
	var tallest = control_points[control_points.length - 1];
	for (var i = 0, li = cell_ids.length; i < li; i++) {
		var height = heights[i];

		for (var j = 1; j < control_points.length; j++) {
			var lower = control_points[j-1];
			var upper = control_points[j];
			if (height < upper.displacement || 
				upper.displacement == tallest.displacement){
				var fraction = smoothstep(lower.displacement, upper.displacement, height);
				
				Crust.set_value( world, cell_ids[i], RockColumn.lerp(lower, upper, fraction) );

				break;
			}
		};
	};
};

WorldGenerator.early_earth_hypsography = function() {
	var water_fraction = 0.05; // Earth = 0.71
	return random.uniform(0,1) > water_fraction? 
		random.normal(-4019,1113) :
		random.normal(797,1169);
};
WorldGenerator.modern_earth_hypsography = function() {
	var water_fraction = 0.29; 
	return random.uniform(0,1) > water_fraction? 
		random.normal(-4019,1113) :
		random.normal(797,1169);
};
WorldGenerator.modern_earth_control_points = [
	//abyss
	new RockColumn({
		displacement: -11000,
		sima: 		4000, 
		age: 		250,
	}),
	//deep_ocean
	new RockColumn({
		displacement: -6000,  
		sima: 	 7100-800, // +/- 800, White McKenzie and O'nions 1992
		age: 		200,
	}),
	//shallow_ocean
	new RockColumn({
		displacement: -3682,	 // Charette & Smith 2010
		sima: 		7100+800, // +/- 800, White McKenzie and O'nions 1992
		age: 		0,
	}),
	//shelf_bottom
	new RockColumn({
		displacement: -2000,    //Sverdrup & Fleming 1942
		sima: 		7100+800,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		age: 		100,
	}),
	//shelf_top
	new RockColumn({
		displacement: -200,    //Sverdrup & Fleming 1942
		sial: 		17000,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		age: 		1000,
	}),
	//land
	new RockColumn({
		displacement: 840,    //Sverdrup & Fleming 1942
		sial: 		36900,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		age: 		1000,
	}),
	//mountain
	new RockColumn({
		displacement: 8848,
		sial: 		70000,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		age: 		1000,
	})
];
