
// The VectorDataset namespace provides operations over raster objects
// treating them as if each cell were an entry in a statistical dataset

var VectorDataset = {};
VectorDataset.min = function (field) {
	var id = VectorRaster.min_id(field);

	var x = field.x;
	var y = field.y;
	var z = field.z;

	return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.max = function (field) {
	var id = VectorRaster.max_id(field);

	var x = field.x;
	var y = field.y;
	var z = field.z;

	return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.sum = function (field) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

    for (var i=0, li=field.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }

    return {x:sum_x, y:sum_y, z:sum_z};
};
VectorDataset.average = function (field) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

    for (var i=0, li=field.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    
    return {
		x:sum_x / field.length, 
		y:sum_y / field.length, 
		z:sum_z / field.length
	};
};
VectorDataset.weighted_average = function (field, weights) {
	var x = field.x;
	var y = field.y;
	var z = field.z;

	var sum_x = 0;
	var sum_y = 0;
	var sum_z = 0;

	var weight_sum = 0;

    for (var i=0, li=weights.length; i<li; ++i) {
        sum_x += x[i] * weights[i];
        sum_y += y[i] * weights[i];
        sum_z += z[i] * weights[i];
      	weight_sum += weights[i];
    }
    
    return {
		x:sum_x / weight_sum, 
		y:sum_y / weight_sum, 
		z:sum_z / weight_sum
	};
};


// WARNING: potential gotcha!
// VectorDataset.normalize() performs statistical data normalization - it outputs a vector where minimum magnitude is always min_new
// VectorField.normalize() individually normalizes each vector within the field.
// VectorDataset.rescale() outputs a vector where minimum magnitude is scaled between 0 and max_new
VectorDataset.normalize = function(input, output, min_new, max_new) {
	output = output || VectorRaster(input.grid);

	var min = VectorDataset.min(input);
	var min_mag = Math.sqrt(min.x*min.x + min.y*min.y + min.z*min.z);
	min_new = min_new || 0;

	var max = VectorDataset.max(input);
	var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
	max_new = max_new || 1;

	var range_mag = max_mag - min_mag;
	var range_new = max_new - min_new;

	var scaling_factor = range_new / range_mag;

	var ix = input.x;
	var iy = input.y;
	var iz = input.z;

	var ox = output.x;
	var oy = output.y;
	var oz = output.z;

	for (var i=0, li=ix.length; i<li; ++i) {
		ox[i] = scaling_factor * (ix[i] - min_mag) + min_new;
		oy[i] = scaling_factor * (iy[i] - min_mag) + min_new;
		oz[i] = scaling_factor * (iz[i] - min_mag) + min_new;
	}
  	
	return output;
}

VectorDataset.rescale = function(input, output, max_new) {
	output = output || VectorRaster(input.grid);

	var max = VectorDataset.max(input);
	var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
	max_new = max_new || 1;

	var ix = input.x;
	var iy = input.y;
	var iz = input.z;

	var ox = output.x;
	var oy = output.y;
	var oz = output.z;

	var scaling_factor = max_new / max_mag;

	for (var i=0, li=ix.length; i<li; ++i) {
		ox[i] = scaling_factor * ix[i];
		oy[i] = scaling_factor * iy[i];
		oz[i] = scaling_factor * iz[i];
	}
  	
	return output;
}