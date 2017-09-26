
var Vector = {};
Vector.similarity = function(ax, ay, az, bx, by, bz) {
	var sqrt = Math.sqrt;
	return (ax*bx + 
			ay*by + 
			az*bz)   /   ( sqrt(ax*ax+
								ay*ay+
								az*az)   *   sqrt(bx*bx+
											  	  by*by+
											  	  bz*bz) );
}
Vector.dot = function(ax, ay, az, bx, by, bz) {
	var sqrt = Math.sqrt;
	return (ax*bx + ay*by + az*bz);
}
Vector.magnitude = function(x, y, z) {
	return Math.sqrt(x*x + y*y + z*z);
}


// The VectorImageAnalysis namespace encompasses advanced functionality 
// common to image analysis

var VectorImageAnalysis = {};

// performs image segmentation
// NOTE: this uses no particular algorithm, I wrote it before I started looking into the research
// This function repeatedly uses the flood fill algorithm from VectorRasterGraphics,
// then uses mathematical morphology to ensure there are no overlapping regions between segments
VectorImageAnalysis.image_segmentation = function(vector_field, segment_num, min_segment_size, result) {
  var segment_num = segment_num;
  var min_segment_size = min_segment_size;
  var max_iterations = 2 * segment_num;

  var magnitude = VectorField.magnitude(vector_field);

  var segment = Uint8Raster(vector_field.grid);

  var segments = result || Uint8Raster(vector_field.grid);
  Uint8Raster.fill(segments, 0);

  var occupied = Uint8Raster(vector_field.grid);
  Uint8Raster.fill(occupied, 1);

  var equals      = Uint8Field.eq_scalar;
  var not_equals 	= Uint8Field.ne_scalar;
  var dilation		= BinaryMorphology.dilation;
  var closing     = BinaryMorphology.closing;
  var difference	= BinaryMorphology.difference;
  var fill_ui8    = Uint8RasterGraphics.fill_into_selection;
  var fill_f32    = Float32RasterGraphics.fill_into_selection;
  var magic_wand 	= VectorRasterGraphics.magic_wand_select;
  var sum         = Uint8Dataset.sum;
  var max_id      = Float32Raster.max_id;

  // step 1: run flood fill algorithm several times
  for (var i=1, j=0; i<7 && j<max_iterations; j++) {
    magic_wand(vector_field, max_id(magnitude), occupied, segment);   
    fill_f32 	(magnitude, 0, segment, 		                magnitude);
    fill_ui8 	(occupied, 0, segment, 			                occupied);
    if (sum(segment) > min_plate_size) { 
        fill_ui8 (segments, i, segment, 	                segments);
        i++;
    }
  }
  
  // step 2: dilate and take difference with (segments != i)
  var is_empty = Uint8Raster(vector_field.grid);
  var is_occupied = Uint8Raster(vector_field.grid);
  for (var i=1; i<7; ++i) {
    equals    	(segments, i, 		 segment);
    equals    	(segments, 0, 		 is_empty);
    not_equals	(segments, i, 		 is_occupied);
    difference 	(is_occupied, is_empty, is_occupied);
    dilation 	  (segment, 5,			  segment);
    closing  	  (segment, 5,			  segment);
    difference	(segment, is_occupied, segment);
    fill_ui8 	(segments, i, segment, segments);
  }

  return segments;
}

