'use strict';


window.VectorWorldViewOptions = window.VectorWorldViewOptions || {};

window.VectorWorldViewOptions.disabled    = new DisabledVectorRasterView();
window.VectorWorldViewOptions.asthenosphere_velocity = { 
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: function (world, flood_fill, scratch1) {
        // scratch represents pressure
        const pressure = scratch1;
        // flood_fill does double duty for performance reasons
        const scratch2 = flood_fill;
        const field = FluidMechanics.get_fluid_pressures(world.lithosphere.density.value(), pressure, scratch2);
        const gradient = ScalarField.gradient(field);
        return gradient;
    } 
};
window.VectorWorldViewOptions.pos    = { 
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: function (world) {
        const pos = world.grid.pos;
        return pos;
    }
};
window.VectorWorldViewOptions.pos2    = { 
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: function (world) {
        const rotationMatrix = Matrix3x3.RotationAboutAxis(world.eulerPole.x, world.eulerPole.y, world.eulerPole.z, 1);
        const pos = VectorField.mult_matrix(world.grid.pos, rotationMatrix);
        return pos;
    }
};
window.VectorWorldViewOptions.aesthenosphere_velocity    = { 
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: world => world.lithosphere.aesthenosphere_velocity.value()
};

window.VectorWorldViewOptions.surface_air_velocity = {
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: world => world.atmosphere.surface_wind_velocity.value()
};


window.VectorWorldViewOptions.plate_velocity = {  
    vector_raster_view_type: 'VectorRasterViewResources',
    get_vector_raster: world => world.lithosphere.plate_velocity.value()
}; 

