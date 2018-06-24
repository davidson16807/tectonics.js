// This namespace encloses operations that apply to rasters on the surface of a sphere
Float32SphereRaster = {};
Float32SphereRaster.latitude = function(height, lat) {
	// Note: vertical axis is classically Y in 3d gaming, but it's classically Z in the math
	// We call it "height" to avoid confusion.
	// see https://gamedev.stackexchange.com/questions/46225/why-is-y-up-in-many-games
	var lat = lat || Float32Raster(height.grid);
	var asin = Math.asin;
	for (var i=0, li=height.length; i<li; ++i) {
	    lat[i] = asin(height[i]);
	}
	return lat;
}
Float32SphereRaster.longitude = function(x, z, lon) {
	var lon = lon || Float32Raster(x.grid);
	var atan = Math.atan2;
	for (var i=0, li=x.length; i<li; ++i) {
		lon[i] = atan(-z[i], x[i]);
	}
	return lon;
}