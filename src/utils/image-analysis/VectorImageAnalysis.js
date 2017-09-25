
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
VectorImageAnalysis.image_segmentation = function(vector_field, grid) {
  //TODO: holy shit, this still needs perf improvement
  var magnitude = VectorField.magnitude(vector_field);
  var mask = Uint8Raster(vector_field.grid);
  Uint8Raster.fill(mask, 1);

  var equals 		= Uint8Field.eq_scalar;
  var not_equals 	= Uint8Field.ne_scalar;
  var dilation		= BinaryMorphology.dilation;
  var closing		= BinaryMorphology.closing;
  var difference	= BinaryMorphology.difference;
  var fill	 		= Uint8RasterGraphics.fill_into_selection;
  var UINT8_NULL = 255;

  // step 1: run flood fill algorithm several times
  var min_plate_size = 200;
  var flood_fill;
  var plate_masks = Uint8Raster(vector_field.grid);
  Uint8Raster.fill(plate_masks, UINT8_NULL);
  for (var i=1; i<7; ) {
    flood_fill = VectorRasterGraphics.magic_wand_select(vector_field, Float32Raster.max_id(magnitude), mask);   
    ScalarField.sub_field_term(magnitude, flood_fill, magnitude, magnitude);
    Uint8Field.sub_field(mask, flood_fill, mask);
      if (Uint8Dataset.sum(flood_fill) > min_plate_size) { 
        fill (plate_masks, i, flood_fill, plate_masks);
        // TODO: do something about infinite loop
        i++;
    }
  }
  
  // step 2: dilate and take difference with (plate_masks != i)
  var plate_mask = Uint8Raster(vector_field.grid);
  var is_empty = Uint8Raster(vector_field.grid);
  var is_occupied = Uint8Raster(vector_field.grid);
  for (var i=0; i<7; ++i) {
    equals    	(plate_masks, i,      plate_mask);
    equals    	(plate_masks, UINT8_NULL,   is_empty);
    not_equals	(plate_masks, i,      is_occupied);
    difference 	(is_occupied, is_empty,   is_occupied);
    dilation 	(plate_mask, 5,       plate_mask);
    closing  	(plate_mask, 5,       plate_mask);
    difference	(plate_mask, is_occupied,   plate_mask);
    fill 		(plate_masks, i, plate_mask, plate_masks);
  }

  // step 3: find the remaining region that is not mapped to a plate, and make a new plate just for it
  equals      (plate_masks, UINT8_NULL,   is_empty);
  fill (plate_masks, 7, is_empty, plate_masks);

  return plate_masks;
}

