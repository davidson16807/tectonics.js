'use strict';

function Star(parameters) {
	var self = this;

	// private variables
	var grid = parameters['grid'] || stop('missing parameter: "grid"');

	// public variables
	var self = this;
	this.stellar_luminosity			= parameters['stellar_luminosity'] 			|| StellarEvolution.SOLAR_LUMINOSITY;

	function assert_dependencies() { }

	this.setDependencies = function(dependencies) { };

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {
		// NOTE: we don't need to invalidate these commented-out attributes, because the underlying data doesn't change often
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
