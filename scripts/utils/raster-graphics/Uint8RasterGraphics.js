'use strict';

var Uint8RasterGraphics = {};


Uint8RasterGraphics.copy_into_selection = function(field, copied, selection, result) {
	result = result || Float32Raster(field.grid);

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = selection[i] === 1? copied[i] : field[i];
	}

	return result;
}

Uint8RasterGraphics.fill_into_selection = function(field, fill, selection, result) {
	result = result || Float32Raster(field.grid);

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = selection[i] === 1? fill : field[i];
	}

	return result;
}

