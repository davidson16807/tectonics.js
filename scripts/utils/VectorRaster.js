function VectorRaster(grid) {
	var length = grid.vertices.length;
	var result = {
		x: new Float32Array(length),
		y: new Float32Array(length),
		z: new Float32Array(length),
		grid: grid
	};
	return result;
}
VectorRaster.OfLength = function(length, grid) {
	var result = {
		x: new Float32Array(length),
		y: new Float32Array(length),
		z: new Float32Array(length),
		grid: grid
	};	
	return result;
}
VectorRaster.FromVectors = function(vectors, grid) {
	var result = VectorRaster.OfLength(vectors.length, grid);
	var x = result.x;
	var y = result.y;
	var z = result.z;
	for (var i=0, li=vectors.length; i<li; ++i) {
	    x[i] = vectors[i].x;
	    y[i] = vectors[i].y;
	    z[i] = vectors[i].z;
	}
	return result;
}