'use strict';

// "Star" is a component that holds attributes of stars.
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
function Star(parameters) {
    parameters = parameters || {};

    // INDEPENDANT ATTRIBUTES:
    // independant attributes are always public and can be modified at any time
    this.mass_H     = parameters.mass_H     || 0; // hydrogen kilograms
    this.mass_He    = parameters.mass_He    || 0; // helium   kilograms
    this.mass_metal = parameters.mass_metal || 0; // helium   kilograms

    this.getParameters = function() {
        return {
            mass_H  : this.mass_H,
            mass_He : this.mass_He,
        };
    };

    // DERIVED ATTRIBUTES:
    // derived scalars are always calculated within getters, 
    // derived rasters are always calculated within memos

    // derived scalars, private
    var this_ = this;
    var solar_masses          = () => this.total_mass() / Units.SOLAR_MASS;
    var solar_luminosities    = () => Math.pow(solar_masses(), 3.5);
    var solar_radii           = () => solar_masses() < 1? Math.pow(solar_masses(), 0.8) : Math.pow(solar_masses(), 0.5);

    // derived scalars, public
    this.total_mass            = () => this.mass_H + this.mass_He;
    this.radius                = () => solar_radii() * Units.SOLAR_RADIUS;
    this.surface_area          = () => SphericalGeometry.get_surface_area(this.radius());
    this.luminosity            = () => solar_luminosities() * Units.SOLAR_LUMINOSITY;
    this.time_on_main_sequence = () => solar_masses()/solar_luminosities() * 10e9 * Units.YEAR;
    this.intensity             = () => this.luminosity() / this.surface_area();
    this.surface_temperature   = () => Math.pow(this.intensity() / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4);
}

// "StellarFusion" represents the evolution of a star's composition as it ages
var StellarFusion = function() {
    
}