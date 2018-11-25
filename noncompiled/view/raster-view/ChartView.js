'use strict';

function SpatialPdfChartView(surface_type_focus, name) {
	surface_type_focus = surface_type_focus || 'land';
	this.name = name;

	this.get_dynamic_data = function(field, options) {
		options = options || {};
		var ocean_visibility = options['ocean_visibility'];

		var max = Float32Dataset.max(field);
		var min = Float32Dataset.min(field);
		var median = Float32Dataset.median(field); 
		var plot_range = Math.pow(10, Math.floor(Math.log10(max-min)));
		var bin_num = 10;
		var bin_size = plot_range/bin_num;
		var bin_min = 0;
		var bin_max = 0;
		var x = [];
		var y = [];

		var bin_size = Math.pow(10, Math.floor(Math.log10(max-min))-1); 
		var bin_num = 10; 
		var bin_size = plot_range / bin_num;
		var plot_middle = Math.round(median/bin_size)*bin_size; 
		var plot_min = plot_middle - bin_size * Math.round(bin_num/2); 

		var world = focus; //TODO: pass in as parameter
		var land = ScalarField.gte_scalar(world.lithosphere.displacement.value(), world.hydrosphere.sealevel.value());
		var ocean = ScalarField.lt_scalar(world.lithosphere.displacement.value(), world.hydrosphere.sealevel.value());

		var category = Uint8Raster(field.grid);

		for (var i = 0; i < bin_num; i++) {
			// debugger;
	        bin_min = plot_min + i*bin_size; 
	        bin_max = plot_min + (i+1)*bin_size; 
	        ScalarField.between_scalars(field, bin_min, bin_max, category);
	        if (surface_type_focus == 'land' && ocean_visibility) {
	        	BinaryMorphology.intersection(category, land, category);
	        }
	        if (surface_type_focus == 'ocean' && ocean_visibility) {
	        	BinaryMorphology.intersection(category, ocean, category);
	        }
			x[i] = Uint8Dataset.average(category) * 100;
			y[i] = Math.round(bin_min * 1e3)/1e3;
		}

		return {
		    x: x,
		    y: y,
		    y_label: '%',
		    x_label: options['x_label']
		};
	}
}
