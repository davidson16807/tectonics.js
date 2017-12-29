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
experimentalDisplays.erosion = new ScalarHeatDisplay( { min: '0.', max: '1e4',  
	getField: function (world, result, scratch) {
		sediment = world.unsubductable_sediment
		displacement = world.displacement
		sealevel = world.SEALEVEL


		result = result || Float32Raster(displacement.grid);
		scratch = scratch || Float32Raster(displacement.grid);

		var grid = displacement.grid;

		var erosive_factor = 3.9e-3; // measured as volumetric sediment discharge per volumetric water discharge

		var earth_surface_gravity = 9.8; // m/s^2
		var surface_gravity = 9.8; // m/s^2

		var sediment_density = 2500 // kg/m^2, from Simoes et al. 2010

		var water_height = scratch;
		ScalarField.max_scalar(displacement, sealevel, water_height);

		var gradient = ScalarField.gradient(water_height);

		var greatest_slope = scratch;
		VectorField.magnitude(gradient, greatest_slope);
		// divide by radius of planet (in meters)
		ScalarField.div_scalar(greatest_slope, world.radius, greatest_slope);

		// "force" does double duty for performance reasons
		var greatest_slope_direction = gradient;
		VectorField.normalize(gradient, greatest_slope_direction);
		
		
		// "water discharge" is the volumetric quantity of water that flows downhill through a point
		// TODO: turn this into a scratch param
		water = Float32Raster(displacement.grid);
		water_flow = VectorRaster(displacement.grid);
		water_flux = Float32Raster(displacement.grid);
		water_discharge = Float32Raster(displacement.grid);
		// start with precip
		Float32Raster.fill(water,7.8e5);
		Float32Raster.fill(water_discharge,7.8e5);
		// repeatedly apply height-governed convection (∇⋅(Qw dx ∇h/|∇h|)) 
		// where Qw is water discharge per timestep, dx is grid cell length, and h is height
		// TODO: turn this into a scratch param
		for (var i = 0; i < 5; i++) {
			VectorField.mult_scalar_field(greatest_slope_direction, water, water_flow);
			VectorField.divergence(water_flow, water_flux);
			ScalarField.mult_scalar(water_flux, grid.average_distance, water_flux);
			ScalarField.add_field(water, water_flux, water);
			ScalarField.max_scalar(water_flux, 0, water_flux);
			ScalarField.add_field(water_discharge, water_flux, water_discharge);
		}

		// Great Scott! It's the flux capacity, Marty!
		// "flux capacity" is the maximum rate at which sediment can be transported
		var sediment_flux_capacity = scratch;
		ScalarField.mult_field(
			greatest_slope,
			water_discharge,
			scratch
		)
		ScalarField.mult_scalar(
			scratch, 
			erosive_factor * 	// apply erosive factor to get volume flux of sediment
			sediment_density *  // apply sediment density to get mass flux of sediment
			surface_gravity/earth_surface_gravity, // correct for planet's gravity
			sediment_flux_capacity);

		// "flux magnitude" is the actual quantity at which sediment is transported
		// i.e. you can't transport more sediment than what exists in a cell

		var sediment_flux_magnitude = scratch;
		ScalarField.min_field(sediment_flux_capacity, sediment, sediment_flux_magnitude);

		// "force" does double duty for performance reasons
		var sediment_flux = greatest_slope_direction;
		VectorField.mult_scalar_field(greatest_slope_direction, sediment_flux_magnitude, sediment_flux);
		// VectorField.magnitude(sediment_flux, greatest_slope); 

		var erosion_rate = result;
		VectorField.divergence(sediment_flux, erosion_rate); // apply divergence to get kg/My
		ScalarField.mult_scalar(erosion_rate, grid.average_distance, erosion_rate); // apply average distance between cells to get kg * radians/My
		return erosion_rate;
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