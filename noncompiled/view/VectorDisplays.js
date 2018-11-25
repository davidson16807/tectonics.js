'use strict';

var vectorDisplays = {};
vectorDisplays.disabled	= new DisabledVectorRasterDisplay();
vectorDisplays.asthenosphere_velocity = new VectorWorldDisplay( { 
		getField: function (world, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = LithosphereModeling.get_asthenosphere_pressure(world.lithosphere.density.value(), pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			return gradient;
		} 
	} );
vectorDisplays.pos	= new VectorWorldDisplay( { 
	getField: function (world) {
		var pos = world.grid.pos;
		return pos;
	}
} );
vectorDisplays.pos2	= new VectorWorldDisplay( { 
	getField: function (world) {
		var rotationMatrix = Matrix3x3.RotationAboutAxis(world.eulerPole.x, world.eulerPole.y, world.eulerPole.z, 1);
		var pos = VectorField.mult_matrix(world.grid.pos, rotationMatrix);
		return pos;
	}
} );
vectorDisplays.aesthenosphere_velocity	= new VectorWorldDisplay( { 
		getField: world => world.lithosphere.aesthenosphere_velocity.value()
	} );

vectorDisplays.surface_air_velocity = new VectorWorldDisplay( {
		getField: world => world.atmosphere.surface_wind_velocity.value()
	} );


vectorDisplays.plate_velocity = new VectorWorldDisplay( {  
		getField: world => world.lithosphere.plate_velocity.value()
  	} ); 

