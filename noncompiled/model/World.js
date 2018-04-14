'use strict';



function World(parameters) {
	this.grid = parameters['grid'] || stop('missing parameter: "grid"');

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

	this.radius = parameters['radius'] || 6367e3; // meters

	this.age = parameters['age'] || 0; // megayears

	this.lithosphere = new Lithosphere(parameters);
	this.hydrosphere = new Hydrosphere(parameters);

	this.lithosphere.setDependencies({
		'surface_gravity': 		this.surface_gravity,
		'sealevel': 			this.hydrosphere.sealevel,
		'material_density': 	this.material_density,
		'material_viscosity': 	this.material_viscosity,
	});
	this.hydrosphere.setDependencies({
		'displacement': 		this.lithosphere.displacement,
	});
	this.SEALEVEL = 3682;
	
	this.update = function(timestep){
		if (timestep === 0) {
			return;
		};

		// NOTE: update all non-constant, non-spatial dependencies
		this.lithosphere.setDependencies({
			'sealevel': 			this.hydrosphere.sealevel,
		});

		this.lithosphere.calcChanges(timestep);
		this.hydrosphere.calcChanges(timestep);

		this.lithosphere.applyChanges(timestep);
		this.hydrosphere.applyChanges(timestep);
	};
	return this;
}