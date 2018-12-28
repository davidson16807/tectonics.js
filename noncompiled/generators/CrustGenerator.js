
var CrustGenerator = {};
CrustGenerator.generate = function (height_ranks, hypsography, control_points, crust, random) {

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
		heights[i] = hypsography(random);
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
				
				Crust.set_value( crust, cell_ids[i], RockColumn.lerp(lower, upper, fraction) );

				break;
			}
		};
	};
};

CrustGenerator.early_earth_hypsography = function(random) {
	var water_fraction = 0.95; // Earth = 0.71
	return random.uniform(0,1) < water_fraction? 
		random.normal(-4019,1113) :
		random.normal(797,1169);
};
CrustGenerator.modern_earth_hypsography = function(random) {
	var water_fraction = 0.6; // 60% of earth's crust is oceanic
	return random.uniform(0,1) < water_fraction? 
		random.normal(-4019,1113) :
		random.normal(797,1169);
};
CrustGenerator.modern_earth_control_points = [
	//abyss
	new RockColumn({
		displacement: -11000,
		mafic_volcanic: 		2890. * 7100, 
		age: 		250 * Units.MEGAYEAR,
	}),
	//deep_ocean
	new RockColumn({
		displacement: -6000,  
		mafic_volcanic: 	 	2890. * 7100, // +/- 800, White McKenzie and O'nions 1992
		age: 		200 * Units.MEGAYEAR,
	}),
	//shallow_ocean
	new RockColumn({
		displacement: -3682,	 // Charette & Smith 2010
		mafic_volcanic: 		2890. * 7100, // +/- 800, White McKenzie and O'nions 1992
		age: 		0 * Units.MEGAYEAR,
	}),
	//shelf_bottom
	new RockColumn({
		displacement: -3200,    // encyclopedia britannica, "continental slope"
		mafic_volcanic: 		2890. * 7100,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		sediment: 	2500. * 5,
		age: 		100 * Units.MEGAYEAR,
	}),
	//shelf_top
	new RockColumn({
		displacement: -200,    //wikipedia
		felsic_plutonic: 		2700. * 0.85 * 28300,  
		felsic_volcanic: 		2700. * 0.15 * 28300,  
		// "28300m" is back-calculated using isostatic model and estimates from control point for land
		sediment: 	2500. * 5,
		age: 		100 * Units.MEGAYEAR,
	}),
	//land
	new RockColumn({
		displacement: 840,    //Sverdrup & Fleming 1942
		felsic_plutonic: 		2700. * 0.85 * 36900,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		felsic_volcanic: 		2700. * 0.15 * 36900,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		sediment: 	2500. * 5,
		age: 		1000 * Units.MEGAYEAR,
	}),
	//mountain
	new RockColumn({
		displacement: 8848,
		felsic_plutonic: 		2700. * 0.85 *70000,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		felsic_volcanic: 		2700. * 0.15 *70000,  // +/- 2900, estimate for shields, Zandt & Ammon 1995
		age: 		1000 * Units.MEGAYEAR,
	})
];
