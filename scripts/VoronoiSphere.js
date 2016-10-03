'use strict';

function _toSpherical(cartesian){
	return {lat: Math.asin(cartesian.y/cartesian.length()), lon: Math.atan2(-cartesian.z, cartesian.x)};
}

function _toCartesian (spherical){
	return new THREE.Vector3(
		Math.cos(spherical.lat)  * Math.cos(spherical.lon),
	    Math.sin(spherical.lat),
		-Math.cos(spherical.lat) * Math.sin(spherical.lon));
}
function _bound (value, min, max){
	return Math.max(Math.min(value, max), min);
}

//Data structure mapping coordinates on a sphere to the nearest point in a kdtree
//Retrievals from the map are of O(1) complexity. The result resembles a voronoi diagram, hence the name.
function VoronoiSphere(pointsNum, kdtree){
	var size = 3*Math.sqrt(pointsNum/2);
	this.lonRange = 2*Math.PI;
	this.lonMin = -Math.PI;
	this.lonNum = Math.round(2*size);
	this.latRange = Math.PI;
	this.latMin = -Math.PI / 2;
	this.latNum = Math.round(size);
	var raster = new Uint16Array(this.latNum * this.lonNum);
	if(kdtree){
		for(var i = 0, j=0, li = this.latNum, lj = this.lonNum; i<li; i++){
			for(j = 0; j<lj; j++){
				var lat = i*this.latRange/li + this.latMin;
				var lon = j*this.lonRange/lj + this.lonMin;
				var vertex = _toCartesian({lat:lat, lon:lon});
				var nearest_id = kdtree.nearest(vertex,1)[0][0].i;
				var raster_id = i*this.lonNum + j;
				raster[raster_id] = nearest_id;
			}
		}
	}
	this.raster = raster;
}

VoronoiSphere.prototype.getNearestId = function(vector) {
	var spherical = _toSpherical(vector);
    var i = (spherical.lat - this.latMin) *this.latNum / this.latRange;
	i = Math.max(Math.min(i, this.latNum-1), 0);
	i = Math.round(i);
    var j = (spherical.lon - this.lonMin) *this.lonNum / this.lonRange;
	j = Math.max(Math.min(j, this.lonNum-1), 0); 
	j = Math.round(j);
	var raster_id = i*this.lonNum + j;
	return this.raster[raster_id];
}

VoronoiSphere.prototype.getNearestIds = function(pos_field, result) {
	result = result || new Uint16Array(pos_field.x.length);

	var pos_x = pos_field.x;
	var pos_y = pos_field.y;
	var pos_z = pos_field.z;
	var pos_lat = 0.;
	var pos_lon = 0.;

	var raster = this.raster;
	var raster_i = 0;
	var raster_j = 0;
	var raster_id = 0;

	var asin = Math.asin;
	var atan2 = Math.atan2;

	var latMin = this.latMin;
	var latRange = this.latRange;
	var latNum = this.latNum;

	var lonMin = this.lonMin;
	var lonRange = this.lonRange;
	var lonNum = this.lonNum;
	
	var max_raster_i = latNum-1;
	var max_raster_j = lonNum-1;
	for (var i=0, li=pos_x.length; i<li; ++i) {
	    pos_lat = asin(pos_y[i]);
	    raster_i = ((pos_lat - latMin) *latNum / latRange) | 0;

	    pos_lon = atan2(-pos_z[i], pos_x[i]);
	   	raster_j = ((pos_lon - lonMin) * lonNum / lonRange) | 0;

	   	raster_id = raster_i*lonNum + raster_j;
   		result[i] = raster[raster_id];
	}

	return result;
}