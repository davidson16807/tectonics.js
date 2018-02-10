'use strict';

// A "Crust" is defined as a set of rasters that represent a planet's crust
// The Crust namespace provides methods that extend the functionality of rasters.js to Crust objects
// It also provides functions for modeling properties of Crust
function Crust(params) {
	this.grid = params['grid'] || stop('missing parameter: "grid"');

	// TODO:
	// * rename sima/sial to subductable/unsubductable
	// * record sima/sial in metric tons, not meters thickness
	// * switch densities to T/m^3

	// The following are the most fundamental fields to the tectonics model:

	this.sial = Float32Raster(this.grid);
	// "sial" is the thickness (in meters) of the buoyant, unsubductable component of the crust
	// AKA "sial", "felsic", or "continental" crust
	// sial+sediment is a conserved quantity - it is never created or destroyed without our explicit say-so
	// This is to provide our model with a way to check for errors

	this.sediment = Float32Raster(this.grid);
	// "sediment" is the thickness (in meters) of sial that has converted to sial
	// it behaves like sial in every way, except it has a lighter density
	// sial+sediment is a conserved quantity - it is never created or destroyed without our explicit say-so
	// This is to provide our model with a way to check for errors

	this.sima = Float32Raster(this.grid);
	// "sima" is the thickness (in meters) of the denser, subductable component of the crust
	// AKA "sima", "mafsic", or "oceanic" crust

	this.age = Float32Raster(this.grid);
	// "age" is the age (in millions of years) of the subductable component of the crust
	// we don't track the age of unsubductable crust because it doesn't affect model behavior


	// The following are fields that are derived from other fields:
	//TODO: these should no longer be stored in Crust objects!
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
		sial 			:crust.sial[i],
		sediment 		:crust.sediment[i],
		age 			:crust.age[i],
	});
}
Crust.set_value = function(crust, i, rock_column) {
	crust.sima[i] 			= rock_column.sima;
	crust.sial[i] 			= rock_column.sial;
	crust.sediment[i] 		= rock_column.sediment;
	crust.age[i] 			= rock_column.age;
}
Crust.copy = function(source, destination) {
	var copy = Float32Raster.copy;
	copy(source.sima, destination.sima);
	copy(source.sial, destination.sial);
	copy(source.sediment, destination.sediment);
	copy(source.age, destination.age);
}
Crust.fill = function(crust, rock_column) {
	var fill = Float32Raster.fill;
	fill(crust.sima, rock_column.sima);
	fill(crust.sial, rock_column.sial);
	fill(crust.sediment, rock_column.sediment);
	fill(crust.age, rock_column.age);
}
Crust.copy_into_selection = function(crust, copied_crust, selection_raster, result_crust) {
	var copy = Float32RasterGraphics.copy_into_selection;
	copy(source.sima, copied_crust.sima, selection_raster, result_crust.sima);
	copy(source.sial, copied_crust.sial, selection_raster, result_crust.sial);
	copy(source.sediment, copied_crust.sediment, selection_raster, result_crust.sediment);
	copy(source.age, copied_crust.age, selection_raster, result_crust.age);
}
Crust.fill_into_selection = function(crust, rock_column, selection_raster, result_crust) {
	var fill = Float32RasterGraphics.fill_into_selection;
	var fill_ui8 = Uint8Raster.fill;
	fill(crust.sima, rock_column.sima, selection_raster, result_crust.sima);
	fill(crust.sial, rock_column.sial, selection_raster, result_crust.sial);
	fill(crust.sediment, rock_column.sediment, selection_raster, result_crust.sediment);
	fill(crust.age, rock_column.age, selection_raster, result_crust.age);
}
Crust.get_ids = function(crust, ids_raster, result_crust) {
	var resample = Float32Raster.get_ids;
	resample(crust.sima, 	ids_raster,	result_crust.sima	);
	resample(crust.sial, 	ids_raster,	result_crust.sial	);
	resample(crust.sediment,ids_raster,	result_crust.sediment);
	resample(crust.age, 	ids_raster,	result_crust.age	);
}


// WARNING: be careful when creating math functions - 
//  it does not make sense to perform math operations on properties like "age"
Crust.add = function(crust, crust_delta, result_crust) {
	var add = ScalarField.add_field;
	add(crust.sima, 	crust_delta.sima, 	result_crust.sima);
	add(crust.sial, 	crust_delta.sial, 	result_crust.sial);
	add(crust.sediment, crust_delta.sediment, result_crust.sediment);
}
Crust.add_field_term = function(crust, crust_delta, scalar_field, result_crust) {
	var add = ScalarField.add_field_term;
	add(crust.sima, 	crust_delta.sima, 		scalar_field, result_crust.sima);
	add(crust.sial, 	crust_delta.sial, 		scalar_field, result_crust.sial);
	add(crust.sediment, crust_delta.sediment, 	scalar_field, result_crust.sediment);
}

Crust.fix_nonnegative_quantity_delta = function(crust_delta, crust) {
	var fix = Float32Raster.fix_nonnegative_quantity_delta;
	fix(crust_delta.sima, 	crust.sima 		);
	fix(crust_delta.sial, 	crust.sial 		);
	fix(crust_delta.sediment,	crust.sediment 	);
}