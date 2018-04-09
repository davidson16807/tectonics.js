
function SpatialPdfChartDisplay(name, surface_type_focus) {
	surface_type_focus = surface_type_focus || 'ocean';
	this.name = name;

	this.get_dynamic_data = function(field, options) {
		options = options || {};
		var ocean_visibility = options['ocean_visibility'] || true;

		var max = Float32Dataset.max(field);
		var min = Float32Dataset.min(field);
		var range = Math.pow(10, Math.round(Math.log10(max - min)));
		var bin_num = 10;
		var bin_size = range/bin_num;
		var bin_min = 0;
		var bin_max = 0;
		var bin_mag = 0;
		var x = [];
		var y = [];
		for (var i = 0; i < bin_num; i++) {
			bin_min = Math.round(min+i*bin_size);
			bin_max = Math.round(max+i*bin_size);
			x[i] = Uint8Dataset.sum(ScalarField.between_scalars(field, bin_min, bin_max))
			y[i] = bin_min;
		}

		return {
		    x: x,
		    y: y,
		    y_label: '%'
		    x_label: options['x_label']
		};
	}
}
