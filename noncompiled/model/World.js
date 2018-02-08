'use strict';


var World = (function() {
	function World(parameters) {
		Crust.call(this, parameters);

		this.getRandomPlateSpeed = parameters['getRandomPlateSpeed'] ||
			//function() { return Math.exp(random.normal(-5.13, 0.548)); }
			function() { return random.normal(0.00687, 0.00380); }
			//^^^ log normal and normal distribution fit to angular velocities from Larson et al. 1997

		this.supercontinentCycle = parameters['supercontinentCycle'] || new SupercontinentCycle(this, parameters);

		this.subductability = Float32Raster(this.grid);
		this.plate_map = Uint8Raster(this.grid);
		this.plate_count = Uint8Raster(this.grid);
		this.asthenosphere_velocity = VectorRaster(this.grid);
		this.meanAnomaly = parameters['meanAnomaly'] || 0;

		// this.radius = parameters['radius'] || 6367;
		// this.age = parameters['age'] || 0;
		// this.maxPlatesNum = parameters['platesNum'] || 8;

		this.plates = [];
	}
	World.prototype = Object.create(Crust);
	World.prototype.constructor = World;

	function merge_plates_to_master(plates, master) {

		var UINT8_NULL = 255;
		var UINT16_NULL = 65535;

		var fill_f32 = Float32Raster.fill;
		var fill_ui8 = Uint8Raster.fill;

		//WIPE MASTER RASTERS CLEAN
		Crust.fill(master, new RockColumn({ density: master.ocean.density }));
		fill_ui8(master.plate_map, UINT8_NULL);
		fill_ui8(master.plate_count, 0);

	  	var plate; 
		
		var master_subductability = Float32Raster(master.grid); 
		fill_f32(master_subductability, 9999);

		//local variables
		var local_pos_of_global_cells = VectorRaster(master.grid); 
		var local_ids_of_global_cells; 

		//global variables
		var globalized_is_on_top = Uint8Raster(master.grid);
		var globalized_plate_mask = Uint8Raster(master.grid); 
		var global_ids_of_local_cells; 

		// float32array used for temporary storage of globalized scalar fields
		// this is used for performance reasons
		var globalized_scalar_field = Float32Raster(master.grid); 


		var fill = Uint8Raster.fill;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var copy_into = Float32RasterGraphics.copy_into_selection;
		var add_term = ScalarField.add_field_term;
		var add_ui8 = Uint8Field.add_field
		var resample = Float32Raster.get_ids;
		var resample_ui8 = Uint8Raster.get_ids;
		var and = BinaryMorphology.intersection;
		var lt = ScalarField.lt_field;

		fill(globalized_is_on_top, 1);
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i]; 

	    	local_ids_of_global_cells = plate.local_ids_of_global_cells;
	    	global_ids_of_local_cells = plate.global_ids_of_local_cells;

	    	// generate globalized_plate_mask
	    	// this raster indicates whether the plate exists in a region of the planet
	    	// this raster will be used when merging other rasters
		    resample_ui8(plate.mask, local_ids_of_global_cells, 								globalized_plate_mask); 

		    // generate globalized_is_on_top
		    // this raster indicates whether the plate is viewable from space
		    // this raster will be used when merging other fields
		    update_calculated_fields(plate);

		    resample 	(plate.subductability,		 local_ids_of_global_cells, 				globalized_scalar_field);
		    lt 			(globalized_scalar_field,	 master_subductability,						globalized_is_on_top);
		    and 		(globalized_is_on_top,		 globalized_plate_mask, 					globalized_is_on_top);
		    copy_into 	(master_subductability,	 globalized_scalar_field, globalized_is_on_top, master_subductability);

		    // merge plates with master
		    // set plate_mask to current plate's index where current plate is on top
		    fill_into 	(master.plate_map, i, globalized_is_on_top, 							master.plate_map);
		    
		    // add 1 to master.plate_count where current plate exists
		    add_ui8 	(master.plate_count, globalized_plate_mask, 							master.plate_count);

		    // add current plate sial to master sial wherever current plate exists
		    resample 	(plate.sial, local_ids_of_global_cells, 								globalized_scalar_field);
		    add_term 	(master.sial, globalized_scalar_field, globalized_plate_mask, 			master.sial);

		    // add current plate sediment to master sediment wherever current plate exists
		    resample 	(plate.sediment, local_ids_of_global_cells, 							globalized_scalar_field);
		    add_term 	(master.sediment, globalized_scalar_field, globalized_plate_mask, 		master.sediment);

		    // overwrite master wherever current plate is on top
		    resample 	(plate.sima, local_ids_of_global_cells, 								globalized_scalar_field);
		    copy_into 	(master.sima, globalized_scalar_field, globalized_is_on_top, 			master.sima);

		    // overwrite master wherever current plate is on top
		    resample 	(plate.age, local_ids_of_global_cells, 									globalized_scalar_field);
		    copy_into 	(master.age, globalized_scalar_field, globalized_is_on_top, 			master.age);
		}
		update_calculated_fields(master);
	}
	function update_plates(world, timestep, plates) { 
	  	var plate; 
	  	var plate_count = world.plate_count;
	  	var plate_map = world.plate_map;
	  	var displacement = world.displacement;
	  	var ocean = world.ocean;

	  	var grid = plate_count.grid;

	  	//rifting variables
		var localized_is_riftable = Uint8Raster(grid);
		var localized_is_detachable = Uint8Raster(grid);
		var localized_will_stay_riftable = Uint8Raster(grid);
		var localized_will_stay_detachable = Uint8Raster(grid);
		var localized_is_just_outside_border = Uint8Raster(grid);
		var localized_is_rifting = Uint8Raster(grid);
		
		//detaching variables
		var localized_is_on_top = Uint8Raster(grid);
		var localized_is_on_bottom = Uint8Raster(grid);
		var localized_will_stay_on_bottom = Uint8Raster(grid);
		var localized_is_just_inside_border = Uint8Raster(grid);
		var localized_is_detaching = Uint8Raster(grid);

		var local_pos_of_global_cells = VectorRaster(grid); 
		var localized_subductability = Float32Raster(grid); 
		var localized_erosion = Float32Raster(grid); 
		var localized_accretion = Float32Raster(grid); 

		//global rifting/detaching variables
		var globalized_is_empty = Uint8Raster(grid);
		var globalized_is_alone = Uint8Raster(grid);
		var globalized_is_not_alone = Uint8Raster(grid);
		var globalized_is_riftable = Uint8Raster(grid);
		var globalized_is_detachable = Uint8Raster(grid);
		var globalized_is_on_top = Uint8Raster(grid);
		var globalized_is_not_on_top = Uint8Raster(grid);
		var globalized_is_on_top_or_empty = Uint8Raster(grid);
		var globalized_is_on_bottom = Uint8Raster(grid);
		var globalized_is_rifting = Uint8Raster(grid); 
		var globalized_is_detaching = Uint8Raster(grid); 

		var globalized_plate_mask = Uint8Raster(grid); 
		var global_pos_of_local_cells = VectorRaster(grid);
		var globalized_scalar_field = Float32Raster(grid); 
		

		var mult_field = ScalarField.mult_field;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var fill_into_crust = Crust.fill_into_selection;
		var copy = Uint8Raster.copy;
		var resample = Uint8Raster.get_ids;
		var resample_f32 = Float32Raster.get_ids;
		var margin = BinaryMorphology.margin;
		var padding = BinaryMorphology.padding;
		var or = BinaryMorphology.union;
		var and = BinaryMorphology.intersection;
		var erode = BinaryMorphology.erosion;
		var not = BinaryMorphology.negation;
		var equals = Uint8Field.eq_scalar;
		var gt_f32 = ScalarField.gt_scalar;
		var gt_ui8 = Uint8Field.gt_scalar;
		var global_ids_of_local_cells, local_ids_of_global_cells;
		var add_term = ScalarField.add_field_term;
		var add = ScalarField.add_field;
		var min = ScalarField.min_field;
		var max = ScalarField.max_scalar;
		var fix_nonnegative_quantity_delta = Float32Raster.fix_nonnegative_quantity_delta;
		var assert_nonnegative_quantity = Float32Raster.assert_nonnegative_quantity;

		var globalized_accretion = Float32Raster(grid); 
		Float32Raster.fill(globalized_accretion, 0);
		var sial_erosion = Float32Raster(grid);
		var sima_erosion = Float32Raster(grid);
		var sediment_erosion = Float32Raster(grid);
		// TectonicsModeling.get_erosion(displacement, world.SEALEVEL, timestep, sial_erosion, globalized_scalar_field);
		TectonicsModeling.get_erosion(
			displacement, 		world.SEALEVEL, 	timestep,
			world.sediment, 	world.sial, 	world.sima, 
			sediment_erosion, 	sial_erosion, 	sima_erosion, 
			globalized_scalar_field
		);

		var RIFT = true;
		var DETACH = true;
		var ERODE = true;
		var ACCRETE = true;

	    //shared variables for detaching and rifting
		// op 	operands																result
		equals 	(plate_count, 0, 														globalized_is_empty);
		equals 	(plate_count, 1, 														globalized_is_alone);
		not		(globalized_is_alone, 													globalized_is_not_alone);
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

		    local_ids_of_global_cells = plate.local_ids_of_global_cells;
		    global_ids_of_local_cells = plate.global_ids_of_local_cells;

	 		localized_subductability = plate.subductability;

		    //shared variables for detaching and rifting
			// op 	operands															result
			equals 	(plate_map, i, 														globalized_is_on_top);
		    not 	(globalized_is_on_top, 												globalized_is_not_on_top);

		    //detect rifting
		    // is_riftable: count == 0 or (count = 1 and top_plate = i)
			and 	(globalized_is_alone, globalized_is_on_top, 						globalized_is_riftable);
			or 		(globalized_is_riftable, globalized_is_empty, 						globalized_is_riftable);

            resample(globalized_is_riftable, global_ids_of_local_cells, 				localized_is_riftable);
		    erode	(localized_is_riftable, 1, 											localized_will_stay_riftable);
		    margin	(plate.mask, 1, 													localized_is_just_outside_border);
		    and 	(localized_will_stay_riftable, localized_is_just_outside_border,	localized_is_rifting);

		    //detect detachment
			// is_detachable: count > 1 and top_plate != i
		    and 	(globalized_is_not_alone, globalized_is_not_on_top,					globalized_is_detachable);

            resample(globalized_is_detachable, global_ids_of_local_cells, 				localized_is_detachable);
            erode	(localized_is_detachable, 1,										localized_will_stay_detachable);
		    padding (plate.mask, 1, 													localized_is_just_inside_border);
        	gt_f32	(localized_subductability, 0.5, 									localized_is_detachable);//todo: set this to higher threshold
		    and 	(localized_will_stay_detachable, localized_is_just_inside_border, 	localized_is_detaching);
		    and 	(localized_is_detaching, localized_is_detachable, 					localized_is_detaching);

	        //rift 
	        if(RIFT){
		        fill_into(plate.mask, 1, localized_is_rifting,                 			plate.mask); 
		        fill_into_crust(plate, ocean, localized_is_rifting, plate);
	        }
	        //detach
	        if(DETACH){
		        fill_into(plate.mask, 1, localized_is_detaching,                 		plate.mask); 
		        //accrete, part 1
		        if(ACCRETE) {
		        	mult_field	(plate.sial, localized_is_detaching,					localized_accretion);
	            	resample_f32(localized_accretion, local_ids_of_global_cells,		globalized_scalar_field);
	            	add 		(globalized_accretion, globalized_scalar_field, 		globalized_accretion);

		        	mult_field	(plate.sediment, localized_is_detaching,				localized_accretion);
	            	resample_f32(localized_accretion, local_ids_of_global_cells,		globalized_scalar_field);
	            	add 		(globalized_accretion, globalized_scalar_field, 		globalized_accretion);
		        }
	        }
	        //erode
	        if(ERODE) {
            	resample_f32(sial_erosion, global_ids_of_local_cells,				localized_erosion);
            	resample 	(globalized_is_on_top, global_ids_of_local_cells,			localized_is_on_top);

		        // enforce constraint: erosion should never exceed amount of rock available
		        // get_erosion() guarantees against this, but plate motion sometimes causes violations to this constraint
		        // violations to constraint are usually small, so we just modify erosion after the fact to preserve the constraint
		        fix_nonnegative_quantity_delta 
		        			(localized_erosion, plate.sial, 							localized_erosion);
		        // assert_nonnegative_quantity(plate.sial);
	        	add_term 	(plate.sial, localized_erosion, localized_is_on_top,		plate.sial);
		        // assert_nonnegative_quantity(plate.sial);
	        }


	        //aging
			ScalarField.add_scalar(plate.age, timestep, 								plate.age);
		}
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

		    local_ids_of_global_cells = plate.local_ids_of_global_cells;
		    global_ids_of_local_cells = plate.global_ids_of_local_cells;

	        //accrete, part 2
	        if(ACCRETE) {
            	resample 	(globalized_is_on_top, global_ids_of_local_cells,			localized_is_on_top);
            	resample_f32(globalized_accretion, global_ids_of_local_cells,			localized_accretion);
	        	add_term 	(plate.sial, localized_accretion, localized_is_on_top,		plate.sial);
	        }
		}
	}

	World.prototype.SEALEVEL = 3682;
	World.prototype.mantleDensity=3300;
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
		var pressure = TectonicsModeling.get_asthenosphere_pressure(this.subductability);
		TectonicsModeling.get_asthenosphere_velocity(pressure, this.asthenosphere_velocity);
		var angular_velocity = VectorField.cross_vector_field(this.asthenosphere_velocity, this.grid.pos);
		var plate_map = TectonicsModeling.get_plate_map(angular_velocity, 7, 200);
		var plate_ids = Uint8Dataset.unique(plate_map);
		this.plates = [];

		var plate;
		// TODO: overwrite plates instead of creating new ones, create separate function for plate initialization
		for (var i = 0, li = plate_ids.length; i < li; ++i) {
			var mask = Uint8Field.eq_scalar(plate_map, plate_ids[i]);

			//TODO: comment this out when you're done
			var eulerPole = VectorDataset.weighted_average(angular_velocity, mask)
			//TODO: fix it properly - no negation!
			Vector.normalize(-eulerPole.x, -eulerPole.y, -eulerPole.z, eulerPole); 

			plate = new Plate({
				world: 	this,
				mask: 	mask,
				eulerPole: eulerPole
			})
			Crust.copy(this, plate);

			// TODO: see if you can't get this to reflect relative magnitude of average surface asthenosphere velocity
			plate.angularSpeed = this.getRandomPlateSpeed();

			this.plates.push(plate);
		}
	};

	// update fields that are derived from others
	function update_calculated_fields(crust) {
		TectonicsModeling.get_thickness(crust.sima, crust.sial, crust.sediment, crust.thickness);
		TectonicsModeling.get_density(crust.sima, crust.sial, crust.sediment, crust.age, crust.density);
		TectonicsModeling.get_subductability(crust.density, crust.subductability);
		TectonicsModeling.get_displacement(crust.thickness, crust.density, world.mantleDensity, crust.displacement);
	}
	World.prototype.update = function(timestep){
		if (timestep === 0) {
			return;
		};


	 	for (var i = 0; i < this.plates.length; i++) {
	 		this.plates[i].move(timestep)
	 	}
		update_calculated_fields(this);
		this.supercontinentCycle.update(timestep);
		merge_plates_to_master(this.plates, this);
		update_plates(this, timestep, this.plates);

		// World submodels go here: atmo model, hydro model, bio model, etc.
	};
	return World;
})();
