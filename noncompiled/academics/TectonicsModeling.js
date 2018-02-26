
// "TectonicsModeling" is the distillation of all raster-based geological sub models within tectonics.js
// All functions are global and stateless. 
// Only the raster data structures and namespaces are used. 
// No other data structure is assumed to exist.
// The idea is to create a core that's invariant to changes across application architecture.

var TectonicsModeling = (function() {

var TectonicsModeling = {};


TectonicsModeling.get_thickness = function(crust, thickness) {
	return ScalarField.add_field(crust.sima, crust.sial, thickness);
}
TectonicsModeling.get_sial_type = function(crust, thickness) {  
  thickness = thickness || Float32Raster(crust.grid);  
  Float32Raster.copy(crust.sial, thickness); 
  return thickness; 
}  
TectonicsModeling.get_density = function(crust, density) {
	density = density || Float32Raster(sima.grid);

	var sima = crust.sima;
	var sial = crust.sial;
	var age = crust.age;

	// NOTE: density does double duty for performance reasons
	var fraction_of_lifetime = density;
	var sima_density = density;

	Float32RasterInterpolation.smoothstep	(0, 250, age, 						fraction_of_lifetime);
	Float32RasterInterpolation.lerp			(2890, 3300, fraction_of_lifetime, 	density);

    for (var i = 0, li = density.length; i < li; i++) {
    	density[i] = sima[i] + sial[i] > 0? (sima[i] * sima_density[i] + sial[i] * 2700) / (sima[i] + sial[i]) : 2890;
    }
    return density;
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
TectonicsModeling.get_displacement = function(thickness, density, mantleDensity, displacement) {
 	var thickness_i, rootDepth;
 	var inverse_mantle_density = 1 / mantleDensity;
 	for(var i=0, li = displacement.length; i<li; i++){
 		//Calculates elevation as a function of crust density. 
 		//This was chosen as it only requires knowledge of crust density and thickness,  
 		//which are relatively well known. 
 		thickness_i = thickness[i]; 
 		displacement[i] = thickness_i - thickness_i * density[i] * inverse_mantle_density;
 	}
 	return displacement;
}

TectonicsModeling.get_erosion = function(
		displacement, sealevel, timestep,
		crust, crust_delta){
  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_erosion');

	var sial 		 	= crust.sial;
	var sima 			= crust.sima;
	
	var sial_delta  	= crust_delta.sial;
	var sima_delta 		= crust_delta.sima;

	Float32Raster.fill(sial_delta, 0);

	var precipitation = 7.8e5;
	// ^^^ measured in meters of rain per million years
	// global land average from wikipedia
	var erosiveFactor = 1.8e-7; 
	// ^^^ the rate of erosion per the rate of rainfall in that place
	// measured in fraction of height difference per meters of rain per million years
	var sial_density = 2700;

	var water_height = scratchpad.getFloat32Raster(displacement.grid);
	ScalarField.max_scalar(displacement, sealevel, water_height);

	var outbound_height_transfer = scratchpad.getFloat32Raster(displacement.grid);
	Float32Raster.fill(outbound_height_transfer, 0);

	var outbound_sediment_fraction = scratchpad.getFloat32Raster(displacement.grid);
	var outbound_sial_fraction = scratchpad.getFloat32Raster(displacement.grid);
	var outbound_sima_fraction = scratchpad.getFloat32Raster(displacement.grid);

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
	    outbound_height_transfer[from] += height_difference > 0? height_difference * precipitation * timestep * erosiveFactor / neighbor_count[from] : 0;
	}
	for (var i=0, li=outbound_height_transfer.length; i<li; ++i) {
		outbound_sial_fraction[i] = outbound_height_transfer[i] > sial[i]? (sial[i] > 0.0? sial[i] / outbound_height_transfer[i] : 0.0) : 1.0;
	}
	for (var i=0, li=arrows.length; i<li; ++i) {
	    arrow = arrows[i];
	    from = arrow[0];
	    to = arrow[1];
	    height_difference = water_height[from] - water_height[to];
	    outbound_height_transfer_i = height_difference > 0? height_difference * precipitation * timestep * erosiveFactor * outbound_sial_fraction[from] / neighbor_count[from] : 0;
	    sial_delta[from] -= outbound_height_transfer_i;
	    sial_delta[to] += outbound_height_transfer_i;
	}
  	scratchpad.deallocate('get_erosion');
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

TectonicsModeling.overlap_crust = function(crust1, crust2, crust2_exists, crust2_on_top, result_crust) {
	// add current plate thickness to crust1 thickness wherever current plate exists
	ScalarField.add_field_term 					(crust1.sial, crust2.sial, crust2_exists, 		result_crust.sial);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 	(crust1.sima, crust2.sima, crust2_on_top, 		result_crust.sima);
	// overwrite crust1 wherever current plate is on top
	Float32RasterGraphics.copy_into_selection 	(crust1.age, crust2.age, crust2_on_top, 		result_crust.age);
}

return TectonicsModeling;
})();
