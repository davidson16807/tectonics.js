'use strict';

function Hydrosphere(parameters) {

	// public variables
	this.grid = parameters['grid'] || stop('missing parameter: "grid"');
	this.sealevel = parameters['sealevel'] || 3682;
	this.surface_height = Float32Raster(this.grid);
	this.ocean_depth = Float32Raster(this.grid);
	this.average_ocean_depth = 0;

	// private variables
	var sealevel_refresh = this.sealevel;
	var ocean_depth_updated = Float32Raster(this.grid);

	var displacement = undefined;
	var material_density = undefined;

	function calculate_deltas(world, timestep) { }
	function calculate_refresh(world) {
		sealevel_refresh = HydrosphereModeling.solve_sealevel(displacement, world.average_ocean_depth, material_density.ocean, ocean_depth_updated);
	}

	function apply_deltas(world) { }
	function apply_refresh(world) {
		world.sealevel = sealevel_refresh;
		Float32Raster.copy(ocean_depth_updated, world.ocean_depth);
	}

	this.initialize = function() {
		HydrosphereModeling.get_ocean_depth(displacement, this.sealevel, this.ocean_depth);
		this.average_ocean_depth = Float32Dataset.average(this.ocean_depth);
	}

	this.setDependencies = function(dependencies) {
		displacement = dependencies['displacement'] || displacement || stop('"displacement" not provided');
		material_density = dependencies['material_density'] || material_density || stop('"material_density" not provided');
	};

	this.calcChanges = function(timestep) {
		calculate_deltas(this, timestep); 			// this creates a world map of all additions and subtractions to crust (e.g. from erosion, accretion, etc.)
		calculate_refresh(this); 					// this creates a world map of all additions and subtractions to crust (e.g. from erosion, accretion, etc.)
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};

		apply_deltas(this); 	// this uses the map above in order to add and subtract crust
		apply_refresh(this); 	// this uses the map above in order to add and subtract crust
	};
}
