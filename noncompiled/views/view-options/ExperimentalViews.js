// TESTS FOR EXPERIMENTAL FUNCTIONALITY
// NOT TO BE INCLUDED IN PRODUCTION

window.ScalarWorldViewOptions = window.ScalarWorldViewOptions || {};
window.VectorWorldViewOptions = window.VectorWorldViewOptions || {};

window.ScalarWorldViewOptions.eliptic_ids = { 
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    scaling: true, 
    get_scalar_raster: function (world) { 
      var ids = Float32Raster(world.grid); 
      Float32Raster.FromUint16Raster(world.grid.vertex_ids, ids); 
      var pos = OrbitalMechanics.get_ecliptic_coordinates_raster_from_equatorial_coordinates_raster( 
        world.grid.pos, 
        23.5/180*Math.PI, 
        23.5/180*Math.PI 
      ); 
      return Float32Raster.get_nearest_values(ids, pos); 
    }
};

window.ScalarWorldViewOptions.get_varying_albedo = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 0, // custom
    min: 0, max: 1,
    get_scalar_raster: function (world) {

        // dependencies: sealevel, displacement, mean_anomaly, snow_fraction, precip, npp, lai, plant_fraction, land_fraction
        var sealevel = world.hydrosphere.sealevel;
        var land_fraction = Float32RasterInterpolation.linearstep(sealevel-200, sealevel, world.displacement);
        var temp = AtmosphericModeling.surface_air_temperature(world.grid.pos, world.meanAnomaly, Math.PI*23.5/180);

        var snow_fraction = Float32RasterInterpolation.mix( 
                1, 0, 
                Float32RasterInterpolation.linearstep(273.15-10, 273.15, temp)
            );
        Float32RasterGraphics.fill_into_selection(
            snow_fraction, 0.,
            ScalarField.lt_field(
                world.displacement, 
                Float32RasterInterpolation.mix(
                    sealevel-1000, 
                    sealevel-200, 
                    Float32RasterInterpolation.linearstep(273.15-10, 273.15, temp)
                )
            ),
            snow_fraction
        );

        var lat = Float32SphereRaster.latitude(world.grid.pos.y);
        var precipitation = Climatology.guess_precipitation_fluxes(lat);
        var npp_max = 1;
        var lai_max = 10;
        var npp = PlantBiology.net_primary_productivities(temp, precipitation, npp_max);
        var lai = PlantBiology.leaf_area_indices(npp, npp_max, lai_max);
        var plant_fraction = Float32RasterInterpolation.linearstep(0, 2, lai);
        albedo = AtmosphericModeling.get_varying_albedo(land_fraction, snow_fraction, plant_fraction);
        return albedo;
    }
}   


window.ScalarWorldViewOptions.plate0 = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    min: 0., max: 1.,
    get_scalar_raster: function (world) {
        return world.plates[0].mask;
    },     
}
window.ScalarWorldViewOptions.buoyancy = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    min: -2., max: 0.,
    get_scalar_raster: function (world, buoyancy) {
        Crust.get_buoyancy(world.density, world.material_density, world.surface_gravity, buoyancy);
        return buoyancy;
    }
}
window.ScalarWorldViewOptions.buoyancy_smoothed = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    min: -2., max: 0.,
    get_scalar_raster: function (world, buoyancy) {
        Crust.get_buoyancy(world.density, world.material_density, world.surface_gravity, buoyancy);
        var pressure = TectonicsModeling.get_asthenosphere_pressure(buoyancy);
        return pressure;
    }
}
window.ScalarWorldViewOptions.plates = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    min: 0., max: 7.,
    get_scalar_raster: function (world) {
        var buoyancy = Crust.get_buoyancy(world.density, world.material_density, world.surface_gravity);
        var pressure = TectonicsModeling.get_asthenosphere_pressure(buoyancy);
        var velocity = TectonicsModeling.get_asthenosphere_velocity(pressure);
        var angular_velocity = VectorField.cross_vector_field(velocity, world.grid.pos);
        var top_plate_map = TectonicsModeling.get_plate_map(angular_velocity, 7, 200);
        return top_plate_map;
    }
}
window.ScalarWorldViewOptions.speed = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    min: 0., max: 1.,
    get_scalar_raster: function (world, result) {
        var plate = world.plates[0];

        Crust.get_buoyancy(plate.density, world.material_density, world.surface_gravity, plate.buoyancy);
        var velocity = TectonicsModeling.get_plate_velocity(plate.mask, plate.buoyancy, world.material_viscosity);
        return VectorField.magnitude(velocity, result);
    } 
}
window.ScalarWorldViewOptions.insolation = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    builtin_colorscale: 1, // heatmap
    min: 0., max: 400.,
    get_scalar_raster: function (world, result) {
        return world.atmosphere.average_insolation;
    }
}

window.ScalarWorldViewOptions.buoyancy_smoothed_laplacian = {  
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: function (world) { 
            var buoyancy = Crust.get_buoyancy(world.density, world.material_density, world.surface_gravity);
            var pressure = TectonicsModeling.get_asthenosphere_pressure(buoyancy);
            var velocity = TectonicsModeling.get_asthenosphere_velocity(pressure);
            return velocity;
    }
};
window.ScalarWorldViewOptions.angular_velocity = {  
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: function (world) { 
            var buoyancy = Crust.get_buoyancy(world.density, world.material_density, world.surface_gravity);
            var pressure = TectonicsModeling.get_asthenosphere_pressure(buoyancy);
            var velocity = TectonicsModeling.get_asthenosphere_velocity(pressure);
            var angular_velocity = VectorField.cross_vector_field(velocity, world.grid.pos);
            return angular_velocity;
    }
};
var PLATE_ID = 0;
window.VectorWorldViewOptions.velocity = {  
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: function (world) { 
        return world.plates[PLATE_ID].velocity;
        var velocity = TectonicsModeling.get_plate_velocity(world.plates[PLATE_ID].mask, world.plates[PLATE_ID].buoyancy, world.material_viscosity);
        var speed = VectorField.magnitude(velocity);
        return velocity;
    }
}