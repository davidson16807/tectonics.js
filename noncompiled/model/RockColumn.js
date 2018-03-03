'use strict';

var RockColumn = (function() {
	function lerp(a,b, x){
		return a + x*(b-a);
	}

	function RockColumn(optional){
		optional = optional || {};
		this.displacement = optional['displacement'] || 0;
		this.sediment = optional['sediment'] || 0;
		this.sedimentary = optional['sedimentary'] || 0;
		this.metamorphic = optional['metamorphic'] || 0;
		this.sial = optional['sial'] || 0;
		this.sima = optional['sima'] || 0;
		this.age = optional['age'] || 0;
	}
	RockColumn.lerp = function(lower, upper, fraction) {
		return new RockColumn({
			sediment			:lerp(lower.sediment, upper.sediment, fraction),
			sedimentary			:lerp(lower.sedimentary, upper.sedimentary, fraction),
			metamorphic			:lerp(lower.metamorphic, upper.metamorphic, fraction),
			sial				:lerp(lower.sial, upper.sial, fraction),
			sima				:lerp(lower.sima, upper.sima, fraction),
			age					:lerp(lower.age, upper.age, fraction),
		});
	}
	RockColumn.EMPTY = new RockColumn()
	return RockColumn;
})();
