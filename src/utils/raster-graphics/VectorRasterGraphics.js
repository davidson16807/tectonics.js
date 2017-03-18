
#ifndef STRICT
#define STRICT
'use strict';
#endif

// The VectorRasterGraphics namespace encompasses functionality 
// you've come to expect from a standard image editor like Gimp or MS Paint

var VectorRasterGraphics = {};

VectorRasterGraphics.magic_wand_select = function function_name(field, start_id, mask, result) {
	result = result || Uint8Raster(field.grid, 0);

	var neighbor_lookup = field.grid.neighbor_lookup;
	var similarity = Vector.similarity;
	var magnitude = Vector.magnitude;

	var x = field.x;
	var y = field.y;
	var z = field.z;

	var searching = [start_id];
	var searched = Uint8Raster(field.grid, 0);
	var grouped  = result;

	searched[start_id] = 1;

	var id = 0;
	var neighbor_id = 0;
	var neighbors = [];
	var is_similar = 0;
	var threshold = Math.cos(Math.PI * 60/180);
	while(searching.length > 0){
		id = searching.shift();

		is_similar = similarity (x[id], 		y[id], 		z[id], 
								 x[start_id],	y[start_id],	z[start_id]) > threshold;
		if (is_similar) {
			grouped[id] = 1;

			neighbors = neighbor_lookup[id];
			for (var i=0, li=neighbors.length; i<li; ++i) {
			    neighbor_id = neighbors[i];
			    if (searched[neighbor_id] === 0 && mask[id] != 0) {
			    	searching.push(neighbor_id);
			    	searched[neighbor_id] = 1;
			    }
			}
		}
	}

	return result;
}

VectorRasterGraphics.copy_into_selection = function(field, copied, selection, result) {
	result = result || Float32Raster(field.grid);

	var ax = field.x;
	var ay = field.y;
	var az = field.z;

	var bx = copied.x;
	var by = copied.y;
	var bz = copied.z;

	var cx = result.x;
	var cy = result.y;
	var cz = result.z;

	for (var i=0, li=field.length; i<li; ++i) {
	    cx[i] = selection[i] === 1? bx[i] : ax[i];
	    cy[i] = selection[i] === 1? by[i] : ay[i];
	    cz[i] = selection[i] === 1? bz[i] : az[i];
	}

	return result;
}

VectorRasterGraphics.fill_into_selection = function(field, fill, selection, result) {
	result = result || Float32Raster(field.grid);

	var ax = field.x;
	var ay = field.y;
	var az = field.z;

	var bx = fill.x;
	var by = fill.y;
	var bz = fill.z;

	var cx = result.x;
	var cy = result.y;
	var cz = result.z;

	for (var i=0, li=field.length; i<li; ++i) {
	    cx[i] = selection[i] === 1? bx : ax[i];
	    cy[i] = selection[i] === 1? by : ay[i];
	    cz[i] = selection[i] === 1? bz : az[i];
	}

	return result;
}

