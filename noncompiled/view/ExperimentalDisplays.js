// TESTS FOR EXPERIMENTAL FUNCTIONALITY
// NOT TO BE INCLUDED IN PRODUCTION

var experimentalDisplays = {};


experimentalDisplays.albedo 	= new ScalarHeatDisplay( { min: '0.', max: '1.',  
	getField: function (world) {
		var land_fraction = Float32RasterInterpolation.smoothstep(world.SEALEVEL-200, world.SEALEVEL, world.displacement);
		var temp = AtmosphericModeling.surface_air_temp(world.grid.pos, world.meanAnomaly, Math.PI*23.5/180);

		var ice_fraction = Float32RasterInterpolation.lerp( 
				1, 0, 
				Float32RasterInterpolation.smoothstep(273.15-10, 273.15, temp)
			);
		Float32RasterGraphics.fill_into_selection(
			ice_fraction, 0.,
			ScalarField.lt_field(
				world.displacement, 
				Float32RasterInterpolation.lerp(
					world.SEALEVEL-1000, 
					world.SEALEVEL-200, 
					Float32RasterInterpolation.smoothstep(273.15-10, 273.15, temp)
				)
			),
			ice_fraction
		);

		var lat = Float32SphereRaster.latitude(world.grid.pos.y);
		var precip = AtmosphericModeling.precip(lat);
		var npp_max = 1;
		var lai_max = 10;
		var npp = BiosphereModeling.net_primary_productivity(temp, precip, npp_max);
		var lai = BiosphereModeling.leaf_area_index(npp, npp_max, lai_max);
		var plant_fraction = Float32RasterInterpolation.smoothstep(0, 2, lai);
		albedo = AtmosphericModeling.albedo(land_fraction, ice_fraction, plant_fraction);
		return albedo;
	}
} );



experimentalDisplays.motion_test = new VectorFieldDisplay( {  
    getField: function (world) { 
      var grid = world.grid; 
      var pos = grid.pos; 

      var plates = world.plates; 
      var plate = plates[0];
      var boundary_normal = Uint8Field.gradient(plate.mask); 

      return boundary_normal;


      var add_term = VectorField.add_vector_field_and_scalar_field_term; 
      var cross = VectorField.cross_vector; 
      var eq = Uint8Field.eq_scalar;
      return all_velocities; 
    }  
  } ); 

experimentalDisplays.velocity = new VectorFieldDisplay( {  
    getField: function (world) { 
		var velocity = TectonicsModeling.get_plate_velocity(world.plates[0].mask, world.plates[0].buoyancy, world.material_viscosity);
		var speed = VectorField.magnitude(velocity);

    }  
  } ); 

experimentalDisplays.plate0 	= new ScalarHeatDisplay( { min: '0.', max: '1.', 
		getField: function (world) {
			return world.plates[0].mask;
		} 	
	} );
experimentalDisplays.buoyancy 	= new ScalarHeatDisplay( { min: '-2.', max: '0.', 
		getField: function (world, buoyancy) {
			Crust.get_buoyancy(world.density, world.material_density, world.surface_gravity, buoyancy);
			return buoyancy;
		}
	} );
experimentalDisplays.speed 	= new ScalarHeatDisplay( { min: '0.', max: '1.', 
		getField: function (world, result) {
			var plate = world.plates[0];

			Crust.get_buoyancy(plate.density, world.material_density, world.surface_gravity, plate.buoyancy);
			var velocity = TectonicsModeling.get_plate_velocity(plate.mask, plate.buoyancy, world.material_viscosity);
			return VectorField.magnitude(velocity, result);
		} 	
	} );
