'use strict';

// A "Crust" is defined as a set of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
function Crust(params) {
	this.uuid = params['uuid'] || Uuid.create();
	this.grid = params['grid'] || stop('missing parameter: "grid"');

	this.displacement = Float32Raster(this.grid);
	this.thickness = Float32Raster(this.grid);
	this.density = Float32Raster(this.grid);
	this.sima = Float32Raster(this.grid);
	this.sial = Float32Raster(this.grid);
	this.age = Float32Raster(this.grid);
}
Crust.get_value = function(crust, i) {
	return new RockColumn({
		displacement 	:crust.displacement[i],
		thickness 		:crust.thickness[i],
		density 		:crust.density[i],
		sima 			:crust.sima[i],
		sial 			:crust.sial[i],
		age 			:crust.age[i],
	});
}
Crust.set_value = function(crust, i, rock_column) {
	crust.displacement[i]	= rock_column.displacement;
	crust.thickness[i] 		= rock_column.thickness;
	crust.density[i] 		= rock_column.density;
	crust.sima[i] 			= rock_column.sima;
	crust.sial[i] 			= rock_column.sial;
	crust.age[i] 			= rock_column.age;
}
Crust.copy = function(source, destination) {
	var copy = Float32Raster.copy;
	copy(source.displacement, destination.displacement);
	copy(source.thickness, destination.thickness);
	copy(source.density, destination.density);
	copy(source.sima, destination.sima);
	copy(source.sial, destination.sial);
	copy(source.age, destination.age);
}
Crust.fill = function(crust, rock_column) {
	var fill = Float32Raster.fill;
	fill(crust.displacement, rock_column.displacement);
	fill(crust.thickness, rock_column.thickness);
	fill(crust.density, rock_column.density);
	fill(crust.sima, rock_column.sima);
	fill(crust.sial, rock_column.sial);
	fill(crust.age, rock_column.age);
}
Crust.copy_into_selection = function(crust, copied_crust, selection_raster, result_crust) {
	var copy = Float32RasterGraphics.copy_into_selection;
	copy(source.displacement, copied_crust.displacement, selection_raster, result_crust.displacement);
	copy(source.thickness, copied_crust.thickness, selection_raster, result_crust.thickness);
	copy(source.density, copied_crust.density, selection_raster, result_crust.density);
	copy(source.sima, copied_crust.sima, selection_raster, result_crust.sima);
	copy(source.sial, copied_crust.sial, selection_raster, result_crust.sial);
	copy(source.age, copied_crust.age, selection_raster, result_crust.age);
}
Crust.fill_into_selection = function(crust, rock_column, selection_raster, result_crust) {
	var fill = Float32RasterGraphics.fill_into_selection;
	var fill_ui8 = Uint8Raster.fill;
	fill(crust.displacement, rock_column.displacement, selection_raster, result_crust.displacement);
	fill(crust.thickness, rock_column.thickness, selection_raster, result_crust.thickness);
	fill(crust.density, rock_column.density, selection_raster, result_crust.density);
	fill(crust.sima, rock_column.sima, selection_raster, result_crust.sima);
	fill(crust.sial, rock_column.sial, selection_raster, result_crust.sial);
	fill(crust.age, rock_column.age, selection_raster, result_crust.age);
}
