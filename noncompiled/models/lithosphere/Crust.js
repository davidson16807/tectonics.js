'use strict';

// A "Crust" is defined as a tuple of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
// It also provides functions for modeling properties of Crust
function Crust(parameters) {
    this.grid = parameters['grid'] || stop('missing parameter: "grid"');

    var length = this.grid.vertices.length;

    var raster_stack_buffer = new RasterStackBuffer(8 * Float32Array.BYTES_PER_ELEMENT * this.grid.vertices.length, parameters['buffer']);
    this.buffer             = raster_stack_buffer.buffer;
    this.sediment           = raster_stack_buffer.getFloat32Raster(this.grid);
    this.sedimentary        = raster_stack_buffer.getFloat32Raster(this.grid);
    this.metamorphic        = raster_stack_buffer.getFloat32Raster(this.grid);
    this.felsic_plutonic    = raster_stack_buffer.getFloat32Raster(this.grid);
    this.felsic_volcanic    = raster_stack_buffer.getFloat32Raster(this.grid);
    this.mafic_volcanic     = raster_stack_buffer.getFloat32Raster(this.grid);
    this.mafic_plutonic     = raster_stack_buffer.getFloat32Raster(this.grid);
    this.age                = raster_stack_buffer.getFloat32Raster(this.grid);

    this.conserved_array    = new Float32Array(this.buffer, 0, 5 * length);
    this.mass_array         = new Float32Array(this.buffer, 0, 7 * length);
    this.everything         = new Float32Array(this.buffer);

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
    //    3.) mafic remains underocean most of the time so it isn't very noticeable
    //
    // "volcanic" rock is rock that was created by volcanic resurfacing
    // "plutonic" rock is rock that has 
    // by tracking plutonic/volcanic rock, we can identify the specific kind of rock that's in a region:
    // 
    //             volcanic     plutonic
    //     felsic     rhyolite     granite
    //     mafic     basalt         gabbro
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
    var crust_pools = crust.mass_pools;
    var value_pools = value_crust.mass_pools;
    var result_pools = result_crust.mass_pools;
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
Crust.is_conserved_delta = function(crust_delta, threshold) {
    return ScalarTransport.is_conserved_quantity_delta(crust_delta.conserved_array, threshold);
}
Crust.is_conserved_transport_delta = function(crust_delta, threshold) {
    var delta_pools = crust_delta.conserved_pools;
    var is_conserved = true;
    for (var i = 0, li = delta_pools.length; i < li; ++i) {
        if (!ScalarTransport.is_conserved_quantity_delta(delta_pools[i], threshold)){
            return false;
        }
    }
    return true;
}
Crust.is_conserved_reaction_delta = function(crust_delta, threshold, scratch) {
    var sum = scratch || Float32Raster(crust_delta.grid);
    sum.fill(0);
    var f = ScalarField.add_field;
    var delta_pools = crust_delta.conserved_pools;
    for (var i = 0, li = delta_pools.length; i < li; ++i) {
        f(sum, delta_pools[i], sum);
    }
    ScalarField.mult_field(sum, sum, sum);
    return Uint8Dataset.sum(ScalarField.gt_scalar(sum, threshold * threshold)) == 0;
}



// WARNING: 
// Every function past this point requires special attention when adding new mass pools!

Crust.overlap = function(crust1, crust2, crust2_exists, crust2_on_top, result_crust) {
    // add current plate thickness to crust1 thickness wherever current plate exists
    ScalarField.add_field_term                             (crust1.conserved_array, crust2.conserved_array, crust2_exists, result_crust.conserved_array);
    // overwrite crust1 wherever current plate is on top
    Float32RasterGraphics.copy_into_selection             (crust1.mafic_volcanic, crust2.mafic_volcanic, crust2_on_top,     result_crust.mafic_volcanic);
    Float32RasterGraphics.copy_into_selection             (crust1.mafic_plutonic, crust2.mafic_plutonic, crust2_on_top,     result_crust.mafic_plutonic);
    Float32RasterGraphics.copy_into_selection             (crust1.age, crust2.age, crust2_on_top,                         result_crust.age);
}

Crust.get_thickness = function(crust, material_density, thickness) {
    thickness = thickness || Float32Raster(crust.grid);

    var scratch = Float32Raster(crust.grid);

    var fraction_of_lifetime = scratch;
    Float32RasterInterpolation.linearstep    (0* Units.MEGAYEAR, 250* Units.MEGAYEAR, crust.age, fraction_of_lifetime);
    var mafic_density = scratch;
    Float32RasterInterpolation.mix            (material_density.mafic_volcanic_min, material_density.mafic_volcanic_max, fraction_of_lifetime, mafic_density);
    var mafic_specific_volume = scratch;
    ScalarField.inv_field                     (mafic_density, mafic_specific_volume);

    Float32Raster.fill                 (thickness, 0);
    ScalarField.add_field_term         (thickness, crust.mafic_plutonic, mafic_specific_volume, thickness);
    ScalarField.add_field_term         (thickness, crust.mafic_volcanic, mafic_specific_volume, thickness);

    var f = ScalarField.add_scalar_term;
    var crust_pools = crust.conserved_pools;
    var pool_densities = new RockColumn(material_density).conserved_pools;
    for (var i = 0, li = crust_pools.length; i < li; ++i) {
        f(thickness, crust_pools[i], 1/pool_densities[i],  thickness);
    }

    return thickness;
}

// returns net buoyancy force, in Newtons
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


// model summary:
//    convert sedimentary at a given rate where it exceeds pressure/temperature equivalent of 300MPa/11km
// requires:
//    geothermal temperature model
//    geostatic pressure
Crust.model_lithification = function(
        surface_height, seconds,
        material_density, surface_gravity,
        top_crust, crust_delta, crust_scratch){
    var grid = top_crust.grid;

      var scratchpad = RasterStackBuffer.scratchpad;
      scratchpad.allocate('get_lithification');

      // TODO: maybe...
    // Crust.mult_profile(top_crust, [2500, 2700, 2700, 2700, 2890, 0], crust_scratch);

    // TODO: include overpressure from ocean ocean
    var overpressure = scratchpad.getFloat32Raster(grid); // NOTE: in Pascals
    Float32Raster.fill             (overpressure, 0);
    // TODO: simply math now that we're using mass, not thickness
    ScalarField.add_scalar_term    (overpressure, top_crust.sediment, surface_gravity, overpressure);

    var excess_overpressure = scratchpad.getFloat32Raster(grid); 
    ScalarField.sub_scalar(overpressure, 2.2e6, excess_overpressure); 
    // NOTE: 2.2e6 Pascals is the pressure equivalent of 500ft of sediment @ 1500kg/m^3 density
      // 500ft from http://wiki.aapg.org/Sandstone_diagenetic_processes
      // TODO: rephrase in terms of lithostatic pressure + geothermal gradient

    // convert excess_overpressure to kg
    // this represents the number of kg of sediment that have lithified
    var lithified_meters = scratchpad.getFloat32Raster(grid); 
    ScalarField.div_scalar    (excess_overpressure, surface_gravity,     lithified_meters);

    // clamp lithified_meters to sensible values
    ScalarField.min_field     (lithified_meters, top_crust.sediment,                         lithified_meters)
    ScalarField.max_scalar     (lithified_meters, 0,                                         lithified_meters)

    ScalarField.mult_scalar(lithified_meters, -1,     crust_delta.sediment);
    ScalarField.mult_scalar(lithified_meters,  1,     crust_delta.sedimentary);

      scratchpad.deallocate('get_lithification');
}



Crust.model_metamorphosis = function(
        surface_height, seconds,
        material_density, surface_gravity,
        top_crust, crust_delta, crust_scratch){

    var grid = top_crust.grid;

      var scratchpad = RasterStackBuffer.scratchpad;
      scratchpad.allocate('get_metamorphosis');

      // TODO: maybe...
    // Crust.mult_profile(top_crust, [2500, 2700, 2700, 2700, 2890, 0], crust_scratch);

    // TODO: include overpressure from ocean ocean
    var overpressure = scratchpad.getFloat32Raster(grid); // NOTE: in Pascals
    Float32Raster.fill             (overpressure, 0);
    // TODO: simply math now that we're using mass, not thickness
    ScalarField.add_scalar_term    (overpressure, top_crust.sediment,         surface_gravity,     overpressure);
    ScalarField.add_scalar_term    (overpressure, top_crust.sedimentary,     surface_gravity,     overpressure);
    //TODO: convert igneous to metamorphic
    var excess_overpressure = scratchpad.getFloat32Raster(grid); // pressure at bottom of the layer that's beyond which is necessary to metamorphose 
    ScalarField.sub_scalar(overpressure, 300e6, excess_overpressure); 
    // NOTE: 300e6 Pascals is the pressure equivalent of 11km of sedimentary rock @ 2700kg/m^3 density
      // 300 MPa from https://www.tulane.edu/~sanelson/eens212/typesmetamorph.htm
      // TODO: rephrase in terms of lithostatic pressure + geothermal gradient

    // convert excess_overpressure to kg
    // this represents the number of kg of sediment that have lithified
    var metamorphosed_meters = scratchpad.getFloat32Raster(grid);  
    ScalarField.div_scalar    (excess_overpressure, surface_gravity, metamorphosed_meters);

    // clamp metamorphosed_meters to sensible values
    ScalarField.min_field     (metamorphosed_meters, top_crust.sediment,                     metamorphosed_meters)
    ScalarField.max_scalar     (metamorphosed_meters, 0,                                     metamorphosed_meters)

    ScalarField.mult_scalar(metamorphosed_meters, -1,     crust_delta.sedimentary);
    ScalarField.mult_scalar(metamorphosed_meters,  1,     crust_delta.metamorphic);

      scratchpad.deallocate('get_metamorphosis');
}


// FOR REFERENCE:
// ideal Tectonics.js rock taxonomy:
//
// sediment        sedimentary        metamorphic        high grade metamorphic
//     humus            coal            anthracite    graphite?    
//     reef/lime        limestone        marble            
//     clay            shale            slate        hornfel/schist/gneiss
//     sand            sandstone        quartzite        

//                         +temperature
//                 slate    hornfel
// +pressure    schist    gneiss


// igneous
//                         felsic                intermediate    mafic                    ultramafic
// plutonic                granite                diorite            gabbro                    peridotite
// volcanic                rhyolite            andesite        basalt                    komatiite
// plutonic metamorphic    granitic gneiss        intermediate    amphibiole schist        serpentinite
// volcanic metamorphic    rhyolitic schist     intermediate    greenschist/blueschist    metakomatiite

// coarse/fine
// sediment/sedimentary/metamorphic/igneous
// organic/chalky/mineral
// high/low temp metamorphism
// high/low pressure metamorphism
// mafic/felsic




// "weathering" is the process by which rock is converted to sediment 
Crust.model_weathering = function(
        surface_height, seconds,
        material_density, surface_gravity,
        top_crust, crust_delta, crust_scratch){
  var grid = surface_height.grid;
  var scratch = Float32Raster(grid);

  var precip = 1.05 / Units.YEAR;
  // ^^^ measured in meters of rain per million years 
  // global land average from wikipedia 
  var weathering_factor = 0;//1.8e-7;  
  // ^^^ the rate of weathering per the rate of rainfall in that place 
  // measured in fraction of height difference per meters of rain per million years 
  var critical_sediment_thickness = 1; 
  // ^^^ the sediment thickness (in meters) at which bedrock weathering no longer occurs 
 
  var earth_surface_gravity = 9.8; // m/s^2 
   
  var average_difference = ScalarField.average_difference(surface_height); 
  var weathering = scratch;
  // NOTE: result array does double duty for performance reasons 
 
  ScalarField.mult_scalar( 
    average_difference,  
    weathering_factor *           // apply weathering factor to get height change per unit precip
    precip *             // apply precip to get height change 
    seconds *                     // 
    material_density.felsic_plutonic *          // apply density to get mass converted to sediment 
    surface_gravity/earth_surface_gravity, //correct for planet's gravity 
    weathering) 
   
  var bedrock_exposure = Float32Raster(grid); 
  ScalarField.div_scalar(top_crust.sediment,  
    -critical_sediment_thickness * material_density.sediment
    // * material_density.sediment 
    , bedrock_exposure); 
  ScalarField.add_scalar(bedrock_exposure, 1, bedrock_exposure); 
  ScalarField.max_scalar(bedrock_exposure, 0, bedrock_exposure); 
  ScalarField.min_scalar(bedrock_exposure, 1, bedrock_exposure); 
 
  ScalarField.mult_field(weathering, bedrock_exposure, weathering); 
  
  // NOTE: this draws from all pools equally
  // TODO: draw from topmost pools, first, borrowing code from bedrock_exposure
  var conserved = Float32Raster(grid);
  ScalarField.add_field(conserved, top_crust.sedimentary, conserved);
  ScalarField.add_field(conserved, top_crust.metamorphic, conserved);
  ScalarField.add_field(conserved, top_crust.felsic_plutonic,         conserved);
  ScalarField.add_field(conserved, top_crust.felsic_volcanic,         conserved);

  ScalarField.min_field(weathering, conserved, weathering); 
  ScalarField.max_scalar(weathering, 0, weathering); 

  var ratio = ScalarField.div_field(weathering, conserved);

  var is_div_by_zero = ScalarField.lt_scalar(conserved, 0.01);

  Float32RasterGraphics.fill_into_selection(ratio, 0, is_div_by_zero, ratio);

  ScalarField.mult_scalar(weathering, -1, crust_delta.sediment);
  ScalarField.mult_field(top_crust.sedimentary, ratio, crust_delta.sedimentary);
  ScalarField.mult_field(top_crust.metamorphic, ratio, crust_delta.metamorphic);
  ScalarField.mult_field(top_crust.felsic_plutonic,         ratio, crust_delta.felsic_plutonic);
  ScalarField.mult_field(top_crust.felsic_volcanic,         ratio, crust_delta.felsic_volcanic);
  Float32Raster.fill(crust_delta.mafic_volcanic, 0);

  ScalarField.mult_scalar(crust_delta.everything, -1, crust_delta.everything);
} 




Crust.model_erosion = function(
        surface_height, seconds,
        material_density, surface_gravity,
        top_crust, crust_delta, crust_scratch){
      var scratchpad = RasterStackBuffer.scratchpad;
      scratchpad.allocate('get_erosion');

    var sediment         = top_crust.sediment;
    var sedimentary     = top_crust.sedimentary;
    var metamorphic     = top_crust.metamorphic;
    var felsic_plutonic = top_crust.felsic_plutonic;
    var felsic_volcanic = top_crust.felsic_volcanic;
    
    Crust.reset(crust_delta);

    // TODO: add consideration for surface_gravity
    var precip = 1.05 / Units.YEAR;
    // ^^^ measured in meters of rain per million years
    // global land average from wikipedia
    var erosiveFactor = 1.8e-7; 
    // ^^^ the rate of erosion per the kinetic energy of rainfall
    // measured in fraction of height difference per meters of rain

    var outbound_height_transfer = scratchpad.getFloat32Raster(surface_height.grid);
    Float32Raster.fill(outbound_height_transfer, 0);

    var arrows = surface_height.grid.arrows;
    var arrow;
    var from = 0;
    var to = 0;
    var height_difference = 0.0;
    var outbound_height_transfer_i = 0.0;
      var neighbor_count = surface_height.grid.neighbor_count;

    for (var i=0, li=arrows.length; i<li; ++i) {
        arrow = arrows[i];
        from = arrow[0];
        to = arrow[1];
        height_difference = surface_height[from] - surface_height[to];
        outbound_height_transfer[from] += height_difference > 0? height_difference *precip * seconds * erosiveFactor * material_density.felsic_plutonic : 0;
    }

    var outbound_sediment_fraction = crust_scratch.sediment;
    var outbound_sedimentary_fraction = crust_scratch.sedimentary;
    var outbound_metamorphic_fraction = crust_scratch.metamorphic;
    var outbound_felsic_plutonic_fraction = crust_scratch.felsic_plutonic;
    var outbound_felsic_volcanic_fraction = crust_scratch.felsic_volcanic;

    var fraction = 0.0;
    for (var i=0, li=outbound_height_transfer.length; i<li; ++i) {
        outbound_height_transfer_i = outbound_height_transfer[i];
        
        fraction = sediment[i] / outbound_height_transfer_i
        fraction = fraction > 1? 1 : fraction < 0? 0 : fraction;
        outbound_sediment_fraction[i] = (fraction / neighbor_count[i]) || 0;
        outbound_height_transfer_i *= 1.0 - fraction;

        fraction = sedimentary[i] / outbound_height_transfer_i
        fraction = fraction > 1? 1 : fraction < 0? 0 : fraction;
        outbound_sedimentary_fraction[i] = (fraction / neighbor_count[i]) || 0;
        outbound_height_transfer_i *= 1.0 - fraction;

        fraction = metamorphic[i] / outbound_height_transfer_i
        fraction = fraction > 1? 1 : fraction < 0? 0 : fraction;
        outbound_metamorphic_fraction[i] = (fraction / neighbor_count[i]) || 0;
        outbound_height_transfer_i *= 1.0 - fraction;

        fraction = felsic_plutonic[i] / outbound_height_transfer_i
        fraction = fraction > 1? 1 : fraction < 0? 0 : fraction;
        outbound_felsic_plutonic_fraction[i] = (fraction / neighbor_count[i]) || 0;
        outbound_height_transfer_i *= 1.0 - fraction;

        fraction = felsic_volcanic[i] / outbound_height_transfer_i
        fraction = fraction > 1? 1 : fraction < 0? 0 : fraction;
        outbound_felsic_volcanic_fraction[i] = (fraction / neighbor_count[i]) || 0;
        outbound_height_transfer_i *= 1.0 - fraction;

    }

    var sediment_delta      = crust_delta.sediment;
    var sedimentary_delta      = crust_delta.sedimentary;
    var metamorphic_delta      = crust_delta.metamorphic;
    var felsic_plutonic_delta          = crust_delta.felsic_plutonic;
    var felsic_volcanic_delta          = crust_delta.felsic_volcanic;

    var transfer = 0.0;
    for (var i=0, li=arrows.length; i<li; ++i) {
        arrow = arrows[i];
        from = arrow[0];
        to = arrow[1];
        height_difference = surface_height[from] - surface_height[to];
        outbound_height_transfer_i = height_difference > 0? height_difference *precip * seconds * erosiveFactor * material_density.felsic_plutonic : 0;

        transfer = outbound_height_transfer_i * outbound_sediment_fraction[from];
        sediment_delta[from] -= transfer;
        sediment_delta[to] += transfer;

        transfer = outbound_height_transfer_i * outbound_sedimentary_fraction[from];
        sedimentary_delta[from] -= transfer;
        sedimentary_delta[to] += transfer;

        transfer = outbound_height_transfer_i * outbound_metamorphic_fraction[from];
        metamorphic_delta[from] -= transfer;
        metamorphic_delta[to] += transfer;

        transfer = outbound_height_transfer_i * outbound_felsic_plutonic_fraction[from];
        felsic_plutonic_delta[from] -= transfer;
        felsic_plutonic_delta[to] += transfer;

        transfer = outbound_height_transfer_i * outbound_felsic_volcanic_fraction[from];
        felsic_volcanic_delta[from] -= transfer;
        felsic_volcanic_delta[to] += transfer;
    }
      scratchpad.deallocate('get_erosion');
}
