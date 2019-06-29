'use strict';

function Star(parameters) {
    var _this = this;

    // "id" is used to reference the world within the rest of the universe
    // It remains unique to the world regardless of name changes. 
    // It is not visible to the user.
    // It is effectively the primary key within the context of database design.
    this.id   = parameters.id;
    // "name" is the name of the world as understood by the user.
    // It is randomly generated and can be modified by the user at any time. 
    this.name = parameters.name;

    this.mass = parameters['mass'] || stop('missing parameter: "mass"')

    // scaling laws from artifexian: https://www.youtube.com/watch?v=hG1of0MroM8
    var solar_masses = this.mass / Units.SOLAR_MASS;

    var solar_radii = this.mass < 1? Math.pow(solar_masses, 0.8) : Math.pow(solar_masses, 0.5);
    this.radius = solar_radii * Units.SOLAR_RADIUS;

    var solar_luminosities = Math.pow(solar_masses, 3.5);
    this.luminosity    = solar_luminosities * Units.SOLAR_LUMINOSITY;

    this.time_on_main_sequence = solar_masses/solar_luminosities * 10e9 * Units.YEAR;

    var surface_area = SphericalGeometry.get_surface_area(this.radius);
    var intensity = this.luminosity / surface_area;
    this.surface_temperature = Math.pow(intensity / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4);

    this.getParameters = function() {
        return {
            type:     'star',
            id:       this.id,
            name:     this.name,
            mass:     this.mass,
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
