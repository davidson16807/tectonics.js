// Tectonophysics is a namespace isolating all business logic relating to the motion of tectonic plates
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Tectonophysics = (function() {

var Tectonophysics = {};



Tectonophysics.guess_plate_velocity = function(plate_mask, buoyancy, material_viscosity, result) {
    result = result || VectorRaster(plate_mask.grid);
    var grid = buoyancy.grid;

    var result_cpp = new cpp.vec3s(result.x.length);
    var plate_mask_cpp = new cpp.bools_from_list(plate_mask);
    var buoyancy_cpp   = new cpp.floats_from_list(buoyancy);
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
