// This namespace encloses operations that apply to rasters on the surface of a sphere
Float32SphereRaster = {};
Float32SphereRaster.latitude = function(height, lat) {
	// Note: vertical axis is classically Y in 3d gaming, but it's classically Z in the math
	// We call it "height" to avoid confusion.
	// see https://gamedev.stackexchange.com/questions/46225/why-is-y-up-in-many-games
	var lat = lat || Float32Raster(world.grid);
	var asin = Math.asin;
	for (var i=0, li=height.length; i<li; ++i) {
	    lat[i] = asin(height[i]);
	}
	return lat;
}
Float32SphereRaster.cos_lat = function(pos, cos_lat) { 
  var cos_lat = cos_lat || Float32Raster(pos.grid); 
  var sqrt = Math.sqrt; 
  var x = pos.x; 
  var z = pos.z; 
  var xi = 0.; 
  var zi = 0.; 
  for (var i = 0; i < pos.x.length; i++) { 
    xi = x[i]; 
    zi = z[i]; 
    cos_lat[i] = sqrt(xi*xi+zi*zi); 
  } 
  return cos_lat; 
}