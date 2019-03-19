// Climatology is a namespace isolating all business logic relating to climate
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var Climatology = (function() {

    var surface_air_pressure_temperature_effect = function(temperature, material_heat_capacity, atmospheric_height, result) {
        // NOTE: "volumetric_heat_capacity" is the energy required to heat a volume of air by 1 Kelvin
        // it is reported in joules per kelvin per square meter column of air

        return ScalarField.mult_scalar(temperature, material_heat_capacity.air / atmospheric_height, result);
    }
    var surface_air_pressure_lat_effect = function (lat, pressure) {
        pressure = pressure || Float32Raster(lat.grid);
        var cos = Math.cos;
        for (var i=0, li=lat.length; i<li; ++i) {
            pressure[i] = -cos(5*(lat[i]));
        }
        return pressure;
    }
    var surface_air_velocity_coriolis_effect = function(pos, velocity, angular_speed, effect) {
        effect = effect || VectorRaster(pos.grid);
        VectorField.cross_vector_field    (velocity, pos,             effect);
        VectorField.mult_scalar         (effect, 2 * angular_speed, effect);
        VectorField.mult_scalar_field    (effect, pos.y,             effect);
        return effect;
    }

    Climatology = {};
    Climatology.guess_surface_air_velocities = function(pos, pressure, angular_speed, velocity) {
        velocity = velocity || VectorRaster(pos.grid);
        ScalarField.gradient(pressure, velocity);
        EARTH_RADIUS = 6.3e6; // meters
        VectorField.div_scalar(velocity, EARTH_RADIUS, velocity); // need to adjust gradient because grid.pos is on a unit sphere
        var coriolis_effect = surface_air_velocity_coriolis_effect(pos, velocity, angular_speed);
        VectorField.add_vector_field(velocity, coriolis_effect, velocity);
        VectorDataset.rescale(velocity, velocity, 15.65); //15.65 m/s is the fastest average wind speed on Earth, recorded at Mt. Washington
        return velocity;
    }
    Climatology.guess_surface_air_pressures = function(temperature, lat, material_heat_capacity, atmospheric_height, result, scratch) {
        result = result || Float32Raster(lat.grid);
        scratch = scratch || Float32Raster(lat.grid);

        surface_air_pressure_lat_effect(lat, result);

        var temperature_effect = scratch;
        surface_air_pressure_temperature_effect(temperature, material_heat_capacity, atmospheric_height, temperature_effect);
        Float32Dataset.normalize(temperature_effect, temperature_effect);
        ScalarField.add_scalar_term(result, temperature_effect, 3, result);
        Float32Dataset.normalize(result, result, 980e3, 1030e3);

        return result;
    }
    Climatology.guess_precipitation_fluxes = function(lat, result) {
        result = result || Float32Raster(lat.grid);
        //Mean annual precipitation over land, mm yr-1
        //credits for original model go to /u/astrographer, 
        //some modifications made to improve goodness of fit and conceptual integrity 
        //parameters fit to data from 
        precip_intercept = 2000;
        precip_min = 60;
        var cell_effect = 1.;
        var cos = Math.cos;
        var abs = Math.abs;
        var PI = Math.PI;
        for (var i = 0; i < lat.length; i++) {
            result[i] =  precip_intercept * 
                (1. - abs(lat[i]) / (PI*90./180.)) *                             //latitude effect
                //amplitude of circulation cell decreases with latitude, and precip inherently must be positive
                //for these reasons, we multiply the lat effect with the circulation effect
                (cell_effect * cos(6.*abs(lat[i]) + (PI*30./180.)) + 1.) +        //circulation cell effect
                precip_min;
        }
        return result;
    }
    Climatology.get_albedos = function(
        ocean_fraction,
        snow_fraction, 
        plant_fraction,
        material_reflectivity,
        result) {

        material_reflectivity = material_reflectivity || {};
        result = result || Float32Raster(ocean_fraction.grid);

        var albedo = result;

        var ocean_albedo     = material_reflectivity.ocean || 0.06;
        var land_albedo     = material_reflectivity.felsic || 0.27;
        var plant_albedo     = material_reflectivity.forest || 0.1;
        var snow_albedo         = material_reflectivity.snow || 0.9;

        var mix_fsf = Float32RasterInterpolation.mix_fsf;
        var mix_sff = Float32RasterInterpolation.mix_sff;
        // albedo hierarchy: cloud, snow, ocean, plant, sediment
        Float32Raster.fill(albedo, land_albedo);
        if (plant_fraction !== void 0) {    mix_fsf(albedo,     plant_albedo,     plant_fraction, albedo);    }
        if (ocean_fraction !== void 0) {    mix_fsf(albedo,     ocean_albedo,     ocean_fraction, albedo);    }
        if (snow_fraction !== void 0)   {    mix_fsf(albedo,     snow_albedo,     snow_fraction,     albedo);    }
        
        return result;
    }
    Climatology.get_heat_capacities = function(
        ocean_fraction,
        material_heat_capacity,
        result) {

        result = result || Float32Raster(ocean_fraction.grid);

        var ocean_heat_capacity     = material_heat_capacity.ocean || 30e7; // heat capacity of 1m^2 of 75m ocean column, the ocean's "mixing layer"
        var land_heat_capacity        = material_heat_capacity.felsic || 1e7; // heat capacity of 1m^2 air column on earth

        var mix_fsf = Float32RasterInterpolation.mix_fsf;

        Float32Raster.fill(result, land_heat_capacity);
        if (ocean_fraction !== void 0) {    mix_fsf(result,     ocean_heat_capacity,     ocean_fraction, result);    }
        
        return result;
    }



    return Climatology;
})();
