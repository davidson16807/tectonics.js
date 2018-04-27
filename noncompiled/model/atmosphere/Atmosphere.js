'use strict';

function Atmosphere(parameters) {
	// private variables
	var grid = parameters['grid'] || stop('missing parameter: "grid"');
	var lat = new Memo(
		Float32Raster(grid),  
		result => Float32SphereRaster.latitude(grid.pos.y, result)
	); 
	var max_absorbed_radiation = new Memo(
		Float32Raster(grid),  
		result => Float32Dataset.max(self.absorbed_radiation.value())
	);
	var min_absorbed_radiation = new Memo(
		Float32Raster(grid),  
		result => Float32Dataset.min(self.absorbed_radiation.value())
	);
	var heat_flow = new Memo( 0,
		current_value => AtmosphereModeling.solve_heat_flow(
			max_absorbed_radiation.value(), 
			min_absorbed_radiation.value(), 
			4/3, 10
		);
	);
	var mep_max_surface_temp = new Memo( 0,
		current_value => AtmosphereModeling.get_scalar_equilibrium_temperature(
			max_absorbed_radiation.value() - 2*heat_flow.value(), 
			4/3);
	);
	var mep_min_surface_temp = new Memo( 0,
		current_value => AtmosphereModeling.get_scalar_equilibrium_temperature(
			min_absorbed_radiation.value() + heat_flow.value(), 
			4/3);
	);
	// public variables
	var self = this;
	this.surface_temp = new Memo(
		Float32Raster(grid),  
		result => AtmosphereModeling.surface_air_temp(grid.pos, mean_anomaly, axial_tilt, result)
	); 
	this.surface_pressure = new Memo(
		Float32Raster(grid),  
		result => AtmosphereModeling.surface_air_pressure(
				displacement.value(), 
				lat.value(), 
				sealevel.value(), 
				mean_anomaly, 
				axial_tilt, 
				result
			)
	); 
	this.surface_wind_velocity = new Memo(
		VectorRaster(grid),  
		result => AtmosphereModeling.surface_air_velocity(grid.pos, surface_pressure.value(), angular_speed, result)
	); 
	this.precip = new Memo(
		Float32Raster(grid),  
		result => AtmosphereModeling.precip(lat.value(), result)
	); 
	this.albedo = new Memo(
		Float32Raster(grid),  
		result => AtmosphereModeling.albedo(ocean_coverage.value(), ice_coverage.value(), plant_coverage.value(), result)	
	);
	this.absorbed_radiation = new Memo(
		Float32Raster(grid),  
		result => ScalarField.mult_field(incident_radiation.value(), self.albedo.value(), result)
	);

	// private variables
	var displacement 	= undefined;
	var ocean_coverage 	= undefined;
	var ice_coverage 	= undefined;
	var plant_coverage 	= undefined;
	var mean_anomaly 	= undefined;
	var axial_tilt 		= undefined;
	var angular_speed 	= undefined;
	var sealevel 		= undefined;
	var incident_radiation = undefined;

	function assert_dependencies() {
		if (displacement === void 0)	 { throw '"displacement" not provided'; }
		if (ocean_coverage === void 0)	 { throw '"ocean_coverage" not provided'; }
		if (ice_coverage === void 0)	 { throw '"ice_coverage" not provided'; }
		if (plant_coverage === void 0)	 { throw '"plant_coverage" not provided'; }
		if (mean_anomaly === void 0)	 { throw '"mean_anomaly" not provided'; }
		if (axial_tilt === void 0)		 { throw '"axial_tilt" not provided'; }
		if (angular_speed === void 0)	 { throw '"angular_speed" not provided'; }
		if (sealevel === void 0)		 { throw '"sealevel" not provided'; }
		if (incident_radiation === void 0) { throw '"incident_radiation" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		displacement 		= dependencies['displacement'] 	!== void 0? 	dependencies['displacement'] 	: displacement;		
		ocean_coverage 		= dependencies['ocean_coverage']!== void 0? 	dependencies['ocean_coverage'] 	: ocean_coverage;		
		ice_coverage 		= dependencies['ice_coverage'] 	!== void 0? 	dependencies['ice_coverage'] 	: ice_coverage;		
		plant_coverage 		= dependencies['plant_coverage']!== void 0? 	dependencies['plant_coverage'] 	: plant_coverage;	
		mean_anomaly 		= dependencies['mean_anomaly'] 	!== void 0? 	dependencies['mean_anomaly'] 	: mean_anomaly;		
		axial_tilt 			= dependencies['axial_tilt'] 	!== void 0? 	dependencies['axial_tilt'] 		: axial_tilt;		
		angular_speed 		= dependencies['angular_speed'] !== void 0? 	dependencies['angular_speed'] 	: angular_speed;	
		sealevel 			= dependencies['sealevel'] 		!== void 0? 	dependencies['sealevel'] 		: sealevel;			
		incident_radiation 	= dependencies['incident_radiation'] !== void 0? dependencies['incident_radiation'] : incident_radiation;			
	};

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		this.surface_temp 			.invalidate();
		this.surface_pressure 		.invalidate();
		this.surface_wind_velocity 	.invalidate();
		this.precip 				.invalidate();
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		
		assert_dependencies();
	};
}
