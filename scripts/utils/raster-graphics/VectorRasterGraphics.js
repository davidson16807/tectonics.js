'use strict';

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

