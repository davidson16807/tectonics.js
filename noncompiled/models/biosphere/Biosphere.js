'use strict';

function Biosphere(grid, parameters) {
    var grid             = grid || stop('missing parameter: "grid"');
    var growth_factor     = parameters['growth_factor'] || 1; // This is something I haven't bothered parameterizing. If c=1/∞, then npp∝lai
    var npp_max         = parameters['npp_max'] || 1;
    var lai_max         = parameters['lai_max'] || 1;

    this.getParameters = function() {
        return { 
            //grid:         grid. // TODO: add grid
            growth_factor:     growth_factor,
            npp_max:         npp_max,
            lai_max:         lai_max,
        };
    }

    // public variables
    var self = this;
    this.npp = new Memo(
        Float32Raster(grid),  
        result => {
            return PlantBiology.net_primary_productivities(long_term_surface_temperature.value(), precipitation.value(), npp_max, result)
        }
    ); 
    this.lai = new Memo(
        Float32Raster(grid),  
        result => PlantBiology.leaf_area_indices(self.npp.value(), npp_max, lai_max, result, growth_factor)
    ); 
    this.plant_coverage = new Memo(
        Float32Raster(grid),  
        result => Float32RasterInterpolation.linearstep(0, 1, self.lai.value(), result)
    ); 

    // private variables
    var npp_refresh = Float32Raster(grid);
    var lai_refresh = Float32Raster(grid);
    var plant_coverage_refresh = Float32Raster(grid);

    var long_term_surface_temperature = undefined;
    var precipitation = undefined;

    function calculate_deltas(world, timestep) { }

    function apply_deltas(world) { }

    function assert_dependencies() {
        if (long_term_surface_temperature === void 0)    { throw '"long_term_surface_temperature" not provided'; }
        if (precipitation === void 0)             { throw '"precipitation" not provided'; }
    }

    this.setDependencies = function(dependencies) {
        long_term_surface_temperature     = dependencies['long_term_surface_temperature']     !== void 0?     dependencies['long_term_surface_temperature']     : long_term_surface_temperature;
        precipitation             = dependencies['precipitation']         !== void 0?     dependencies['precipitation']             : precipitation;
    }

    this.initialize = function() {
        assert_dependencies();
    }

    this.invalidate = function() {
        this.npp.invalidate();
        this.lai.invalidate();
        this.plant_coverage.invalidate();
    }

    this.calcChanges = function(timestep) {
        assert_dependencies();

        calculate_deltas(this, timestep);     // this creates a world map of all additions and subtractions rasters
    }

    this.applyChanges = function(timestep){
        if (timestep === 0) {
            return;
        };
        
        assert_dependencies();

        apply_deltas(this);     // this applies additions and subtractions to rasters
    }
}
