
function Spin(parameters) {
	var self = this;

	// public variables
	this.precession_angle			= parameters['precession_angle'] 	|| 0;
	this.axial_tilt 				= parameters['axial_tilt'] 			|| Math.PI * 23.5/180;
	this.angular_speed 				= parameters['angular_speed'] 		|| 2*Math.PI/(60*60*24); // radians/s
	this.rotation_angle 			= parameters['rotation_angle'] 		|| 0; // radians/s
}

Spin.rotation_matrix = function(rotation_angle) {
	return OrbitalMechanics.get_equatorial_to_ecliptic_matrix(
		rotation_angle, 
		axial_tilt, 
		precession_angle
	);
}
// "iterate" is a function which, given an spin and a timestep, 
// returns a new spin representing the state of an object if left undisturbed
Spin.iterate = function(orbit, timestep, spin) {
	
}