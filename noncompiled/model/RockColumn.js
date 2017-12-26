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
		this.subductable = optional['subductable'] || 0;
		this.unsubductable = optional['unsubductable'] || 0;
		this.unsubductable_sediment = optional['unsubductable_sediment'] || 0;
		this.subductable_age = optional['subductable_age'] || 0;
	}
	RockColumn.lerp = function(lower, upper, fraction) {
		return new RockColumn({
			displacement	:lerp(lower.displacement, upper.displacement, fraction),
			thickness		:lerp(lower.thickness, upper.thickness, fraction),
			density			:lerp(lower.density, upper.density, fraction),
			subductable		:lerp(lower.subductable, upper.subductable, fraction),
			unsubductable	:lerp(lower.unsubductable, upper.unsubductable, fraction),
			unsubductable_sediment	:lerp(lower.unsubductable_sediment, upper.unsubductable_sediment, fraction),
			subductable_age				:lerp(lower.subductable_age, upper.subductable_age, fraction),
		});
	}
	return RockColumn;
})();
