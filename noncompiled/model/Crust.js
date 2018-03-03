'use strict';

// A "Crust" is defined as a set of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
// It also provides functions for modeling properties of Crust
function Crust(params) {
	this.grid = params['grid'] || stop('missing parameter: "grid"');

	var length = this.grid.vertices.length;

    var buffer = params['buffer'] || new ArrayBuffer(6 * Float32Array.BYTES_PER_ELEMENT * length);
    this.buffer = buffer;

    this.sediment 	= new Float32Array(buffer, 0 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.sedimentary= new Float32Array(buffer, 1 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.metamorphic= new Float32Array(buffer, 2 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.sial 		= new Float32Array(buffer, 3 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.sima 		= new Float32Array(buffer, 4 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.age  		= new Float32Array(buffer, 5 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.conserved_pools 	= new Float32Array(buffer, 0, 4 * length);
    this.mass_pools 		= new Float32Array(buffer, 0, 5 * length);
    this.everything = new Float32Array(buffer);

	// TODO:
	// * record sima/sial in metric tons, not meters thickness
	// * switch densities to T/m^3

	// The following are the most fundamental fields to the tectonics model:

	// "sial" is the thickness of the buoyant, unsubductable component of the crust
	// AKA "sial", "felsic", or "continental" crust
	// Why don't we call it "continental" or some other name? Two reasons:
	//  1.) programmers will immediately understand what it does
	//  2.) we may want this model to simulate planets where alternate names don't apply, e.g. Pluto
	// sial is a conserved quantity - it is never created or destroyed without our explicit say-so
	// This is to provide our model with a way to check for errors

	// "sima" is the thickness of the denser, subductable component of the crust
	// AKA "sima", "mafsic", or "oceanic" crust
	// Why don't we call it "oceanic" or some other name? Two reasons:
	//  1.) programmers will immediately understand what it does
	//  2.) we may want this model to simulate planets where alternate names don't apply, e.g. Pluto

	// "age" is the age of the subductable component of the crust
	// we don't track the age of unsubductable crust because it doesn't affect model behavior
}


// HERE IS STUFF WE DON'T NEED TO CHANGE WHEN WE ADD RASTERS
Crust.copy = function(source, destination) {
	destination.everything.set(source.everything);
}
Crust.copy_into_selection = function(crust, copied_crust, selection_raster, result_crust) {
	VectorRasterGraphics.copy_into_selection(crust, copied_crust, selection_raster, result_crust);
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

Crust.sum_mass_pools = function(crust, thickness) {
	thickness = thickness || Float32Raster(crust.grid);
	thickness.fill(0);

	var mass_pools = crust.mass_pools;
	var length = thickness.length;
	for (var i=0, li=mass_pools.length; i<li; ++i) {
		thickness[i%length] += mass_pools[i];
	}
	
	return thickness; 
}
Crust.sum_conserved_pools = function(crust, thickness) {  
	thickness = thickness || Float32Raster(crust.grid);
	thickness.fill(0);

	var conserved = crust.conserved_pools;
	var length = thickness.length;
	for (var i=0, li=conserved.length; i<li; ++i) {
		thickness[i%length] += conserved[i];
	}
	
	return thickness; 
}
Crust.get_average_conserved_per_cell = function(crust, thickness) {  
	return Float32Dataset.sum(crust.conserved_pools) / crust.grid.vertices.length
}
Crust.overlap = function(crust1, crust2, crust2_exists, crust2_on_top, result_crust) {

	// add current plate thickness to crust1 thickness wherever current plate exists
	ScalarField.add_field_term				 			(crust1.conserved_pools, crust2.conserved_pools, crust2_exists, result_crust.conserved_pools);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 			(crust1.sima, crust2.sima, crust2_on_top, 						result_crust.sima);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 			(crust1.age, crust2.age, crust2_on_top, 						result_crust.age);
}




// HERE IS STUFF WE *DO* NEED TO CHANGE WHEN WE ADD RASTERS
Crust.get_value = function(crust, i) {
	return new RockColumn({
		sediment 			:crust.sediment[i],
		sedimentary 		:crust.sedimentary[i],
		metamorphic 		:crust.metamorphic[i],
		sial 				:crust.sial[i],
		sima 				:crust.sima[i],
		age 				:crust.age[i],
	});
}
Crust.set_value = function(crust, i, rock_column) {
	crust.sediment[i] 		= rock_column.sediment;
	crust.sedimentary[i] 	= rock_column.sedimentary;
	crust.metamorphic[i] 	= rock_column.metamorphic;
	crust.sial[i] 			= rock_column.sial;
	crust.sima[i] 			= rock_column.sima;
	crust.age[i] 			= rock_column.age;
}
Crust.fill = function(crust, rock_column) {
	var fill = Float32Raster.fill;
	fill(crust.sediment, rock_column.sediment);
	fill(crust.sedimentary, rock_column.sedimentary);
	fill(crust.metamorphic, rock_column.metamorphic);
	fill(crust.sial, rock_column.sial);
	fill(crust.sima, rock_column.sima);
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
	fill_into(crust.sial, rock_column.sial, selection_raster, result_crust.sial);
	fill_into(crust.sima, rock_column.sima, selection_raster, result_crust.sima);
	fill_into(crust.age,  rock_column.age,  selection_raster, result_crust.age) ;
}

Crust.get_ids = function(crust, id_raster, result_crust) {
	var get_ids = Float32Raster.get_ids;
	get_ids(crust.sediment, id_raster, result_crust.sediment);
	get_ids(crust.sedimentary, id_raster, result_crust.sedimentary);
	get_ids(crust.metamorphic, id_raster, result_crust.metamorphic);
	get_ids(crust.sial, id_raster, result_crust.sial);
	get_ids(crust.sima, id_raster, result_crust.sima);
	get_ids(crust.age, id_raster, result_crust.age);
}
Crust.fix_delta = function(crust_delta, crust, scratch) {
	var scratch = scratch || Float32Raster(crust_delta.grid);
	var fix = ScalarTransport.fix_nonnegative_conserved_quantity_delta;
	fix(crust_delta.sediment, crust.sediment, scratch);
	fix(crust_delta.sedimentary, crust.sedimentary, scratch);
	fix(crust_delta.metamorphic, crust.metamorphic, scratch);
	fix(crust_delta.sial, crust.sial, scratch);
	fix(crust_delta.sima, crust.sima, scratch);
}
Crust.assert_conserved_transport_delta = function(crust_delta, threshold) {
	var assert = ScalarTransport.assert_conserved_quantity_delta;
	assert(crust_delta.sediment, threshold);
	assert(crust_delta.sedimentary, threshold);
	assert(crust_delta.metamorphic, threshold);
	assert(crust_delta.sial, threshold);
	assert(crust_delta.sima, threshold);
}
Crust.assert_conserved_reaction_delta = function(crust_delta, threshold, scratch) {
	var sum = scratch || Float32Raster(crust_delta.grid);
	sum.fill(0);
	ScalarField.add_field(crust_delta.sediment, sum);
	ScalarField.add_field(crust_delta.sedimentary, sum);
	ScalarField.add_field(crust_delta.metamorphic, sum);
	ScalarField.add_field(crust_delta.sial, sum);
	ScalarField.add_field(crust_delta.sima, sum);
	ScalarField.mult_field(sum, sum, sum);
	var is_not_conserved = Uint8Dataset.sum(ScalarField.gt_scalar(sum, threshold * threshold));
	if (is_not_conserved) {
		debugger;
	}
}
Crust.get_density = function(crust, thickness, density) {
	density = density || Float32Raster(sima.grid);

	var sediment = crust.sediment;
	var sedimentary = crust.sedimentary;
	var metamorphic = crust.metamorphic;
	var sial = crust.sial;
	var sima = crust.sima;
	var age = crust.age;

	// NOTE: density does double duty for performance reasons
	var fraction_of_lifetime = density;
	var sima_density = density;

	Float32RasterInterpolation.smoothstep	(0, 250, age, 						fraction_of_lifetime);
	Float32RasterInterpolation.lerp			(2890, 3300, fraction_of_lifetime, 	sima_density);

    for (var i = 0, li = density.length; i < li; i++) {
    	density[i] = thickness[i] > 0? (sima[i] * sima_density[i] + (sediment[i]+sedimentary[i]+metamorphic[i]+sial[i]) * 2700) / (thickness[i]) : 2890;
    }
    return density;
}


