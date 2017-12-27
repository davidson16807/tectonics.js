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
experimentalDisplays.weathering = new ScalarHeatDisplay( { min: '0.', max: '30.*2700.',  
	getField: function (world, result, scratch) {
		return TectonicsModeling.get_weathering_rate(
			world.unsubductable,
			world.unsubductable_sediment, 
			world.displacement, 
			world.SEALEVEL, 
			result, 
			scratch
		);
	}
} );
experimentalDisplays.erosion = new ScalarHeatDisplay( { min: '-150000.', max: '150000.',  
	getField: function (world, result, scratch) {
		return TectonicsModeling.get_erosion_rate(
			world.unsubductable_sediment, 
			world.displacement, 
			world.SEALEVEL, 
			result, 
			scratch
		);
	}
} );
experimentalDisplays.sediment 	= new ScalarHeatDisplay( { min: '0.', max: '3.',  
		getField: function (crust, result) {
			return ScalarField.div_scalar(crust.unsubductable_sediment, 2500, result);
		} 
	} );
experimentalDisplays.water_height = new ScalarHeatDisplay( { min: '0.', max: '20000.',  
	getField: function (world, result, scratch) {
		return ScalarField.max_scalar(world.displacement, world.SEALEVEL, result);
	}
} );