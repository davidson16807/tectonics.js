'use strict';

// A "Crust" is defined as a set of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
// It also provides functions for modeling properties of Crust
function Crust(params) {
	this.uuid = params['uuid'] || Uuid.create();
	this.grid = params['grid'] || stop('missing parameter: "grid"');

	// TODO:
	// * rename sima/sial to subductable/unsubductable
	// * record sima/sial in metric tons, not meters thickness
	// * switch densities to T/m^3

	// The following are the most fundamental fields to the tectonics model:

	this.sial = Float32Raster(this.grid);
	// "sial" is the thickness of the buoyant, unsubductable component of the crust
	// AKA "sial", "felsic", or "continental" crust
	// Why don't we call it "continental" or some other name? Two reasons:
	//  1.) programmers will immediately understand what it does
	//  2.) we may want this model to simulate planets where alternate names don't apply, e.g. Pluto
	// sial is a conserved quantity - it is never created or destroyed without our explicit say-so
	// This is to provide our model with a way to check for errors

	this.sediment = Float32Raster(this.grid);
	// "sediment" is the thickness of the component of sial that has weathered down to sediment
	
	this.sima = Float32Raster(this.grid);
	// "sima" is the thickness of the denser, subductable component of the crust
	// AKA "sima", "mafsic", or "oceanic" crust
	// Why don't we call it "oceanic" or some other name? Two reasons:
	//  1.) programmers will immediately understand what it does
	//  2.) we may want this model to simulate planets where alternate names don't apply, e.g. Pluto

	this.age = Float32Raster(this.grid);
	// the age of the subductable component of the crust
	// we don't track the age of unsubductable crust because it doesn't affect model behavior


	// The following are fields that are derived from other fields:
	this.displacement = Float32Raster(this.grid);
	// "displacement is the height of the crust relative to an arbitrary datum level
	// It is not called "elevation" to emphasize that it is not relative to sea level
	this.thickness = Float32Raster(this.grid);
	// the thickness of the crust in km
	this.density = Float32Raster(this.grid);
	// the average density of the crust, in kg/m^3
}
Crust.get_value = function(crust, i) {
	return new RockColumn({
		displacement 	:crust.displacement[i],
		thickness 		:crust.thickness[i],
		density 		:crust.density[i],
		sima 			:crust.sima[i],
		sediment 			:crust.sediment[i],
		sial 			:crust.sial[i],
		age 			:crust.age[i],
	});
}
Crust.set_value = function(crust, i, rock_column) {
	crust.displacement[i]	= rock_column.displacement;
	crust.thickness[i] 		= rock_column.thickness;
	crust.density[i] 		= rock_column.density;
	crust.sima[i] 			= rock_column.sima;
	crust.sediment[i] 			= rock_column.sediment;
	crust.sial[i] 			= rock_column.sial;
	crust.age[i] 			= rock_column.age;
}
Crust.copy = function(source, destination) {
	var copy = Float32Raster.copy;
	copy(source.displacement, destination.displacement);
	copy(source.thickness, destination.thickness);
	copy(source.density, destination.density);
	copy(source.sima, destination.sima);
	copy(source.sediment, destination.sediment);
	copy(source.sial, destination.sial);
	copy(source.age, destination.age);
}
Crust.fill = function(crust, rock_column) {
	var fill = Float32Raster.fill;
	fill(crust.displacement, rock_column.displacement);
	fill(crust.thickness, rock_column.thickness);
	fill(crust.density, rock_column.density);
	fill(crust.sima, rock_column.sima);
	fill(crust.sediment, rock_column.sediment);
	fill(crust.sial, rock_column.sial);
	fill(crust.age, rock_column.age);
}
Crust.copy_into_selection = function(crust, copied_crust, selection_raster, result_crust) {
	var copy = Float32RasterGraphics.copy_into_selection;
	copy(source.displacement, copied_crust.displacement, selection_raster, result_crust.displacement);
	copy(source.thickness, copied_crust.thickness, selection_raster, result_crust.thickness);
	copy(source.density, copied_crust.density, selection_raster, result_crust.density);
	copy(source.sima, copied_crust.sima, selection_raster, result_crust.sima);
	copy(source.sediment, copied_crust.sediment, selection_raster, result_crust.sediment);
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
	fill(crust.sediment, rock_column.sediment, selection_raster, result_crust.sediment);
	fill(crust.sial, rock_column.sial, selection_raster, result_crust.sial);
	fill(crust.age, rock_column.age, selection_raster, result_crust.age);
}

Crust.get_ids = function(crust, id_raster, result_crust) {
	var get_ids = Float32Raster.get_ids;
	get_ids(crust.sima, id_raster, result_crust.sima);
	get_ids(crust.sediment, id_raster, result_crust.sediment);
	get_ids(crust.sial, id_raster, result_crust.sial);
}
Crust.mult_field = function(crust, field, result_crust) {
	var mult_field = ScalarField.mult_field;
	mult_field(crust.sima, field, result_crust.sima);
	mult_field(crust.sediment, field, result_crust.sediment);
	mult_field(crust.sial, field, result_crust.sial);
}
Crust.add_delta = function(crust, crust_delta, result_crust) {
	var add_field = ScalarField.add_field;
	add_field(crust.sima, crust_delta.sima, result_crust.sima);
	add_field(crust.sediment, crust_delta.sediment, result_crust.sediment);
	add_field(crust.sial, crust_delta.sial, result_crust.sial);
}
Crust.fix_delta = function(crust_delta, crust) {
	var fix = Float32Raster.fix_nonnegative_conserved_quantity_delta;
	fix(crust_delta.sima, crust.sima);
	fix(crust_delta.sediment, crust.sediment);
	fix(crust_delta.sial, crust.sial);
}
