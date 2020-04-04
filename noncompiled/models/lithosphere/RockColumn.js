'use strict';

const RockColumn = (function() {
    function RockColumn(optional){
        optional = optional || {};
        this.displacement = optional['displacement'] || 0;
        this.sediment = optional['sediment'] || 0;
        this.sedimentary = optional['sedimentary'] || 0;
        this.metamorphic = optional['metamorphic'] || 0;
        this.felsic_plutonic = optional['felsic_plutonic'] || 0;
        this.felsic_volcanic = optional['felsic_volcanic'] || 0;
        this.mafic_volcanic = optional['mafic_volcanic'] || 0;
        this.mafic_plutonic = optional['mafic_volcanic'] || 0;
        this.age = optional['age'] || 0;


        this.all_pools = [ 
            this.sediment,
            this.sedimentary,
            this.metamorphic,
            this.felsic_plutonic,
            this.felsic_volcanic,
            this.mafic_volcanic,
            this.mafic_plutonic,
            this.age,
        ];

        this.mass_pools = [ 
            this.sediment,
            this.sedimentary,
            this.metamorphic,
            this.felsic_plutonic,
            this.felsic_volcanic,
            this.mafic_volcanic,
            this.mafic_plutonic,
        ];

        this.conserved_pools = [ 
            this.sediment,
            this.sedimentary,
            this.metamorphic,
            this.felsic_plutonic,
            this.felsic_volcanic,
        ];

        this.nonconserved_pools = [ 
            this.mafic_volcanic,
            this.mafic_plutonic,
            this.age,
        ];
    }
    RockColumn.EMPTY = new RockColumn()
    return RockColumn;
})();
