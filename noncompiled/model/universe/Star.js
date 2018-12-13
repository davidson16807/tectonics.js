'use strict';

function Star(parameters) {
	var _this = this;

	this.mass = parameters['mass'] || stop('missing parameter: "mass"')

	// scaling laws from artifexian: https://www.youtube.com/watch?v=hG1of0MroM8
	var solar_masses = this.mass / Units.SOLAR_MASS;

	var solar_radii = this.mass < 1? Math.pow(solar_masses, 0.8) : Math.pow(solar_masses, 0.5);
	this.radius = solar_radii * Units.SOLAR_RADIUS;

	var solar_luminosities = Math.pow(solar_masses, 3.5);
	this.luminosity	= solar_luminosities * Units.SOLAR_LUMINOSITY;

	this.time_on_main_sequence = solar_masses/solar_luminosities * 10e9 * Units.YEAR;

	var surface_area = SphericalGeometry.surface_area(this.radius);
	var intensity = this.luminosity / surface_area;
	this.temperature = Math.pow(intensity / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4);

	this.getParameters = function() {
		return {
			type: 	'star',
			mass: 	this.mass,
		};
	}

	function assert_dependencies() { }

	this.setDependencies = function(dependencies) { };

	this.initialize = function() {
		assert_dependencies();
	}

	this.invalidate = function() {}

	this.calcChanges = function(timestep) {
		if (timestep === 0) {
			return;
		};

		assert_dependencies();
	};

	this.applyChanges = function(timestep){
		if (timestep === 0) {
			return;
		};
		
		assert_dependencies();
	};
}
