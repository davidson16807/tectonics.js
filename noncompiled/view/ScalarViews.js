'use strict';

var scalarViews = {};
scalarViews.satellite = new RealisticWorldView('canopy');
scalarViews.soil = new RealisticWorldView('soil');
scalarViews.bedrock = new RealisticWorldView('bedrock');

scalarViews.npp 	= new ScalarWorldView( 
		new ColorscaleRasterView( { minColor: 0xffffff, maxColor: 0x00ff00, min: '0.', max: '1.' }),
		world => world.biosphere.npp.value()
	);
scalarViews.alt 	= new ScalarWorldView( 
		new ColorscaleRasterView( { minColor: 0x000000, maxColor: 0xffffff, min:'0.', max:'10000.' }),
		world => world.hydrosphere.surface_height.value()
	);
scalarViews.plates 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '7.' }),
		world => world.lithosphere.top_plate_map
	);
scalarViews.plate_count 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '3.' }),
		world => world.lithosphere.plate_count
	);
scalarViews.temp 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '-50.', max: '30.' }),
		(world, result) => ScalarField.add_scalar(world.atmosphere.surface_temp, -273.15, result)
	);
scalarViews.precip 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '2000.', max: '1.' }),
		world => world.atmosphere.precip.value()
	);
scalarViews.age 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '250.', max: '0.' }),
		world => world.lithosphere.top_crust.age
	);
scalarViews.mafic_volcanic 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '7000.' }),
		world => world.lithosphere.top_crust.mafic_volcanic
	);
scalarViews.felsic_plutonic 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '70000.' }),
		world => world.lithosphere.top_crust.felsic_plutonic
	);
scalarViews.felsic_plutonic_erosion 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '100.' }),
		world => world.lithosphere.top_crust.felsic_plutonic_erosion
	);
scalarViews.sediment 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment
	);
scalarViews.sediment_erosion 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment_erosion
	);
scalarViews.sediment_weathering 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '5.' }),
		world => world.lithosphere.top_crust.sediment_weathering
	);
scalarViews.sedimentary 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '10000.' }),
		world => world.lithosphere.top_crust.sedimentary
	);
scalarViews.metamorphic 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '10000.' }),
		world => world.lithosphere.top_crust.metamorphic
	);
scalarViews.thickness 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '70000.' }),
		world => world.lithosphere.thickness
	);
scalarViews.density 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '2.700', max: '3.300' }),
		world => world.lithosphere.density.value()
	);
scalarViews.elevation 	= new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '10000.' }),
		world => world.lithosphere.elevation.value()
	);
scalarViews.ice_coverage = new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '1.' }),
		world => world.hydrosphere.ice_coverage.value()
	);
scalarViews.land_coverage = new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '1.' }),
		world => world.lithosphere.land_coverage.value()
	);
scalarViews.ocean_coverage = new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '1.' }),
		world => world.hydrosphere.ocean_coverage.value()
	);
scalarViews.plant_coverage = new ScalarWorldView( 
		new HeatmapRasterView( { min: '0.', max: '1.' }),
		world => world.biosphere.plant_coverage.value()
	);
scalarViews.asthenosphere_pressure = new ScalarWorldView( 
		new HeatmapRasterView(  { min: '1.', max: '0.'  }),
		function (world, output, scratch, iterations) {return TectonicsModeling.get_asthenosphere_pressure(world.lithosphere.density, output, scratch);}
	);

scalarViews.surface_air_pressure = new ScalarWorldView( 
		new HeatmapRasterView( { min: '980000.', max: '1030000.' }),
		world => world.atmosphere.surface_pressure.value()
	);
