'use strict';

var World = (function() {
	function World(parameters) {
		this.grid = parameters['grid'] || stop('missing parameter: "grid"');

		this.getRandomPlateSpeed = parameters['getRandomPlateSpeed'] ||
			//function() { return Math.exp(random.normal(-5.13, 0.548)); }
			function() { return random.normal(0.00687, 0.00380); }
			//^^^ log normal and normal distribution fit to angular velocities from Larson et al. 1997

		this.supercontinentCycle = parameters['supercontinentCycle'] || new SupercontinentCycle(this, parameters);

		this.meanAnomaly 		= parameters['meanAnomaly'] || 0;

		// this.radius = parameters['radius'] || 6367;
		// this.age = parameters['age'] || 0;
		// this.maxPlatesNum = parameters['platesNum'] || 8;

		// The following are fields that are derived from other fields:
		this.displacement 		= Float32Raster(this.grid);
		// "displacement is the height of the crust relative to an arbitrary datum level
		// It is not called "elevation" to emphasize that it is not relative to sea level
		this.thickness 			= Float32Raster(this.grid);
		// the thickness of the crust in km
		this.density 			= Float32Raster(this.grid);
		// the average density of the crust, in kg/m^3
		this.plate_count 		= Uint8Raster(this.grid);
		// the number of plates occupying a cell
		this.asthenosphere_velocity = VectorRaster(this.grid);
		// the velocity of the asthenosphere
		this.is_detaching 		= Uint8Raster(this.grid);
		// indicates whether detachment is occuring 

		this.debug 				= Float32Raster(this.grid);

		this.top_plate_map 		= Uint8Raster(this.grid);
		this.top_crust 			= new Crust({grid: this.grid});
		this.top_crust_delta 	= new Crust({grid: this.grid});
		this.top_crust_scratch 	= new Crust({grid: this.grid});

		this.bottom_plate_map 	= Uint8Raster(this.grid);
		this.bottom_crust 		= new Crust({grid: this.grid});
		this.bottom_crust_delta = new Crust({grid: this.grid});
		this.bottom_crust_scratch = new Crust({grid: this.grid});

		this.total_crust 		= new Crust({grid: this.grid});

		this.misc_crust_scratch = new Crust({grid: this.grid});

		this.plates = [];
	}

	function move_plates(plates, timestep) {
		for (var i=0, li=plates.length; i<li; ++i) {
	 		plates[i].move(timestep);
	 	}
	}
    // calculate derived properties for plates
	function update_calculated_plate_fields(plates, scratch) { 
		var plate_thickness = scratch || Float32Raster(plates[0].grid); 

	    var get_density = Crust.get_density; 
	    var sum_mass_pools = Crust.sum_mass_pools; 
	    
		var plate;
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i]; 
            sum_mass_pools	(plate.crust, 															plate_thickness); 
            get_density		(plate.crust, plate_thickness,											plate.density); 
	 	}
	}
	// update fields that are derived from others
	function update_calculated_fields(world) {
		Crust.sum_mass_pools				(world.total_crust, 									world.thickness);
		Crust.get_density 					(world.total_crust, world.thickness,					world.density);
		TectonicsModeling.get_displacement 	(world.thickness, world.density, world.mantleDensity, 	world.displacement);
	}
	function merge_plates_to_master(plates, master) {
	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('merge_plates_to_master');

		var UINT8_NULL = 255;
		var UINT16_NULL = 65535;

		//WIPE MASTER RASTERS CLEAN
		Crust.reset(master.total_crust);
		Crust.reset(master.top_crust);
		Crust.reset(master.bottom_crust);
		Uint8Raster.fill(master.top_plate_map, UINT8_NULL);
		Uint8Raster.fill(master.bottom_plate_map, UINT8_NULL);
		Uint8Raster.fill(master.plate_count, 0);

		
		var master_density = master.density; 
		Float32Raster.fill(master_density, Infinity);

		//local variables
		var local_ids_of_global_cells; 

		//global variables
		var globalized_is_on_top 	= scratchpad.getUint8Raster(master.grid);
		var globalized_is_not_on_top = scratchpad.getUint8Raster(master.grid);
		var globalized_plate_mask 	= scratchpad.getUint8Raster(master.grid); 
		var global_ids_of_local_cells; 

		// float32array used for temporary storage of globalized scalar fields
		// this is used for performance reasons
		var globalized_plate_density = scratchpad.getFloat32Raster(master.grid); 
		var plate_thickness = scratchpad.getFloat32Raster(master.grid); 

		var globalized_plate_crust = master.misc_crust_scratch;

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
		    resample_f32(plate.density,		 		local_ids_of_global_cells, 							globalized_plate_density);
		    lt 			(globalized_plate_density,	master_density,										globalized_is_on_top);
		    and 		(globalized_is_on_top,		globalized_plate_mask,	 							globalized_is_on_top);

		    // update master density 
		    copy_into 	(master_density,	 		globalized_plate_density, globalized_is_on_top, 	master_density);

		    // merge plates with master
		    // set plate_mask to current plate's index where current plate is on top
		    fill_into 	(master.top_plate_map, i, globalized_is_on_top, 								master.top_plate_map);
		    
		    // add 1 to master.plate_count where current plate exists
		    add_ui8 	(master.plate_count, globalized_plate_mask, 									master.plate_count);

		    resample_crust(plate.crust, local_ids_of_global_cells, 										globalized_plate_crust);
		    overlap_crust (master.total_crust, globalized_plate_crust, globalized_plate_mask, globalized_is_on_top, master.total_crust);

			Crust.copy_into_selection(master.top_crust, globalized_plate_crust, globalized_is_on_top, 	master.top_crust);
		}
	  	
		// now that top plate is determined, we can figure out which plate(s) are on the bottom
		// NOTE: 3-way plate collision results in undefined behavior - it is not certain which plate will wind up in bottom_plate_map
		var equals = Uint8Field.eq_scalar;
		var diff = BinaryMorphology.difference;
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i]; 
	    	local_ids_of_global_cells = plate.local_ids_of_global_cells;

			// find places where plate is not on top
		    resample_ui8(plate.mask, local_ids_of_global_cells, 										globalized_plate_mask); 	
			equals 		(master.top_plate_map, i,                             							globalized_is_on_top);	
		    diff 		(globalized_plate_mask, globalized_is_on_top,	 								globalized_is_not_on_top);	

		    resample_crust(plate.crust, local_ids_of_global_cells, 										globalized_plate_crust);	

		    // set master.bottom_crust and master.bottom_plate_map
			Crust.copy_into_selection(master.bottom_crust, globalized_plate_crust, globalized_is_not_on_top, master.bottom_crust);	
		    fill_into 	(master.bottom_plate_map, i, globalized_is_not_on_top, 							master.bottom_plate_map);
		}
	  	scratchpad.deallocate('merge_plates_to_master');
	}

	function rift(world, plates) { 
	  	var top_plate_map = world.top_plate_map;
	  	var ocean = world.ocean;
	  	var grid = world.grid;

	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('rift');

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
			equals 	(top_plate_map, i,                             						globalized_is_on_top); 
			and 	(globalized_is_alone, globalized_is_on_top,         				globalized_is_riftable); 
			or 		(globalized_is_riftable, globalized_is_empty,       				globalized_is_riftable); 

			resample(globalized_is_riftable, plate.global_ids_of_local_cells,       	localized_is_riftable); 
			erode 	(localized_is_riftable, 1,                       					localized_will_stay_riftable,     scratch_ui8); 
			margin 	(plate.mask, 1,                           							localized_is_just_outside_border, scratch_ui8); 
			and 	(localized_will_stay_riftable, localized_is_just_outside_border,  	localized_is_rifting); 

	        fill_into(plate.mask, 1, localized_is_rifting,                 				plate.mask); 
	        fill_into_crust(plate.crust, ocean, localized_is_rifting, 					plate.crust);
		}

	  	scratchpad.deallocate('rift');
	} 
	function detach_and_accrete(world, plates) {
	  	var top_plate_map = world.top_plate_map;
	  	var grid = world.grid;

		Uint8Raster.fill(world.is_detaching, 0);

	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('detach_and_accrete');

	  	//rifting/detaching variables
		var localized_is_detachable = scratchpad.getUint8Raster(grid);
		var localized_will_stay_detachable = scratchpad.getUint8Raster(grid);
		var localized_is_just_inside_border = scratchpad.getUint8Raster(grid);
		var localized_is_detaching = scratchpad.getUint8Raster(grid);

		var localized_scratch_ui8 = scratchpad.getUint8Raster(grid); 

		//global rifting/detaching variables
		var globalized_is_not_alone = scratchpad.getUint8Raster(grid);
		var globalized_is_detachable = scratchpad.getUint8Raster(grid);
		var globalized_is_detaching = scratchpad.getUint8Raster(grid);
		var globalized_is_not_on_top = scratchpad.getUint8Raster(grid);

		var globalized_scalar_field = scratchpad.getFloat32Raster(grid); 

		var mult_field = ScalarField.mult_field;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var resample_ui8 = Uint8Raster.get_ids;
		var resample_f32 = Float32Raster.get_ids;
		var padding = BinaryMorphology.padding;
		var and = BinaryMorphology.intersection;
		var or = BinaryMorphology.union;
		var erode = BinaryMorphology.erosion;
		var not_equals = Uint8Field.ne_scalar;
		var gt_f32 = ScalarField.gt_scalar;
		var add = ScalarField.add_field;


		//				 op 	operands													result
		not_equals 		(world.plate_count, 1, 												globalized_is_not_alone);

		var plate = plates[0];
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

			not_equals 	(top_plate_map, i, 													globalized_is_not_on_top);

		    //detect detachment
			// is_detachable: count > 1 and top_plate != i
		    or 	 		(globalized_is_not_alone, globalized_is_not_on_top,					globalized_is_detachable);

            resample_ui8(globalized_is_detachable, plate.global_ids_of_local_cells, 		localized_is_detachable);
            erode		(localized_is_detachable, 1,										localized_will_stay_detachable, 	localized_scratch_ui8);
		    padding 	(plate.mask, 1, 													localized_is_just_inside_border, 	localized_scratch_ui8);
        	gt_f32		(plate.density, world.mantleDensity,								localized_is_detachable);
		    and 		(localized_will_stay_detachable, localized_is_just_inside_border, 	localized_is_detaching);
		    and 		(localized_is_detaching, localized_is_detachable, 					localized_is_detaching);

	        fill_into 	(plate.mask, 0, localized_is_detaching,                 			plate.mask); 
        	resample_ui8(localized_is_detaching, plate.local_ids_of_global_cells,			globalized_is_detaching);
        	or 			(world.is_detaching, globalized_is_detaching,  						world.is_detaching);
		}

	  	scratchpad.deallocate('detach_and_accrete');
	}
	function calculate_deltas(world, timestep) {
		Crust.reset 			(world.top_crust_delta);
		Crust.reset 			(world.bottom_crust_delta);

       	// CALCULATE DELTAS
       	// erosion
		TectonicsModeling.get_erosion(
			world.displacement, world.SEALEVEL, timestep,
			world.top_crust, world.top_crust_scratch, world.misc_crust_scratch
		);
		Crust.assert_conserved_transport_delta(world.top_crust_scratch, 1e-2); 
		Crust.add_delta (world.top_crust_delta, world.top_crust_scratch, 				world.top_crust_delta);

       	// weathering
		TectonicsModeling.get_weathering(
			world.displacement, world.SEALEVEL, timestep,
			world.top_crust, world.top_crust_scratch, world.misc_crust_scratch
		);
		Crust.assert_conserved_reaction_delta(world.top_crust_scratch, 1e-2); 
		Crust.add_delta (world.top_crust_delta, world.top_crust_scratch, 				world.top_crust_delta);

       	// lithification
		TectonicsModeling.get_lithification(
			world.displacement, world.SEALEVEL, timestep,
			world.top_crust, world.top_crust_scratch, world.misc_crust_scratch
		);
		Crust.assert_conserved_reaction_delta(world.top_crust_scratch, 1e-2); 
		Crust.add_delta (world.top_crust_delta, world.top_crust_scratch, 				world.top_crust_delta);

       	// metamorphosis
		TectonicsModeling.get_metamorphosis(
			world.displacement, world.SEALEVEL, timestep,
			world.top_crust, world.top_crust_scratch, 
			world.bottom_crust, world.bottom_crust_scratch, 
			world.misc_crust_scratch
		);
		Crust.assert_conserved_reaction_delta(world.top_crust_scratch, 1e-2); 
		Crust.add_delta (world.top_crust_delta, world.top_crust_scratch, 				world.top_crust_delta);
		Crust.assert_conserved_reaction_delta(world.bottom_crust_scratch, 1e-2); 
		Crust.add_delta (world.bottom_crust_delta, world.bottom_crust_scratch,			world.bottom_crust_delta);

	    // NOTE: calculate nonconserved deltas last! Doing so will allow us to call assertions on the sum of conserved deltas!

        // accretion
        Crust.reset 				(world.top_crust_scratch);
        Crust.sum_conserved_pools	(world.bottom_crust, 									world.top_crust_scratch.sial);
    	ScalarField.mult_field		(world.top_crust_scratch.sial, world.is_detaching,		world.top_crust_scratch.sial);
    	ScalarField.min_scalar		(world.top_crust_scratch.sial, 0,						world.top_crust_scratch.sial);
		Crust.add_delta 			(world.top_crust_delta, world.top_crust_scratch, 		world.top_crust_delta);

		// aging
		ScalarField.add_scalar 		(world.top_crust_delta.age, timestep, 					world.top_crust_delta.age); 
		ScalarField.add_scalar 		(world.bottom_crust_delta.age, timestep, 				world.bottom_crust_delta.age); 
	}

	function integrate_deltas(world, plates) { 
		// INTEGRATE DELTAS

	  	var grid = world.grid;

	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('integrate_deltas');
	  	
	  	var top_plate_map = world.top_plate_map;
	  	var bottom_plate_map = world.top_plate_map;

		var globalized_is_on_top = scratchpad.getUint8Raster(grid);
		var globalized_is_on_bottom = scratchpad.getUint8Raster(grid);

		var equals = Uint8Field.eq_scalar;
		var mult_crust 		= Crust.mult_field;

	  	var plate; 
		var local_ids_of_global_cells;
		var globalized_top_deltas = world.top_crust_delta;
		var globalized_bottom_deltas = world.bottom_crust_delta;

		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

		    local_ids_of_global_cells = plate.local_ids_of_global_cells;

			// filter the global delta map where plate is on top, 
			// then map cells 1-to-many from global delta map to local delta map (adding together effects when cell is mentioned twice)
			// then apply the local delta map
        	// // retains positive mass, and appears to give the best results of any method attempted so far
			equals 			(top_plate_map, i, 												globalized_is_on_top);
			mult_crust 		(globalized_top_deltas, globalized_is_on_top, 					world.misc_crust_scratch);
			Crust.add_values_to_ids(plate.crust, local_ids_of_global_cells, world.misc_crust_scratch, plate.crust);

			equals 			(bottom_plate_map, i, 											globalized_is_on_bottom);
			mult_crust 		(globalized_bottom_deltas, globalized_is_on_bottom, 			world.misc_crust_scratch);
			// Crust.add_values_to_ids(plate.crust, local_ids_of_global_cells, world.misc_crust_scratch, plate.crust);

			// Crust.fix_negatives (plate.crust);

		}

	  	scratchpad.deallocate('integrate_deltas');

	}

	World.prototype.SEALEVEL = 3682;
	World.prototype.mantleDensity=3075; // derived empirically using isostatic model
	World.prototype.waterDensity=1026;
	World.prototype.ocean = 
	 new RockColumn({
		elevation: 	-3682,	// Charette & Smith 2010
		sima: 		7100, 	// +/- 800, White McKenzie and O'nions 1992
		// sial: 		100, // This can be set above zero to "cheat" on sial mass conservation
		// thickness: 	7100, 	// +/- 800, White McKenzie and O'nions 1992
		density: 	2890	// Carlson & Raskin 1984
	 });

	World.prototype.resetPlates = function() {
		// get plate masks from image segmentation of asthenosphere velocity
		update_calculated_fields(this);
		var pressure = TectonicsModeling.get_asthenosphere_pressure(this.density);
		TectonicsModeling.get_asthenosphere_velocity(pressure, this.asthenosphere_velocity);
		var angular_velocity = VectorField.cross_vector_field(this.asthenosphere_velocity, this.grid.pos);
		var top_plate_map = TectonicsModeling.get_plate_map(angular_velocity, 7, 200);
		var plate_ids = Uint8Dataset.unique(top_plate_map);
		this.plates = [];

		var plate;
		// TODO: overwrite plates instead of creating new ones, create separate function for plate initialization
		for (var i = 0, li = plate_ids.length; i < li; ++i) {
			var mask = Uint8Field.eq_scalar(top_plate_map, plate_ids[i]);

			//TODO: comment this out when you're done
			var eulerPole = VectorDataset.weighted_average(angular_velocity, mask)
			//TODO: fix it properly - no negation!
			Vector.normalize(-eulerPole.x, -eulerPole.y, -eulerPole.z, eulerPole); 

			plate = new Plate({
				world: 	this,
				mask: 	mask,
				eulerPole: eulerPole
			})
			Crust.copy(this.total_crust, plate.crust);

			// TODO: see if you can't get this to reflect relative magnitude of average surface asthenosphere velocity
			plate.angularSpeed = this.getRandomPlateSpeed();

			this.plates.push(plate);
		}
	};

	World.prototype.update = function(timestep){
		if (timestep === 0) {
			return;
		};

		move_plates 			(this.plates, timestep); 	// this performs the actual plate movement
		this.supercontinentCycle.update(timestep); 			// this periodically splits the world into plates
		update_calculated_plate_fields(this.plates); 		// this calculates properties for each plate, like density
		merge_plates_to_master	(this.plates, this); 		// this stitches plates together to create a world map
		update_calculated_fields(this); 					// this creates world maps for things like density and elevation
		rift 					(this, this.plates); 		// this identifies rifting regions on the world map and adds crust to plates where needed
		detach_and_accrete 		(this, this.plates); 		// this identifies detaching regions on the world map and then removes crust from plates where needed
		calculate_deltas		(this, timestep); 			// this creates a world map of all additions and subtractions to crust (e.g. from erosion, accretion, etc.)
		integrate_deltas 		(this, this.plates); 		// this uses the map above in order to add and subtract crust
	};
	World.prototype.worldLoaded = function(timestep){
		merge_plates_to_master(this.plates, this);
	};
	return World;
})();
