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
		this.plate_masks = Uint8Raster(this.grid);
		this.plate_count = Uint8Raster(this.grid);
		this.is_rifting = Uint8Raster(this.grid);
		this.is_detaching = Uint8Raster(this.grid);
		this.asthenosphere_velocity = VectorRaster(this.grid);

		// this.radius = parameters['radius'] || 6367;
		// this.age = parameters['age'] || 0;
		// this.maxPlatesNum = parameters['platesNum'] || 8;

		this.plates = [];
	}
	World.prototype = Object.create(Crust);
	World.prototype.constructor = World;


	var subduction_min_age_threshold = 150;
	var subduction_max_age_threshold = 200;
	var subductability_transition_factor = 1/100;

	function lerp(a,b, x, result){
	    for (var i = 0, li = result.length; i < li; i++) {
			result[i] = a + x[i]*(b-a);
	    }
	    return result;
	}
	function smoothstep (edge0, edge1, x, result) {
		var fraction;
		var inverse_edge_distance = 1 / (edge1 - edge0);
	    for (var i = 0, li = result.length; i < li; i++) {
			fraction = (x[i] - edge0) * inverse_edge_distance;
			result[i] = fraction > 1.0? 1.0 : fraction < 0.0? 0.0 : fraction;
		}
		return result;
	}
	function heaviside_approximation(x, k) {
		return 2 / (1 + Math.exp(-k*x)) - 1;
		return x>0? 1: 0; 
	}

	function get_thickness(sima, sial, thickness) {
		return ScalarField.add_field(sima, sial, thickness);
	}
	function get_density(sima, sial, age, density) {
		density = density || Float32Raster(sima.grid);

		// NOTE: density does double duty for performance reasons
		var fraction_of_lifetime = density;
		var sima_density = density;

		smoothstep	(0, 250, age, 						fraction_of_lifetime);
		lerp		(2890, 3300, fraction_of_lifetime, 	density);

	    for (var i = 0, li = density.length; i < li; i++) {
	    	density[i] = sima[i] + sial[i] > 0? (sima[i] * sima_density[i] + sial[i] * 2700) / (sima[i] + sial[i]) : 2890;
	    }
	    return density;
	}

	function get_subductability(density, subductability) {
		var exp = Math.exp;
		for (var i=0, li=subductability.length; i<li; ++i) {
			subductability[i] = 2 / (1 + exp( -(density[i] - 3000) * subductability_transition_factor )) - 1;
		}
		return subductability;
	}

	function get_asthenosphere_velocity(subductability, output, scratch1, scratch2) {
		output = output || Float32Raster(subductability.grid);
		scratch1 = scratch1 || Float32Raster(subductability.grid);
		scratch2 = scratch2 || Float32Raster(subductability.grid);

		var diffused_subductability = scratch1;
		var scratch = scratch2;
		var smoothing_iterations =  15;
		Float32Raster.copy(subductability, diffused_subductability);
		var diffuse = ScalarField.diffusion_by_constant
		for (var i=0; i<smoothing_iterations; ++i) {
			diffuse(diffused_subductability, 1, diffused_subductability, scratch);
			// ScalarField.laplacian(diffused_subductability, laplacian);
			// ScalarField.add_field(diffused_subductability, laplacian, diffused_subductability);
		}

		ScalarField.gradient(diffused_subductability, output);

		return output;
	}
	function get_angular_velocity(velocity, pos, output) {
		return VectorField.cross_vector_field(velocity, pos, output);
	}
	// gets displacement using an isostatic model
	function get_displacement(thickness, density, mantleDensity, displacement) {
	 	var thickness_i, rootDepth;
	 	var inverse_mantle_density = 1 / mantleDensity;
	 	for(var i=0, li = displacement.length; i<li; i++){
	 		//Calculates elevation as a function of crust density. 
	 		//This was chosen as it only requires knowledge of crust density and thickness,  
	 		//which are relatively well known. 
	 		thickness_i = thickness[i]; 
	 		displacement[i] = thickness_i - thickness_i * density[i] * inverse_mantle_density;
	 	}
	 	return displacement;
	}
	function get_erosion(displacement, sealevel, timestep, erosion, scratch){
		erosion = erosion || Float32Raster(displacement.grid);
		scratch = scratch || Float32Raster(displacement.grid);

		var precipitation = 7.8e5;
		// ^^^ measured in meters of rain per million years
		// global land average from wikipedia
		var erosiveFactor = 1.8e-7; 
		// ^^^ the rate of erosion per the rate of rainfall in that place
		// measured in fraction of height difference per meters of rain per million years

		// NOTE: erosion array does double duty for performance reasons
		var height_difference = erosion;
		var water_height = scratch;
		ScalarField.max_scalar(displacement, sealevel, water_height);
		ScalarField.laplacian(water_height, height_difference);
		ScalarField.mult_scalar(height_difference, precipitation * timestep * erosiveFactor, erosion)
		return erosion;
	}
	function merge_plates_to_master(plates, master) {

		var UINT8_NULL = 255;
		var UINT16_NULL = 65535;

		var fill_f32 = Float32Raster.fill;
		var fill_ui8 = Uint8Raster.fill;

		//WIPE MASTER RASTERS CLEAN
		Crust.fill(master, new RockColumn({ density: master.ocean.density }));
		fill_ui8(master.plate_masks, UINT8_NULL);
		fill_ui8(master.plate_count, 0);
		fill_ui8(master.is_rifting, 0);
		fill_ui8(master.is_detaching, 0);

	  	var plate; 
		
		var master_subductability = Float32Raster(master.grid); 
		fill_f32(master_subductability, 9999);

		//local variables
		var localized_pos = VectorRaster(master.grid); 
		var localized_ids; 

		//global variables
		var globalized_is_on_top = Uint8Raster(master.grid);
		var globalized_plate_mask = Uint8Raster(master.grid); 

		// float32array used for temporary storage of globalized scalar fields
		// this is used for performance reasons
		var globalized_scalar_field = Float32Raster(master.grid); 


		var mult_matrix = VectorField.mult_matrix;
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

		    // find localized_ids
		    // for each cell in the master's grid, this raster indicates the id of the corresponding cell in the plate's grid
		    // this is used to convert between global and local coordinate systems
		    mult_matrix(master.grid.pos, plate.global_to_local_matrix.elements, 				localized_pos); 
	    	localized_ids = master.grid.getNearestIds(localized_pos);

	    	// generate globalized_plate_mask
	    	// this raster indicates whether the plate exists in a region of the planet
	    	// this raster will be used when merging other rasters
		    resample_ui8(plate.mask, localized_ids, 											globalized_plate_mask); 

		    // generate globalized_is_on_top
		    // this raster indicates whether the plate is viewable from space
		    // this raster will be used when merging other fields
		    update_calculated_fields(plate);

		    resample 	(plate.subductability,		 localized_ids, 							globalized_scalar_field);
		    lt 			(globalized_scalar_field,	 master_subductability,						globalized_is_on_top);
		    and 		(globalized_is_on_top,		 globalized_plate_mask, 					globalized_is_on_top);
		    copy_into 	(master_subductability,	 globalized_scalar_field, globalized_is_on_top, master_subductability);

		    // merge plates with master
		    // set plate_mask to current plate's index where current plate is on top
		    fill_into 	(master.plate_masks, i, globalized_is_on_top, 							master.plate_masks);
		    
		    // add 1 to master.plate_count where current plate exists
		    add_ui8 	(master.plate_count, globalized_plate_mask, 							master.plate_count);

		    // add current plate thickness to master thickness wherever current plate exists
		    resample 	(plate.sial, localized_ids, 											globalized_scalar_field);
		    add_term 	(master.sial, globalized_scalar_field, globalized_plate_mask, 			master.sial);

		    // overwrite master wherever current plate is on top
		    resample 	(plate.sima, localized_ids, 											globalized_scalar_field);
		    copy_into 	(master.sima, globalized_scalar_field, globalized_is_on_top, 			master.sima);

		    // overwrite master wherever current plate is on top
		    resample 	(plate.age, localized_ids, 												globalized_scalar_field);
		    copy_into 	(master.age, globalized_scalar_field, globalized_is_on_top, 			master.age);
		}
		update_calculated_fields(master);
	}
	function update_plates(world, timestep, plates) { 
	  	var plate; 
	  	var plate_count = world.plate_count;
	  	var plate_masks = world.plate_masks;
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

		var localized_pos = VectorRaster(grid); 
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
		var globalized_pos = VectorRaster(grid);
		var globalized_scalar_field = Float32Raster(grid); 
		

		var mult_matrix = VectorField.mult_matrix;
		var mult_field = ScalarField.mult_field;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var fill_into_crust = Crust.fill_into_selection;
		var copy = Uint8Raster.copy;
		var resample = Uint8Raster.get_ids;
		var margin = BinaryMorphology.margin;
		var padding = BinaryMorphology.padding;
		var or = BinaryMorphology.union;
		var and = BinaryMorphology.intersection;
		var erode = BinaryMorphology.erosion;
		var not = BinaryMorphology.negation;
		var equals = Uint8Field.eq_scalar;
		var gt_f32 = ScalarField.gt_scalar;
		var gt_ui8 = Uint8Field.gt_scalar;
		var globalized_ids, localized_ids;
		var add_term = ScalarField.add_field_term;
		var add = ScalarField.add_field;

		var globalized_accretion = Float32Raster(grid); 
		Float32Raster.fill(globalized_accretion, 0);
		var globalized_erosion = Float32Raster(grid);
		get_erosion(displacement, world.SEALEVEL, timestep, globalized_erosion, globalized_scalar_field);

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

		    mult_matrix(grid.pos, plate.global_to_local_matrix.elements, localized_pos); 
	    	localized_ids = plate.grid.getNearestIds(localized_pos);

	        mult_matrix(plate.grid.pos, plate.local_to_global_matrix.elements, globalized_pos);
	    	globalized_ids = plate.grid.getNearestIds(globalized_pos);

	 		localized_subductability = plate.subductability;

		    //shared variables for detaching and rifting
			// op 	operands																result
			equals 	(plate_masks, i, 														globalized_is_on_top);
		    not 	(globalized_is_on_top, 													globalized_is_not_on_top);

		    //detect rifting
		    // is_riftable: count == 0 or (count = 1 and top_plate = i)
			and 	(globalized_is_alone, globalized_is_on_top, 							globalized_is_riftable);
			or 		(globalized_is_riftable, globalized_is_empty, 							globalized_is_riftable);

            resample(globalized_is_riftable, globalized_ids, 								localized_is_riftable);
		    erode	(localized_is_riftable, 1, 												localized_will_stay_riftable);
		    margin	(plate.mask, 1, 														localized_is_just_outside_border);
		    and 	(localized_will_stay_riftable, localized_is_just_outside_border,		localized_is_rifting);

		    //detect detachment
			// is_detachable: count > 1 and top_plate != i
		    and 	(globalized_is_not_alone, globalized_is_not_on_top,						globalized_is_detachable);

            resample(globalized_is_detachable, globalized_ids, 								localized_is_detachable);
            erode	(localized_is_detachable, 1,											localized_will_stay_detachable);
		    padding (plate.mask, 1, 														localized_is_just_inside_border);
        	gt_f32	(localized_subductability, 0.5, 										localized_is_detachable);//todo: set this to higher threshold
		    and 	(localized_will_stay_detachable, localized_is_just_inside_border, 		localized_is_detaching);
		    and 	(localized_is_detaching, localized_is_detachable, 						localized_is_detaching);

	        //rift 
	        if(RIFT){
		        fill_into(plate.mask, 1, localized_is_rifting,                 				plate.mask); 
		        fill_into_crust(plate, ocean, localized_is_rifting, plate);
	        }
	        //detach
	        if(DETACH){
		        fill_into(plate.mask, 1, localized_is_detaching,                 			plate.mask); 
		        //accrete, part 1
		        if(ACCRETE) {
		        	mult_field	(plate.sial, localized_is_detaching,						localized_accretion);
	            	resample 	(localized_accretion, localized_ids,						globalized_scalar_field);
	            	add 		(globalized_accretion, globalized_scalar_field, 			globalized_accretion);
		        }
	        }
	        //erode
	        if(ERODE) {
            	resample(globalized_erosion, globalized_ids,								localized_erosion);
            	resample(globalized_is_on_top, globalized_ids,								localized_is_on_top);
	        	add_term(plate.sial, localized_erosion, localized_is_on_top,				plate.sial);
	        }

	        //aging
			ScalarField.add_scalar(plate.age, timestep, plate.age);
		}
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

	        mult_matrix(plate.grid.pos, plate.local_to_global_matrix.elements, globalized_pos);
	    	globalized_ids = plate.grid.getNearestIds(globalized_pos);

	        //accrete, part 2
	        if(ACCRETE) {
            	resample(globalized_is_on_top, globalized_ids,								localized_is_on_top);
            	resample(globalized_accretion, globalized_ids,								localized_accretion);
	        	add_term(plate.sial, localized_accretion, localized_is_on_top,				plate.sial);
	        }
		}
	}
	function merge_master_to_plates(master, plates) {
		return;
		var plate;
		var local_plate_mask_negation = Uint8Raster(master.grid);
		var globalized_pos = VectorRaster(master.grid);
		var localized_scalar_field = Float32Raster(master.grid);
		var localized_vector_field = VectorRaster(master.grid); 
		
		var angular_velocity = VectorField.cross_vector_field(master.asthenosphere_velocity, master.grid.pos); 
		for (var i = 0; i < plates.length; i++) {
			plate = plates[i];
			VectorField.mult_matrix(plate.grid.pos, plate.local_to_global_matrix.elements, globalized_pos);

			//BinaryMorphology.negation(plate.mask, local_plate_mask_negation);
//
//			//Float32Raster.get_nearest_values(master.thickness, globalized_pos, localized_scalar_field);
//			//Float32RasterGraphics.copy_into_selection(plate.thickness, localized_scalar_field, local_plate_mask_negation, plate.thickness);
//
//			//Float32Raster.get_nearest_values(master.density, globalized_pos, localized_scalar_field);
//			//Float32RasterGraphics.copy_into_selection(plate.density, localized_scalar_field, local_plate_mask_negation, plate.density);
//
//			//Float32Raster.get_nearest_values(master.displacement, globalized_pos, localized_scalar_field);
//			//Float32RasterGraphics.copy_into_selection(plate.displacement, localized_scalar_field, local_plate_mask_negation, plate.displacement);
//
			//Float32Raster.get_nearest_values(master.age, globalized_pos, localized_scalar_field);
			//Float32RasterGraphics.copy_into_selection(plate.age, localized_scalar_field, local_plate_mask_negation, plate.age);

			// VectorRaster.get_nearest_values(angular_velocity, globalized_pos, localized_vector_field); 
			// var eulerPole = VectorDataset.weighted_average(localized_vector_field, plate.mask)
			// //todo: fix it properly - no negation!
			// plate.eulerPole = new THREE.Vector3(-eulerPole.x, -eulerPole.y, -eulerPole.z).normalize(); 
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
		get_asthenosphere_velocity(this.subductability, this.asthenosphere_velocity);
		var angular_velocity = VectorField.cross_vector_field(this.asthenosphere_velocity, this.grid.pos);
		var plate_masks = VectorImageAnalysis.image_segmentation(angular_velocity, this.grid);
		this.plates = [];

		var plate;
		// TODO: overwrite plates instead of creating new ones, create separate function for plate initialization
		for (var i = 0, li = plate_masks.length; i < li; ++i) {
			plate = new Plate({
				world: 	this,
				mask: 	plate_masks[i]
			})
			Crust.copy(this, plate);

			plate.angularSpeed = this.getRandomPlateSpeed();

			this.plates.push(plate);

			//TODO: comment this out when you're done
			var eulerPole = VectorDataset.weighted_average(angular_velocity, plate.mask)
			//TODO: fix it properly - no negation!
			plate.eulerPole = new THREE.Vector3(-eulerPole.x, -eulerPole.y, -eulerPole.z).normalize(); 
		}
	};


	World.prototype.fast_update = function (timestep) {
	 	if (timestep === 0) {
	 		return;
	 	};

	 	for (var i = 0; i < this.plates.length; i++) {
	 		this.plates[i].move(timestep)
	 	}
	}
	// update fields that are derived from others
	function update_calculated_fields(crust) {
		get_thickness(crust.sima, crust.sial, crust.thickness);
		get_density(crust.sima, crust.sial, crust.age, crust.density);
		get_subductability(crust.density, crust.subductability);
		get_displacement(crust.thickness, crust.density, world.mantleDensity, crust.displacement);
	}
	World.prototype.slow_update = function(timestep){
		if (timestep === 0) {
			return;
		};

		update_calculated_fields(this);

		//get_asthenosphere_velocity(this.subductability, this.asthenosphere_velocity);
		
		this.supercontinentCycle.update(timestep);

		merge_master_to_plates(this, this.plates);

		merge_plates_to_master(this.plates, this);
		update_plates(this, timestep, this.plates);

		// World submodels go here: atmo model, hydro model, bio model, etc.

		//FIRST ITERATION? 
		// var new_pos = add_scalar_term(grid.pos, asthenosphere_velocity, -timestep);
		// var ids = get_nearest_ids(new_pos);
		// get_values(fields, ids); giving fields

		Publisher.publish('crust', 'update', { 
			value: this, 
			uuid: this.uuid } 
		);
	};
	return World;
})();
