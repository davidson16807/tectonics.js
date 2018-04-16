'use strict';

function Hydrosphere(parameters) {

	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	// public variables
	this.sealevel = parameters['sealevel'] || 3682;
	this.surface_height = Float32Raster(grid);
	this.ocean_depth = Float32Raster(grid);
	this.average_ocean_depth = 0;
	this.ice_coverage = Float32Raster(grid);
	this.ocean_coverage = Float32Raster(grid);

	// private variables
	var sealevel_refresh = this.sealevel;
	var ocean_depth_refresh = Float32Raster(grid);

	var displacement = undefined;
	var material_density = undefined;

	function calculate_deltas(world, timestep) { }
	function calculate_refresh(world) {
		sealevel_refresh = HydrosphereModeling.solve_sealevel(displacement, world.average_ocean_depth, material_density.ocean, ocean_depth_refresh);
	}

	function apply_deltas(world) { }
	function apply_refresh(world) {
		world.sealevel = sealevel_refresh;
		Float32Raster.copy(ocean_depth_refresh, world.ocean_depth);
	}

	function assert_dependencies() {
		if (displacement === void 0)	 { throw '"displacement" not provided'; }
		if (material_density === void 0) { throw '"material_density" not provided'; }
	}

	this.setDependencies = function(dependencies) {
		displacement 	= dependencies['displacement'] 	!== void 0? 	dependencies['displacement'] 		: displacement;
		material_density= dependencies['material_density'] 	!== void 0? dependencies['material_density'] 	: material_density;
	};

	this.initialize = function() {
		assert_dependencies();

		HydrosphereModeling.get_ocean_depth(displacement, this.sealevel, this.ocean_depth);
		this.average_ocean_depth = Float32Dataset.average(this.ocean_depth);
	}

	this.calcChanges = function(timestep) {
		assert_dependencies();

		calculate_deltas(this, timestep); 			// this creates a world map of all additions and subtractions to crust (e.g. from erosion, accretion, etc.)
		calculate_refresh(this); 					// this calculates the updated state of the model to reflect the most recent changes to derived attributes
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};

		assert_dependencies();

		apply_deltas(this); 	// this applies additions and subtractions to crust
		apply_refresh(this); 	// this applies the updated state of the model to reflect the most recent changes to derived attributes
	};
}
