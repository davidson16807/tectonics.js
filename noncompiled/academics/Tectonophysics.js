// Tectonophysics is a namespace isolating all business logic relating to the motion of tectonic plates
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Tectonophysics = (function() {

var Tectonophysics = {};



Tectonophysics.guess_plate_velocity = function(plate_mask, buoyancy, material_viscosity, result) {
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
    //         v = S F (WLT)^2/3 /18 cμ
    // modify to:
    //         v = S F W(LT)^1/2 /18 cμ
    // 
    // TODO: commit Schellart 2010 to the research folder!
    // TODO: REMOVE HARDCODED CONSTANTS!
    // TODO: make width dependant on the size of subducting region!
    var width = 300e3; // meters 
    var length = 600e3; // meters
    var thickness = 100e3; // meters
    var effective_area = Math.pow(thickness * length * width, 2/3); // m^2
    var shape_parameter = 0.725; // unitless
    var slab_dip_angle_constant = 4.025; // unitless
    var world_radius = 6367e3; // meters

    var lateral_speed = scratchpad.getFloat32Raster(grid);                 
    var lateral_speed_per_force  = 1;
    lateral_speed_per_force *= effective_area;                         // start with m^2
    lateral_speed_per_force /= material_viscosity.mantle;             // convert to m/s per Newton
    lateral_speed_per_force /= 18;                                     // apply various unitless constants
    lateral_speed_per_force *= shape_parameter;                     
    lateral_speed_per_force /= slab_dip_angle_constant;             
    // lateral_speed_per_force *= Units.MEGAYEAR;         // convert to m/My per Newton
    lateral_speed_per_force /= world_radius;                        // convert to radians/My per Newton

    ScalarField.mult_scalar         (buoyancy, lateral_speed_per_force, lateral_speed); // radians/My
     //     scratchpad.deallocate('get_plate_velocity');
    // return lateral_speed;

    // find slab pull force field (Newtons/m^3)
    // buoyancy = slab_pull * normalize(gradient(mask))
    // lateral_velocity = buoyancy * normalize(gradient(mask))
    // NOTE: result does double duty for performance reasons
    var boundary_normal = result;
    Uint8Field.gradient                (plate_mask,                         boundary_normal);
    VectorField.normalize            (boundary_normal,                    boundary_normal);

      //scratchpad.deallocate('get_plate_velocity');
    //return boundary_normal;

    var lateral_velocity = result;    
    VectorField.mult_scalar_field    (boundary_normal, lateral_speed,     lateral_velocity);

      scratchpad.deallocate('get_plate_velocity');
    
    return lateral_velocity;

}
Tectonophysics.guess_plate_velocity = function(plate_mask, buoyancy, material_viscosity, result) {
    result = result || VectorRaster(plate_mask.grid);
    var grid = buoyancy.grid;

    debugger
    var result_cpp = new cpp.vec3s(result.x.length);
    var plate_mask_cpp = new cpp.bools_from_list(plate_mask);
    var plate_mask_debug = cpp.bools_to_list(plate_mask_cpp);
    var buoyancy_cpp   = new cpp.floats_from_list(buoyancy);
    var buoyancy_debug = cpp.floats_to_list(buoyancy_cpp);
    cpp.guess_plate_velocity(plate_mask_cpp, buoyancy_cpp, material_viscosity.mantle, grid.cpp, result_cpp);
    var result_view = cpp.vec3s_to_typed_arrays(result_cpp);

    result.x.set(result_view.x);
    result.y.set(result_view.y);
    result.z.set(result_view.z);

    result_cpp.delete();
    plate_mask_cpp.delete();
    buoyancy_cpp.delete();

    return result;
}

Tectonophysics.get_plate_center_of_mass = function(mass, plate_mask, scratch) {
    scratch = scratch || Float32Raster(mass.grid);

    // find plate's center of mass
    var plate_mass = scratch;
    ScalarField.mult_field             (mass, plate_mask,                     plate_mass);
    var center_of_plate = VectorDataset.weighted_average (plate_mass.grid.pos, plate_mass);
    // Vector.normalize(center_of_plate.x, center_of_plate.y, center_of_plate.z, center_of_plate);
    return center_of_plate;
}

Tectonophysics.get_plate_rotation_matrix3x3 = function(plate_velocity, center_of_plate, seconds) {

      var scratchpad = RasterStackBuffer.scratchpad;
      scratchpad.allocate('get_plate_rotation_matrix');

    var grid = plate_velocity.grid;

    // plates are rigid bodies
    // as with any rigid body, there are two ways that forces can manifest themselves:
    //    1.) linear acceleration     translates a body 
    //    2.) angular acceleration     rotates a body around its center of mass (CoM)
    // but on a sphere, linear acceleration just winds up rotating a plate around the world's center
    // this contrasts with angular acceleration, which rotates a plate around its center of mass
    // so we track both rotations

    // find distance to center of plate
    var center_of_world_offset = grid.pos;
    var center_of_plate_offset = scratchpad.getVectorRaster(grid);
    var center_of_plate_distance2 = scratchpad.getFloat32Raster(grid);
//    var center_of_world_distance2 = scratchpad.getFloat32Raster(grid); // NOTE: center_of_world_distance2 is not effectively used

//    VectorField.fill                 (center_of_world_distance2, 1); // NOTE: center_of_world_distance2 is not effectively used
    VectorField.sub_vector             (center_of_world_offset, center_of_plate,            center_of_plate_offset);
    VectorField.dot_vector_field     (center_of_plate_offset, center_of_plate_offset,     center_of_plate_distance2);

    var center_of_plate_angular_velocity = scratchpad.getVectorRaster(grid);
    VectorField.cross_vector_field     (plate_velocity, center_of_plate_offset,             center_of_plate_angular_velocity);
    VectorField.div_scalar_field     (center_of_plate_angular_velocity, center_of_plate_distance2, center_of_plate_angular_velocity);

    var center_of_world_angular_velocity = scratchpad.getVectorRaster(grid);
    VectorField.cross_vector_field     (plate_velocity, center_of_world_offset,             center_of_world_angular_velocity);
//    VectorField.div_scalar_field     (center_of_world_angular_velocity, center_of_world_distance2, center_of_world_angular_velocity); // NOTE: equivalent to division by 1

    var plate_velocity_magnitude = scratchpad.getFloat32Raster(grid);
    VectorField.magnitude             (plate_velocity,                     plate_velocity_magnitude);
    var is_pulled = scratchpad.getUint8Raster(grid);
    ScalarField.gt_scalar             (plate_velocity_magnitude, 3e-18,    is_pulled);
// console.log(Uint8Dataset.sum(is_pulled))

    var center_of_plate_angular_velocity_average = VectorDataset.weighted_average(center_of_plate_angular_velocity, is_pulled);
    var center_of_world_angular_velocity_average = VectorDataset.weighted_average(center_of_world_angular_velocity, is_pulled);

    var center_of_plate_rotation_vector = Vector.mult_scalar(center_of_plate_angular_velocity_average.x, center_of_plate_angular_velocity_average.y, center_of_plate_angular_velocity_average.z, seconds);
    var center_of_world_rotation_vector = Vector.mult_scalar(center_of_world_angular_velocity_average.x, center_of_world_angular_velocity_average.y, center_of_world_angular_velocity_average.z, seconds);

    // TODO: negation shouldn't theoretically be needed! find out where the discrepancy lies and fix it the proper way! 
    var center_of_plate_rotation_matrix = Matrix3x3.FromRotationVector(-center_of_plate_rotation_vector.x, -center_of_plate_rotation_vector.y, -center_of_plate_rotation_vector.z);
    if (isNaN(center_of_plate_rotation_matrix[0])) {
        center_of_plate_rotation_matrix = Matrix3x3.Identity();
    }
    var center_of_world_rotation_matrix = Matrix3x3.FromRotationVector(-center_of_world_rotation_vector.x, -center_of_world_rotation_vector.y, -center_of_world_rotation_vector.z);
    if (isNaN(center_of_world_rotation_matrix[0])) {
        center_of_world_rotation_matrix = Matrix3x3.Identity();
    }

    var rotation_matrix = Matrix3x3.mult_matrix(center_of_plate_rotation_matrix, center_of_world_rotation_matrix);

      scratchpad.deallocate('get_plate_rotation_matrix');

    return rotation_matrix;
}

// get a map of plates using image segmentation and binary morphology
Tectonophysics.guess_plate_map = function(vector_field, segment_num, min_segment_size, segments) {
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
    equals      (segments, plate_id,    segment);
    equals      (segments, 0,          is_empty);
    not_equals  (segments, plate_id,    is_occupied);
    difference  (is_occupied, is_empty, is_occupied);
    dilation    (segment, 5,            segment);
    closing     (segment, 5,            segment);
    difference  (segment, is_occupied,  segment);
    fill_ui8    (segments, plate_id, segment, segments);
  }

  return segments;
}


return Tectonophysics;
})();
