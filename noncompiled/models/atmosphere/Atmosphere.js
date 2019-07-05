'use strict';

function Atmosphere(grid, parameters) {
    // private variables
    var grid = grid || stop('missing parameter: "grid"');
    this.lapse_rate = parameters['lapse_rate'] || 3.5 / 1e3; // degrees Kelvin per meter
    this.emission_coefficient = parameters['emission_coefficient'] || 0.83;

    this.getParameters = function() {
        return { 
            //grid:                 grid. // TODO: add grid
            lapse_rate:             this.lapse_rate,
            emission_coefficient:     this.emission_coefficient,
        };
    }

    var _this = this;
    this.scratch = Float32Raster(grid);
    this.long_term_absorbed_radiation = new Memo(
        Float32Raster(grid),  
        result => { 
            var long_term_average_insolation = result; // double duty for performance
            get_average_insolation(Units.MEGAYEAR, long_term_average_insolation)
            var absorbed_radiation = this.scratch; // double duty for performance
            ScalarField.mult_field( this.absorption.value(), long_term_average_insolation, result );
            return result;
        }
    );
    this.long_term_heat_flow = new Memo(
        Float32Raster(grid),  
        result => { 
            var absorbed_radiation = this.long_term_absorbed_radiation.value();
            var max_absorbed_radiation     = Float32Dataset.max( absorbed_radiation );
            var min_absorbed_radiation     = Float32Dataset.min( absorbed_radiation );
            var mean_absorbed_radiation    = Float32Dataset.average( absorbed_radiation );

            // TODO: improve heat flow by modeling it as a vector field
            var heat_flow_uniform = Thermodynamics.solve_entropic_heat_flow(
                max_absorbed_radiation, 
                min_absorbed_radiation, 
                this.emission_coefficient,
                10
            );

            Thermodynamics.guess_entropic_heat_flows(
                absorbed_radiation, 
                heat_flow_uniform, 
                result
            );
            return result;
        }
    );
    this.long_term_sealevel_temperature = new Memo(
        Float32Raster(grid),  
        result => { 
            var incoming_heat = result;// double duty for performance
            ScalarField.add_field(this.long_term_absorbed_radiation.value(), this.long_term_heat_flow.value(), incoming_heat);

            ScalarField.div_scalar(incoming_heat, this.emission_coefficient, incoming_heat);
            Thermodynamics.get_equilibrium_temperatures(incoming_heat, result);
            return result;
        }
    );
    this.long_term_surface_temperature = new Memo(
        Float32Raster(grid),  
        result => ScalarField.sub_scalar_term ( this.long_term_sealevel_temperature.value(), surface_height.value(), this.lapse_rate, result ),
    );

    this.average_insolation = Float32Raster(grid);
    this.absorbed_radiation = Float32Raster(grid);
    this.get_varying_heat_capacity = Float32Raster(grid);
    this.incoming_heat = Float32Raster(grid);
    this.outgoing_heat = Float32Raster(grid);
    this.net_heat_gain = Float32Raster(grid);
    this.temperature_delta_rate = Float32Raster(grid);
    this.temperature_delta = Float32Raster(grid);
    this.sealevel_temperature = undefined;
    this.surface_temperature = Float32Raster(grid);


    this.get_varying_albedo = new Memo(
        Float32Raster(grid),  
        // result => Climatology.get_albedos(ocean_coverage.value(), snow_coverage.value(), plant_coverage.value(), material_reflectivity, result),
        // result => Climatology.get_albedos(ocean_coverage.value(), undefined, plant_coverage.value(), material_reflectivity, result),
        result => { Float32Raster.fill(result, 0.2); return result; },
        false // assume everything gets absorbed initially to prevent circular dependencies
    );
    this.absorption = new Memo(
        Float32Raster(grid),  
        result => { 
            ScalarField.mult_scalar    ( this.get_varying_albedo.value(), -1, result );
            ScalarField.add_scalar     ( result, 1, result );
            return result;
        },
    );
    var lat = new Memo(
        Float32Raster(grid),  
        result => SphericalGeometry.get_latitudes(grid.pos.y, result)
    ); 
    this.surface_pressure = new Memo(
        Float32Raster(grid),  
        result => Climatology.guess_surface_air_pressures( this.surface_temperature, lat.value(), material_heat_capacity, 100e3, result)
    ); 
    this.surface_wind_velocity = new Memo(
        VectorRaster(grid),  
        result => Climatology.guess_surface_air_velocities(
            grid.pos, 
            _this.surface_pressure.value(), 
            angular_speed, 
            result
        )
    ); 
    this.precipitation = new Memo(
        Float32Raster(grid),  
        result => Climatology.guess_precipitation_fluxes(lat.value(), result)
    );

    // private variables
    var material_heat_capacity = undefined;
    var get_average_insolation = undefined;
    var material_reflectivity = undefined;
    var surface_height     = undefined;
    var ocean_coverage     = undefined;
    var snow_coverage     = undefined;
    var angular_speed     = undefined;

    function assert_dependencies() {
        if (material_heat_capacity === void 0) { throw '"material_heat_capacity" not provided'; }
        if (get_average_insolation === void 0) { throw '"get_average_insolation" not provided'; }
        if (material_reflectivity === void 0) { throw '"material_reflectivity" not provided'; }
        if (surface_height === void 0)     { throw '"surface_height" not provided'; }
        if (ocean_coverage === void 0)     { throw '"ocean_coverage" not provided'; }
        if (snow_coverage === void 0)     { throw '"snow_coverage" not provided'; }
        if (angular_speed === void 0)     { throw '"angular_speed" not provided'; }
    }

    this.setDependencies = function(dependencies) {
        get_average_insolation = dependencies['get_average_insolation'] !== void 0?     dependencies['get_average_insolation']     : get_average_insolation;        
        material_heat_capacity = dependencies['material_heat_capacity'] !== void 0?     dependencies['material_heat_capacity']     : material_heat_capacity;        
        material_reflectivity = dependencies['material_reflectivity'] !== void 0?     dependencies['material_reflectivity']     : material_reflectivity;        
        surface_height         = dependencies['surface_height']     !== void 0?     dependencies['surface_height']     : surface_height;        
        ocean_coverage         = dependencies['ocean_coverage']!== void 0?     dependencies['ocean_coverage']     : ocean_coverage;        
        snow_coverage         = dependencies['snow_coverage']     !== void 0?     dependencies['snow_coverage']     : snow_coverage;        
        angular_speed         = dependencies['angular_speed'] !== void 0?     dependencies['angular_speed']     : angular_speed;    
    };

    this.initialize = function() {
        assert_dependencies();
    }

    this.invalidate = function() {
        this.get_varying_albedo.invalidate();
        this.surface_pressure .invalidate();
        this.surface_wind_velocity.invalidate();
        this.precipitation.invalidate();
    }

    this.calcChanges = function(timestep) {
        assert_dependencies();
    };

    this.applyChanges = function(timestep){
        if (timestep === 0) {
            return;
        };
        assert_dependencies();

        if (this.sealevel_temperature === void 0 || timestep > 7*Units.DAY) {
            this.sealevel_temperature = Float32Raster.copy(this.long_term_sealevel_temperature.value(),     this.sealevel_temperature);
        } else {
            get_average_insolation(timestep,                                              this.average_insolation);
            ScalarField.mult_field( this.absorption.value(), this.average_insolation,     this.absorbed_radiation );

            ScalarField.add_field(
                this.absorbed_radiation, 
                this.long_term_heat_flow.value(), 
                this.incoming_heat
            );

            Thermodynamics.get_intensity_of_light_emitted_by_black_bodies(this.sealevel_temperature, this.outgoing_heat);
            ScalarField.mult_scalar       ( this.outgoing_heat, this.emission_coefficient,     this.outgoing_heat);
            Climatology.get_heat_capacities(ocean_coverage.value(), material_heat_capacity,    this.get_varying_heat_capacity);
            ScalarField.sub_field         ( this.incoming_heat, this.outgoing_heat,            this.net_heat_gain );
            ScalarField.div_field         ( this.net_heat_gain, this.get_varying_heat_capacity,this.temperature_delta_rate );
            ScalarField.mult_scalar       ( this.temperature_delta_rate, timestep,             this.temperature_delta );
            ScalarField.add_field         ( this.temperature_delta, this.sealevel_temperature, this.sealevel_temperature );
        }


        ScalarField.sub_scalar_term ( this.sealevel_temperature, surface_height.value(), this.lapse_rate, this.surface_temperature );
        // NOTE: do not diffuse sealevel_temperature! it must persist across the next timestep!
        ScalarField.diffusion_by_constant(this.surface_temperature, 0.2, this.surface_temperature);

        // TODO: rename "scalar" to "uniform" across all raster namespaces

        // estimate black body equilibrium temperature, T̄
        // if applying ΔT*t to T results in a T' that exceeds a threshold past T̄, just accept the average
        // if T̄-T < ΔT*t, don't simulate

        // TODO: fall back on equilibrium estimate if timestep exceeds threshold 
        // the threshold is based on the fastest<< time required for the sun to provide the heat needed to reach equilibrium temperature
        // i.e. at min heat capacity 
        // e.g. for earth: 3% * (300 kelvin * 1e7 Joules per kelvin) / 400 joules per second in years
        //                    = 3 days

        // option 2:
        // define threshold as fraction of time needed to 

    };
}
