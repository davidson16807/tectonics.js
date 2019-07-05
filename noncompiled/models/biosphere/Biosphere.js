'use strict';


var Biosphere = (function() {
        
    function Biosphere(parameters) {
        this.grid                     = parameters['grid'] || stop('missing parameter: "grid"');
        this.growth_factor            = parameters['growth_factor'] || 1; // This is something I haven't bothered parameterizing. If c=1/∞, then npp∝lai
        this.npp_max                  = parameters['npp_max'] || 1;
        this.lai_max                  = parameters['lai_max'] || 1;

        var length = this.grid.vertices.length;
        this.buffer                   = parameters['buffer']          || new ArrayBuffer(2 * Float32Array.BYTES_PER_ELEMENT * length);
        this.primary_biomass          = Float32Raster.FromBuffer(this.buffer, this.grid, 0 * Float32Array.BYTES_PER_ELEMENT * length);
        this.net_primary_productivity = Float32Raster.FromBuffer(this.buffer, this.grid, 1 * Float32Array.BYTES_PER_ELEMENT * length);
        this.everything               = new Float32Array(this.buffer);

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

    Biosphere.get_delta  = function(biosphere, atmosphere, timestep, biosphere_delta) {
        biosphere_delta = biosphere_delta || new Biosphere(biosphere.getParameters());

        Biosphere.growth_factor = 0;
        Biosphere.npp_max       = 0;
        Biosphere.lai_max       = 0;
        PlantBiology.net_primary_productivities(atmosphere.long_term_surface_temperature.value(), atmosphere.precipitation.value(), biosphere.npp_max, biosphere_delta.net_primary_productivity);
        ScalarField.sub_field(biosphere_delta.net_primary_productivity, biosphere.net_primary_productivity, biosphere_delta.net_primary_productivity);

        return biosphere_delta;
    }
    Biosphere.add_delta = function(biosphere, biosphere_delta, biosphere_result) {
        biosphere_result = biosphere_result || new Biosphere(biosphere.getParameters());

        ScalarField.add_field(biosphere.everything, biosphere_delta.everything, biosphere_result.everything);

        return biosphere_result;
    }

    // NOTE: All derived attributes are calculated within stateless functions!
    //  Do not create getter/setter attributes within the "Biosphere" class!
    //  We do it this way for two reasons:
    //   1.) To prevent introducing state within code that relies on the Biosphere class.
    //       Developers do not have to worry about the state of is_dirty flags, memos, 
    //       or derived attributes within "Biosphere" objects. 
    //       Biosphere is guaranteed to be a simple data structure. 
    //       All functions that calculate derived attributes are guaranteed to be stateless. 
    //   2.) To achieve a separation of concerns:
    //       The "Biosphere" class concerns itself only with storing the inherent state of a biosphere.
    //       The "Biosphere namespace" concerns itself only with pure, stateless functions 
    //        that describe the transformation of state and the calculation of derived attributes.
    Biosphere.get_memos = function(biosphere) {

        var memos = {};
        memos.leaf_area_index = memo( 
            result => PlantBiology.leaf_area_indices(biosphere.net_primary_productivity, biosphere.npp_max, biosphere.lai_max, result, biosphere.growth_factor),
            Float32Raster(biosphere.grid),
        );
        memos.plant_coverage = memo( 
            result => Float32RasterInterpolation.linearstep(0, 1, memos.leaf_area_index(), result),
            Float32Raster(biosphere.grid),
        );
        return memos;
    }

    return Biosphere;
}) ();
