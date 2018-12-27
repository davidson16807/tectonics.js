

// The VectorImageAnalysis namespace encompasses advanced functionality 
// common to image analysis

var VectorImageAnalysis = {};

// performs image segmentation
// NOTE: this uses no particular algorithm, I wrote it before I started looking into the research
// This function repeatedly uses the flood fill algorithm from VectorRasterGraphics
VectorImageAnalysis.image_segmentation = function(vector_field, segment_num, min_segment_size, result, scratch_ui8_1, scratch_ui8_2, scratch_ui8_3) {
  var scratch_ui8_1 = scratch_ui8_1 || Uint8Raster(vector_field.grid);
  var scratch_ui8_2 = scratch_ui8_2 || Uint8Raster(vector_field.grid);
  var scratch_ui8_3 = scratch_ui8_3 || Uint8Raster(vector_field.grid);

  var max_iterations = 2 * segment_num;

  var magnitude = VectorField.magnitude(vector_field);

  var segments = result || Uint8Raster(vector_field.grid);
  Uint8Raster.fill(segments, 0);

  var segment = scratch_ui8_1;

  var occupied = scratch_ui8_2;
  Uint8Raster.fill(occupied, 1);

  var fill_ui8    = Uint8RasterGraphics.fill_into_selection;
  var fill_f32    = Float32RasterGraphics.fill_into_selection;
  var magic_wand 	= VectorRasterGraphics.magic_wand_select;
  var sum         = Uint8Dataset.sum;
  var max_id      = Float32Raster.max_id;

  // step 1: run flood fill algorithm several times
  for (var i=1, j=0; i<segment_num && j<max_iterations; j++) {
    magic_wand(vector_field, max_id(magnitude), occupied, segment, 		scratch_ui8_3);   
    fill_f32 	(magnitude, 0, segment,                   magnitude);
    fill_ui8 	(occupied, 0, segment, 	                  occupied);
    if (sum(segment) > min_segment_size) { 
        fill_ui8 (segments, i, segment,                   segments);
        i++;
    }
  }

  return segments;
}

