'use strict';

// "World" is a component that holds attributes inherent to all worlds,
// including a break down of their total appreciable mass.
// It is used in combination with the PlanetaryDifferentiation system
// to distribute total mass amongst an interior, crust, ocean, and atmosphere
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
var World = (function() {
    // NOTE: We do not use a standard table of densities here,
    //  because solids are significantly compressed at the pressures 
    //  found within the interiors of worlds, so the usual densities don't apply. 
    // We instead use values for density that are most likely to occur
    //  whenever the quantity of a substance is large enough 
    //  to make a significant contribution to a world's mass.
    // We may think about modeling the effects of compression on density later. 
    // All units are in kilograms per cubic meter
    var densities = {
        FeNi: 13000, // compressed iron+nickel
        SiX :  4000, // compressed silicates
        H2O :  1000, // water ice
        HHe :  1300  // metallic hydrogen and liquid helium, derived from Jupiter
    }

    function World(parameters) {
        parameters = parameters || {};
        
        // INDEPENDANT ATTRIBUTES:
        // independant attributes are always public and can be modified at any time
        this.mass_FeNi= parameters.mass_FeNi || 0; // iron + nickel        kilograms
        this.mass_SiX = parameters.mass_SiX  || 0; // silicate             kilograms
        this.mass_H2O = parameters.mass_H2O  || 0; // water                kilograms
        this.mass_HHe = parameters.mass_HHe  || 0; // hydrogen + helium    kilograms

        this.getParameters = function() {
            return {
                mass_FeNi: this.mass_FeNi,  
                mass_SiX : this.mass_SiX, 
                mass_H2O : this.mass_H2O, 
                mass_HHe : this.mass_HHe, 
            };
        };

        // DERIVED ATTRIBUTES:
        // scalars are calculated within getters, 
        // rasters are calculated within memos

        // derived scalars
        this.volume = function() {
            return this.mass_FeNi / densities.FeNi+
                   this.mass_SiX  / densities.SiX + 
                   this.mass_H2O  / densities.H2O + 
                   this.mass_HHe  / densities.HHe;
        };
        this.total_mass            = () => this.mass_FeNi + this.mass_SiX + this.mass_H2O + this.mass_HHe;
        this.density               = () => this.total_mass() / this.volume();
        this.radius                = () => SphericalGeometry.get_radius_from_volume(this.volume());
        this.surface_area          = () => SphericalGeometry.get_surface_area(this.radius());
        this.surface_gravity       = () => OrbitalMechanics.get_gravity(this.total_mass(), this.radius());
    }

    return World;
})();

// "PlanetaryDifferentiation" automatically distributes a planet's mass amongst its pools:
// a solid core, liquid mantle, solid crust, liquid ocean, solid icecaps, and gaseous atmosphere
// this partitioning represents a succession of alternating changes in material and temperature
var PlanetaryDifferentiation = function() {
    
}