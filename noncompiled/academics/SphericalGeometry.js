// SphericalGeometry is a namespace isolating all business logic relating to geometry on the surface of spheres
// It assumes no knowledge of physics
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

SphericalGeometry = {}

SphericalGeometry.surface_area = function(radius) {
	return 4*Math.PI*radius*radius;
}
SphericalGeometry.volume = function(radius) {
	return 4/3*Math.PI*radius*radius*radius;
}
SphericalGeometry.cartesian_to_spherical = function(x,y,z){
	return {lat: Math.asin(y/Math.sqrt(x*x+y*y+z*z)), lon: Math.atan2(-z, x)};
}
SphericalGeometry.spherical_to_cartesian = function(lat, lon){
	return Vector(
		Math.cos(lat) * Math.cos(lon),
	    Math.sin(lat),
	   -Math.cos(lat) * Math.sin(lon)
	);
}
SphericalGeometry.random_point_on_surface = function(random) {
	return SphericalGeometry.spherical_to_cartesian(
		Math.asin(2*random.random() - 1),
		2*Math.PI * random.random()
	);
};
SphericalGeometry.random_point_on_great_circle = function(eulerPole, random) {
    var a = eulerPole;
    var b = Vector(0,0,1); 
    var c = Vector()

    // First, cross eulerPole with another vector to give a nonrandom point along great circle
    Vector.cross_vector	(a.x, a.y, a.z,  	b.x, b.y, b.z, 	c); 
    Vector.normalize	(c.x, c.y, c.z, 					c); 
	
	// then rotate by some random amount around the eulerPole
	var random_rotation_matrix = Matrix3x3.RotationAboutAxis(a.x, a.y, a.z, 2*Math.PI * random.random());
	return Vector.mult_matrix(c.x, c.y, c.z,  random_rotation_matrix)
};
SphericalGeometry.random_basis = function (random) {
    var up = Vector(0,0,1); 
    var a = Vector(); 
    var b = Vector(); 
    var c = SphericalGeometry.random_point_on_surface(random); 
    Vector.cross_vector	(c.x, c.y, c.z, up.x, up.y, up.z, a); 
    Vector.normalize	(a.x, a.y, a.z, a); 
    Vector.cross_vector	(c.x, c.y, c.z, a.x, a.y, a.z, b); 
    return Matrix3x3.BasisVectors(a,b,c); 
}

