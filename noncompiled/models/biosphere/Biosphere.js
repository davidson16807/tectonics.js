'use strict';


var Biosphere = (function() {
        
    function Biosphere(parameters) {
        this.grid                   = parameters['grid'] || stop('missing parameter: "grid"');
        this.growth_factor          = parameters['growth_factor'] || 1; // This is something I haven't bothered parameterizing. If c=1/∞, then npp∝lai
        this.npp_max                = parameters['npp_max'] || 1;
        this.lai_max                = parameters['lai_max'] || 1;

        var raster_stack_buffer     = new RasterStackBuffer(8 * Float32Array.BYTES_PER_ELEMENT * this.grid.vertices.length, parameters['buffer']);
        this.buffer                 = raster_stack_buffer.buffer;
        this.primary_carbon_biomass = raster_stack_buffer.getFloat32Raster(this.grid);
        this.all_rasters            = new Float32Array(this.buffer);

        this.getParameters = function() {
            return { 
                grid:          this.grid,
                growth_factor: this.growth_factor,
                npp_max:       this.npp_max,
                lai_max:       this.lai_max,
                buffer:        this.buffer.slice(0),
            };
        }
    }

    Biosphere.get_steady_state = function(
            /*input:*/  atmosphere, universe, 
            /*output:*/ biosphere) {
        biosphere = biosphere || new Biosphere({ grid: atmosphere.grid });

    }

    Biosphere.get_update = function(
            /*input:*/  biosphere, biosphere_memos, timestep,
            /*output:*/ biosphere_result
        ) {
        biosphere_result = biosphere_result || new Biosphere(biosphere.getParameters());

        // ScalarField.add_scalar_term(biosphere.primary_carbon_biomass, biosphere_memos.net_primary_productivity(), timestep, biosphere_result.primary_carbon_biomass);

        return biosphere_result;
    }

    
    // NOTE: Do not create getters/setters within the "Biosphere" class! Use this instead!
    // "get_memos()" is a pure stateless function. 
    // Given a Biosphere object, it returns a dictionary of memo functions.
    // These memo functions calculate derived attributes of the Biosphere object.
    // When modifications are made to the biosphere object, the memo is discarded. 
    // This ensures with minimal overhead that derived attributes are never "dirty".
    // They are never out of sync with the underlying attributes they were derived from. 
    // We do it this way for two reasons:
    //   1.) To prevent introducing state within code that relies on the Biosphere class.
    //       Developers do not have to worry about the state of is_dirty flags, memos, 
    //       or derived attributes within "Biosphere" objects. 
    //       Biosphere is guaranteed to be a simple data structure. 
    //       All functions that calculate derived attributes are guaranteed to be stateless. 
    //   2.) To achieve a separation of concerns:
    //       The "Biosphere" class concerns itself only with storing the inherent state of a biosphere.
    //       The "Biosphere namespace" concerns itself only with pure, stateless functions 
    //        that describe the transformation of state and the calculation of derived attributes.
    Biosphere.get_memos = function(biosphere, atmosphere, universe, memos_out) {

        var memos_out = memos_out || {
            net_primary_productivity: new Memo( 0, 
                result => PlantBiology.net_primary_productivities(
                    atmosphere.long_term_surface_temperature.value(), 
                    atmosphere.precipitation.value(), 
                    biosphere.npp_max, 
                    result
                ),
                Float32Raster(biosphere.grid),
            ),
            leaf_area_index: new Memo( 0, 
                result => PlantBiology.leaf_area_indices(
                    memos_out.net_primary_productivity.value(), 
                    biosphere.npp_max, 
                    biosphere.lai_max, 
                    result, 
                    biosphere.growth_factor
                ),
                Float32Raster(biosphere.grid),
            ),
            plant_coverage: new Memo( 0, 
                result => Float32RasterInterpolation.linearstep(0, 1, memos_out.leaf_area_index.value(), result),
                Float32Raster(biosphere.grid),
            )
        };

        for (var memo_id in memos_out){
            memos_out[memo_id].invalidate();
        }

        return memos_out;
    }

    return Biosphere;
}) ();
