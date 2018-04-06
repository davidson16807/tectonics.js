
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
		material_density, surface_gravity,
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
TectonicsModeling.get_weathering = function(
		displacement, sealevel, timestep,
		material_density, surface_gravity,
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




TectonicsModeling.get_erosion = function(
		displacement, sealevel, timestep,
		material_density, surface_gravity,
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
	    outbound_height_transfer[from] += height_difference > 0? height_difference * precipitation * timestep * erosiveFactor * material_density.felsic_plutonic : 0;
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
	    outbound_height_transfer_i = height_difference > 0? height_difference * precipitation * timestep * erosiveFactor * material_density.felsic_plutonic : 0;

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


var coarse_grid = new Grid( 
	new THREE.IcosahedronGeometry(1, 4),
	{ voronoi_generator: VoronoiSphere.FromPos }
);
// gets surface pressure of the asthenosphere by smoothing a field representing buoyancy
TectonicsModeling.get_asthenosphere_pressure = function(buoyancy, pressure, scratch) {
	var fine_grid = buoyancy.grid;
	var fine_buoyancy = buoyancy;
	var fine_pressure = pressure;

	fine_pressure = fine_pressure || Float32Raster(fine_grid);
	scratch = scratch || Float32Raster(fine_grid);

	ScalarField.mult_scalar(fine_buoyancy, -1, fine_pressure);

	// NOTE: smoothing the field is done by iteratively subtracting the laplacian
	// This is a very costly operation, and it's output is dependant on grid resolution,
	// so we resample buoyancy onto to a constantly defined, coarse grid 
	// This way, we guarantee performant behavior that's invariant to resolution.
	var diffuse = ScalarField.diffusion_by_constant;

	// smooth at fine resolution a few times so that coarse resolution does not capture random details
	for (var i=0; i<3; ++i) {
		diffuse(fine_pressure, 1, fine_pressure, scratch);
	}

	// convert to coarse resolution
	var coarse_ids = fine_grid.getNearestIds(coarse_grid.pos);
    var coarse_pressure = Float32Raster.get_ids(fine_pressure, coarse_ids);

	// smooth at coarse resolution
	for (var i=0; i<30; ++i) {
		diffuse(coarse_pressure, 1, coarse_pressure, scratch);
	}

	// convert back to fine resolution
	var fine_ids = coarse_grid.getNearestIds(fine_grid.pos);
    Float32Raster.get_ids (coarse_pressure, fine_ids, fine_pressure);

	// NOTE: rescaling back to fine_grid resolution causes "stair step" looking results
	// It's important that the field be smooth because we eventually want its laplacian,
	// so we smooth it a second time, this time using the fine_grid resolution

	// smooth at fine resolution
	for (var i=0; i<3; ++i) {
		diffuse(fine_pressure, 1, fine_pressure, scratch);
	}
	return fine_pressure;
}

// gets surface velocity of the asthenosphere as the gradient of pressure
TectonicsModeling.get_asthenosphere_velocity = function(pressure, velocity) {
	velocity = velocity || VectorRaster(pressure.grid);
	ScalarField.gradient(pressure, velocity);
	return velocity;
}

TectonicsModeling.get_plate_velocity = function(plate_mask, buoyancy, material_viscosity, result) {
	result = result || VectorRaster(plate_mask.grid);

  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_plate_velocity');

	var grid = buoyancy.grid;


	// NOTE: 
	// Here, we calculate plate velocity as the terminal velocity of a subducting slab as it falls through the mantle.
	// 
	// Imagine a cloth with lead weights strapped to one side as it slides down into a vat of honey - it's kind of like that.
	// 
	// WARNING:
	// most of this is wrong! Here, we try calculating terminal velocity for each grid cell in isolation,
	//  then try to average them to approximate the velocity of the rigid body. 
	// 
	// If we wanted to do it the correct way, this is how we'd do it:
	//  * find drag force, subtract it from slab pull force, and use that to update velocity via netwonian integration
	//  * repeat simulation for several iterations every time step 
	// the reason we don't do it the correct way is 1.) it's slow, 2.) it's complicated, and 3.) it's not super important
	// 
	// from Schellart 2010
	// particularly http://rockdef.wustl.edu/seminar/Schellart%20et%20al%20(2010)%20Supp%20Material.pdf
	// TODO: modify to linearize the width parameter ("W") 
	// originally: 
	// 		v = S F (WLT)^2/3 /18 cμ
	// modify to:
	// 		v = S F W(LT)^1/2 /18 cμ
	// 
	// TODO: commit Schellart 2010 to the research folder!
	// TODO: REMOVE HARDCODED CONSTANTS!
	// TODO: make width dependant on the size of subducting region!
	var width = 5000e3; // meters 
	var length = 600e3; // meters
	var thickness = 100e3; // meters
	var effective_area = Math.pow(thickness * length * width, 2/3); // m^2
	var shape_parameter = 0.725; // unitless
	var slab_dip_angle_constant = 4.025; // unitless
	var SECONDS_PER_MILLION_EARTH_YEARS = 60*60*365.25*1e6; // seconds/My
	var world_radius = 6367e3; // meters

	var lateral_speed = scratchpad.getFloat32Raster(grid); 				
	var lateral_speed_per_force  = 1;
	lateral_speed_per_force *= effective_area; 						// start with m^2
	lateral_speed_per_force /= material_viscosity.mantle; 			// convert to m/s per kiloNewton
	lateral_speed_per_force /= 18; 									// apply various unitless constants
	lateral_speed_per_force *= shape_parameter; 					
	lateral_speed_per_force /= slab_dip_angle_constant; 			
	lateral_speed_per_force *= SECONDS_PER_MILLION_EARTH_YEARS; 	// convert to m/My per kiloNewton
	lateral_speed_per_force /= world_radius;						// convert to radians/My per kiloNewton

	ScalarField.mult_scalar 		(buoyancy, lateral_speed_per_force, lateral_speed); // radians/My
 	// 	scratchpad.deallocate('get_plate_velocity');
	// return lateral_speed;

	// find slab pull force field (kiloNewtons/m^3)
	// buoyancy = slab_pull * normalize(gradient(mask))
	// lateral_velocity = buoyancy * normalize(gradient(mask))
	// NOTE: result does double duty for performance reasons
	var boundary_normal = result;
	Uint8Field.gradient				(plate_mask, 						boundary_normal);
	VectorField.normalize			(boundary_normal,					boundary_normal);

  	//scratchpad.deallocate('get_plate_velocity');
	//return boundary_normal;

	var lateral_velocity = result;	
	VectorField.mult_scalar_field	(boundary_normal, lateral_speed, 	lateral_velocity);

  	scratchpad.deallocate('get_plate_velocity');
	
	return lateral_velocity;

}

TectonicsModeling.get_plate_center_of_mass = function(mass, plate_mask, scratch) {
	scratch = scratch || Float32Raster(mass.grid);

	// find plate's center of mass
	var plate_mass = scratch;
	ScalarField.mult_field 			(mass, plate_mask, 					plate_mass);
	var center_of_plate = VectorDataset.weighted_average (plate_mass.grid.pos, plate_mass);
	// Vector.normalize(center_of_plate.x, center_of_plate.y, center_of_plate.z, center_of_plate);
	return center_of_plate;
}

TectonicsModeling.get_plate_rotation_matrix = function(plate_velocity, center_of_plate, timestep) {

  	var scratchpad = RasterStackBuffer.scratchpad;
  	scratchpad.allocate('get_plate_rotation_matrix');

	var grid = plate_velocity.grid;

	// plates are rigid bodies
	// as with any rigid body, there are two ways that forces can manifest themselves:
	//    1.) linear acceleration 	translates a body 
	//    2.) angular acceleration 	rotates a body around its center of mass (CoM)
	// but on a sphere, linear acceleration just winds up rotating a plate around the world's center
	// this contrasts with angular acceleration, which rotates a plate around its center of mass
	// so we track both rotations

	// find distance to center of plate
	var center_of_world_offset = grid.pos;
	var center_of_world_distance2 = scratchpad.getFloat32Raster(grid);
	VectorField.dot_vector_field 	(center_of_world_offset, center_of_world_offset, center_of_world_distance2);

	var center_of_plate_offset = scratchpad.getVectorRaster(grid);
	var center_of_plate_distance2 = scratchpad.getFloat32Raster(grid);
	VectorField.dot_vector_field 	(center_of_plate_offset, center_of_plate_offset, center_of_plate_distance2);

	VectorField.sub_vector 			(grid.pos, center_of_plate,			center_of_plate_offset);

	var center_of_plate_angular_velocity = scratchpad.getVectorRaster(grid);
	VectorField.cross_vector_field 	(plate_velocity, center_of_plate_offset, 	center_of_plate_angular_velocity);
	VectorField.div_scalar_field 	(center_of_plate_angular_velocity, center_of_plate_distance2, center_of_plate_angular_velocity);

	var center_of_world_angular_velocity = scratchpad.getVectorRaster(grid);
	VectorField.cross_vector_field 	(plate_velocity, center_of_world_offset, 	center_of_world_angular_velocity);
	VectorField.div_scalar_field 	(center_of_world_angular_velocity, center_of_world_distance2, center_of_world_angular_velocity);

	var plate_velocity_magnitude = scratchpad.getFloat32Raster(grid);
	VectorField.magnitude 			(plate_velocity, 					plate_velocity_magnitude);
	var is_pulled = scratchpad.getUint8Raster(grid);
	ScalarField.gt_scalar 			(plate_velocity_magnitude, 1e-4,	is_pulled);
// console.log(Uint8Dataset.sum(is_pulled))

	var center_of_plate_angular_velocity_average = VectorDataset.weighted_average(center_of_plate_angular_velocity, is_pulled);
	var center_of_world_angular_velocity_average = VectorDataset.weighted_average(center_of_world_angular_velocity, is_pulled);

	var center_of_plate_rotation_vector = Vector.mult_scalar(center_of_plate_angular_velocity_average.x, center_of_plate_angular_velocity_average.y, center_of_plate_angular_velocity_average.z, timestep);
	var center_of_world_rotation_vector = Vector.mult_scalar(center_of_world_angular_velocity_average.x, center_of_world_angular_velocity_average.y, center_of_world_angular_velocity_average.z, timestep);
// debugger;

	// TODO: negation shouldn't theoretically be needed! find out where the discrepancy lies and fix it the proper way! 
	var center_of_plate_rotation_matrix = Matrix.FromRotationVector(-center_of_plate_rotation_vector.x, -center_of_plate_rotation_vector.y, -center_of_plate_rotation_vector.z);
	var center_of_world_rotation_matrix = Matrix.FromRotationVector(-center_of_world_rotation_vector.x, -center_of_world_rotation_vector.y, -center_of_world_rotation_vector.z);

	var rotation_matrix = Matrix.mult_matrix(center_of_plate_rotation_matrix, center_of_world_rotation_matrix);

  	scratchpad.deallocate('get_plate_rotation_matrix');

	return rotation_matrix;
}

// gets angular velocity of the asthenosphere as the cross product of velocity and position
TectonicsModeling.get_angular_velocity = function(velocity, pos, angular_velocity) {
	return VectorField.cross_vector_field(velocity, pos, angular_velocity);
}
// gets displacement using an isostatic model
TectonicsModeling.get_displacement = function(thickness, density, material_density, displacement) {
 	var thickness_i, rootDepth;
 	var inverse_mantle_density = 1 / material_density.mantle;
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
