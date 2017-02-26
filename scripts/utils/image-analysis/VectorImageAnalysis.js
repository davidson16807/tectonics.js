'use strict';
// The VectorImageAnalysis namespace encompasses advanced functionality 
// common to image analysis

var VectorImageAnalysis = {};

// performs image segmentation
// NOTE: this uses no particular algorithm, I wrote it before I started looking into the research
// This function repeatedly uses the flood fill algorithm from VectorRasterGraphics,
// then uses mathematical morphology to ensure there are no overlapping regions between segments
VectorImageAnalysis.image_segmentation = function(vector_field, grid) {
	var magnitude = VectorField.magnitude(vector_field);
	var mask = Float32Raster(grid, 1);

	// step 1: run flood fill algorithm several times
	var min_plate_size = 200;
	var flood_fills = [];
	var flood_fill;
	for (var i=1; i<7; ) {
		flood_fill = VectorRasterGraphics.magic_wand_select(vector_field, Float32Raster.max_id(magnitude), mask);   
		ScalarField.sub_field(magnitude, ScalarField.mult_field(flood_fill, magnitude), magnitude);
		ScalarField.sub_field(mask, flood_fill, mask);
	    if (Float32Dataset.sum(flood_fill) > min_plate_size) { 
			flood_fills.push(flood_fill);
			i++;
		}
	}
	
	// step 2: expand boundaries so all regions of globe map to exactly one plate
	var original_mask;
	var original_masks = [];
	var edited_masks = flood_fills;
	for (var i=0, li=edited_masks.length; i<li; ++i) {
	    original_masks.push(BinaryMorphology.copy(edited_masks[i]));
	}
	for (var i=0, li=original_masks.length; i<li; ++i) {
	    original_mask = original_masks[i];
	    original_mask = BinaryMorphology.dilation(original_mask, 5);
	    original_mask = BinaryMorphology.closing(original_mask, 5);
	    // original_mask = BinaryMorphology.opening(original_mask, 5);
	    for (var j=0, lj=edited_masks.length; j<lj; ++j) {
	    	if (i != j) {
		        original_mask = BinaryMorphology.difference(original_mask, edited_masks[j]);
	    	}
	    }
	    edited_masks[i] = BinaryMorphology.to_float(original_mask);
	}

	// step 3: find the remaining region that is not mapped to a plate, and make a new plate just for it
	var masks = edited_masks;
	var is_not_mapped = Uint8Raster(grid, 1);
	for (var i=0, li=edited_masks.length; i<li; ++i) {
	    BinaryMorphology.difference(is_not_mapped, edited_masks[i], is_not_mapped);
	}
	masks.push(is_not_mapped);

	return masks;
}

