Sphere = {}

Sphere.toSpherical = function(cartesian){
	return {lat: Math.asin(cartesian.y/cartesian.length()), lon: Math.atan2(-cartesian.z, cartesian.x)};
}
Sphere.toCartesian = function(spherical){
	return new THREE.Vector3(
		Math.cos(spherical.lat)  * Math.cos(spherical.lon),
	    Math.sin(spherical.lat),
		-Math.cos(spherical.lat) * Math.sin(spherical.lon));
}

Sphere.getRandomPoint = function() {
	return _toCartesian({
		lat: Math.asin(2*random.random() - 1),
		lon: 2*Math.PI * random.random()
	});
};

Sphere.getRandomPointAlongGreatCircle = function(eulerPole) {
	// start with eulerPole as z
	var matrix1 = new THREE.Matrix4();
	matrix1.lookAt(new THREE.Vector3(0,0,0), eulerPole, new THREE.Vector3(0,0,1));
	
	// rotate 90 degrees about an axis orthogonal to eulerPole
	// here, we find one possible x axis where z = eulerPole
	var randomPoint = new THREE.Vector3(1,0,0);
	randomPoint.applyMatrix4(matrix1);
	
	// rotate by some random amount 
	var matrix2 = new THREE.Matrix4();
	matrix2.makeRotationAxis( eulerPole, random.uniform(0, 2*Math.PI) );
	randomPoint.applyMatrix4(matrix2);
	
	return randomPoint;
};

Sphere.harmonics1_matrix = (function(){
	//shorthand variables
	var sqrt = Math.sqrt,
		PI = Math.PI,
		Matrix = THREE.Matrix4;

	harmonics_lookup = {
		0: 	new Matrix(	1,	0,	0,				0,
						0,	1,	0,				0,
						0,	0,	sqrt(3/PI)/2, 	0,
						0,	0,	0,				1,	),
	}

	return function (order) {
		if(order !== 0){
			throw "Orders beside 0 are unsuported, at the moment"
		}

		if (harmonics_lookup[order]) {
			return harmonics_lookup[order][0];
		}

		throw "harmonics of order " + order + "are not implemented" 
	}
})()