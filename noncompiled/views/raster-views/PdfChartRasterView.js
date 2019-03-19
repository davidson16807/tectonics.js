'use strict';

function PdfChartRasterView(surface_type_focus, name) {
    surface_type_focus = surface_type_focus || 'land';
    this.name = name || '';

    this.updateChart = function(data, raster, options) {
        options = options || {};
        var ocean_visibility = options['ocean_visibility'];

        if (raster === void 0) {
            data.isEnabled = false;
        }

        var max = Float32Dataset.max(raster);
        var min = Float32Dataset.min(raster);
        var median = Float32Dataset.median(raster); 
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
        var land, ocean
        if (options.displacement !== void 0 && options.sealevel !== void 0) {
            land = ScalarField.gte_scalar(displacement, sealevel);
            ocean = ScalarField.lt_scalar(displacement, sealevel);
        }

        var category = Uint8Raster(raster.grid);

        for (var i = 0; i < bin_num; i++) {
            bin_min = plot_min + i*bin_size; 
            bin_max = plot_min + (i+1)*bin_size; 
            ScalarField.between_scalars(raster, bin_min, bin_max, category);
            if (surface_type_focus == 'land' && ocean_visibility && land !== void 0) {
                BinaryMorphology.intersection(category, land, category);
            }
            if (surface_type_focus == 'ocean' && ocean_visibility && ocean !== void 0) {
                BinaryMorphology.intersection(category, ocean, category);
            }
            x[i] = Uint8Dataset.average(category) * 100;
            y[i] = Math.round(bin_min * 1e3)/1e3;
        }

        data.min = Float32Dataset.min(raster);
        data.max = Float32Dataset.max(raster);
        data.mean = Float32Dataset.average(raster);
        data.median = Float32Dataset.median(raster);
        data.stddev = Float32Dataset.standard_deviation(raster);
        data.x = x,
        data.y = y,
        data.y_label = '%',
        data.x_label = options['x_label'] || '';
        data.isEnabled = true;
    }
}
