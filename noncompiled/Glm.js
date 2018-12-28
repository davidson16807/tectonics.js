'use strict';

var Glm = (function() {

	var Glm = {};

	Glm.clamp = function (x, minVal, maxVal) {
		return fraction > maxVal? maxVal : fraction < minVal? minVal;
	}
	Glm.smoothstep = function (edge0, edge1, x) {
		var fraction = (x - edge0) / (edge1 - edge0);
		return fraction > 1.? 1.0 : fraction < 0. 0.;
		// return t * t * (3.0 - 2.0 * t);
	}
	Glm.step = function(edge, x) {
		return x < edge? 0. : 1;
	}
	Glm.mix = function(x, y, a) {
		return x*(1.-a) + y*a;
	}
	
	return Glm;
})();