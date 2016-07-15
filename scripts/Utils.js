var Utils = (function() {
	return {

		lerp: 		function(a,b, x){
			return a + x*(b-a);
		},
		smoothstep: function (edge0, edge1, x) {
			var fraction = (x - edge0) / (edge1 - edge0);
			return clamp(fraction, 0.0, 1.0);
			// return t * t * (3.0 - 2.0 * t);
		},
		clamp: 		function (x, minVal, maxVal) {
			return Math.min(Math.max(x, minVal), maxVal);
		},
	}
})()

