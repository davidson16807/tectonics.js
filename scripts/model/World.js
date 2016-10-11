'use strict';


var World = (function() {
	function get_subductability(output) {
		// body...
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

		//option 1 seems to make more sense - there is no final merge function that serves only to prepare for next timestep

		//OPTION 1:
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
