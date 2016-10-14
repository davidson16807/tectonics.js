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
	
	function get_subductability(crust, output) {
		var subductability = output;
		var age = crust.age;
		var density = crust.density;
		for (var i=0, li=subductability.length; i<li; ++i) {
			var continent = smoothstep(2890, 2800, density);
			var density_i = density[i];
			var age_i = age[i];
			var density = 	density_i * continent 	+ 
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
	
	function get_diffused_subductability(plate, output, scratch, iterations) {
		iterations = iterations || 15;
		getSubductability(plate, output);
		for (var i=0; i<iterations; ++i) {
			ScalarField.diffusion_by_constant(output, 1, output, scratch);
			// ScalarField.laplacian(output, laplacian);
			// ScalarField.add_field(output, laplacian, output);
		}
		return output;
	}
	function get_aesthenosphere_velocity(subductability, output) {
		// body...
	}
	function get_plate_masks(aesthenosphere_velocity) {
		// get_plates? get_plate_segments? get_plate_regions? get_plate_boundaries?
		// body...
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

		get_subductability(this, this.subductability);

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
