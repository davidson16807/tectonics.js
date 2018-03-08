
// "TectonicsModeling" is the distillation of all raster-based geological sub models within tectonics.js
// All functions are global and stateless. 
// Only the raster data structures and namespaces are used. 
// No other data structure is assumed to exist.
// The idea is to create a core that's invariant to changes across application architecture.

var TectonicsModeling = (function() {

var TectonicsModeling = {};



// model summary:
//    convert sedimentary at a given rate where it exceeds pressure/temperature equivalent of 300MPa/11km
// requires:
//    geothermal temperature model
//    geostatic pressure
TectonicsModeling.get_lithification = function(
		displacement, sealevel, timestep,
		rock_density, surface_gravity,
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
	ScalarField.sub_scalar(overpressure, 2.2e3, excess_overpressure); 
	// NOTE: 2.2e3 kiloPascals is the pressure equivalent of 500ft of sediment @ 1500T/m^3 density
  	// 500ft from http://wiki.aapg.org/Sandstone_diagenetic_processes
  	// TODO: rephrase in terms of lithostatic pressure + geothermal gradient

	// convert excess_overpressure to tons
	// this represents the number of tons of sediment that have lithified
	var lithified_meters = scratchpad.getFloat32Raster(grid); 
	ScalarField.div_scalar	(excess_overpressure, surface_gravity, 	lithified_meters);

	// clamp lithified_meters to sensible values
	ScalarField.min_field 	(lithified_meters, top_crust.sediment,	 					lithified_meters)
	ScalarField.max_scalar 	(lithified_meters, 0, 										lithified_meters)

	ScalarField.mult_scalar(lithified_meters, -1, 	crust_delta.sediment);
	ScalarField.mult_scalar(lithified_meters,  1, 	crust_delta.sedimentary);

  	scratchpad.deallocate('get_lithification');
}



TectonicsModeling.get_metamorphosis = function(
		displacement, sealevel, timestep,
		rock_density, surface_gravity,
		top_crust, crust_delta, crust_scratch){

	var grid = top_crust.grid;

  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_metamorphosis');

  	// TODO: maybe...
    // Crust.mult_profile(top_crust, [2500, 2700, 2700, 2700, 2890, 0], crust_scratch);

	// TODO: include overpressure from ocean water
	var overpressure = scratchpad.getFloat32Raster(grid); // NOTE: in kiloPascals
	Float32Raster.fill 			(overpressure, 0);
	// TODO: simply math now that we're using mass, not thickness
	ScalarField.add_scalar_term	(overpressure, top_crust.sediment, 		surface_gravity, 	overpressure);
	ScalarField.add_scalar_term	(overpressure, top_crust.sedimentary, 	surface_gravity, 	overpressure);
	//TODO: convert igneous to metamorphic
	var excess_overpressure = scratchpad.getFloat32Raster(grid); // pressure at bottom of the layer that's beyond which is necessary to metamorphose 
	ScalarField.sub_scalar(overpressure, 300e3, excess_overpressure); 
	// NOTE: 300e3 Pascals is the pressure equivalent of 11km of sedimentary rock @ 2700kg/m^3 density
  	// 300 MPa from https://www.tulane.edu/~sanelson/eens212/typesmetamorph.htm
  	// TODO: rephrase in terms of lithostatic pressure + geothermal gradient

	// convert excess_overpressure to tons
	// this represents the number of tons of sediment that have lithified
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
// 	reef			limestone		marble			
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
TectonicsModeling.get_weathering = function(
		displacement, sealevel, timestep,
		rock_density, surface_gravity,
		top_crust, crust_delta, crust_scratch){
  var grid = displacement.grid;
  var scratch = Float32Raster(grid);

  var precipitation = 7.8e5; 
  // ^^^ measured in meters of rain per million years 
  // global land average from wikipedia 
  var weathering_factor = 1.8e-7;  
  // ^^^ the rate of weathering per the rate of rainfall in that place 
  // measured in fraction of height difference per meters of rain per million years 
  var critical_sediment_thickness = 1; 
  // ^^^ the sediment thickness (in meters) at which bedrock weathering no longer occurs 
 
  var earth_surface_gravity = 9.8; // m/s^2 
   
  var water_height = scratch;
  ScalarField.sub_scalar(displacement, sealevel, 	water_height);
  ScalarField.max_scalar(water_height, 0, 			water_height);

  var average_difference = ScalarField.average_difference(water_height); 
  var weathering = scratch;
  // NOTE: result array does double duty for performance reasons 
 
  ScalarField.mult_scalar( 
    average_difference,  
    weathering_factor *       	// apply weathering factor to get height change per unit precip  
    precipitation *         	// apply precip to get height change 
    timestep *         			// 
    rock_density.felsic_plutonic *      	// apply density to get mass converted to sediment 
    surface_gravity/earth_surface_gravity, //correct for planet's gravity 
    weathering) 
   
  var bedrock_exposure = Float32Raster(grid); 
  ScalarField.div_scalar(top_crust.sediment,  
    -critical_sediment_thickness * rock_density.sediment
    // * rock_density.sediment 
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




TectonicsModeling.get_erosion = function(
		displacement, sealevel, timestep,
		rock_density, surface_gravity,
		top_crust, crust_delta, crust_scratch){
  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_erosion');

	var sediment 		= top_crust.sediment;
	var sedimentary 	= top_crust.sedimentary;
	var metamorphic 	= top_crust.metamorphic;
	var felsic_plutonic 		 	= top_crust.felsic_plutonic;
	var felsic_volcanic 		 	= top_crust.felsic_volcanic;
	
	Crust.reset(crust_delta);

	// TODO: add consideration for surface_gravity
	var precipitation = 7.8e5;
	// ^^^ measured in meters of rain per million years
	// global land average from wikipedia
	var erosiveFactor = 1.8e-7; 
	// ^^^ the rate of erosion per the rate of rainfall in that place
	// measured in fraction of height difference per meters of rain per million years

	var water_height = scratchpad.getFloat32Raster(displacement.grid);
	ScalarField.sub_scalar(displacement, sealevel, 	water_height);
	ScalarField.max_scalar(water_height, 0, 			water_height);

	var outbound_height_transfer = scratchpad.getFloat32Raster(displacement.grid);
	Float32Raster.fill(outbound_height_transfer, 0);

	var arrows = displacement.grid.arrows;
	var arrow;
	var from = 0;
	var to = 0;
	var height_difference = 0.0;
	var outbound_height_transfer_i = 0.0;
  	var neighbor_count = displacement.grid.neighbor_count;

	for (var i=0, li=arrows.length; i<li; ++i) {
	    arrow = arrows[i];
	    from = arrow[0];
	    to = arrow[1];
	    height_difference = water_height[from] - water_height[to];
	    outbound_height_transfer[from] += height_difference > 0? height_difference * precipitation * timestep * erosiveFactor * rock_density.felsic_plutonic : 0;
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
	    height_difference = water_height[from] - water_height[to];
	    outbound_height_transfer_i = height_difference > 0? height_difference * precipitation * timestep * erosiveFactor * rock_density.felsic_plutonic : 0;

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


// gets surface pressure of the asthenosphere by smoothing a field representing density/buoyancy
TectonicsModeling.get_asthenosphere_pressure = function(density, pressure, scratch) {
	pressure = pressure || Float32Raster(density.grid);
	scratch = scratch || Float32Raster(density.grid);

	var diffuse = ScalarField.diffusion_by_constant;

	var smoothing_iterations =  15;
	Float32Raster.copy(density, pressure);
	for (var i=0; i<smoothing_iterations; ++i) {
		diffuse(pressure, 1, pressure, scratch);
	}
	return pressure;
}

// gets surface velocity of the asthenosphere as the gradient of pressure
TectonicsModeling.get_asthenosphere_velocity = function(pressure, velocity) {
	velocity = velocity || VectorRaster(pressure.grid);
	ScalarField.gradient(pressure, velocity);
	return velocity;
}

// gets angular velocity of the asthenosphere as the cross product of velocity and position
TectonicsModeling.get_angular_velocity = function(velocity, pos, angular_velocity) {
	return VectorField.cross_vector_field(velocity, pos, angular_velocity);
}
// gets displacement using an isostatic model
TectonicsModeling.get_displacement = function(thickness, density, rock_density, displacement) {
 	var thickness_i, rootDepth;
 	var inverse_mantle_density = 1 / rock_density.mantle;
 	for(var i=0, li = displacement.length; i<li; i++){
 		//Calculates elevation as a function of crust density. 
 		//This was chosen as it only requires knowledge of crust density and thickness,  
 		//which are relatively well known. 
 		thickness_i = thickness[i]; 
 		displacement[i] = thickness_i - thickness_i * density[i] * inverse_mantle_density;
 	}
 	return displacement;
}

// get a map of plates using image segmentation and binary morphology
TectonicsModeling.get_plate_map = function(vector_field, segment_num, min_segment_size, segments) {
  var segments = segments || Uint8Raster(vector_field.grid);
  
  // step 1: run image segmentation algorithm
  VectorImageAnalysis.image_segmentation(vector_field, segment_num, min_segment_size, segments);

  var equals      = Uint8Field.eq_scalar;
  var not_equals  = Uint8Field.ne_scalar;
  var dilation    = BinaryMorphology.dilation;
  var closing     = BinaryMorphology.closing;
  var difference  = BinaryMorphology.difference;
  var fill_ui8    = Uint8RasterGraphics.fill_into_selection;

  // step 2: dilate and take difference with (segments != i)
  var segment = Uint8Raster(vector_field.grid);
  var is_empty = Uint8Raster(vector_field.grid);
  var is_occupied = Uint8Raster(vector_field.grid);
  var plate_ids = Uint8Dataset.unique(segments);
  var plate_id = 0;
  for (var i = 0, li = plate_ids.length; i < li; ++i) {
  	plate_id = plate_ids[i]
    equals      (segments, plate_id,	segment);
    equals      (segments, 0,      	is_empty);
    not_equals  (segments, plate_id,	is_occupied);
    difference  (is_occupied, is_empty, is_occupied);
    dilation    (segment, 5,        	segment);
    closing     (segment, 5,        	segment);
    difference  (segment, is_occupied,  segment);
    fill_ui8    (segments, plate_id, segment, segments);
  }

  return segments;
}


return TectonicsModeling;
})();
