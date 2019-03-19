
var Uint16RasterGraphics = {};


Uint16RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
    result = result || Uint16Raster(raster.grid);
    ASSERT_IS_ARRAY(raster, Uint16Array)
    ASSERT_IS_ARRAY(copied, Uint16Array)
    ASSERT_IS_ARRAY(selection, Uint8Array)
    ASSERT_IS_ARRAY(result, Uint16Array)

    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? copied[i] : raster[i];
    }

    return result;
}

Uint16RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
    result = result || Uint16Raster(raster.grid);
    ASSERT_IS_ARRAY(raster, Uint16Array)
    ASSERT_IS_TYPE(fill, number)
    ASSERT_IS_ARRAY(selection, Uint8Array)
    ASSERT_IS_ARRAY(result, Uint16Array)

    for (var i=0, li=raster.length; i<li; ++i) {
        result[i] = selection[i] === 1? fill : raster[i];
    }

    return result;
}

