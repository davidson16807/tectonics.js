

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
		zDotMultipliers.push(Sphere.random_point());
	};

	// Now, we iterate through the cells and find their "height rank".
	// This value doesn't translate directly to elevation. 
	// It only represents how cells would rank if sorted by elevation.
	// This is done so we can later derive elevations that are consistent with earth's.
	var positions = grid.vertices;
	var pos = grid.pos;
	var z = Float32Raster(grid);
	var height_ranks = Float32Raster(grid);
	Float32Raster.fill(height_ranks, 0);
	for (var j = 0, lj = zDotMultipliers.length; j < lj; j++) {
		VectorField.dot_vector(pos, zDotMultipliers[j], z);
		Float32RasterInterpolation.smooth_heaviside(z, 300, z);
		ScalarField.add_field(height_ranks, z, height_ranks);
	}

	return height_ranks;
}
