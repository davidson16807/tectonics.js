'use strict';

var scalarDisplays = {};
scalarDisplays.satellite = new RealisticWorldDisplay('canopy');
scalarDisplays.soil = new RealisticWorldDisplay('soil');
scalarDisplays.bedrock = new RealisticWorldDisplay('bedrock');

scalarDisplays.npp 	= new ScalarWorldDisplay( 
		new ColorscaleRasterDisplay( { minColor: 0xffffff, maxColor: 0x00ff00, min: '0.', max: '1.' }),
		world => world.biosphere.npp.value()
	);
scalarDisplays.alt 	= new ScalarWorldDisplay( 
		new ColorscaleRasterDisplay( { minColor: 0x000000, maxColor: 0xffffff, min:'0.', max:'10000.' }),
		world => world.hydrosphere.surface_height.value()
	);
scalarDisplays.plates 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '7.' }),
		world => world.lithosphere.top_plate_map
	);
scalarDisplays.plate_count 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '3.' }),
		world => world.lithosphere.plate_count
	);
scalarDisplays.temp 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '-50.', max: '30.' }),
		(world, result) => ScalarField.add_scalar(world.atmosphere.surface_temp, -273.15, result)
	);
scalarDisplays.precip 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '2000.', max: '1.' }),
		world => world.atmosphere.precip.value()
	);
scalarDisplays.age 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '250.', max: '0.' }),
		world => world.lithosphere.top_crust.age
	);
scalarDisplays.mafic_volcanic 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '7000.' }),
		world => world.lithosphere.top_crust.mafic_volcanic
	);
scalarDisplays.felsic_plutonic 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '70000.' }),
		world => world.lithosphere.top_crust.felsic_plutonic
	);
scalarDisplays.felsic_plutonic_erosion 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '100.' }),
		world => world.lithosphere.top_crust.felsic_plutonic_erosion
	);
scalarDisplays.sediment 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment
	);
scalarDisplays.sediment_erosion 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment_erosion
	);
scalarDisplays.sediment_weathering 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment_weathering
	);
scalarDisplays.sedimentary 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '10000.' }),
		world => world.lithosphere.top_crust.sedimentary
	);
scalarDisplays.metamorphic 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '10000.' }),
		world => world.lithosphere.top_crust.metamorphic
	);
scalarDisplays.thickness 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '70000.' }),
		world => world.lithosphere.thickness
	);
scalarDisplays.density 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '2.700', max: '3.300' }),
		world => world.lithosphere.density.value()
	);
scalarDisplays.elevation 	= new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '10000.' }),
		world => world.lithosphere.elevation.value()
	);
scalarDisplays.ice_coverage = new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '1.' }),
		world => world.hydrosphere.ice_coverage.value()
	);
scalarDisplays.land_coverage = new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '1.' }),
		world => world.lithosphere.land_coverage.value()
	);
scalarDisplays.ocean_coverage = new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '1.' }),
		world => world.hydrosphere.ocean_coverage.value()
	);
scalarDisplays.plant_coverage = new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '0.', max: '1.' }),
		world => world.biosphere.plant_coverage.value()
	);
scalarDisplays.asthenosphere_pressure = new ScalarWorldDisplay( 
		new HeatmapRasterDisplay(  { min: '1.', max: '0.'  }),
		function (world, output, scratch, iterations) {return TectonicsModeling.get_asthenosphere_pressure(world.lithosphere.density, output, scratch);}
	);

scalarDisplays.surface_air_pressure = new ScalarWorldDisplay( 
		new HeatmapRasterDisplay( { min: '980000.', max: '1030000.' }),
		world => world.atmosphere.surface_pressure.value()
	);
