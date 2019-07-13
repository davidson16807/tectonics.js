'use strict';

// "Star" is a component that holds derived attributes of stars.
// It holds variables that are populated by the StellarPhysics system.
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
function Star(parameters) {
    this.radius                = 0;
    this.luminosity            = 0;
    this.surface_area          = 0;
    this.time_on_main_sequence = 0;
    this.intensity             = 0;
    this.surface_temperature   = 0;

    this.getParameters = function() {
        return {};
    };
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

                var solar_masses          = star.mass / Units.SOLAR_MASS;
                var solar_luminosities    = Math.pow(solar_masses, 3.5);
                var solar_radii           = solar_masses < 1? Math.pow(solar_masses, 0.8) : Math.pow(solar_masses, 0.5);

                star.radius                = solar_radii * Units.SOLAR_RADIUS,
                star.luminosity            = solar_luminosities * Units.SOLAR_LUMINOSITY,
                star.surface_area          = SphericalGeometry.get_surface_area(star.radius),
                star.time_on_main_sequence = solar_masses/solar_luminosities * 10e9 * Units.YEAR,
                star.intensity             = star.luminosity / star.surface_area,
                star.surface_temperature   = Math.pow(star.intensity / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4),            
            }
        }
    }

    return StellarPhysics;
}) ();
