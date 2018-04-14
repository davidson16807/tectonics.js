'use strict';

function Hydrosphere(parameters) {
	this.grid = parameters['grid'] || stop('missing parameter: "grid"');

	var displacement = Float32Raster(this.grid);

	this.ocean_depth = Float32Raster(this.grid);
	this.sealevel = parameters['sealevel'] || 3682;
	this.total_water_mass = 0;


	function calculate_deltas(world, timestep) {
		
	}

	function integrate_deltas(world) { 
	  	var grid = world.grid;

	  	var scratchpad = RasterStackBuffer.scratchpad;
	  	scratchpad.allocate('integrate_deltas');

	  	scratchpad.deallocate('integrate_deltas');
	}

	this.setDependencies = function(dependencies) {
		displacement = dependencies['displacement']|| displacement 	|| stop('"displacement" not provided');
	};

	this.calcChanges = function(timestep) {
		calculate_deltas		(this, timestep); 			// this creates a world map of all additions and subtractions to crust (e.g. from erosion, accretion, etc.)
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};

		integrate_deltas(this); 	// this uses the map above in order to add and subtract crust
	};
}
