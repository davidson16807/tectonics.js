// Lithology is a namespace isolating all business logic relating to the rock cycle
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Lithology = (function() {

var Lithology = {};



// model summary:
//    convert sedimentary at a given rate where it exceeds pressure/temperature equivalent of 300MPa/11km
// requires:
//    geothermal temperature model
//    geostatic pressure
Lithology.model_lithification = function(
		surface_height, seconds,
		material_density, surface_gravity,
		top_crust, crust_delta, crust_scratch){
	var grid = top_crust.grid;

  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_lithification');

  	// TODO: maybe...
    // Crust.mult_profile(top_crust, [2500, 2700, 2700, 2700, 2890, 0], crust_scratch);

	// TODO: include overpressure from ocean water
	var overpressure = scratchpad.getFloat32Raster(grid); // NOTE: in Pascals
	Float32Raster.fill 			(overpressure, 0);
	// TODO: simply math now that we're using mass, not thickness
	ScalarField.add_scalar_term	(overpressure, top_crust.sediment, surface_gravity, overpressure);

	var excess_overpressure = scratchpad.getFloat32Raster(grid); 
	ScalarField.sub_scalar(overpressure, 2.2e6, excess_overpressure); 
	// NOTE: 2.2e6 Pascals is the pressure equivalent of 500ft of sediment @ 1500kg/m^3 density
  	// 500ft from http://wiki.aapg.org/Sandstone_diagenetic_processes
  	// TODO: rephrase in terms of lithostatic pressure + geothermal gradient

	// convert excess_overpressure to kg
	// this represents the number of kg of sediment that have lithified
	var lithified_meters = scratchpad.getFloat32Raster(grid); 
	ScalarField.div_scalar	(excess_overpressure, surface_gravity, 	lithified_meters);

	// clamp lithified_meters to sensible values
	ScalarField.min_field 	(lithified_meters, top_crust.sediment,	 					lithified_meters)
	ScalarField.max_scalar 	(lithified_meters, 0, 										lithified_meters)

	ScalarField.mult_scalar(lithified_meters, -1, 	crust_delta.sediment);
	ScalarField.mult_scalar(lithified_meters,  1, 	crust_delta.sedimentary);

  	scratchpad.deallocate('get_lithification');
}



Lithology.model_metamorphosis = function(
		surface_height, seconds,
		material_density, surface_gravity,
		top_crust, crust_delta, crust_scratch){

	var grid = top_crust.grid;

  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_metamorphosis');

  	// TODO: maybe...
    // Crust.mult_profile(top_crust, [2500, 2700, 2700, 2700, 2890, 0], crust_scratch);

	// TODO: include overpressure from ocean water
	var overpressure = scratchpad.getFloat32Raster(grid); // NOTE: in Pascals
	Float32Raster.fill 			(overpressure, 0);
	// TODO: simply math now that we're using mass, not thickness
	ScalarField.add_scalar_term	(overpressure, top_crust.sediment, 		surface_gravity, 	overpressure);
	ScalarField.add_scalar_term	(overpressure, top_crust.sedimentary, 	surface_gravity, 	overpressure);
	//TODO: convert igneous to metamorphic
	var excess_overpressure = scratchpad.getFloat32Raster(grid); // pressure at bottom of the layer that's beyond which is necessary to metamorphose 
	ScalarField.sub_scalar(overpressure, 300e6, excess_overpressure); 
	// NOTE: 300e6 Pascals is the pressure equivalent of 11km of sedimentary rock @ 2700kg/m^3 density
  	// 300 MPa from https://www.tulane.edu/~sanelson/eens212/typesmetamorph.htm
  	// TODO: rephrase in terms of lithostatic pressure + geothermal gradient

	// convert excess_overpressure to kg
	// this represents the number of kg of sediment that have lithified
	var metamorphosed_meters = scratchpad.getFloat32Raster(grid);  
	ScalarField.div_scalar	(excess_overpressure, surface_gravity, metamorphosed_meters);

	// clamp metamorphosed_meters to sensible values
	ScalarField.min_field 	(metamorphosed_meters, top_crust.sediment,	 				metamorphosed_meters)
	ScalarField.max_scalar 	(metamorphosed_meters, 0, 									metamorphosed_meters)

	ScalarField.mult_scalar(metamorphosed_meters, -1, 	crust_delta.sedimentary);
	ScalarField.mult_scalar(metamorphosed_meters,  1, 	crust_delta.metamorphic);

  	scratchpad.deallocate('get_metamorphosis');
}


// FOR REFERENCE:
// ideal Tectonics.js rock taxonomy:
//
// sediment		sedimentary		metamorphic		high grade metamorphic
// 	humus			coal			anthracite	graphite?	
// 	reef/lime		limestone		marble			
// 	clay			shale			slate		hornfel/schist/gneiss
// 	sand			sandstone		quartzite		

// 						+temperature
// 				slate	hornfel
// +pressure	schist	gneiss


// igneous
// 						felsic				intermediate	mafic					ultramafic
// plutonic				granite				diorite			gabbro					peridotite
// volcanic				rhyolite			andesite		basalt					komatiite
// plutonic metamorphic	granitic gneiss		intermediate	amphibiole schist		serpentinite
// volcanic metamorphic	rhyolitic schist 	intermediate	greenschist/blueschist	metakomatiite

// coarse/fine
// sediment/sedimentary/metamorphic/igneous
// organic/chalky/mineral
// high/low temp metamorphism
// high/low pressure metamorphism
// mafic/felsic




// "weathering" is the process by which rock is converted to sediment 
Lithology.model_weathering = function(
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
    weathering_factor *       	// apply weathering factor to get height change per unit precip
    precip *         	// apply precip to get height change 
    seconds *         			// 
    material_density.felsic_plutonic *      	// apply density to get mass converted to sediment 
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
  ScalarField.add_field(conserved, top_crust.felsic_plutonic, 		conserved);
  ScalarField.add_field(conserved, top_crust.felsic_volcanic, 		conserved);

  ScalarField.min_field(weathering, conserved, weathering); 
  ScalarField.max_scalar(weathering, 0, weathering); 

  var ratio = ScalarField.div_field(weathering, conserved);

  var is_div_by_zero = ScalarField.lt_scalar(conserved, 0.01);

  Float32RasterGraphics.fill_into_selection(ratio, 0, is_div_by_zero, ratio);

  ScalarField.mult_scalar(weathering, -1, crust_delta.sediment);
  ScalarField.mult_field(top_crust.sedimentary, ratio, crust_delta.sedimentary);
  ScalarField.mult_field(top_crust.metamorphic, ratio, crust_delta.metamorphic);
  ScalarField.mult_field(top_crust.felsic_plutonic, 		ratio, crust_delta.felsic_plutonic);
  ScalarField.mult_field(top_crust.felsic_volcanic, 		ratio, crust_delta.felsic_volcanic);
  Float32Raster.fill(crust_delta.mafic_volcanic, 0);

  ScalarField.mult_scalar(crust_delta.everything, -1, crust_delta.everything);
} 




Lithology.model_erosion = function(
		surface_height, seconds,
		material_density, surface_gravity,
		top_crust, crust_delta, crust_scratch){
  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_erosion');

	var sediment 		= top_crust.sediment;
	var sedimentary 	= top_crust.sedimentary;
	var metamorphic 	= top_crust.metamorphic;
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

	var sediment_delta  	= crust_delta.sediment;
	var sedimentary_delta  	= crust_delta.sedimentary;
	var metamorphic_delta  	= crust_delta.metamorphic;
	var felsic_plutonic_delta  		= crust_delta.felsic_plutonic;
	var felsic_volcanic_delta  		= crust_delta.felsic_volcanic;

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


return Lithology;
})();
