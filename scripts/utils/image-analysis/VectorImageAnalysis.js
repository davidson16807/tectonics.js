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
	
	var output;
	var outputs = [];
	var inputs = flood_fills;
	for (var i=0, li=inputs.length; i<li; ++i) {
	    outputs.push(BinaryMorphology.copy(inputs[i]));
	}
	for (var i=0, li=outputs.length; i<li; ++i) {
	    output = outputs[i];
	    output = BinaryMorphology.dilation(output, 5);
	    output = BinaryMorphology.closing(output, 5);
	    // output = BinaryMorphology.opening(output, 5);
	    for (var j=0, lj=inputs.length; j<lj; ++j) {
	    	if (i != j) {
		        output = BinaryMorphology.difference(output, inputs[j]);
	    	}
	    }
	    inputs[i] = BinaryMorphology.to_float(output);
	}

	return inputs;
}

