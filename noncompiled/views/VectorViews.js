'use strict';

const vectorViews = {};
vectorViews.disabled    = new DisabledVectorRasterView();
vectorViews.asthenosphere_velocity = new VectorWorldView( { 
        getField: function (world, flood_fill, scratch1) {
            // scratch represents pressure
            const pressure = scratch1;
            // flood_fill does double duty for performance reasons
            const scratch2 = flood_fill;
            const field = FluidMechanics.get_fluid_pressures(world.lithosphere.density.value(), pressure, scratch2);
            const gradient = ScalarField.gradient(field);
            return gradient;
        } 
    } );
vectorViews.pos    = new VectorWorldView( { 
    getField: function (world) {
        const pos = world.grid.pos;
        return pos;
    }
} );
vectorViews.pos2    = new VectorWorldView( { 
    getField: function (world) {
        const rotationMatrix = Matrix3x3.RotationAboutAxis(world.eulerPole.x, world.eulerPole.y, world.eulerPole.z, 1);
        const pos = VectorField.mult_matrix(world.grid.pos, rotationMatrix);
        return pos;
    }
} );
vectorViews.aesthenosphere_velocity    = new VectorWorldView( { 
        getField: world => world.lithosphere.aesthenosphere_velocity.value()
    } );

vectorViews.surface_air_velocity = new VectorWorldView( {
        getField: world => world.atmosphere.surface_wind_velocity.value()
    } );


vectorViews.plate_velocity = new VectorWorldView( {  
        getField: world => world.lithosphere.plate_velocity.value()
      } ); 

