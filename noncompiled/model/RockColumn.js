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
		this.felsic_plutonic = optional['felsic_plutonic'] || 0;
		this.mafic_volcanic = optional['mafic_volcanic'] || 0;
		this.age = optional['age'] || 0;
	}
	RockColumn.lerp = function(lower, upper, fraction) {
		return new RockColumn({
			sediment			:lerp(lower.sediment, upper.sediment, fraction),
			sedimentary			:lerp(lower.sedimentary, upper.sedimentary, fraction),
			metamorphic			:lerp(lower.metamorphic, upper.metamorphic, fraction),
			felsic_plutonic				:lerp(lower.felsic_plutonic, upper.felsic_plutonic, fraction),
			mafic_volcanic				:lerp(lower.mafic_volcanic, upper.mafic_volcanic, fraction),
			age					:lerp(lower.age, upper.age, fraction),
		});
	}
	RockColumn.EMPTY = new RockColumn()
	return RockColumn;
})();
