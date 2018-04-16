'use strict';


function Lithosphere(parameters) {
	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	var material_viscosity = parameters['material_viscosity'];
	var sealevel = parameters['sealevel'];
	var material_density = parameters['material_density'];
	var surface_gravity = parameters['surface_gravity'] || 9.8; // m/s^2

	this.rifting_crust =
	 new RockColumn({
		mafic_volcanic: 		7100, 	// +/- 800, White McKenzie and O'nions 1992
		// felsic_plutonic: 	100, // This can be set above zero to "cheat" on felsic mass conservation
	 });

	this.supercontinentCycle = parameters['supercontinentCycle'] || new SupercontinentCycle(this, parameters);

	// The following are fields that are derived from other fields:
	this.displacement = Float32Raster(grid);
	// "displacement is the height of the crust relative to an arbitrary datum level
	// It is not called "elevation" to emphasize that it is not relative to sea level
	this.thickness = Float32Raster(grid);
	// the thickness of the crust in km
	this.total_mass = Float32Raster(grid);
	// total mass of the crust in tons
	this.density = Float32Raster(grid);
	// the average density of the crust, in T/m^3
	this.buoyancy = Float32Raster(grid);

	this.top_plate_map 			= Uint8Raster(grid);
	this.plate_count 		= Uint8Raster(grid);
	this.asthenosphere_velocity = VectorRaster(grid);

	// this.maxPlatesNum = parameters['platesNum'] || 8;

	this.top_crust 		= new Crust({grid: grid});
	this.total_crust 	= new Crust({grid: grid});
	this.erosion 		= new Crust({grid: grid});
	this.weathering 	= new Crust({grid: grid});
	this.lithification 	= new Crust({grid: grid});
	this.metamorphosis 	= new Crust({grid: grid});
	this.accretion 		= new Crust({grid: grid});
	this.crust_delta 	= new Crust({grid: grid});
	this.crust_scratch 	= new Crust({grid: grid});

	this.plates = [];
	this.average_conserved_per_cell = 0;





	function move_plates(plates, timestep) {
		for (var i=0, li=plates.length; i<li; ++i) {
	 		plates[i].move(timestep, material_density, material_viscosity, surface_gravity);
	 	}
	}
    // calculate derived properties for plates
	function update_calculated_plate_fields(world, plates) { 
		var plate_thickness = Float32Raster(grid); 
		var plate_mass = Float32Raster(grid); 

	    var get_thickness = Crust.get_thickness; 
	    var get_total_mass = Crust.get_total_mass; 
	    var get_density = Crust.get_density; 
	    
		var plate;
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i]; 
            get_thickness		(plate.crust, material_density,									plate_thickness); 
            get_total_mass 		(plate.crust, material_density,									plate_mass); 
            get_density			(plate_mass, plate_thickness, material_density.mafic_volcanic_min, plate.density); 
	 	}
	}
	// update fields that are derived from others
	function update_calculated_fields(world) {
		Crust.get_thickness					(world.total_crust, material_density,								world.thickness);
		Crust.get_total_mass				(world.total_crust, material_density,								world.total_mass);
		Crust.get_density 					(world.total_mass, world.thickness,	material_density.mafic_volcanic_min, 	world.density);
		Crust.get_buoyancy 					(world.density, material_density, surface_gravity, 		 	world.buoyancy);
		LithosphereModeling.get_displacement 	(world.thickness, world.density, material_density, 				world.displacement);
	}
	function merge_plates_to_master(plates, master) {
	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('merge_plates_to_master');

		var UINT8_NULL = 255;
		var UINT16_NULL = 65535;

		//WIPE MASTER RASTERS CLEAN
		Crust.reset(master.total_crust);
		Crust.reset(master.top_crust);
		Uint8Raster.fill(master.top_plate_map, UINT8_NULL);
		Uint8Raster.fill(master.plate_count, 0);

		
		var master_density = master.density; 
		Float32Raster.fill(master_density, 9999);

		//local variables
		var local_ids_of_global_cells; 

		//global variables
		var globalized_is_on_top = scratchpad.getUint8Raster(grid);
		var globalized_plate_mask = scratchpad.getUint8Raster(grid); 
		var global_ids_of_local_cells; 

		// float32array used for temporary storage of globalized scalar fields
		// this is used for performance reasons
		var globalized_scalar_field = scratchpad.getFloat32Raster(grid); 
		var plate_thickness = scratchpad.getFloat32Raster(grid); 

		var globalized_crust = master.crust_scratch;

		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var copy_into = Float32RasterGraphics.copy_into_selection;
		var add_term = ScalarField.add_field_term;
		var add_ui8 = Uint8Field.add_field
		var resample_f32 = Float32Raster.get_ids;
		var resample_ui8 = Uint8Raster.get_ids;
		var and = BinaryMorphology.intersection;
		var lt = ScalarField.lt_field;

		var resample_crust = Crust.get_ids;

		var overlap_crust = Crust.overlap; 

	  	var plate; 
		Uint8Raster.fill(globalized_is_on_top, 1);
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i]; 

	    	local_ids_of_global_cells = plate.local_ids_of_global_cells;
	    	global_ids_of_local_cells = plate.global_ids_of_local_cells;

	    	// generate globalized_plate_mask
	    	// this raster indicates whether the plate exists in a region of the planet
	    	// this raster will be used when merging other rasters
		    resample_ui8(plate.mask, local_ids_of_global_cells, 										globalized_plate_mask); 

		    // generate globalized_is_on_top
		    // this raster indicates whether the plate is viewable from space
		    // this raster will be used when merging other fields
		    resample_f32(plate.density,		 		local_ids_of_global_cells, 							globalized_scalar_field);
		    lt 			(globalized_scalar_field,	master_density,										globalized_is_on_top);
		    and 		(globalized_is_on_top,		globalized_plate_mask,	 							globalized_is_on_top);
		    copy_into 	(master_density,	 		globalized_scalar_field, globalized_is_on_top, 		master_density);

		    // merge plates with master
		    // set plate_mask to current plate's index where current plate is on top
		    fill_into 	(master.top_plate_map, i, globalized_is_on_top, 									master.top_plate_map);
		    
		    // add 1 to master.plate_count where current plate exists
		    add_ui8 	(master.plate_count, globalized_plate_mask, 									master.plate_count);

		    resample_crust(plate.crust, local_ids_of_global_cells, 										globalized_crust);
		    overlap_crust (master.total_crust, globalized_crust, globalized_plate_mask, globalized_is_on_top, master.total_crust);

			Crust.copy_into_selection(master.top_crust, globalized_crust, globalized_is_on_top, 		master.top_crust);
		}
	  	scratchpad.deallocate('merge_plates_to_master');
	}

	function update_rifting(world, plates) { 
	  	var top_plate_map = world.top_plate_map;
	  	var rifting_crust = world.rifting_crust;

	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('update_rifting');

	  	//rifting/detaching variables
		var localized_is_riftable = scratchpad.getUint8Raster(grid);
		var localized_will_stay_riftable = scratchpad.getUint8Raster(grid);
		var localized_is_just_outside_border = scratchpad.getUint8Raster(grid);
		var localized_is_rifting = scratchpad.getUint8Raster(grid);

		//global rifting/detaching variables
		var globalized_is_empty = scratchpad.getUint8Raster(grid);
		var globalized_is_alone = scratchpad.getUint8Raster(grid);
		var globalized_is_riftable = scratchpad.getUint8Raster(grid);
		var globalized_is_on_top = scratchpad.getUint8Raster(grid);

		var scratch_ui8 = scratchpad.getUint8Raster(grid);

		var resample = Uint8Raster.get_ids;
		var margin = BinaryMorphology.margin;
		var or = BinaryMorphology.union;
		var and = BinaryMorphology.intersection;
		var erode = BinaryMorphology.erosion;
		var equals = Uint8Field.eq_scalar;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var fill_into_crust = Crust.fill_into_selection;

		//		 op 	operands														result
		equals 	(world.plate_count, 0, 													globalized_is_empty);
		equals 	(world.plate_count, 1, 													globalized_is_alone);

		var plate = plates[0];
		for (var i=0, li=plates.length; i<li; ++i) { 
			plate = plates[i]; 

			// is_riftable: count == 0 or (count = 1 and top_plate = i) 
			equals 	(top_plate_map, i,                             							globalized_is_on_top); 
			and 	(globalized_is_alone, globalized_is_on_top,         				globalized_is_riftable); 
			or 		(globalized_is_riftable, globalized_is_empty,       				globalized_is_riftable); 

			resample(globalized_is_riftable, plate.global_ids_of_local_cells,       	localized_is_riftable); 
			erode 	(localized_is_riftable, 1,                       					localized_will_stay_riftable,     scratch_ui8); 
			margin 	(plate.mask, 1,                           							localized_is_just_outside_border, scratch_ui8); 
			and 	(localized_will_stay_riftable, localized_is_just_outside_border,  	localized_is_rifting); 

	        fill_into(plate.mask, 1, localized_is_rifting,                 				plate.mask); 
	        fill_into_crust(plate.crust, rifting_crust, localized_is_rifting, 					plate.crust);
		}

	  	scratchpad.deallocate('update_rifting');
	} 
	function update_subducted(world, plates) {
	  	var top_plate_map = world.top_plate_map;

		// WARNING: unfortunate side effect!
		// we calculate accretion delta during detachment for performance reasons
		Crust.reset(world.accretion);

	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('update_subducted');

	  	//rifting/detaching variables
		var localized_is_subducted = scratchpad.getUint8Raster(grid);
		var localized_will_stay_detachable = scratchpad.getUint8Raster(grid);
		var localized_is_just_inside_border = scratchpad.getUint8Raster(grid);
		var localized_is_detaching = scratchpad.getUint8Raster(grid);

		var localized_scratch_ui8 = scratchpad.getUint8Raster(grid); 
		var localized_accretion = scratchpad.getFloat32Raster(grid); 

		//global rifting/detaching variables
		var globalized_is_not_alone = scratchpad.getUint8Raster(grid);
		var globalized_is_subducted = scratchpad.getUint8Raster(grid);
		var globalized_is_not_on_top = scratchpad.getUint8Raster(grid);

		var globalized_scalar_field = scratchpad.getFloat32Raster(grid); 

		var mult_field = ScalarField.mult_field;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var fill_into_f32 = Float32RasterGraphics.fill_into_selection;
		var resample_ui8 = Uint8Raster.get_ids;
		var resample_f32 = Float32Raster.get_ids;
		var padding = BinaryMorphology.padding;
		var and = BinaryMorphology.intersection;
		var erode = BinaryMorphology.erosion;
		var not_equals = Uint8Field.ne_scalar;
		var gt_f32 = ScalarField.gt_scalar;
		var add = ScalarField.add_field;
		var add_term = ScalarField.add_field_term;
		var add_scalar_term = ScalarField.add_scalar_term;

		//				 op 	operands													result
		not_equals 		(world.plate_count, 1, 												globalized_is_not_alone);

		var plate = plates[0];
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

			not_equals 	(top_plate_map, i, 													globalized_is_not_on_top);

		    //detect detachment
			// is_detachable: count > 1 and top_plate != i
		    and 		(globalized_is_not_alone, globalized_is_not_on_top,					globalized_is_subducted);
            resample_ui8(globalized_is_subducted, plate.global_ids_of_local_cells, 			localized_is_subducted);

			// WARNING: unfortunate side effect!
			// we metamorphose stuff here because trying to do it using deltas was causing problems with conservation
			add_term	(plate.crust.metamorphic, plate.crust.sediment, 	localized_is_subducted,	plate.crust.metamorphic);
			add_term	(plate.crust.metamorphic, plate.crust.sedimentary, 	localized_is_subducted,	plate.crust.metamorphic);
			add_term	(plate.crust.metamorphic, plate.crust.felsic_plutonic, 		localized_is_subducted,	plate.crust.metamorphic);
			add_term	(plate.crust.metamorphic, plate.crust.felsic_volcanic, 		localized_is_subducted,	plate.crust.metamorphic);
			fill_into_f32(plate.crust.sediment, 	0, localized_is_subducted, 				plate.crust.sediment);
			fill_into_f32(plate.crust.sedimentary, 	0, localized_is_subducted, 				plate.crust.sedimentary);
			fill_into_f32(plate.crust.felsic_plutonic, 		0, localized_is_subducted, 				plate.crust.felsic_plutonic);
			fill_into_f32(plate.crust.felsic_volcanic, 		0, localized_is_subducted, 				plate.crust.felsic_volcanic);

            erode		(localized_is_subducted, 1,											localized_will_stay_detachable, 	localized_scratch_ui8);
		    padding 	(plate.mask, 1, 													localized_is_just_inside_border, 	localized_scratch_ui8);
        	gt_f32		(plate.density, material_density.mantle,							localized_is_subducted);
		    and 		(localized_will_stay_detachable, localized_is_just_inside_border, 	localized_is_detaching);
		    and 		(localized_is_detaching, localized_is_subducted, 					localized_is_detaching);

	        fill_into 	(plate.mask, 0, localized_is_detaching,                 			plate.mask); 
	        
	        // calculate accretion delta
	        Crust.get_conserved_mass(plate.crust, 											localized_accretion);
        	mult_field	(localized_accretion, localized_is_detaching,						localized_accretion);
        	resample_f32(localized_accretion, plate.local_ids_of_global_cells,				globalized_scalar_field);
        	add_scalar_term (world.accretion.felsic_plutonic, globalized_scalar_field, 0.85,world.accretion.felsic_plutonic);
        	add_scalar_term (world.accretion.felsic_volcanic, globalized_scalar_field, 0.15,world.accretion.felsic_volcanic);
		}

	  	scratchpad.deallocate('update_subducted');
	}
	function calculate_deltas(world, timestep) {

       	// CALCULATE DELTAS
		LithosphereModeling.get_erosion(
			world.displacement, sealevel, timestep,
			material_density, surface_gravity,
			world.top_crust, world.erosion, world.crust_scratch
		);
		Crust.assert_conserved_transport_delta(world.erosion, 1e-2); 

       	// CALCULATE DELTAS
		LithosphereModeling.get_weathering(
			world.displacement, sealevel, timestep,
			material_density, surface_gravity,
			world.top_crust, world.weathering, world.crust_scratch
		);
		Crust.assert_conserved_reaction_delta(world.weathering, 1e-2); 

       	// CALCULATE DELTAS
		LithosphereModeling.get_lithification(
			world.displacement, sealevel, timestep,
			material_density, surface_gravity,
			world.top_crust, world.lithification, world.crust_scratch
		);
		Crust.assert_conserved_reaction_delta(world.lithification, 1e-2); 

       	// CALCULATE DELTAS
		LithosphereModeling.get_metamorphosis(
			world.displacement, sealevel, timestep,
			material_density, surface_gravity,
			world.top_crust, world.metamorphosis, world.crust_scratch
		);
		Crust.assert_conserved_reaction_delta(world.metamorphosis, 1e-2); 

		// COMPILE DELTAS
		var globalized_deltas = world.crust_delta;
		Crust.reset 			(globalized_deltas);
		Crust.add_delta 		(globalized_deltas, world.erosion, 						globalized_deltas);
		Crust.add_delta 		(globalized_deltas, world.weathering, 					globalized_deltas);
		Crust.add_delta 		(globalized_deltas, world.lithification,				globalized_deltas);
		Crust.add_delta 		(globalized_deltas, world.metamorphosis,				globalized_deltas);
		Crust.add_delta 		(globalized_deltas, world.accretion,					globalized_deltas);
		ScalarField.add_scalar 	(globalized_deltas.age, timestep, 						globalized_deltas.age); // aging
	}

	function integrate_deltas(world, plates) { 
		// INTEGRATE DELTAS


	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('integrate_deltas');
	  	
	  	var top_plate_map = world.top_plate_map;

		var localized_is_on_top = scratchpad.getUint8Raster(grid);
		var globalized_is_on_top = scratchpad.getUint8Raster(grid);
		var scratch_f32 = scratchpad.getFloat32Raster(grid);

		var resample_ui8 = Uint8Raster.get_ids;
		var equals = Uint8Field.eq_scalar;
		
		var resample_crust 	= Crust.get_ids;
		var mult_crust 		= Crust.mult_field;
        var fix_crust_delta	= Crust.fix_delta;
       	var add_crust_delta	= Crust.add_delta;

	  	var plate; 
		var global_ids_of_local_cells;
		var local_ids_of_global_cells;
		var globalized_deltas = world.crust_delta;
		var localized_deltas = world.crust_scratch;

		Crust.add_delta(world.total_crust, world.crust_delta, world.total_crust);

		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

		    global_ids_of_local_cells = plate.global_ids_of_local_cells;
		    local_ids_of_global_cells = plate.local_ids_of_global_cells;

			equals 			(top_plate_map, i, 												globalized_is_on_top);

			// filter the global delta map where plate is on top, 
			// then map cells 1-to-many from global delta map to local delta map (adding together effects when cell is mentioned twice)
			// then apply the local delta map
        	// this method retains positive mass, and appears to give the best results of any method attempted so far
			mult_crust 		(globalized_deltas, globalized_is_on_top, 					world.crust_scratch);
			Crust.add_values_to_ids(plate.crust, local_ids_of_global_cells, world.crust_scratch, plate.crust);
		}

	  	scratchpad.deallocate('integrate_deltas');

	}

	this.resetPlates = function() {
		// get plate masks from image segmentation of asthenosphere velocity
		update_calculated_fields(this);

		var pressure = LithosphereModeling.get_asthenosphere_pressure(this.buoyancy);
		LithosphereModeling.get_asthenosphere_velocity(pressure, this.asthenosphere_velocity);
		var angular_velocity = VectorField.cross_vector_field(this.asthenosphere_velocity, grid.pos);
		var top_plate_map = LithosphereModeling.get_plate_map(angular_velocity, 7, 200);
		var plate_ids = Uint8Dataset.unique(top_plate_map);
		this.plates = [];

		var plate;
		// TODO: overwrite plates instead of creating new ones, create separate function for plate initialization
		for (var i = 0, li = plate_ids.length; i < li; ++i) {
			var mask = Uint8Field.eq_scalar(top_plate_map, plate_ids[i]);

			plate = new Plate({
				grid: 	grid,
				mask: 	mask,
			})
			Crust.copy(this.total_crust, plate.crust);

			this.plates.push(plate);
		}
	};

	function assert_dependencies() {
		sealevel 			|| stop('"sealevel" not provided');
		material_density 	|| stop('"material_density" not provided');
		material_viscosity 	|| stop('"material_viscosity" not provided');
	}

	this.setDependencies = function(dependencies) {
		surface_gravity 	= dependencies['surface_gravity'] 	|| surface_gravity;
		sealevel 			= dependencies['sealevel'] 			|| sealevel;
		material_density 	= dependencies['material_density'] 	|| material_density;
		material_viscosity	= dependencies['material_viscosity']|| material_viscosity;
	};

	this.initialize = function() { 
		update_calculated_fields(this); 					// this creates world maps for things like density and elevation

		this.average_conserved_per_cell = Crust.get_average_conserved_per_cell(this.total_crust);
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();
		calculate_deltas		(this, timestep); 			// this creates a world map of all additions and subtractions to crust (e.g. from erosion, accretion, etc.)
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};

		assert_dependencies();

		integrate_deltas 		(this, this.plates); 		// this uses the map above in order to add and subtract crust

		move_plates 			(this.plates, timestep); 	// this performs the actual plate movement
		this.supercontinentCycle.update(timestep); 			// this periodically splits the world into plates
		update_calculated_plate_fields(this, this.plates); 	// this calculates properties for each plate, like density
		merge_plates_to_master	(this.plates, this); 		// this stitches plates together to create a world map
		update_calculated_fields(this); 					// this creates world maps for things like density and elevation
		update_rifting			(this, this.plates); 		// this identifies rifting regions on the world map and adds crust to plates where needed
		update_subducted 		(this, this.plates); 		// this identifies detaching regions on the world map and then removes crust from plates where needed
	};
}
