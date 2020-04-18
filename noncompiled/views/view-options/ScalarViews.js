'use strict';

window.ScalarWorldViewOptions = window.ScalarWorldViewOptions || {};
    
window.ScalarWorldViewOptions.surface_normal_map     = {
    scalar_raster_view_type: 'SurfaceNormalMapRasterViewResources',
    get_scalar_raster: (world, result, scratch, options) => (options.ocean_visibility > 0.5? world.lithosphere.surface_height.value() : world.lithosphere.displacement.value())
}
    
window.ScalarWorldViewOptions.topographic    = {
    scalar_raster_view_type: 'TopographicRasterView',
    scaling: true,
    get_scalar_raster: world => world.hydrosphere.elevation.value()
}
    
window.ScalarWorldViewOptions.npp     = {
    scalar_raster_view_type: 'ColorscaleRasterView',
    min_color: 0xffffff, max_color: 0x00ff00, min: 0., max: 1.,
    get_scalar_raster: world => world.biosphere.npp.value()
}
    
window.ScalarWorldViewOptions.elevation = {
    scalar_raster_view_type: 'ColorscaleRasterView',
    min_color: 0x000000, max_color: 0xffffff, scaling: true,
    get_scalar_raster: (world, result, scratch, options) => (options.ocean_visibility > 0.5? world.lithosphere.surface_height.value() : world.hydrosphere.elevation.value())
}
window.ScalarWorldViewOptions.plates     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 7.,
    get_scalar_raster: world => world.lithosphere.top_plate_map
}
    
window.ScalarWorldViewOptions.plate_count     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 3.,
    get_scalar_raster: world => world.lithosphere.plate_count
}
    
window.ScalarWorldViewOptions.temp     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: -20., max: 30.,
    get_scalar_raster: (world, result) => ScalarField.sub_scalar(world.atmosphere.surface_temperature, 273.15, result)
}
    
window.ScalarWorldViewOptions.precipitation     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 2000., max: 1.,
    get_scalar_raster: world => world.atmosphere.precipitation.value()
}
    
window.ScalarWorldViewOptions.age     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 250., max: 0.,
    get_scalar_raster: (world, result) => ScalarField.div_scalar(world.lithosphere.top_crust.age, Units.MEGAYEAR, result)
}
    
window.ScalarWorldViewOptions.mafic_volcanic     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 7000.,
    get_scalar_raster: world => world.lithosphere.top_crust.mafic_volcanic
}
    
window.ScalarWorldViewOptions.felsic_plutonic     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 70000.,
    get_scalar_raster: world => world.lithosphere.top_crust.felsic_plutonic
}
    
window.ScalarWorldViewOptions.felsic_plutonic_erosion     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 100.,
    get_scalar_raster: world => world.lithosphere.top_crust.felsic_plutonic_erosion
}
    
window.ScalarWorldViewOptions.sediment     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 5.,
    get_scalar_raster: world => world.lithosphere.top_crust.sediment
}
    
window.ScalarWorldViewOptions.sediment_erosion     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 5.,
    get_scalar_raster: world => world.lithosphere.top_crust.sediment_erosion
}
    
window.ScalarWorldViewOptions.sediment_weathering     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 5.,
    get_scalar_raster: world => world.lithosphere.top_crust.sediment_weathering
}
    
window.ScalarWorldViewOptions.sedimentary     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 10000.,
    get_scalar_raster: world => world.lithosphere.top_crust.sedimentary
}
    
window.ScalarWorldViewOptions.metamorphic     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 10000.,
    get_scalar_raster: world => world.lithosphere.top_crust.metamorphic
}
    
window.ScalarWorldViewOptions.thickness     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 70000.,
    get_scalar_raster: world => world.lithosphere.thickness.value()
}
    
window.ScalarWorldViewOptions.density     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 2500, max: 3300,
    get_scalar_raster: world => world.lithosphere.density.value()
}
    
window.ScalarWorldViewOptions.elevation     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 10000., scaling: true,
    get_scalar_raster: function(world, result, scratch, options){
        return options
            world.lithosphere.elevation.value(
    }
}
    
window.ScalarWorldViewOptions.snow_coverage = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 1.,
    get_scalar_raster: world => world.hydrosphere.snow_coverage.value()
}
    
window.ScalarWorldViewOptions.land_coverage = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 1.,
    get_scalar_raster: world => world.lithosphere.land_coverage.value()
}
    
window.ScalarWorldViewOptions.ocean_coverage = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 1.,
    get_scalar_raster: world => world.hydrosphere.ocean_coverage.value()
}
    
window.ScalarWorldViewOptions.plant_coverage = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 0., max: 1.,
    get_scalar_raster: world => world.biosphere.plant_coverage.value()
}
    
window.ScalarWorldViewOptions.asthenosphere_pressure = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 1., max: 0. ,
    get_scalar_raster: function (world, output, scratch, iterations) {
        return TectonicsModeling.get_asthenosphere_pressure(world.lithosphere.density, output, scratch
    }
}

window.ScalarWorldViewOptions.surface_air_pressure = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: 980000., max: 1030000.,
    get_scalar_raster: world => world.atmosphere.surface_pressure.value()
}
    
