'use strict';

// A "Crust" is defined as a tuple of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
// It also provides functions for modeling properties of Crust
function Crust(params) {
	this.grid = params['grid'] || stop('missing parameter: "grid"');

	var length = this.grid.vertices.length;

    var buffer = params['buffer'] || new ArrayBuffer(8 * Float32Array.BYTES_PER_ELEMENT * length);
    this.buffer = buffer;

    this.sediment 			= new Float32Array(buffer, 0 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.sedimentary		= new Float32Array(buffer, 1 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.metamorphic		= new Float32Array(buffer, 2 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.felsic_plutonic 	= new Float32Array(buffer, 3 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.felsic_volcanic 	= new Float32Array(buffer, 4 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.mafic_volcanic 	= new Float32Array(buffer, 5 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.mafic_plutonic 	= new Float32Array(buffer, 6 * Float32Array.BYTES_PER_ELEMENT * length, length);
    this.age  				= new Float32Array(buffer, 7 * Float32Array.BYTES_PER_ELEMENT * length, length);

    this.conserved_array 	= new Float32Array(buffer, 0, 5 * length);
    this.mass_array 		= new Float32Array(buffer, 0, 7 * length);
    this.everything 		= new Float32Array(buffer);

    this.all_pools = [ 
    	this.sediment,
		this.sedimentary,
		this.metamorphic,
		this.felsic_plutonic,
		this.felsic_volcanic,
		this.mafic_volcanic,
		this.mafic_plutonic,
		this.age,
	];

	this.mass_pools = [ 
    	this.sediment,
		this.sedimentary,
		this.metamorphic,
		this.felsic_plutonic,
		this.felsic_volcanic,
		this.mafic_volcanic,
		this.mafic_plutonic,
	];

	this.conserved_pools = [ 
    	this.sediment,
		this.sedimentary,
		this.metamorphic,
		this.felsic_plutonic,
		this.felsic_volcanic,
	];

	this.nonconserved_pools = [ 
		this.mafic_volcanic,
		this.mafic_plutonic,
		this.age,
	];

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
	ScalarTransport.assert_conserved_quantity_delta(crust_delta.conserved_array, threshold);
}

Crust.get_average_conserved_per_cell = function(crust, thickness) {  
	return Float32Dataset.sum(crust.conserved_array) / crust.grid.vertices.length
}
Crust.get_conserved_mass = function(crust, mass) {  
	mass = mass || Float32Raster(crust.grid);
	mass.fill(0);

	var pools = crust.conserved_array;
	var length = mass.length;
	for (var i=0, li=pools.length; i<li; ++i) {
		mass[i%length] += pools[i];
	}
	
	return mass; 
}
Crust.get_total_mass = function(crust, mass) {  
	mass = mass || Float32Raster(crust.grid);
	mass.fill(0);

	var pools = crust.mass_array;
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
    return density;
}



Crust.get_value = function(crust, i) {
	var column = new RockColumn();
	var crust_pools = crust.all_pools;
	var column_pools = column.all_pools;
	for (var j = 0, lj = crust_pools.length; j < lj; ++j) {
		column_pools[j] = crust_pools[j][i];
	}
	return column;
}
Crust.set_value = function(crust, i, rock_column) {
	var crust_pools = crust.all_pools;
	var column_pools = rock_column.all_pools;
	for (var j = 0, lj = crust_pools.length; j < lj; ++j) {
		crust_pools[j][i] = column_pools[j];
	}
}
Crust.fill = function(crust, rock_column) {
	var f = Float32Raster.fill;
	var crust_pools = crust.all_pools;
	var column_pools = rock_column.all_pools;
	for (var i = 0, li = crust_pools.length; i < li; ++i) {
		f(crust_pools[i], column_pools[i]);
	}
}
Crust.fill_into_selection = function(crust, rock_column, selection_raster, result_crust) {
	var f = Float32RasterGraphics.fill_into_selection;
	var crust_pools = crust.all_pools;
	var column_pools = rock_column.all_pools;
	var result_pools = result_crust.all_pools;
	for (var i = 0, li = crust_pools.length; i < li; ++i) {
		f(crust_pools[i], column_pools[i], selection_raster, result_pools[i]);
	}
}
Crust.copy_into_selection = function(crust1, crust2, selection_raster, result_crust) {
	var f = Float32RasterGraphics.copy_into_selection;
	var crust1_pools = crust1.all_pools;
	var crust2_pools = crust2.all_pools;
	var result_pools = result_crust.all_pools;
	for (var i = 0, li = crust1_pools.length; i < li; ++i) {
		f(crust1_pools[i], crust2_pools[i], selection_raster, result_pools[i]);
	}
}

Crust.get_ids = function(crust, id_raster, result_crust) {
	var f = Float32Raster.get_ids;
	var crust_pools = crust.all_pools;
	var result_pools = result_crust.all_pools;
	for (var i = 0, li = crust_pools.length; i < li; ++i) {
		f(crust_pools[i], id_raster, result_pools[i]);
	}
}
Crust.add_values_to_ids = function(crust, id_raster, value_crust, result_crust) {
	var f = Float32Raster.add_values_to_ids;
	var crust_pools = crust.all_pools;
	var value_pools = value_crust.all_pools;
	var result_pools = result_crust.all_pools;
	for (var i = 0, li = crust_pools.length; i < li; ++i) {
		f(crust_pools[i], id_raster, value_pools[i], result_pools[i]);
	}
}
Crust.fix_delta = function(crust_delta, crust, scratch) {
	var scratch = scratch || Float32Raster(crust_delta.grid);
	var f = ScalarTransport.fix_nonnegative_conserved_quantity_delta;
	var delta_pools = crust_delta.conserved_pools;
	var crust_pools = crust.conserved_pools;
	for (var i = 0, li = crust_pools.length; i < li; ++i) {
		f(delta_pools[i], crust_pools[i], scratch);
	}
}
Crust.assert_conserved_transport_delta = function(crust_delta, threshold) {
	var f = ScalarTransport.assert_conserved_quantity_delta;
	var delta_pools = crust_delta.conserved_pools;
	for (var i = 0, li = delta_pools.length; i < li; ++i) {
		f(delta_pools[i], threshold);
	}
}
Crust.assert_conserved_reaction_delta = function(crust_delta, threshold, scratch) {
	var sum = scratch || Float32Raster(crust_delta.grid);
	sum.fill(0);
	var f = ScalarField.add_field;
	var delta_pools = crust_delta.conserved_pools;
	for (var i = 0, li = delta_pools.length; i < li; ++i) {
		f(sum, delta_pools[i], sum);
	}
	ScalarField.mult_field(sum, sum, sum);
	var is_not_conserved = Uint8Dataset.sum(ScalarField.gt_scalar(sum, threshold * threshold));
	if (is_not_conserved) {
		debugger;
	}
}



// WARNING: 
// The following functions require special attention when adding new mass pools!

Crust.overlap = function(crust1, crust2, crust2_exists, crust2_on_top, result_crust) {
	// add current plate thickness to crust1 thickness wherever current plate exists
	ScalarField.add_field_term				 			(crust1.conserved_array, crust2.conserved_array, crust2_exists, result_crust.conserved_array);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 			(crust1.mafic_volcanic, crust2.mafic_volcanic, crust2_on_top, 	result_crust.mafic_volcanic);
	Float32RasterGraphics.copy_into_selection 			(crust1.mafic_plutonic, crust2.mafic_plutonic, crust2_on_top, 	result_crust.mafic_plutonic);
	Float32RasterGraphics.copy_into_selection 			(crust1.age, crust2.age, crust2_on_top, 						result_crust.age);
}

Crust.get_thickness = function(crust, material_density, thickness) {
	thickness = thickness || Float32Raster(crust.grid);

	var scratch = Float32Raster(crust.grid);

	var fraction_of_lifetime = scratch;
	Float32RasterInterpolation.smoothstep	(0, 250, crust.age, fraction_of_lifetime);
	var mafic_density = scratch;
	Float32RasterInterpolation.lerp			(material_density.mafic_volcanic_min, material_density.mafic_volcanic_max, fraction_of_lifetime, mafic_density);
	var mafic_specific_volume = scratch;
	ScalarField.inv_field 					(mafic_density, mafic_specific_volume);

	Float32Raster.fill 				(thickness, 0);
	ScalarField.add_field_term 		(thickness, crust.mafic_plutonic, mafic_specific_volume, thickness);
	ScalarField.add_field_term 		(thickness, crust.mafic_volcanic, mafic_specific_volume, thickness);

	var f = ScalarField.add_scalar_term;
	var crust_pools = crust.conserved_pools;
	var pool_densities = new RockColumn(material_density).conserved_pools;
	for (var i = 0, li = crust_pools.length; i < li; ++i) {
		f(thickness, crust_pools[i], 1/pool_densities[i],  thickness);
	}

	return thickness;
}

// returns net buoyancy force, in kiloNewtons
// buoyancy is a scalar indicating force applied along the height axis
// positive buoyancy indicates floating, negative buoyancy indicates sinking
Crust.get_buoyancy = function (density, material_density, surface_gravity, buoyancy) {
	buoyancy = buoyancy || Float32Raster(density.grid);

	// buoyancy = min( g ( crust_density - mantle_density ), 0 )

	// NOTE: buoyancy does double duty for performance reasons
	var density_difference = buoyancy
	ScalarField.sub_scalar( density, material_density.mantle, density_difference );
	ScalarField.mult_scalar(density_difference, -surface_gravity, buoyancy);
	ScalarField.min_scalar(buoyancy, 0, buoyancy);

	return buoyancy;
}