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
		for (var i=0; i<smoothing_iterations; ++i) {
			ScalarField.diffusion_by_constant(diffused_subductability, 1, diffused_subductability, scratch);
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
		Float32Raster.fill(master.thickness, 0);
		Float32Raster.fill(master.density, 9999);
		Float32Raster.fill(master.displacement, 0);
		Float32Raster.fill(master.age, 9999);
		Float32Raster.fill(master.subductability, 9999);
		Float32Raster.fill(master.plate_masks, -1);
		Float32Raster.fill(master.plate_count, 0);

	  	var plate; 
		var globalized_plate_mask = Uint8Raster(master.grid); 
		var localized_pos = VectorRaster(master.grid); 
		var subductability = Float32Raster(master.grid); 
		var globalized_scalar_field = Float32Raster(master.grid); 
		var is_on_top = Uint8Raster(master.grid);
		Float32Raster.fill(is_on_top, 1);
		for (var i=0, li=plates.length; i<li; ++i) {
		    plate = plates[i]; 

		    VectorField.mult_matrix(master.grid.pos, plate.global_to_local_matrix.elements, localized_pos); 

		    Uint8Raster.get_nearest_values(plate.mask, localized_pos, globalized_plate_mask); 

		    get_subductability(plate.age, plate.density, subductability);

		    Float32Raster.get_nearest_values(subductability, localized_pos, globalized_scalar_field);
		    ScalarField.lt_field(globalized_scalar_field, master.subductability, is_on_top);
		    BinaryMorphology.intersection(is_on_top, globalized_plate_mask, is_on_top);

		    Uint8RasterGraphics.fill_into_selection(master.plate_masks, i, is_on_top, master.plate_masks);
		    Uint8Field.add_field(master.plate_count, is_on_top, master.plate_count);

		    // sum between plates
		    Float32Raster.get_nearest_values(plate.thickness, localized_pos, globalized_scalar_field);
		    ScalarField.add_field_term(master.thickness, globalized_scalar_field, globalized_plate_mask, master.thickness);

		    // min function
		    Float32Raster.get_nearest_values(plate.density, localized_pos, globalized_scalar_field);
		    Float32RasterGraphics.copy_into_selection(master.density, globalized_scalar_field, is_on_top, master.density);

		    // doesn't matter - recalculate via isostasy
		    Float32Raster.get_nearest_values(plate.displacement, localized_pos, globalized_scalar_field);
		    Float32RasterGraphics.copy_into_selection(master.displacement, globalized_scalar_field, is_on_top, master.displacement);

		    // take whatever the lighter plate is
		    Float32Raster.get_nearest_values(plate.age, localized_pos, globalized_scalar_field);
		    Float32RasterGraphics.copy_into_selection(master.age, globalized_scalar_field, is_on_top, master.age);

		}
	}
	function merge_master_to_plates(master, plates) {
		var plate;
		var local_plate_mask_negation = Uint8Raster(master.grid);
		var globalized_pos = VectorRaster(master.grid);
		var localized_scalar_field = Float32Raster(master.grid);
		var localized_vector_field = VectorRaster(master.grid); 
		
		var angular_velocity = VectorField.cross_vector_field(master.asthenosphere_velocity, master.grid.pos); 
		for (var i = 0; i < plates.length; i++) {
			plate = plates[i];
			VectorField.mult_matrix(master.grid.pos, plate.local_to_global_matrix.elements, globalized_pos);

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
		console.log(plate_masks);
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
