'use strict';

function Atmosphere(grid, parameters) {
	// private variables
	var grid = grid || stop('missing parameter: "grid"');
	this.lapse_rate = parameters['lapse_rate'] || 3.5 / 1e3; // degrees Kelvin per meter
	this.greenhouse_gas_factor = parameters['greenhouse_gas_factor'] || 1.3;

	this.getParameters = function() {
		return { 
			//grid: 				grid. // TODO: add grid
			lapse_rate: 			this.lapse_rate,
			greenhouse_gas_factor: 	this.greenhouse_gas_factor,
		};
	}

	var _this = this;
	this.scratch = Float32Raster(grid);
	this.long_term_sealevel_temp = new Memo(
		Float32Raster(grid),  
		result => { 
			var long_term_average_insolation = result; // double duty for performance
			get_average_insolation(Units.SECONDS_IN_MEGAYEAR, long_term_average_insolation)
			var absorbed_radiation = this.scratch; // double duty for performance
			ScalarField.mult_field( this.absorption.value(), long_term_average_insolation, absorbed_radiation );
			var max_absorbed_radiation 	= Float32Dataset.max( absorbed_radiation );
			var min_absorbed_radiation 	= Float32Dataset.min( absorbed_radiation );
			var mean_absorbed_radiation	= Float32Dataset.average( absorbed_radiation );

			// TODO: improve heat flow by modeling it as a vector field
			var heat_flow_uniform = AtmosphereModeling.solve_heat_flow_uniform(
				max_absorbed_radiation, 
				min_absorbed_radiation, 
				4/3,
				10
			);

			var incoming_heat = result; // double duty for performance
			AtmosphereModeling.surface_air_heat(
				absorbed_radiation, 
				heat_flow_uniform, 
				incoming_heat
			);

			Optics.black_body_equilibrium_temperature(incoming_heat, result, this.greenhouse_gas_factor);
			return result;
		}
	);
	this.long_term_surface_temp = new Memo(
		Float32Raster(grid),  
		result => ScalarField.sub_scalar_term ( this.long_term_sealevel_temp.value(), surface_height.value(), this.lapse_rate, result ),
	);

	this.average_insolation = Float32Raster(grid);
	this.absorbed_radiation = Float32Raster(grid);
	this.heat_capacity = Float32Raster(grid);
	this.incoming_heat = Float32Raster(grid);
	this.outgoing_heat = Float32Raster(grid);
	this.net_heat_gain = Float32Raster(grid);
	this.temperature_delta_rate = Float32Raster(grid);
	this.temperature_delta = Float32Raster(grid);
	this.sealevel_temp = undefined;
	this.surface_temp = Float32Raster(grid);


	this.albedo = new Memo(
		Float32Raster(grid),  
		// result => AtmosphereModeling.albedo(ocean_coverage.value(), ice_coverage.value(), plant_coverage.value(), material_reflectivity, result),
		// result => AtmosphereModeling.albedo(ocean_coverage.value(), undefined, plant_coverage.value(), material_reflectivity, result),
		result => { Float32Raster.fill(result, 0.2); return result; },
		false // assume everything gets absorbed initially to prevent circular dependencies
	);
	this.absorption = new Memo(
		Float32Raster(grid),  
		result => { 
			ScalarField.mult_scalar	( this.albedo.value(), -1, result );
			ScalarField.add_scalar 	( result, 1, result );
			return result;
		},
	);
	var lat = new Memo(
		Float32Raster(grid),  
		result => Float32SphereRaster.latitude(grid.pos.y, result)
	); 
	this.surface_pressure = new Memo(
		Float32Raster(grid),  
		result => AtmosphereModeling.surface_air_pressure( this.surface_temp, lat.value(), material_heat_capacity, 100e3, result)
	); 
	this.surface_wind_velocity = new Memo(
		VectorRaster(grid),  
		result => AtmosphereModeling.surface_air_velocity(
			grid.pos, 
			_this.surface_pressure.value(), 
			angular_speed, 
			result
		)
	); 
	this.precip = new Memo(
		Float32Raster(grid),  
		result => AtmosphereModeling.precip(lat.value(), result)
	);

	// private variables
	var material_heat_capacity = undefined;
	var get_average_insolation = undefined;
	var material_reflectivity = undefined;
	var surface_height 	= undefined;
	var ocean_coverage 	= undefined;
	var ice_coverage 	= undefined;
	var plant_coverage 	= undefined;
	var angular_speed 	= undefined;

	function assert_dependencies() {
		if (material_heat_capacity === void 0) { throw '"material_heat_capacity" not provided'; }
		if (get_average_insolation === void 0) { throw '"get_average_insolation" not provided'; }
		if (material_reflectivity === void 0) { throw '"material_reflectivity" not provided'; }
		if (surface_height === void 0)	 { throw '"surface_height" not provided'; }
		if (ocean_coverage === void 0)	 { throw '"ocean_coverage" not provided'; }
		if (ice_coverage === void 0)	 { throw '"ice_coverage" not provided'; }
		if (plant_coverage === void 0)	 { throw '"plant_coverage" not provided'; }
		if (angular_speed === void 0)	 { throw '"angular_speed" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		get_average_insolation = dependencies['get_average_insolation'] !== void 0? 	dependencies['get_average_insolation'] 	: get_average_insolation;		
		material_heat_capacity = dependencies['material_heat_capacity'] !== void 0? 	dependencies['material_heat_capacity'] 	: material_heat_capacity;		
		material_reflectivity = dependencies['material_reflectivity'] !== void 0? 	dependencies['material_reflectivity'] 	: material_reflectivity;		
		surface_height 		= dependencies['surface_height'] 	!== void 0? 	dependencies['surface_height'] 	: surface_height;		
		ocean_coverage 		= dependencies['ocean_coverage']!== void 0? 	dependencies['ocean_coverage'] 	: ocean_coverage;		
		ice_coverage 		= dependencies['ice_coverage'] 	!== void 0? 	dependencies['ice_coverage'] 	: ice_coverage;		
		plant_coverage 		= dependencies['plant_coverage']!== void 0? 	dependencies['plant_coverage'] 	: plant_coverage;	
		angular_speed 		= dependencies['angular_speed'] !== void 0? 	dependencies['angular_speed'] 	: angular_speed;	
	};

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		this.albedo.invalidate();
		this.surface_pressure .invalidate();
		this.surface_wind_velocity.invalidate();
		this.precip.invalidate();
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		assert_dependencies();
		var seconds = timestep * Units.SECONDS_IN_MEGAYEAR;

		if (this.sealevel_temp === void 0 || seconds > 7*Units.SECONDS_IN_DAY) {
			this.sealevel_temp = Float32Raster.copy(this.long_term_sealevel_temp.value(), 	this.sealevel_temp);
		} else {
			get_average_insolation(seconds, 											this.average_insolation);
			ScalarField.mult_field( this.absorption.value(), this.average_insolation, 	this.absorbed_radiation );

			var max_absorbed_radiation = Float32Dataset.max( this.absorbed_radiation );
			var min_absorbed_radiation = Float32Dataset.min( this.absorbed_radiation );
			var mean_absorbed_radiation = Float32Dataset.average( this.absorbed_radiation );

			// TODO: improve heat flow by modeling it as a vector field
			var heat_flow_uniform = AtmosphereModeling.solve_heat_flow_uniform(
				max_absorbed_radiation, 
				min_absorbed_radiation, 
				4/3,
				10
			);
			AtmosphereModeling.surface_air_heat(
				this.absorbed_radiation, 
				heat_flow_uniform, 
				this.incoming_heat
			);
			Optics.black_body_radiation	(this.sealevel_temp, 								this.outgoing_heat);
			ScalarField.div_scalar 		( this.outgoing_heat, this.greenhouse_gas_factor, 	this.outgoing_heat);
			AtmosphereModeling.heat_capacity(ocean_coverage.value(), material_heat_capacity, this.heat_capacity);
			ScalarField.sub_field 		( this.incoming_heat, this.outgoing_heat, 			this.net_heat_gain );
			ScalarField.div_field 		( this.net_heat_gain, this.heat_capacity, 			this.temperature_delta_rate );
			ScalarField.mult_scalar 	( this.temperature_delta_rate, seconds, 			this.temperature_delta );
			ScalarField.add_field 		( this.temperature_delta, this.sealevel_temp, 		this.sealevel_temp );
		}

		ScalarField.diffusion_by_constant(this.sealevel_temp, 0.2, this.sealevel_temp);

 		ScalarField.sub_scalar_term ( this.sealevel_temp, surface_height.value(), this.lapse_rate, this.surface_temp );

		// TODO: rename "scalar" to "uniform" across all raster namespaces

		// estimate black body equilibrium temperature, T̄
		// if applying ΔT*t to T results in a T' that exceeds a threshold past T̄, just accept the average
		// if T̄-T < ΔT*t, don't simulate

		// TODO: fall back on equilibrium estimate if timestep exceeds threshold 
		// the threshold is based on the fastest<< time required for the sun to provide the heat needed to reach equilibrium temperature
		// i.e. at min heat capacity 
		// e.g. for earth: 3% * (300 kelvin * 1e7 Joules per kelvin) / 400 joules per second in years
		//                    = 3 days

		// option 2:
		// define threshold as fraction of time needed to 

	};
}
