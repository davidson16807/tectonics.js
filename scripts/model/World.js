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
	function get_aesthenosphere_velocity(subductability, output, scratch1, scratch2) {
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

	function get_plate_masks(angular_velocity_field, grid) {
		var magnitude = VectorField.magnitude(angular_velocity_field);
		var is_unfilled_mask = Float32Raster(angular_velocity_field.grid, 1);

		var min_plate_size = 200;
		var flood_fills = [];
		var flood_fill;
		for (var i=1; i<7; ) {
			flood_fill = VectorRasterGraphics.magic_wand_select(angular_velocity_field, Float32Raster.max_id(magnitude), is_unfilled_mask);   
			ScalarField.sub_field(magnitude, ScalarField.mult_field(flood_fill, magnitude), magnitude);
			ScalarField.sub_field(is_unfilled_mask, flood_fill, is_unfilled_mask);
		    if (Float32Dataset.sum(flood_fill) > min_plate_size) { 
				flood_fills.push(flood_fill);
				i++;
			}
		}
		
		// Now, iterate through plate masks and remove intersections
		var output;
		var outputs = [];
		var inputs = flood_fills;
		for (var i=0, li=inputs.length; i<li; ++i) {
		    outputs.push(BinaryMorphology.copy(inputs[i]));
		}
		for (var i=0, li=outputs.length; i<li; ++i) {
		    output = outputs[i];
		    output = BinaryMorphology.dilation(output, 5);
		    output = BinaryMorphology.closing(output, 5);
		    // output = BinaryMorphology.opening(output, 5);
		    for (var j=0, lj=inputs.length; j<lj; ++j) {
		    	if (i != j) {
			        output = BinaryMorphology.difference(output, inputs[j]);
		    	}
		    }
		    inputs[i] = BinaryMorphology.to_float(output);
		}

		return inputs;
	}
	function branch_plates(masks) {
		// body...
	}
	function merge_plates_to_master(plates, world) {
		// body...
	}
	function merge_master_to_plates(world, plates) {
		// body...
	}
	function isostasy(world) {
		var thicknesses = world.thickness; 
		var densities = world.density; 
		var displacements = world.displacement; 
		var is_member = world.is_member; 
		
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

	function World(optional) {
		Crust.call(this, optional);

		this.getRandomPlateSpeed = optional['getRandomPlateSpeed'] ||
			//function() { return Math.exp(random.normal(-5.13, 0.548)); }
			function() { return random.normal(0.00687, 0.00380); }
			//^^^ log normal and normal distribution fit to angular velocities from Larson et al. 1997

		this.subductability = Float32Raster(this.grid);
		this.aesthenosphere_velocity = VectorRaster(this.grid);
		this.plate_masks = [];

		this.radius = optional['radius'] || 6367;
		// this.age = optional['age'] || 0;
		this.maxPlatesNum = optional['platesNum'] || 8;

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


	World.prototype.resetPlates = function() {
		return;
	};


	World.prototype.fast_update = function (timestep) {
	 	if (timestep === 0) {
	 		return;
	 	};

	}
	World.prototype.slow_update = function(timestep){
		if (timestep === 0) {
			return;
		};

		get_subductability(this.age, this.density, this.subductability);
		get_aesthenosphere_velocity(this.subductability, this.aesthenosphere_velocity);

		merge_master_to_plates(this, this.plates);

		// plate submodels go here: plate motion and erosion, namely

		merge_plates_to_master(this.plates, this);

		// World submodels go here: atmo model, hydro model, bio model, etc.



		//FIRST ITERATION? 
		// var new_pos = add_scalar_term(grid.pos, aesthenosphere_velocity, -timestep);
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
