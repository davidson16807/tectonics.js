'use strict';

// "Ocean" is a component that holds the mass pools of an ocean.
// It contains only orthogonal state variables,
//  and side-effect-free functions that return attributes derived from them.
// It encapsulates variables and functions that are probably not useful elsewhere,
//  but it intentionally does not encapsulate member attributes 
//  because all attributes are orthogonal
//  and this design makes it clear there's nothing that will bite the user. 
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
var Ocean = (function() {
    // TODO: hoist these constants out of atmosphere as need arises
    const molecular_masses = {
        mass_N2  : 28.034  * Units.DALTON,
        mass_O2  : 31.9988 * Units.DALTON,
        mass_CO2 : 44.01   * Units.DALTON,
        mass_H2O : 18.02   * Units.DALTON,
        mass_CH4 : 16.043  * Units.DALTON,
        mass_C2H6: 30.070  * Units.DALTON,
        mass_Ar  : 39.948  * Units.DALTON,
        mass_He  : 4.0026  * Units.DALTON,
        mass_H2  : 2.016   * Units.DALTON,
        // NOTE: felsic rock is 63% SiO2 by mass,
        //  SiO2 is 60.08 orthoclase is 278.33, muscovite is 398.71
        //  mass: m = 0.63*m_s + 0.37*m_o
        //  
        mass_felsic :  60.08 * Units.DALTON, 
        // NOTE: olivine is 153.31
        mass_mafic  : 153.31 * Units.DALTON, 
        // NOTE: iron is 55.84, nickel is 58.69
        //  iron is more abundant in the universe, and their molecular masses are very similar,
        //  so we simply go with the molecular mass for iron
        mass_FeNi   :  55.84 * Units.DALTON,
    };
    // values are mostly from wolfram alpha
    const densities: {
        mass_N2  :    807,
        mass_O2  :   1141,
        mass_CO2 :   1101,
        mass_H2O :   1022, // NOTE: we use the density of seawater, because do not model the effect of solute concentration on density
        mass_CH4 :    423, 
        mass_C2H6:    545,
        mass_Ar  :   1401,
        mass_He  :    141,
        mass_H2  :     72,
        mass_felsic: 2180, // from Murase and McBirney (1973)
        mass_mafic:  2800, // from Murase and McBirney (1973)
        mass_FeNi:   7874,
    };
    // "molecular_absorption_cross_section" is a dictionary that maps mass pools to functions.
    // Each function accepts a range of the electromagnetic spectrum 
    //  (expressed as a range of wavenumbers, in units of waves per meter, A.K.A. meter^-1)
    //  and returns a crude approximation for the effective cross section 
    //  of a particle in that mass pool exposed to that range of the spectrum.
    //  (expressed in meter^2 per particle)
    // We want to capture a large range of effects
    //  (greenhouse gas effect, ozone layer, color of plants, physically based rendering, etc.)
    //  however the model must be performant and its output need only be representational, 
    //  so we prefer crude approximations that cover a broad range of the spectrum.
    // Unlike virtually every other variable involving light, this variable uses wavenumber instead of wavelength.
    // This is because wavenumber scales with energy, 
    //  and since we assume the user mostly cares about processes related to energy,
    //  we can take an average cross section across a range of wavenumbers and it should have some physical meaning. 
    const molecular_absorption_cross_section = {
        mass_N2  : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [6.5e6, 1e7,   8e7,   1e9], 
                [-35,   -20.5, -21.5, -23], 
                lo, hi
            ) / (hi - lo));
        },
        // NOTE: we assume that if UV light and O2 is present, then there must also be ozone,
        //  so we treat O2 as ozone within UV wavelengths.
        // TODO: revisit this, try to model O2/O3 conversion, and separate out their cross sections
        mass_O2  : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [0,  2e5,7e5,9e5,1.6e6,3e6, 3.5e6, 4.8e6, 6.1e6, 7.3e6, 8.1e6, 9.6e6, 1.2e7], 
                [-28,-26,-31,-28,-35,  -35, -26.8, -26.5, -21.3, -20.8, -22.3, -23.3, -22.0], 
                lo, hi
            ) / (hi - lo));
        },
        mass_CO2 : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [ 0,  1.5e6,5e6,  6.6e6,7.5e6,9e6,  4.7e7,1.5e8,5e8,2e9], 
                [-26,-34,  -30.5,-22.5,-22,   -20.5,-21,  -22,  -23,-26], 
                lo, hi
            ) / (hi - lo));
        },
        mass_H2O : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [0,  100, 2.1e6, 2.7e6, 6e6,   1.3e7,  2e8  ], 
                [-26,-24, -31.5, -29.5, -21.5, -20.5,  -22.5], 
                lo, hi
            ) / (hi - lo));
        },
        mass_CH4 : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [3.7e4, 2.9e5, 1.9e6, 2.3e6, 2.4e6, 6.2e6, 7.6e6, 1e7,   7e7  ],
                [-31,   -25,   -31,   -31,   -31,   -27,   -21,   -20.3, -22.5],
                lo, hi
            ) / (hi - lo));
        },
        mass_C2H6: function(lo, hi) { 
            return Math.pow(10, Interpolation.integral_of_lerp(
                [5.6e6, 7.6e6, 1.2e7, 5.3e7, 1.9e8],
                [-35,   -20.6, -20,   -21.5, -22.6],
                lo, hi
            ) / (hi - lo));
        },
        mass_Ar  : function(lo, hi) { return 1e-35; },
        mass_He  : function(lo, hi) { return 1e-35; },
        mass_H2  : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [5e6,  1e7,   2.6e7, 5.7e7], 
                [-35,  -20.6, -21.6, -22.6], 
                lo, hi
            ) / (hi - lo));
        },
        // NOTE: the remaining cross section functions here are for possible future use
        mass_O3  : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [0,  2e5,7e5,9e5,1.6e6,2e6,2.5e6,2.8e6,3e6,3.5e6,4.6e6,6e6,7.7e6,1.2e7], 
                [-28,-26,-31,-28,-24,  -25,-27,  -24.5,-23,-21,  -22.5,-22,-21,  -21  ], 
                lo, hi
            ) / (hi - lo));
        },
        mass_N2O : function(lo, hi) {
            return Math.pow(10, Interpolation.integral_of_lerp(
                [5e4, 6e4, 2.6e5, 7.7e5, 2.7e6, 7.6e6, 7.8e7, 2.1e8, 4.4e8], 
                [-35, -25, -24.4, -29,   -35,   -20.4, -21.4, -22.4, -21.8], 
                lo, hi
            ) / (hi - lo));
        }
        // mass_CO  : 
        // mass_NH3 : 
        // mass_NO  : 
        // mass_NO2 : 
        // mass_NO2 : 
        // mass_SO2 : 
    }
    const mass_pools = [
        'mass_N2',   
        'mass_O2',   
        'mass_CO2',  
        'mass_H2O',  
        'mass_CH4',  
        'mass_C2H6', 
        'mass_Ar',   
        'mass_He',   
        'mass_H2',   
    ];

    function Ocean(parameters) {
        parameters = parameters || {};
        
        // INDEPENDANT, EXTRINSIC, STATE:
        // independant state is always public and can be modified at any time
        this.mass_N2   = parameters.mass_N2   || 0;
        this.mass_O2   = parameters.mass_O2   || 0;
        this.mass_CO2  = parameters.mass_CO2  || 0;
        this.mass_H2O  = parameters.mass_H2O  || 0;
        this.mass_CH4  = parameters.mass_CH4  || 0;
        this.mass_C2H6 = parameters.mass_C2H6 || 0;
        this.mass_Ar   = parameters.mass_Ar   || 0;
        this.mass_He   = parameters.mass_He   || 0;
        this.mass_H2   = parameters.mass_H2   || 0;

        this.getParameters = function() {
            return {
                mass_N2   : this.mass_N2,
                mass_O2   : this.mass_O2,
                mass_CO2  : this.mass_CO2,
                mass_H2O  : this.mass_H2O,
                mass_CH4  : this.mass_CH4,
                mass_C2H6 : this.mass_C2H6,
                mass_Ar   : this.mass_Ar,
                mass_He   : this.mass_He,
                mass_H2   : this.mass_H2,
            };
        };

        // DERIVED ATTRIBUTES:
        // scalars are calculated within getters, 
        // rasters are calculated within memos
        
        var this_ = this;

        // "mean_molecular_refraction_between_diameters" returns the average molecular diameter 
        // for particles whose diameter falls within a range
        var mean_molecular_diameter_between_diameters = function(lo, hi) {
            var sum_molecular_diameter = 0;
            var sum_molecule_count = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var diameter = molecular_diameters[pool];
                var molecule_count = this_[pool] / molecular_masses[pool];
                if (lo < diameter && diameter < hi) {
                    sum_molecular_diameter += diameter * molecule_count;
                    sum_molecule_count += molecule_count;
                }
            };
            return sum_molecular_diameter / sum_molecule_count;
        }

        // derived scalars, public
        this.total_mass             = function() {
            return (
                this.mass_N2   +
                this.mass_O2   +
                this.mass_CO2  +
                this.mass_H2O  +
                this.mass_CH4  +
                this.mass_C2H6 +
                this.mass_Ar   +
                this.mass_He   +
                this.mass_H2   
            );
        }
        this.molecule_count         = function() {
            return (
                this.mass_N2   / molecular_masses.mass_N2   + 
                this.mass_O2   / molecular_masses.mass_O2   + 
                this.mass_CO2  / molecular_masses.mass_CO2  + 
                this.mass_H2O  / molecular_masses.mass_H2O  + 
                this.mass_CH4  / molecular_masses.mass_CH4  + 
                this.mass_C2H6 / molecular_masses.mass_C2H6 + 
                this.mass_Ar   / molecular_masses.mass_Ar   + 
                this.mass_He   / molecular_masses.mass_He   + 
                this.mass_H2   / molecular_masses.mass_H2    
            );
        }
        this.mean_molecular_mass    = function() {
            return this.total_mass() / this.molecule_count();
        }
        // use the Law of Dulong and Petit to find specific heat capacity
        this.specific_heat_capacity = function() {
            const mean_degrees_of_freedom = 3;
            return mean_degrees_of_freedom * (Thermodynamics.BOLTZMANN_CONSTANT / this.mean_molecular_mass());
        }
        // calculation from https://en.wikibooks.org/wiki/Introduction_to_Chemical_Engineering_Processes/The_most_important_point#Density_of_Liquid_Mixtures
        this.density        = function(gravity, surface_area, temperature) {
            var specific_volume = 0;
            var total_mass = this.total_mass();
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                specific_volume += (this[pool] / total_mass) / densities[pool]; 
            }
            return 1. / specific_volume;
        }
        this.molecular_density    = function(gravity, surface_area, temperature) {
            return this.surface_density(gravity, surface_area, temperature) / this.mean_molecular_mass();
        }
        // "mie_scattering_cross_section" indicates the mie scattering cross section for surface air.
        // This is the cross sectional area of a single particle that can scatter with a ray of light of given wavelength.
        // Multiply it by surface_molecular_density() to get a scattering coefficient, 
        //  then use the scattering coefficient to find the fraction of intensity lost to mie scattering via Beer's law.
        this.mie_scattering_cross_section = function(wavelength) {
            const π = Math.PI;
            const λ = wavelength;
            const r = mean_molecular_diameter_between_diameters(λ, Infinity) / 2.;
            // We actually model mie scattering cross section as the optical scattering cross section,
            //  which is closely related but is meant more for particles that are much larger than the wavelength
            // This makes it easier since the absorption cross section is equivalent to the particle cross section.
            // See http://www.mike-willis.com/Tutorial/rainscatter.htm
            //  or http://www.radartutorial.eu/01.basics/Rayleigh-%20versus%20Mie-Scattering.en.html
            //  for an introduction to the different scattering regimes.
            // One last thing: we check for NaNs in case there are no particles large enough to cause mie scattering
            //  if this  this case we return a very small number.
            return !isNaN(r)? π*r*r : 1e-35;
        }
        // "absorption_cross_section" indicates the absorption cross section for surface air.
        // This is the cross sectional area of a single particle that can scatter with a ray of light of given wavelength.
        // Multiply it by surface_molecular_density() to get an absorption coefficient, 
        //  then use the absorption coefficient to find the fraction of intensity lost to absorption via Beer's law.
        this.absorption_cross_section = function(wavelength_lo, wavelength_hi) {
            var sum_cross_section = 0;
            var sum_molecule_count = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var molecule_count = this_[pool] / molecular_masses[pool];
                var cross_section = molecular_absorption_cross_section[pool](1/wavelength_hi, 1/wavelength_lo);
                sum_cross_section += cross_section * molecule_count;
                sum_molecule_count += molecule_count;
            };
            return sum_cross_section / sum_molecule_count;
        }
    }

    return Ocean;
})();

