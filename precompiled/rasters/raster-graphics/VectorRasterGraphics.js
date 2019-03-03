
// The VectorRasterGraphics namespace encompasses functionality 
// you've come to expect from a standard image editor like Gimp or MS Paint

var VectorRasterGraphics = {};

VectorRasterGraphics.magic_wand_select = function function_name(vector_raster, start_id, mask, result, scratch_ui8) {
    result = result || Uint8Raster(vector_raster.grid);
    scratch_ui8 = scratch_ui8 || Uint8Raster(vector_raster.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_raster)
    ASSERT_IS_TYPE(start_id, number)
    ASSERT_IS_ARRAY(mask, Uint8Array)
    ASSERT_IS_ARRAY(result, Uint8Array)

    Uint8Raster.fill(result, 0);
    var neighbor_lookup = vector_raster.grid.neighbor_lookup;
    var similarity = Vector.similarity;
    var magnitude = Vector.magnitude;

    var x = vector_raster.x;
    var y = vector_raster.y;
    var z = vector_raster.z;

    var searching = [start_id];
    var searched = scratch_ui8;
    var grouped  = result;

    searched[start_id] = 1;

    var id = 0;
    var neighbor_id = 0;
    var neighbors = [];
    var is_similar = 0;
    var threshold = Math.cos(Math.PI * 60/180);

    var start_x = x[start_id];
    var start_y = y[start_id];
    var start_z = z[start_id];

    while(searching.length > 0){
        id = searching.shift();

        is_similar = similarity (x[id],     y[id],         z[id], 
                                 start_x,    start_y,    start_z) > threshold;
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

VectorRasterGraphics.copy_into_selection = function(vector_raster, copied, selection, result) {
    result = result || Float32Raster(vector_raster.grid);

    ASSERT_IS_VECTOR_RASTER(vector_raster)
    ASSERT_IS_VECTOR_RASTER(copied)
    ASSERT_IS_ARRAY(selection, Uint8Array)
    ASSERT_IS_VECTOR_RASTER(result)

    var a = vector_raster.everything;
    var b = copied.everything;
    var c = result.everything;

    var length = selection.length;
    for (var i=0, li=a.length; i<li; ++i) { 
        c[i] = selection[i%length] === 1? b[i] : a[i]; 
    } 

    return result;
}

VectorRasterGraphics.fill_into_selection = function(vector_raster, fill, selection, result) {
    result = result || Float32Raster(vector_raster.grid);
    ASSERT_IS_VECTOR_RASTER(vector_raster)
    ASSERT_IS_ARRAY(selection, Uint8Array)
    ASSERT_IS_VECTOR_RASTER(result)

    var ax = vector_raster.x;
    var ay = vector_raster.y;
    var az = vector_raster.z;

    var bx = fill.x;
    var by = fill.y;
    var bz = fill.z;

    var cx = result.x;
    var cy = result.y;
    var cz = result.z;

    var selection_i = 0;
    for (var i=0, li=vector_raster.length; i<li; ++i) {
      selection_i = selection[i]; 
      cx[i] = selection_i === 1? bx : ax[i]; 
      cy[i] = selection_i === 1? by : ay[i]; 
      cz[i] = selection_i === 1? bz : az[i]; 
    }

    return result;
}

