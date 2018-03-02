'use strict';

var RockColumn = (function() {
	function lerp(a,b, x){
		return a + x*(b-a);
	}

	function RockColumn(optional){
		optional = optional || {};
		this.displacement = optional['displacement'] || 0;
		this.sima = optional['sima'] || 0;
		this.sial = optional['sial'] || 0;
		this.age = optional['age'] || 0;
		
		this.array = new Float32Array(
			optional['sial'] || 0,
			optional['sima'] || 0,
			optional['age'] || 0,
		);
	}
	RockColumn.lerp = function(lower, upper, fraction) {
		return new RockColumn({
			sima			:lerp(lower.sima, upper.sima, fraction),
			sial			:lerp(lower.sial, upper.sial, fraction),
			age				:lerp(lower.age, upper.age, fraction),
		});
	}
	RockColumn.EMPTY = new RockColumn()
	return RockColumn;
})();
