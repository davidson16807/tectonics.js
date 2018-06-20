'use strict';



function World(parameters) {
	var this_ = this;
	this.name = parameters.name;
	this.grid = parameters['grid'] || stop('missing parameter: "grid"');

	this.star = new Star({
		name: 'sun',
		grid: this.grid,
		mass: Units.SOLAR_MASS,
	});
	this.universe = new Universe(
		new System({
			name: 'galactic orbit',
			motion: new Orbit({ // motion mirrors orbit of sun around galactic center
				semi_major_axis: 2.35e20, // meters
				effective_combined_mass: 1.262e41, // kg, back calculated to achieve period of 250 million years
			}),
			invariant_insolation: true,
			body: this.star,
			children: [

				new System({
					name: 'orbit',
					motion: new Orbit({
						semi_major_axis: 1. * Units.ASTRONOMICAL_UNIT,
						eccentricity: 0.0167,
						inclination: Math.PI * 5e-5/180,
						longitude_of_ascending_node: Math.PI * -11/180,
						effective_combined_mass: 2e30, // kg
					}),	
					children: [
						new System({
							name: 'precession',
							motion: new Spin({ 
								angular_speed: 2*Math.PI/(25860 * Units.SECONDS_IN_YEAR),
							}),	
							invariant_insolation: true,
							children: [
								new System({
									name: 'spin',
									motion: new Spin({ 
										angular_speed: 2*Math.PI/(60*60*24),
										axial_tilt: Math.PI * 23.5/180,
									}),	
									body: this,
								}),
						 	]
						}),
					],
				}),
			]
		})
	);


	// all heat capacities in Joules per Kelvin
	this.material_heat_capacity = parameters['material_heat_capacity'] || {
	    ocean  : 30e7, 	// heat capacity of 1m^2 of 75m water column, the ocean's "mixing layer"
	    felsic : 1e7, 	// heat capacity of 1m^2 air column on earth
	}

	// all viscosities in m/s per kiloPascal
	this.material_viscosity = parameters['material_viscosity'] || {
		mantle: 1.57e17, 
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
		ocean: 1.026,
	};

	this.material_reflectivity = parameters['material_reflectivity'] || {
	    ocean:  	0.06,
	    felsic:  	0.27,
	    forest:  	0.1,
	    ice:  		0.8,
	};

	this.surface_gravity = parameters['surface_gravity'] || 9.8; // m/s^2

	this.radius = parameters['radius'] || Units.EARTH_RADIUS; // meters

	this.age = parameters['age'] || 0; // megayears

	this.orbit = new OldOrbit({
		grid: this.grid,
		// TODO: set these using parameters
		semi_major_axis: Units.ASTRONOMICAL_UNIT, 
		mean_anomaly: 0,
		axial_tilt: Math.PI * 23.5/180,
	});
	this.lithosphere = new Lithosphere(parameters);
	this.hydrosphere = new Hydrosphere(parameters);
	this.atmosphere = new Atmosphere(parameters);
	this.biosphere = new Biosphere(parameters);

	this.lithosphere.setDependencies({
		'surface_gravity'		: this.surface_gravity,
		'sealevel'				: this.hydrosphere.sealevel,
		'material_density'		: this.material_density,
		'material_viscosity'	: this.material_viscosity,
	});
	this.hydrosphere.setDependencies({
		'surface_temp'			: this.atmosphere.temperature,
		'displacement'			: this.lithosphere.displacement,
		'material_density'		: this.material_density,
	});
	this.atmosphere.setDependencies({
		'get_average_insolation': ((t, out) => this_.universe.get_average_insolation(this_, t, out)),
		'material_heat_capacity'	: this.material_heat_capacity,
		'material_reflectivity'	: this.material_reflectivity,
		'displacement' 			: this.lithosphere.displacement, //TODO: convert this to elevation
		'sealevel' 				: this.hydrosphere.sealevel,
		'ice_coverage' 			: this.hydrosphere.ice_coverage,
		'ocean_coverage'		: this.hydrosphere.ocean_coverage,
		'plant_coverage'		: this.biosphere.plant_coverage,
		'mean_anomaly' 			: this.orbit.mean_anomaly,
		'axial_tilt' 			: this.orbit.axial_tilt,
		'angular_speed' 		: this.orbit.angular_speed,
		'incident_radiation' 	: {value: () => new Float32Raster(this.grid, 1361/4)},
	});
	this.biosphere.setDependencies({
		'surface_temp'	: this.atmosphere.temperature,
		'precip'		: this.atmosphere.precip,
	});

	this.initialize = function() {
		// WARNING: order matters! (sorry, I'm working on it!)
		this.universe.initialize();
		this.lithosphere.initialize();
		this.hydrosphere.initialize();
		this.atmosphere.initialize();
		this.biosphere.initialize();
	}
	this.update = function(timestep){
		if (timestep === 0) {
			return;
		};
		var timestep_megayears =  timestep / Units.SECONDS_IN_MEGAYEAR;

		// this.orbit.invalidate();
		this.universe.invalidate();
		this.lithosphere.invalidate();
		this.hydrosphere.invalidate();
		this.atmosphere.invalidate();
		this.biosphere.invalidate();

		// NOTE: update all non-constant, non-spatial dependencies
		this.atmosphere.setDependencies({
			'mean_anomaly' 	: this.orbit.mean_anomaly,
			'axial_tilt' 	: this.orbit.axial_tilt,
			'angular_speed' : this.orbit.angular_speed,
		});
		this.biosphere.setDependencies({
			'surface_temp'	: this.atmosphere.temperature,
		});
		this.hydrosphere.setDependencies({
			'surface_temp'	: this.atmosphere.temperature,
		});

		// this.orbit.calcChanges(timestep_megayears);
		this.universe.calcChanges(timestep_megayears);
		this.lithosphere.calcChanges(timestep_megayears);
		this.hydrosphere.calcChanges(timestep_megayears);
		this.atmosphere.calcChanges(timestep_megayears);
		this.biosphere.calcChanges(timestep_megayears);

		// this.orbit.applyChanges(timestep_megayears);
		this.universe.applyChanges(timestep_megayears);
		this.lithosphere.applyChanges(timestep_megayears);
		this.hydrosphere.applyChanges(timestep_megayears);
		this.atmosphere.applyChanges(timestep_megayears);
		this.biosphere.applyChanges(timestep_megayears);
	};
	return this;
}