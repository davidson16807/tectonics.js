
// The VectorDataset namespace provides operations over raster objects
// treating them as if each cell were an entry in a statistical dataset

var VectorDataset = {};
VectorDataset.min = function (vector_dataset) {
    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    var id = VectorRaster.min_id(vector_dataset);

    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;

    return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.max = function (vector_dataset) {
    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    var id = VectorRaster.max_id(vector_dataset);

    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;

    return {x: x[id], y: y[id], z: z[id]};
};
VectorDataset.sum = function (vector_dataset) {
    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;

    var sum_x = 0;
    var sum_y = 0;
    var sum_z = 0;

    for (var i=0, li=vector_dataset.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }

    return {x:sum_x, y:sum_y, z:sum_z};
};
VectorDataset.average = function (vector_dataset) {
    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;

    var sum_x = 0;
    var sum_y = 0;
    var sum_z = 0;

    for (var i=0, li=vector_dataset.length; i<li; ++i) {
        sum_x += x[i];
        sum_y += y[i];
        sum_z += z[i];
    }
    
    return {
        x:sum_x / vector_dataset.length, 
        y:sum_y / vector_dataset.length, 
        z:sum_z / vector_dataset.length
    };
};
VectorDataset.weighted_average = function (vector_dataset, weights) {
    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    var x = vector_dataset.x;
    var y = vector_dataset.y;
    var z = vector_dataset.z;

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
VectorDataset.normalize = function(vector_dataset, result, min_new, max_new) {
    result = result || VectorRaster(vector_dataset.grid);

    var min = VectorDataset.min(vector_dataset);
    var min_mag = Math.sqrt(min.x*min.x + min.y*min.y + min.z*min.z);
    min_new = min_new || 0;

    var max = VectorDataset.max(vector_dataset);
    var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
    max_new = max_new || 1;

    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    ASSERT_IS_VECTOR_RASTER(result)
    ASSERT_IS_TYPE(min_new, number)
    ASSERT_IS_TYPE(max_new, number)

    var range_mag = max_mag - min_mag;
    var range_new = max_new - min_new;

    var scaling_factor = range_new / range_mag;

    var ix = vector_dataset.x;
    var iy = vector_dataset.y;
    var iz = vector_dataset.z;

    var ox = result.x;
    var oy = result.y;
    var oz = result.z;

    for (var i=0, li=ix.length; i<li; ++i) {
        ox[i] = scaling_factor * (ix[i] - min_mag) + min_new;
        oy[i] = scaling_factor * (iy[i] - min_mag) + min_new;
        oz[i] = scaling_factor * (iz[i] - min_mag) + min_new;
    }
      
    return result;
}

VectorDataset.rescale = function(vector_dataset, result, max_new) {
    result = result || VectorRaster(vector_dataset.grid);

    var max = VectorDataset.max(vector_dataset);
    var max_mag = Math.sqrt(max.x*max.x + max.y*max.y + max.z*max.z);
    max_new = max_new || 1;

    ASSERT_IS_VECTOR_RASTER(vector_dataset)
    ASSERT_IS_VECTOR_RASTER(result)
    ASSERT_IS_TYPE(max_new, number)
    
    var ix = vector_dataset.x;
    var iy = vector_dataset.y;
    var iz = vector_dataset.z;

    var ox = result.x;
    var oy = result.y;
    var oz = result.z;

    var scaling_factor = max_new / max_mag;

    for (var i=0, li=ix.length; i<li; ++i) {
        ox[i] = scaling_factor * ix[i];
        oy[i] = scaling_factor * iy[i];
        oz[i] = scaling_factor * iz[i];
    }
      
    return result;
}