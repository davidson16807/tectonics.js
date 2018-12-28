'use strict';

var Interpolation = (function() {
	var Interpolation = {};

	// performs basic Linear piecewise intERPolation:
	// given a list of control points mapping 1d space to 1d scalars, 
	// and a point in 1d space, returns a 1d scalar that maps to the point
	Interpolation.lerp = function(control_point_x, control_point_y, x) {
		var mix = Glm.mix;
		var smoothstep = Glm.smoothstep;
		var result = control_points[0];
		for (var i = 1; i < control_points.length; i++) {
			result = mix(result, control_points[i], smoothstep(control_points[i-1], control_points[i], a));
		}
		return result;
	}

	return Interpolation;
})();

