'use strict';

var World = (function() {
	function World(parameters) {
		this.grid = parameters['grid'] || stop('missing parameter: "grid"');

		this.lithosphere = new Lithosphere(parameters);

		this.material_viscosity = parameters['material_viscosity'] || {
			mantle: 1.57e17
		};

		// all densities in T/m^3
		this.material_density = parameters['material_density'] || {
			// most values are estimates from looking around wolfram alpha
			fine_sediment: 1.500,
			coarse_sediment: 1.500,
			sediment: 1.500,
			sedimentary: 2.600,
			metamorphic: 2.800,
			felsic_plutonic: 2.600,
			felsic_volcanic: 2.600,
			mafic_volcanic_min: 2.890, // Carlson & Raskin 1984
			mafic_volcanic_max: 3.300,
			mantle: 3.075, // derived empirically using isostatic model
			ocean: 1.026 
		};

		this.surface_gravity = parameters['surface_gravity'] || 9.8; // m/s^2
	}
	World.prototype.SEALEVEL = 3682;

	World.prototype.update = function(timestep){
		if (timestep === 0) {
			return;
		};
		this.lithosphere.update(timestep);
	};
	World.prototype.worldLoaded = function(timestep){
		this.lithosphere.worldLoaded(timestep)
	};
	return World;
})();
