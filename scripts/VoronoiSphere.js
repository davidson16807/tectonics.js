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
	var size = Math.sqrt(pointsNum);
	this.lonRange = 2*Math.PI;
	this.lonMin = -Math.PI;
	this.lonNum = Math.round(2*size);
	this.latRange = Math.PI;
	this.latMin = -Math.PI / 2;
	this.latNum = Math.round(size);
	console.log(this.latNum, this.lonNum);
	var raster = new Uint16Array(this.latNum * this.lonNum);
	if(kdtree){
		for(var i = 0, j=0, li = this.latNum, lj = this.lonNum; i<li; i++){
			for(j = 0; j<lj; j++){
				var lat = i*this.latRange/li + this.latMin;
				var lon = j*this.lonRange/lj + this.lonMin;
				var vertex = new THREE.Vector3(
					Math.cos(lat)  * Math.cos(lon),
				    Math.sin(lat),
					-Math.cos(lat) * Math.sin(lon));
				var nearest_id = kdtree.nearest(vertex,1)[0][0].i;
				var raster_id = i*this.lonNum + j;
				raster[raster_id] = nearest_id;
			}
		}
	}
	this.raster = raster;
}

VoronoiSphere.prototype.getNearestId = function(vector) {
	var lat = Math.asin(vector.y/vector.length());
	var lon = Math.atan2(-vector.z, vector.x);
	var i = (lat - this.latMin) *this.latNum / this.latRange;
	i = Math.max(Math.min(i, this.latNum-1), 0);
	i = Math.round(i);
	var j = (lon - this.lonMin) *this.lonNum / this.lonRange;
	j = Math.max(Math.min(j, this.lonNum-1), 0); 
	j = Math.round(j);
	var raster_id = i*this.lonNum + j;
	return this.raster[raster_id];
}
