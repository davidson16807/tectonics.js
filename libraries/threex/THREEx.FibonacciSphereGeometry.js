/*Represents a grid of evenly distributed cells upon a sphere.
    Cells are positioned in a pattern resembling the seeds on a sunflower,
    ultimately based upon the golden ratio / the fibonacci sequence.
    This approach allows for any number of cells to be evenly and efficiently
    distributed on a sphere.
    All implementation details are based upon Swinbank & Purser 2006*/

THREEx.FibonacciSphereGeometry = (function () {
	var sqrt = Math.sqrt, 
		pow = Math.pow,
		round = Math.round,
		cos = Math.cos,
		sin = Math.sin;
	var golden_ratio = 1.618034;
	var golden_angle = 2 * Math.PI * golden_ratio;

	function fib (n) {
		// Returns an approximation of the nth fibonacci number
	    return int(round(pow(golden_ratio, n)/sqrt(5)));
	}
	function _lon(i) {
		return golden_angle*i;
	}
	function _z(i,n) {
		return 2*i/(2*n+1);
	}
	function _xy(z)  {
		return sqrt(1-pow(z,2));
	}
	function _pos(i, n){
		return [];
	}

	return function (radius, pointNum) {
		var pointsPerHemisphere = pointNum / 2;
		var vertices = []
		for (var i = -pointsPerHemisphere, vertex; i < pointsPerHemisphere; i++) {
       	vertex = new THREE.Vector3(
       		radius * cos(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
				radius * sin(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
		 		radius * _z(i,pointsPerHemisphere)
		 	)
           vertices.push(vertex);
		};
		THREE.ConvexGeometry.call(this, vertices);
	}
	//return function (radius, pointNum) {
	//	THREE.Geometry.call(this);
	//	
	//	this.pointNum = pointNum;
	//	
	//	var pointsPerHemisphere = pointNum / 2;
	//	
	//	for (var i = -pointsPerHemisphere/2, vertex; i < pointsPerHemisphere/2; i++) {
    //    	vertex = new THREE.Vector3(
    //    		radius * cos(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
	// 			radius * sin(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
	//	 		radius * _z(i,pointsPerHemisphere)
	//	 	)
    //        this.vertices.push(vertex);
	//	};
	//	console.log(this.vertices);
	//	
	//	THREEx.QuickHull(this);
	//};
})();


THREEx.FibonacciSphereGeometry.prototype = Object.create(THREE.Geometry.prototype);
THREEx.FibonacciSphereGeometry.prototype.constructor = THREEx.FibonacciSphereGeometry;
