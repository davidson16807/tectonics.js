'use strict';

var Uint16RasterGraphics = {};

Uint16RasterGraphics.threshold_select = function(field, threshold, result) {
	result = result || Uint16Raster(field.grid);

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = field[i] > threshold? 1 : 0;
	}

	return result;
}

Uint16RasterGraphics.copy_into_selection = function(field, copied, selection, result) {
	result = result || Uint16Raster(field.grid);

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = selection[i] === 1? copied[i] : field[i];
	}

	return result;
}

Uint16RasterGraphics.fill_into_selection = function(field, fill, selection, result) {
	result = result || Uint16Raster(field.grid);

	for (var i=0, li=field.length; i<li; ++i) {
	    result[i] = selection[i] === 1? fill : field[i];
	}

	return result;
}

