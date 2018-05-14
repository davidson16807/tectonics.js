
function Spin(parameters) {
	var self = this;

	// public variables
	var precession_angle	= parameters['precession_angle'] 	|| 0;
	var axial_tilt 			= parameters['axial_tilt'] 			|| Math.PI * 23.5/180;
	var angular_speed 		= parameters['angular_speed'] 		|| 2*Math.PI/(60*60*24); // radians/s
	var rotation_angle 		= parameters['rotation_angle'] 		|| 0; // radians/s

	this.period = function(orbit) {
		return 2/angular_speed;
	}

	this.get_child_to_parent_matrix = function() {
		return OrbitalMechanics.get_spin_matrix4x4(
			rotation_angle, 
			axial_tilt, 
			precession_angle
		);
	}
	this.get_parent_to_child_matrix = function() {
		return Matrix4x4.invert(this.get_child_to_parent_matrix());
	}

	// private variables 
	var rotation_angle_refresh 		= 0.

	this.calcChanges = function(timestep) {
		timestep *= Units.SECONDS_IN_MILLION_YEARS;
		if (timestep === 0) {
			return;
		};
		if (timestep/period > 1/10){
			return;
		}
		rotation_angle_refresh = (rotation_angle + (timestep / period)) % period;
	};

	this.applyChanges = function(timestep) {
		timestep *= Units.SECONDS_IN_MILLION_YEARS;
		if (timestep === 0) {
			return;
		};
		if (timestep/period > 1/10){
			return;
		}
		rotation_angle = rotation_angle_refresh;
	};

}
