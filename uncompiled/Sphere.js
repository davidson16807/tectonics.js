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
	return Sphere.toCartesian({
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
Sphere.getRandomBasis = function () {
	var center = Sphere.getRandomPoint();
	return new THREE.Matrix4().lookAt(
		new THREE.Vector3(0,0,0), 
		center.multiplyScalar(-1) , 
		new THREE.Vector3(0,0,1));
}

// This namespace encloses operations that apply to rasters on the surface of a sphere
Float32SphereRaster = {}
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