
var Uint8RasterGraphics = {};


Uint8RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
	result = result || Uint8Raster(raster.grid);
	ASSERT_IS_ARRAY(raster, Uint8Array)
	ASSERT_IS_ARRAY(copied, Uint8Array)
	ASSERT_IS_ARRAY(selection, Uint8Array)
	ASSERT_IS_ARRAY(result, Uint8Array)

	for (var i=0, li=raster.length; i<li; ++i) {
	    result[i] = selection[i] === 1? copied[i] : raster[i];
	}

	return result;
}

Uint8RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
	result = result || Uint8Raster(raster.grid);
	ASSERT_IS_ARRAY(raster, Uint8Array)
	ASSERT_IS_TYPE(fill, number)
	ASSERT_IS_ARRAY(selection, Uint8Array)
	ASSERT_IS_ARRAY(result, Uint8Array)

	for (var i=0, li=raster.length; i<li; ++i) {
	    result[i] = selection[i] === 1? fill : raster[i];
	}

	return result;
}

