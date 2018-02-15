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
experimentalDisplays.erosion_deltas 	= new ScalarHeatDisplay( { min: '0.', max: '1.',  
	getField: function (world) {
		return erosion_delta_negatives;
	}
} );