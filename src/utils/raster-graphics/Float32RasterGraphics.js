
var Float32RasterGraphics = {};


Float32RasterGraphics.copy_into_selection = function(raster, copied, selection, result) {
	result = result || Float32Raster(raster.grid);
	ASSERT_IS_ARRAY(raster, Float32Array)
	ASSERT_IS_ARRAY(copied, Float32Array)
	ASSERT_IS_ARRAY(selection, Uint8Array)
	ASSERT_IS_ARRAY(result, Float32Array)

	for (var i=0, li=raster.length; i<li; ++i) {
	    result[i] = selection[i] === 1? copied[i] : raster[i];
	}

	return result;
}

Float32RasterGraphics.fill_into_selection = function(raster, fill, selection, result) {
	result = result || Float32Raster(raster.grid);
	ASSERT_IS_ARRAY(raster, Float32Array)
	ASSERT_IS_TYPE(fill, number)
	ASSERT_IS_ARRAY(selection, Uint8Array)
	ASSERT_IS_ARRAY(result, Float32Array)

	for (var i=0, li=raster.length; i<li; ++i) {
	    result[i] = selection[i] === 1? fill : raster[i];
	}

	return result;
}

