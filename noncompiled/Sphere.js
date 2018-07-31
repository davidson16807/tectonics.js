Sphere = {}

Sphere.surface_area = function(radius) {
	return 4*Math.PI*radius*radius;
}
Sphere.volume = function(radius) {
	return 4/3*Math.PI*radius*radius*radius;
}
Sphere.cartesian_to_spherical = function(x,y,z){
	return {lat: Math.asin(y/Math.sqrt(x*x+y*y+z*z)), lon: Math.atan2(-z, x)};
}
Sphere.spherical_to_cartesian = function(lat, lon){
	return Vector(
		Math.cos(lat) * Math.cos(lon),
	    Math.sin(lat),
	   -Math.cos(lat) * Math.sin(lon)
	);
}
Sphere.random_point = function() {
	return Sphere.spherical_to_cartesian(
		Math.asin(2*sim.random.random() - 1),
		2*Math.PI * sim.random.random()
	);
};
Sphere.random_point_along_great_circle = function(eulerPole) {
    var a = eulerPole;
    var b = Vector(0,0,1); 
    var c = Vector()

    // First, cross eulerPole with another vector to give a nonrandom point along great circle
    Vector.cross	(a.x, a.y, a.z,  	b.x, b.y, b.z, 	c); 
    Vector.normalize(c.x, c.y, c.z, 					c); 
	
	// then rotate by some random amount around the eulerPole
	var random_rotation_matrix = Matrix.RotationAboutAxis(a.x, a.y, a.z, 2*Math.PI * sim.random.random());
	return Vector.mult_matrix(c.x, c.y, c.z,  random_rotation_matrix)
};
Sphere.random_basis = function () {
    var up = Vector(0,0,1); 
    var a = Vector(); 
    var b = Vector(); 
    var c = Sphere.random_point(); 
    Vector.cross(c.x, c.y, c.z, up.x, up.y, up.z, a); 
    Vector.normalize(a.x, a.y, a.z, a); 
    Vector.cross(c.x, c.y, c.z, a.x, a.y, a.z, b); 
    return Matrix.BasisVectors(a,b,c); 
}

