'use strict';

// "Star" is a component that holds attributes of stars.
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
function Star(parameters) {
    // TODO: hoist these constants out of star as need arises
    const atomic_masses = {
        mass_He   : 4.0026 * Units.DALTON,
        mass_H    : 1.008  * Units.DALTON,
        mass_metal: 15.999 * Units.DALTON, 
        // NOTE: mass of atomic oxygen is used as a representative value for metals,
        // since it is the most common metal in stars
    };

    parameters = parameters || {};

    // INDEPENDANT ATTRIBUTES:
    // independant attributes are always public and can be modified at any time
    this.age        = parameters.age        || 0; // seconds
    this.mass_H     = parameters.mass_H     || 0; // hydrogen kilograms
    this.mass_He    = parameters.mass_He    || 0; // helium   kilograms
    this.mass_metal = parameters.mass_metal || 0; // helium   kilograms

    this.getParameters = function() {
        return {
            mass_H     : this.mass_H,
            mass_He    : this.mass_He,
            mass_metal : this.mass_metal,
        };
    };

    // DERIVED ATTRIBUTES:
    // derived scalars are always calculated within getters, 
    // derived rasters are always calculated within memos

    // derived scalars, private
    let this_ = this;
    let solar_masses          = () => this.total_mass() / Units.SOLAR_MASS;
    let solar_luminosities    = () => Math.pow(solar_masses(), 3.5);
    let solar_radii           = () => solar_masses() < 1? Math.pow(solar_masses(), 0.8) : Math.pow(solar_masses(), 0.5);
    let solar_mean_molecular_masses = () => this.mean_molecular_mass() / (0.6 * Units.DALTON);

    // derived scalars, public
    // See Artifexian's video on stars for the source on approximations (I know, not a very solid source):
    // https://www.youtube.com/watch?v=x55nxxaWXAM
    this.total_mass            = () => this.mass_H + this.mass_He;
    this.radius                = () => solar_radii() * Units.SOLAR_RADIUS;
    this.surface_area          = () => SphericalGeometry.get_surface_area(this.radius());
    this.luminosity            = () => solar_luminosities() * Units.SOLAR_LUMINOSITY;
    this.time_on_main_sequence = () => solar_masses()/solar_luminosities() * 10e9 * Units.YEAR;
    this.intensity             = () => this.luminosity() / this.surface_area();
    this.surface_temperature   = () => Math.pow(this.intensity() / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4);
    this.total_mass            = function() {
        return (
            this.mass_He   +
            this.mass_H    +
            this.mass_metal
        );
    }
    this.molecule_count         = function() {
        return (
            this.mass_He   / atomic_masses.mass_He   + 
            this.mass_H    / atomic_masses.mass_H    +
            this.mass_metal/ atomic_masses.mass_metal 
        );
    }
    /*
    See "Stellar Interiors: Physical Principles, Structure, and Evolution" by Hansen et al.
    for a description on the approximations for mean molecular mass, pressure, and temperature used below
    */
    this.mean_molecular_mass_of_ions    = function() {
        return this.total_mass() / this.molecule_count();
    }
    this.mean_molecular_mass_per_electron = function() {
        // NOTE: this approximation assumes that metals are rare,
        // and all elements are completely ionized in a star's core
        return 2.0 * Units.DALTON / (1.0 + this.mass_H / this.total_mass());
    }
    this.mean_molecular_mass    = function() {
        return 1.0 / (1.0 / this.mean_molecular_mass_of_ions() + 1.0 / this.mean_molecular_mass_per_electron());
    }
    this.core_pressure = function() {
        let radius = this.radius();
        let mass = this.total_mass();
        return (
            3.0 / (8*Math.PI)
            * GRAVITATIONAL_CONSTANT
            * mass * mass
            / (radius * radius * radius * radius)
        );
    }
    this.pressure_at_distance_to_core = function(distance) {
        let fraction_of_radius = distance / this.radius();
        return (
            this.core_pressure()
            * (1.0 - fraction_of_radius*fraction_of_radius)
        );
    }
    this.core_temperature = function() {
        return (
            15e6 * KELVIN 
            * solar_mean_molecular_masses()
            * solar_masses()
            / solar_radii()
        );
    }
    this.temperature_at_distance_to_core = function(distance) {
        let fraction_of_radius = distance / this.radius();
        return (
            this.core_temperature()
            * (1.0 - fraction_of_radius*fraction_of_radius)
        );
    }
}

// "StellarFusion" represents the evolution of a star's composition as it ages
let StellarFusion = function() {
    
}