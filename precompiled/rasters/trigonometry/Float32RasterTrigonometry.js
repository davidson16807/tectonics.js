
var Float32RasterTrigonometry = {};
Float32RasterTrigonometry.cos = function(radians, result) { 
  var result = result || Float32Raster(radians.grid); 
  var cos = Math.cos; 
  for (var i = 0; i < radians.length; i++) { 
    result[i] = cos(radians[i]);
  } 
  return result; 
}