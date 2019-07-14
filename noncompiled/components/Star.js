'use strict';

// "Star" is a component that holds derived attributes of stars.
// It holds variables that are populated by the StellarPhysics system.
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
function Star(parameters) {
    parameters = parameters || {};

    this.radius                = parameters.radius;
    this.luminosity            = parameters.luminosity;
    this.surface_area          = parameters.surface_area;
    this.time_on_main_sequence = parameters.time_on_main_sequence;
    this.intensity             = parameters.intensity;
    this.surface_temperature   = parameters.surface_temperature;

    this.getParameters = function() {
        return {
            radius                : this.radius,
            luminosity            : this.luminosity,
            surface_area          : this.surface_area,
            time_on_main_sequence : this.time_on_main_sequence,
            intensity             : this.intensity,
            surface_temperature   : this.surface_temperature,
        };
    };
}

Star.get_steady_state = function(body, star) {
    star = star || new Star();

    var solar_masses          = body.mass / Units.SOLAR_MASS;
    var solar_luminosities    = Math.pow(solar_masses, 3.5);
    var solar_radii           = solar_masses < 1? Math.pow(solar_masses, 0.8) : Math.pow(solar_masses, 0.5);

    star.radius                = solar_radii * Units.SOLAR_RADIUS;
    star.luminosity            = solar_luminosities * Units.SOLAR_LUMINOSITY;
    star.surface_area          = SphericalGeometry.get_surface_area(star.radius);
    star.time_on_main_sequence = solar_masses/solar_luminosities * 10e9 * Units.YEAR;
    star.intensity             = star.luminosity / star.surface_area;
    star.surface_temperature   = Math.pow(star.intensity / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4);            

    return star;
}

// "StellarPhysics" is a system that populates the derived attributes of stars
var StellarPhysics = (function() {
    var StellarPhysics = {};

    StellarPhysics.update = function(input, output) {
        // NOTE: scaling laws from artifexian: https://www.youtube.com/watch?v=hG1of0MroM8
        for (var id of output.stars) {
            if (id in input.bodies) {
                var body = input.bodies[id];
                var star = output.stars [id];

                Star.get_steady_state(body, star);
            }
        }
    }

    return StellarPhysics;
}) ();
