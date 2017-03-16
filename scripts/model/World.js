'use strict';


var World = (function() {

	var subduction_min_age_threshold = 150;
	var subduction_max_age_threshold = 200;
	var subductability_transition_factor = 1/100;

	function lerp(a,b, x){
		return a + x*(b-a);
	}
	function smoothstep (edge0, edge1, x) {
		var fraction = (x - edge0) / (edge1 - edge0);
		return clamp(fraction, 0.0, 1.0);
		// return t * t * (3.0 - 2.0 * t);
	}
	function clamp (x, minVal, maxVal) {
		return Math.min(Math.max(x, minVal), maxVal);
	}
	function heaviside_approximation (x, k) {
		return 2 / (1 + Math.exp(-k*x)) - 1;
		return x>0? 1: 0; 
	}


	//old version
	function get_subductability(age, density, output) {
		var subductability = output;
		var age = age;
		var density = density;
		var _lerp = lerp;
		var _smoothstep = smoothstep;
		var _heaviside_approximation = heaviside_approximation;
		var _subductability_transition_factor = subductability_transition_factor;
		for (var i=0, li=subductability.length; i<li; ++i) {
			var density_i = density[i];
			var continent = _smoothstep(2890, 2800, density_i);
			var age_i = age[i];
			var density_i = 	density_i * continent 	+ 
							_lerp(density_i, 3300, 
								 _smoothstep(
									subduction_min_age_threshold, 
									subduction_min_age_threshold, 
									age_i)) 
								* (1-continent)
			subductability[i] =  _heaviside_approximation( density_i - 3000, _subductability_transition_factor );
		}
		return subductability;
	}
	//field version
	function smoothstep_raster (x, edge0, edge1, output) {
		var fraction;
		for (var i=0, li=x.length; i<li; ++i) {
			fraction = (x[i] - edge0) / (edge1 - edge0);
			output[i] = 0.0 > fraction? 0.0 : 1.0 < fraction? 1.0 : fraction;
		}
	}
	//slower, more complex, probably more easily controllable and realistic
	function get_subductability(age, density, output, scratch) {
		var age_adjusted_density = scratch || Float32Raster(density.grid);
		var subductability = output;
		
		Float32RasterInterpolation.smoothstep_raster(age, subduction_min_age_threshold, subduction_max_age_threshold, is_old);
		Float32RasterInterpolation.lerp_fsf(density, 3300, is_old, age_adjusted_oceanic_density);

		Float32RasterInterpolation.smoothstep_raster(density, 2890, 2800, is_continental);
		Float32RasterInterpolation.lerp_fff(density, age_adjusted_oceanic_density, is_continental, age_adjusted_density);
		Float32RasterInterpolation.smoothstep_raster(density, 3000, 3300, subductability);
		// alternative to above:
		// Float32RasterInterpolation.sigmoid(density, subductability_transition_factor, 3000);

		return subductability;
	}
	//another, simpler method
	function get_subductability(age, density, output, scratch1, scratch2) {
		var is_old = scratch1 || Float32Raster(age.grid);
		var is_oceanic = scratch2 || Float32Raster(density.grid);
		var subductability = output;
		
		smoothstep_raster(age, subduction_min_age_threshold, subduction_max_age_threshold, is_old);
		smoothstep_raster(density, 2800, 2890, is_oceanic);

		ScalarField.mult_field(is_old, is_oceanic, subductability);

		return subductability;
	}

	//original method: slowest of them all, requires older smoothstep
	function get_subductability(age, density, output) {
		var subductability = output;
		var age = age;
		var density = density;
		
		for (var i=0, li=subductability.length; i<li; ++i) {
			var density_i = density[i];
			var continent = smoothstep(2890, 2800, density_i);
			var age_i = age[i];
			var density_i = 	density_i * continent 	+ 
							lerp(density_i, 3300, 
								 smoothstep(
									subduction_min_age_threshold, 
									subduction_min_age_threshold, 
									age_i)) 
								* (1-continent)
			subductability[i] =  heaviside_approximation( density_i - 3000, subductability_transition_factor );
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
	function branch_plates(masks) {
		// body...
	}
	function merge_plates_to_master(plates, master) { 

		var UINT8_NULL = 255;
		var UINT16_NULL = 65535;

		var fill = Float32Raster.fill;



		fill(master.thickness, 0);
		// fill(master.density, 9999);
		fill(master.displacement, 0);
		// fill(master.age, 9999);
		fill(master.plate_masks, -1);
		fill(master.plate_count, 0);
		fill(master.is_rifting, 0);
		fill(master.is_detaching, 0);

		var globalized_subductability = Float32Raster(master.grid); 
		fill(globalized_subductability, 9999);

	  	var plate; 

	  	//rifting variables
		var localized_is_on_top_or_empty = Uint8Raster(master.grid);
		var localized_will_stay_on_top_or_empty = Uint8Raster(master.grid);
		var localized_is_just_outside_border = Uint8Raster(master.grid);
		var localized_is_rifting = Uint8Raster(master.grid);
		
		//detaching variables
		var localized_is_on_bottom = Uint8Raster(master.grid);
		var localized_will_stay_on_bottom = Uint8Raster(master.grid);
		var localized_is_just_inside_border = Uint8Raster(master.grid);
		var localized_is_detachable = Uint8Raster(master.grid);
		var localized_is_detaching = Uint8Raster(master.grid);

		var localized_pos = VectorRaster(master.grid); 
		var localized_subductability = Float32Raster(master.grid); 

		//global rifting/detaching variables
		var globalized_is_empty = Uint8Raster(master.grid);
		var globalized_is_on_top = Uint8Raster(master.grid);
		var globalized_is_on_top_or_empty = Uint8Raster(master.grid);
		var globalized_is_on_bottom = Uint8Raster(master.grid);
		var globalized_is_rifting = Uint8Raster(master.grid); 
		var globalized_is_detaching = Uint8Raster(master.grid); 

		var globalized_plate_mask = Uint8Raster(master.grid); 
		var globalized_pos = VectorRaster(master.grid);
		var globalized_scalar_field = Float32Raster(master.grid); 


		var mult_matrix = VectorField.mult_matrix;
		var mult = ScalarField.mult_field;
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

		    mult_matrix(master.grid.pos, plate.global_to_local_matrix.elements, localized_pos); 

	    	localized_ids = plate.grid.getNearestIds(localized_pos);

		    resample_ui8(plate.mask, localized_ids, globalized_plate_mask); 

		    get_subductability(plate.age, plate.density, plate.subductability);

		    //generate globalized_is_on_top
		    resample 	(plate.subductability, localized_ids, 					globalized_scalar_field);
		    mult 		(globalized_scalar_field, globalized_plate_mask, 			globalized_scalar_field);
		    lt 			(globalized_scalar_field, globalized_subductability,		globalized_is_on_top);
		    copy_into 	(globalized_subductability, globalized_scalar_field, globalized_is_on_top, globalized_subductability);
		    and 		(globalized_is_on_top, globalized_plate_mask, 				globalized_is_on_top);

		    //generate plate_count and plate_mask
		    fill_into 	(master.plate_masks, i, globalized_is_on_top, master.plate_masks);
		    add_ui8 	(master.plate_count, globalized_plate_mask, master.plate_count);

		    // sum between plates
		    resample 	(plate.thickness, localized_ids, globalized_scalar_field);
		    add_term 	(master.thickness, globalized_scalar_field, globalized_plate_mask, 	master.thickness);

		    resample 	(plate.density, localized_ids, 									globalized_scalar_field);
		    copy_into 	(master.density, globalized_scalar_field, globalized_is_on_top, master.density);

		    resample 	(plate.displacement, localized_ids, 							globalized_scalar_field);
		    copy_into 	(master.displacement, globalized_scalar_field, globalized_is_on_top, master.displacement);

		    resample 	(plate.age, localized_ids, 										globalized_scalar_field);
		    copy_into 	(master.age, globalized_scalar_field, globalized_is_on_top, master.age);
		}


		var mult_matrix = VectorField.mult_matrix;
		var fill_into = Uint8RasterGraphics.fill_into_selection;
		var resample = Uint8Raster.get_ids;
		var margin = BinaryMorphology.margin;
		var padding = BinaryMorphology.padding;
		var or = BinaryMorphology.union;
		var and = BinaryMorphology.intersection;
		var erode = BinaryMorphology.erosion;
		var not = BinaryMorphology.negation;
		var equals = Uint8Field.eq_scalar;
		var gt = ScalarField.gt_scalar;
		var globalized_ids, localized_ids; 

	    //shared variables for detaching and rifting
		// op 	operands																result
		equals 	(master.plate_masks, UINT8_NULL, 										globalized_is_empty);
		equals 	(master.plate_masks, i, 												globalized_is_on_top);
	    or 		(globalized_is_on_top, globalized_is_empty,								globalized_is_on_top_or_empty);
	    not 	(globalized_is_on_top_or_empty, 										globalized_is_on_bottom);

		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i];

		    mult_matrix(master.grid.pos, plate.global_to_local_matrix.elements, localized_pos); 
	        mult_matrix(plate.grid.pos, plate.local_to_global_matrix.elements, globalized_pos);

	 		localized_subductability = plate.subductability;

	    	globalized_ids = plate.grid.getNearestIds(globalized_pos);
	    	localized_ids = plate.grid.getNearestIds(localized_pos);

		    //trying to get rifting to work
			// op 	operands																result
            resample(globalized_is_on_top_or_empty, globalized_ids, 						localized_is_on_top_or_empty);
		    erode	(localized_is_on_top_or_empty, 1, 										localized_will_stay_on_top_or_empty);
		    margin	(plate.mask, 1, 														localized_is_just_outside_border);
		    and 	(localized_will_stay_on_top_or_empty, localized_is_just_outside_border,	localized_is_rifting);

		    //trying to get detachment to work
			// op 	operands																result
            resample(globalized_is_on_bottom, globalized_ids, 								localized_is_on_bottom);
		    erode	(localized_is_on_bottom, 1,												localized_will_stay_on_bottom);
		    padding (plate.mask, 1, 														localized_is_just_inside_border);
        	gt 		(localized_subductability, 0.5, 										localized_is_detachable);			//todo: set this to higher threshold
		    and 	(localized_will_stay_on_bottom, localized_is_just_inside_border, 		localized_is_detaching);
		    and 	(localized_is_detaching, localized_is_detachable, 						localized_is_detaching);

		    //display detaching
	        resample(localized_is_detaching, localized_ids, 								globalized_is_detaching);
	        // and 	(globalized_is_detaching, master.is_detaching, 							master.is_detaching);
			fill_into(master.is_detaching, i, globalized_is_detaching, master.is_detaching);  // test code for viewing detaching for single plate

			//display rifting
            resample(localized_is_rifting, localized_ids, 									globalized_is_rifting);
            // and 	(globalized_is_rifting, master.is_rifting, 								master.is_rifting);
		    fill_into(master.is_rifting, i, globalized_is_rifting, 							master.is_rifting);  // test code for viewing rifting for single plate
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

	function World(parameters) {
		Crust.call(this, parameters);

		this.getRandomPlateSpeed = parameters['getRandomPlateSpeed'] ||
			//function() { return Math.exp(random.normal(-5.13, 0.548)); }
			function() { return random.normal(0.00687, 0.00380); }
			//^^^ log normal and normal distribution fit to angular velocities from Larson et al. 1997

		parameters.world = this;
		this.supercontinentCycle = parameters['supercontinentCycle'] || new SupercontinentCycle(parameters);

		this.subductability = Float32Raster(this.grid);
		this.plate_masks = Uint8Raster(this.grid);
		this.plate_count = Uint8Raster(this.grid);
		this.is_rifting = Uint8Raster(this.grid);
		this.is_detaching = Uint8Raster(this.grid);
		this.asthenosphere_velocity = VectorRaster(this.grid);

		this.radius = parameters['radius'] || 6367;
		// this.age = parameters['age'] || 0;
		this.maxPlatesNum = parameters['platesNum'] || 8;

		this.plates = [];
	}
	World.prototype = Object.create(Crust);
	World.prototype.constructor = World;


	World.prototype.SEALEVEL = 3682;
	World.prototype.mantleDensity=3300;
	World.prototype.waterDensity=1026;
	World.prototype.ocean = 
	 new RockColumn({
		elevation: 	-3682,	// Charette & Smith 2010
		thickness: 	7100, 	// +/- 800, White McKenzie and O'nions 1992
		density: 	2890	// Carlson & Raskin 1984
	 });
	World.prototype.land =
	 new RockColumn({
		elevation: 	840,   //Sverdrup & Fleming 1942
	    thickness: 	36900, // +/- 2900, estimate for shields, Zandt & Ammon 1995
		density: 	2700
	 });

	 function isostasy(world) {
	 	var thicknesses = world.thickness; 
	 	var densities = world.density; 
	 	var displacements = world.displacement; 
	 	
	 	var mantleDensity = world.mantleDensity; 
	 	var thickness, rootDepth;
	 	for(var i=0, li = displacements.length; i<li; i++){

	 		//Calculates elevation as a function of crust density. 
	 		//This was chosen as it only requires knowledge of crust density and thickness,  
	 		//which are relatively well known. 
	 		thickness = thicknesses[i]; 
	 		rootDepth = thickness * densities[i] / mantleDensity; 
	 		displacements[i] = thickness - rootDepth;
	 	}
	 }

	World.prototype.resetPlates = function() {
		// get plate masks from image segmentation of asthenosphere velocity
		var angular_velocity = VectorField.cross_vector_field(this.asthenosphere_velocity, this.grid.pos);
		var plate_masks = VectorImageAnalysis.image_segmentation(angular_velocity, this.grid);
		this.plates = [];

		var plate;
		// todo: overwrite plates instead of creating new ones, create separate function for plate initialization
		for (var i = 0, li = plate_masks.length; i < li; ++i) {
			plate = new Plate({
				world: 	this,
				mask: 	plate_masks[i]
			})
			Float32Raster.copy(this.displacement, plate.displacement);
			Float32Raster.copy(this.thickness, plate.thickness);
			Float32Raster.copy(this.density, plate.density);
			Float32Raster.copy(this.age, plate.age);

			plate.angularSpeed = this.getRandomPlateSpeed();

			this.plates.push(plate);

			//TODO: comment this out when you're done
			var eulerPole = VectorDataset.weighted_average(angular_velocity, plate.mask)
			//todo: fix it properly - no negation!
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
	World.prototype.slow_update = function(timestep){
		if (timestep === 0) {
			return;
		};

		get_subductability(this.age, this.density, this.subductability);
		get_asthenosphere_velocity(this.subductability, this.asthenosphere_velocity);

		this.supercontinentCycle.update(timestep);

		merge_master_to_plates(this, this.plates);

		// plate submodels go here: plate motion and erosion, namely


		merge_plates_to_master(this.plates, this);


		// World submodels go here: atmo model, hydro model, bio model, etc.



		//FIRST ITERATION? 
		// var new_pos = add_scalar_term(grid.pos, asthenosphere_velocity, -timestep);
		// var ids = get_nearest_ids(new_pos);
		// get_values(fields, ids); giving fields

		isostasy(this);

		Publisher.publish('world.plates', 'update', { 
			value: this, 
			uuid: this.uuid } 
		);
	};
	return World;
})();
