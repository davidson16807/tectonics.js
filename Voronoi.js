_toSpherical = function(cartesian){
	return {lat: Math.asin(cartesian.y/cartesian.length()), lon: Math.atan2(-cartesian.z, cartesian.x)};
}
_toCartesian = function(spherical){
	return new THREE.Vector3(
		Math.cos(spherical.lat)  * Math.cos(spherical.lon),
	    Math.sin(spherical.lat),
		-Math.cos(spherical.lat) * Math.sin(spherical.lon));
}
_bound = function(value, min, max){
	return Math.max(Math.min(value, max), min);
}

//Data structure mapping coordinates on a sphere to the nearest point in a kdtree
//Retrievals from the map are of O(1) complexity. The result resembles a voronoi diagram, hence the name.
function VoronoiSphere(kdtree, pointsNum){
	size = Math.sqrt(pointsNum);
	this.lonRange = 2*Math.PI;
	this.lonMin = -Math.PI;
	this.lonNum = 4*size;
	this.latRange = Math.PI;
	this.latMin = -Math.PI / 2;
	this.latNum = 2*size;
	var raster = []
	for(var i = 0, j=0, li = this.latNum, lj = this.lonNum; i<li; i++){
		var latLine = []
		for(j = 0; j<lj; j++){
			var lat = i*this.latRange/li + this.latMin;
			var lon = j*this.lonRange/lj + this.lonMin;
			var vertex = _toCartesian({lat:lat, lon:lon});
			var id = kdtree.nearest(vertex,1)[0][0].i;
			latLine[j] = id;
		}
		raster[i] = latLine;
	}
	this.raster = raster;
}

VoronoiSphere.prototype.getNearestId = function(vector) {
	var spherical = _toSpherical(vector);
	var i = (spherical.lat - this.latMin) *this.latNum / this.latRange;
	i = _bound(i, 0, this.latNum-1);
	i = Math.round(i);
	var j = (spherical.lon - this.lonMin) *this.lonNum / this.lonRange;
	j = _bound(j, 0, this.lonNum-1);
	j = Math.round(j);
	return this.raster[i][j];
}
