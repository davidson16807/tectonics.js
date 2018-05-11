'use strict';

// An orbit is a low level mathematical data structure, similar in nature to the "Raster" classes.
// It can be thought of as any conic path drawn across space, regardless of the force that causes it.
// Along with the standard gravitational parameter, "GM" it can be treated as a unique tuple of position and velocity
// this allows the calculation of time related parameters like velocity and period.
// For a non-binary system, GM is equal to the gravitational constant multiplied by the mass of the parent object
//  * An orbit does not require a planet - it could, for instance, describe a motion between barycenters.
//    It is no more dependant on a celestial body than a velocity vector is dependant on a physical object
//    As such, the "Orbit" class does not track celestial bodies within its attributes.
//  * An orbit could be affected by celestial bodies over time. 
//    Since this requires knowledge of all celestial objects in the universe, 
//    We only handle this logic in the "Universe" class. 
//  * "GM" is a constant derived from the mass of the parent object. 
//    It is not typically included in textbooks amongst orbital parameters, 
//    so we do not included it as an attribute of the "Orbit" class. 
function Orbit(parameters) {
	var self = this;

	// public variables
	// the phase angle (in radians) that indicates the state within an object's revolution. It varies linearly with time.
	this.mean_anomaly					  = parameters['mean_anomaly'] 						|| 0;
	// the average between apoapsis and periapsis
	this.semi_major_axis				  = parameters['semi_major_axis'] 					|| stop('missing parameter: "semi_major_axis"');
	// the shape of the orbit, where 0 is a circular orbit and >1 is a hyperbolic orbit
	this.eccentricity					  = parameters['eccentricity'] 						|| 0;
	// the angle (in radians) between the orbital plane and the reference plane (the intersection being known as the "ascending node")
	this.inclination					  = parameters['inclination'] 						|| 0;
	// the angle (in radians) between the ascending node and the periapsis
	this.argument_of_periapsis			  = parameters['argument_of_periapsis'] 			|| 0;
	// the angle (in radians) between the prime meridian of the parent and the "ascending node" - the intersection between the orbital plane and the reference plane
	this.longitude_of_ascending_node	  = parameters['longitude_of_ascending_node'] 		|| 0;
}
Orbit.fromStateVectors = function(position, velocity, result) {
	// body...
}
// "position" returns the position vector that is represented by an orbit 
Orbit.position = function(orbit) {
	return OrbitalMechanics.get_self_centric_to_parent_centric_offset(
		orbit.mean_anomaly,
		orbit.semi_major_axis, 
		orbit.eccentricity, 
		orbit.inclination,
		orbit.argument_of_periapsis,
		orbit.longitude_of_ascending_node
	);
}
// "period" returns the time required to complete one revolution of an orbit
Orbit.period = function(orbit, GM) {
	var a = orbit.semi_major_axis;
	var π = Math.PI;
	return 2*π * Math.sqrt( a*a*a / GM );
}
// "iterate" is a function which, given an orbit and a timestep, 
// returns a new orbit representing the state of an object if left undisturbed
Orbit.iterate = function(orbit, GM, timestep, result) {
	throw "NOT IMPLEMENTED"
}