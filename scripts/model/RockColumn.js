'use strict';

var RockColumn = (function() {
	function lerp(a,b, x){
		return a + x*(b-a);
	}

	function RockColumn(optional){
		optional = optional || {};
		this.displacement = optional['displacement'] || 0;
		this.thickness = optional['thickness'] || 0;
		this.density = optional['density'] || 0;
		this.age = optional['age'] || 0;
	}
	RockColumn.lerp = function(lower, upper, fraction) {
		return new RockColumn({
			displacement	:lerp(lower.displacement, upper.displacement, fraction),
			thickness		:lerp(lower.thickness, upper.thickness, fraction),
			density			:lerp(lower.density, upper.density, fraction),
			age				:lerp(lower.age, upper.age, fraction),
		});
	}
	return RockColumn;
})();
