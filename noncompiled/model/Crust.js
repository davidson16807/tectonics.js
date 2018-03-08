'use strict';

// A "Crust" is defined as a tuple of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
// It also provides functions for modeling properties of Crust
function Crust(params) {
	this.grid = params['grid'] || stop('missing parameter: "grid"');

	var length = this.grid.vertices.length;

    var buffer = params['buffer'] || new ArrayBuffer(6 * Float32Array.BYTES_PER_ELEMENT * length);
    this.buffer = buffer;

    this.sediment 			= new Float32Array(buffer, 0 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.sedimentary		= new Float32Array(buffer, 1 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.metamorphic		= new Float32Array(buffer, 2 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.felsic_plutonic 	= new Float32Array(buffer, 3 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.mafic_volcanic 	= new Float32Array(buffer, 4 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.age  				= new Float32Array(buffer, 5 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.conserved_pools 	= new Float32Array(buffer, 0, 4 * length);
    this.mass_pools 		= new Float32Array(buffer, 0, 5 * length);
    this.everything 		= new Float32Array(buffer);

	// The following are the most fundamental fields to the tectonics model:
	//
	// "felsic" is the mass of the buoyant, unsubductable igneous component of the crust
	// AKA "sial", or "continental" crust
	// 
	// "sediment", "sedimentary", and "metamorphic" are forms of felsic rock that have been converted by weathering, lithification, or metamorphosis
	// together with felsic, they form a conserved quantity - felsic type rock is never created or destroyed without our explicit say-so
	// This is done to provide our model with a way to check for errors
	//
	// "mafic" is the mass of the denser, subductable igneous component of the crust
	// AKA "sima", or "oceanic" crust
	// mafic never undergoes conversion to the other rock types (sediment, sedimentary, or metamorphic)
	// this is due to a few reasons:
	//    1.) it's not performant
	//    2.) mafic is not conserved, so it's not as important to get right
	//    3.) mafic remains underwater most of the time so it isn't very noticeable
	//
	// "volcanic" rock is rock that was created by volcanic resurfacing
	// "plutonic" rock is rock that has 
	// by tracking plutonic/volcanic rock, we can identify the specific kind of rock that's in a region:
	// 
	// 			volcanic 	plutonic
	// 	felsic 	rhyolite 	granite
	// 	mafic 	basalt 		gabbro
	// 
	//
	// "age" is the age of the subductable, mafic component of the crust
	// we don't track the age of unsubductable crust because it doesn't affect model behavior
}


// HERE IS STUFF WE DON'T NEED TO CHANGE WHEN WE ADD RASTERS
Crust.copy = function(source, destination) {
	destination.everything.set(source.everything);
}
Crust.reset = function(crust) {
	crust.everything.fill(0);
}
Crust.mult_field = function(crust, field, result_crust) {
	var input = crust.everything;
	var output = result_crust.everything;

	var length = field.length;
	for (var i=0, li=input.length; i<li; ++i) {
	    output[i] = input[i] * field[i%length];
	}
}
Crust.add_delta = function(crust, crust_delta, result_crust) {
	ScalarField.add_field(crust.everything, crust_delta.everything, result_crust.everything);
}
Crust.assert_conserved_delta = function(crust_delta, threshold) {
	ScalarTransport.assert_conserved_quantity_delta(crust_delta.conserved_pools, threshold);
}

Crust.get_average_conserved_per_cell = function(crust, thickness) {  
	return Float32Dataset.sum(crust.conserved_pools) / crust.grid.vertices.length
}
Crust.overlap = function(crust1, crust2, crust2_exists, crust2_on_top, result_crust) {

	// add current plate thickness to crust1 thickness wherever current plate exists
	ScalarField.add_field_term				 			(crust1.conserved_pools, crust2.conserved_pools, crust2_exists, result_crust.conserved_pools);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 			(crust1.mafic_volcanic, crust2.mafic_volcanic, crust2_on_top, 						result_crust.mafic_volcanic);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 			(crust1.age, crust2.age, crust2_on_top, 						result_crust.age);
}
Crust.get_conserved_mass = function(crust, mass) {  
	mass = mass || Float32Raster(crust.grid);
	mass.fill(0);

	var pools = crust.conserved_pools;
	var length = mass.length;
	for (var i=0, li=pools.length; i<li; ++i) {
		mass[i%length] += pools[i];
	}
	
	return mass; 
}
Crust.get_total_mass = function(crust, rock_density, mass) {  
	mass = mass || Float32Raster(crust.grid);
	mass.fill(0);

	var pools = crust.mass_pools;
	var length = mass.length;
	for (var i=0, li=pools.length; i<li; ++i) {
		mass[i%length] += pools[i];
	}
	
	return mass; 
}
Crust.get_density = function(mass, thickness, default_density, density) {
	for (var i = 0, li = density.length; i < li; i++) { 
        density[i] = thickness[i] > 0? mass[i] / thickness[i] : default_density; 
    }
}




// HERE IS STUFF WE *DO* NEED TO CHANGE WHEN WE ADD RASTERS
Crust.get_value = function(crust, i) {
	return new RockColumn({
		sediment 			:crust.sediment[i],
		sedimentary 		:crust.sedimentary[i],
		metamorphic 		:crust.metamorphic[i],
		felsic_plutonic 				:crust.felsic_plutonic[i],
		mafic_volcanic 				:crust.mafic_volcanic[i],
		age 				:crust.age[i],
	});
}
Crust.set_value = function(crust, i, rock_column) {
	crust.sediment[i] 		= rock_column.sediment;
	crust.sedimentary[i] 	= rock_column.sedimentary;
	crust.metamorphic[i] 	= rock_column.metamorphic;
	crust.felsic_plutonic[i] 			= rock_column.felsic_plutonic;
	crust.mafic_volcanic[i] 			= rock_column.mafic_volcanic;
	crust.age[i] 			= rock_column.age;
}
Crust.fill = function(crust, rock_column) {
	var fill = Float32Raster.fill;
	fill(crust.sediment, rock_column.sediment);
	fill(crust.sedimentary, rock_column.sedimentary);
	fill(crust.metamorphic, rock_column.metamorphic);
	fill(crust.felsic_plutonic, rock_column.felsic_plutonic);
	fill(crust.mafic_volcanic, rock_column.mafic_volcanic);
	fill(crust.age, rock_column.age);
}
Crust.fill_into_selection = function(crust, rock_column, selection_raster, result_crust) {
	// NOTE: a naive implementation would repeatedly invoke Float32RasterGraphics.fill_into_selection 
	// However, this is much less performant because it reads from selection_raster multiple times. 
	// For performance reasons, we have to roll our own. 
	var fill_into = Float32RasterGraphics.fill_into_selection;
	fill_into(crust.sediment, rock_column.sediment, selection_raster, result_crust.sediment);
	fill_into(crust.sedimentary, rock_column.sedimentary, selection_raster, result_crust.sedimentary);
	fill_into(crust.metamorphic, rock_column.metamorphic, selection_raster, result_crust.metamorphic);
	fill_into(crust.felsic_plutonic, rock_column.felsic_plutonic, selection_raster, result_crust.felsic_plutonic);
	fill_into(crust.mafic_volcanic, rock_column.mafic_volcanic, selection_raster, result_crust.mafic_volcanic);
	fill_into(crust.age,  rock_column.age,  selection_raster, result_crust.age) ;
}
Crust.copy_into_selection = function(crust, crust2, selection_raster, result_crust) {
	// NOTE: a naive implementation would repeatedly invoke Float32RasterGraphics.fill_into_selection 
	// However, this is much less performant because it reads from selection_raster multiple times. 
	// For performance reasons, we have to roll our own. 
	var fill_into = Float32RasterGraphics.copy_into_selection;
	fill_into(crust.sediment, crust2.sediment, selection_raster, result_crust.sediment);
	fill_into(crust.sedimentary, crust2.sedimentary, selection_raster, result_crust.sedimentary);
	fill_into(crust.metamorphic, crust2.metamorphic, selection_raster, result_crust.metamorphic);
	fill_into(crust.felsic_plutonic, crust2.felsic_plutonic, selection_raster, result_crust.felsic_plutonic);
	fill_into(crust.mafic_volcanic, crust2.mafic_volcanic, selection_raster, result_crust.mafic_volcanic);
	fill_into(crust.age,  crust2.age,  selection_raster, result_crust.age) ;
}

Crust.get_ids = function(crust, id_raster, result_crust) {
	var get_ids = Float32Raster.get_ids;
	get_ids(crust.sediment, id_raster, result_crust.sediment);
	get_ids(crust.sedimentary, id_raster, result_crust.sedimentary);
	get_ids(crust.metamorphic, id_raster, result_crust.metamorphic);
	get_ids(crust.felsic_plutonic, id_raster, result_crust.felsic_plutonic);
	get_ids(crust.mafic_volcanic, id_raster, result_crust.mafic_volcanic);
	get_ids(crust.age, id_raster, result_crust.age);
}
Crust.add_values_to_ids = function(crust, id_raster, value_crust, result_crust) {
	var add_values_to_ids = Float32Raster.add_values_to_ids;
	add_values_to_ids(crust.sediment, id_raster, value_crust.sediment, 	 result_crust.sediment);
	add_values_to_ids(crust.sedimentary, id_raster, value_crust.sedimentary, result_crust.sedimentary);
	add_values_to_ids(crust.metamorphic, id_raster, value_crust.metamorphic, result_crust.metamorphic);
	add_values_to_ids(crust.felsic_plutonic, id_raster, value_crust.felsic_plutonic, 		 result_crust.felsic_plutonic);
	add_values_to_ids(crust.mafic_volcanic, id_raster, value_crust.mafic_volcanic, 		 result_crust.mafic_volcanic);
	add_values_to_ids(crust.age, id_raster, value_crust.age, 		 result_crust.age);
}
Crust.fix_delta = function(crust_delta, crust, scratch) {
	var scratch = scratch || Float32Raster(crust_delta.grid);
	var fix = ScalarTransport.fix_nonnegative_conserved_quantity_delta;
	fix(crust_delta.sediment, crust.sediment, scratch);
	fix(crust_delta.sedimentary, crust.sedimentary, scratch);
	fix(crust_delta.metamorphic, crust.metamorphic, scratch);
	fix(crust_delta.felsic_plutonic, crust.felsic_plutonic, scratch);
	fix(crust_delta.mafic_volcanic, crust.mafic_volcanic, scratch);
}
Crust.assert_conserved_transport_delta = function(crust_delta, threshold) {
	var assert = ScalarTransport.assert_conserved_quantity_delta;
	assert(crust_delta.sediment, threshold);
	assert(crust_delta.sedimentary, threshold);
	assert(crust_delta.metamorphic, threshold);
	assert(crust_delta.felsic_plutonic, threshold);
}
Crust.assert_conserved_reaction_delta = function(crust_delta, threshold, scratch) {
	var sum = scratch || Float32Raster(crust_delta.grid);
	sum.fill(0);
	ScalarField.add_field(sum, crust_delta.sediment, sum);
	ScalarField.add_field(sum, crust_delta.sedimentary, sum);
	ScalarField.add_field(sum, crust_delta.metamorphic, sum);
	ScalarField.add_field(sum, crust_delta.felsic_plutonic, sum);
	ScalarField.mult_field(sum, sum, sum);
	var is_not_conserved = Uint8Dataset.sum(ScalarField.gt_scalar(sum, threshold * threshold));
	if (is_not_conserved) {
		debugger;
	}
}


Crust.get_thickness = function(crust, rock_density, thickness) {
	thickness = thickness || Float32Raster(crust.grid);

	var sediment = crust.sediment;
	var sedimentary = crust.sedimentary;
	var metamorphic = crust.metamorphic;
	var felsic_plutonic = crust.felsic_plutonic;
	var mafic_volcanic = crust.mafic_volcanic;

	var sediment_density = rock_density.sediment;
	var sedimentary_density = rock_density.sedimentary;
	var metamorphic_density = rock_density.metamorphic;
	var felsic_plutonic_density = rock_density.felsic_plutonic;

	// NOTE: thickness does double duty for performance reasons
	var fraction_of_lifetime = thickness;
	var mafic_volcanic_density = thickness;
	Float32RasterInterpolation.smoothstep	(0, 250, crust.age, fraction_of_lifetime);
	Float32RasterInterpolation.lerp			(rock_density.mafic_volcanic_min, rock_density.mafic_volcanic_max, fraction_of_lifetime, mafic_volcanic_density);

    for (var i = 0, li = thickness.length; i < li; i++) {
    	thickness[i] = 
    		sediment[i]		/ sediment_density +
    		sedimentary[i]	/ sedimentary_density +
    		metamorphic[i]	/ metamorphic_density +
    		felsic_plutonic[i] 		/ felsic_plutonic_density + 
    		mafic_volcanic[i] 		/ mafic_volcanic_density[i];
    }
}