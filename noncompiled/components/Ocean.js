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
    // "get_molecular_refraction_of_refractive_index_at_stp" returns molecular refraction 
    // from refractive index at standard temperature and pressure
    // see description from https://encyclopedia2.thefreedictionary.com/Molecular+Refraction
    // or https://goldbook.iupac.org/terms/view/M03979 for the related concept, "molar refraction"
    // see trying-to-find-molecular-refraction.md for how this was derived
    const get_molecular_refraction_of_refractive_index_at_stp = function(n) {
        return ((n*n-1)/(n*n+2)) * Units.STANDARD_MOLAR_VOLUME / Units.MOLE;
    }
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
        mass_SiO2     :  60.08 * Units.DALTON, 
        mass_KAlSi3O8 : 278.33 * Units.DALTON, 
        mass_Mg2SiO4  : 153.31 * Units.DALTON, 
        mass_Fe       :  55.84 * Units.DALTON,
    };
    // TODO: hoist these constants out of atmosphere as need arises
    const atoms_per_molecule = {
        mass_N2  : 2,
        mass_O2  : 2,
        mass_CO2 : 3,
        mass_H2O : 3,
        mass_CH4 : 5,
        mass_C2H6: 8,
        mass_Ar  : 1,
        mass_He  : 1,
        mass_H2  : 2,
        mass_SiO2     :  3, 
        mass_KAlSi3O8 : 13, 
        mass_Mg2SiO4  :  7, 
        mass_Fe       :  1,
    };
    // values are mostly from wolfram alpha
    const liquid_densities = {
        mass_N2  :     807,
        mass_O2  :    1141,
        mass_CO2 :    1101,
        mass_H2O :    1022, // NOTE: we use the density of seawater, because do not model the effect of solute concentration on density
        mass_CH4 :     423, 
        mass_C2H6:     545,
        mass_Ar  :    1401,
        mass_He  :     141,
        mass_H2  :      72,
        mass_SiO2:    2180, // from Murase and McBirney (1973), for rhyolitic magma
        mass_KAlSi3O8:2180, // from Murase and McBirney (1973), for rhyolitic magma
        mass_Mg2SiO4: 2800, // from Murase and McBirney (1973), for basaltic  magma
        mass_Fe  :    7874,
    };
    // "molecular_refractions" can be thought of as a refractive tendency when applied to a volume per molecule
    // see description from https://encyclopedia2.thefreedictionary.com/Molecular+Refraction
    // or https://goldbook.iupac.org/terms/view/M03979 for the related concept, "molar refraction"
    // derived using refractive indices from https://www.engineeringtoolbox.com/refractive-index-d_1264.html
    // as well as https://refractiveindex.info/?shelf=organic&book=ethane&page=Loria
    const molecular_refractions = {
        mass_N2      : get_molecular_refraction_of_refractive_index_at_stp(1.000298),
        mass_O2      : get_molecular_refraction_of_refractive_index_at_stp(1.000271),
        mass_CO2     : get_molecular_refraction_of_refractive_index_at_stp(1.000449),
        mass_H2O     : get_molecular_refraction_of_refractive_index_at_stp(1.000261),
        mass_CH4     : get_molecular_refraction_of_refractive_index_at_stp(1.000444),
        mass_C2H6    : get_molecular_refraction_of_refractive_index_at_stp(1.000752),
        mass_Ar      : get_molecular_refraction_of_refractive_index_at_stp(1.000281),
        mass_He      : get_molecular_refraction_of_refractive_index_at_stp(1.000035),
        mass_H2      : get_molecular_refraction_of_refractive_index_at_stp(1.000132),
        mass_SiO2    : get_molecular_refraction_of_refractive_index_at_stp(1.000600), // WARNING: wild ass guess based on correlation with molar mass
        mass_KAlSi3O8: get_molecular_refraction_of_refractive_index_at_stp(1.003000), // WARNING: wild ass guess based on correlation with molar mass
        mass_Mg2SiO4 : get_molecular_refraction_of_refractive_index_at_stp(1.001500), // WARNING: wild ass guess based on correlation with molar mass
        mass_Fe      : get_molecular_refraction_of_refractive_index_at_stp(1.000550), // WARNING: wild ass guess based on correlation with molar mass
    };
    // from https://en.wikipedia.org/wiki/Kinetic_diameter
    const molecular_diameters = {
        mass_N2      : 365 * Units.PICOMETER,
        mass_O2      : 346 * Units.PICOMETER,
        mass_CO2     : 330 * Units.PICOMETER,
        mass_H2O     : 265 * Units.PICOMETER,
        mass_CH4     : 380 * Units.PICOMETER,
        mass_C2H6    : 443 * Units.PICOMETER,
        mass_Ar      : 340 * Units.PICOMETER,
        mass_He      : 260 * Units.PICOMETER,
        mass_H2      : 289 * Units.PICOMETER,
        mass_SiO2    : 600 * Units.PICOMETER, // WARNING: wild ass guess based on correlation with molar mass
        mass_KAlSi3O8:3000 * Units.PICOMETER, // WARNING: wild ass guess based on correlation with molar mass
        mass_Mg2SiO4 :1500 * Units.PICOMETER, // WARNING: wild ass guess based on correlation with molar mass
        mass_Fe      : 550 * Units.PICOMETER, // WARNING: wild ass guess based on correlation with molar mass
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
        // "mean_molecular_refraction_between_diameters" returns the average molecular refraction 
        // for particles whose diameter falls within a range
        var mean_molecular_refraction_between_diameters = function(lo, hi) {
            var sum_molecular_refraction = 0;
            var sum_molecule_count = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var diameter = molecular_diameters[pool];
                if (!(pool in molecular_masses)) {
                    continue;
                }
                var molecule_count = this_[pool] / molecular_masses[pool];
                if (lo < diameter && diameter < hi) {
                    sum_molecular_refraction += molecular_refractions[pool] * molecule_count;
                    sum_molecule_count += molecule_count;
                }
            };
            return sum_molecular_refraction / sum_molecule_count;
        }

        // "mean_molecular_refraction_between_diameters" returns the average molecular diameter 
        // for particles whose diameter falls within a range
        var mean_molecular_diameter_between_diameters = function(lo, hi) {
            var sum_molecular_diameter = 0;
            var sum_molecule_count = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var diameter = molecular_diameters[pool];
                if (!(pool in molecular_masses)) {
                    continue;
                }
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
        this.total_volume           = function() {
            return this.total_mass() / this.density();
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
        this.atom_count         = function() {
            return (
                this.mass_N2   * atoms_per_molecule.mass_N2   / molecular_masses.mass_N2   + 
                this.mass_O2   * atoms_per_molecule.mass_O2   / molecular_masses.mass_O2   + 
                this.mass_CO2  * atoms_per_molecule.mass_CO2  / molecular_masses.mass_CO2  + 
                this.mass_H2O  * atoms_per_molecule.mass_H2O  / molecular_masses.mass_H2O  + 
                this.mass_CH4  * atoms_per_molecule.mass_CH4  / molecular_masses.mass_CH4  + 
                this.mass_C2H6 * atoms_per_molecule.mass_C2H6 / molecular_masses.mass_C2H6 + 
                this.mass_Ar   * atoms_per_molecule.mass_Ar   / molecular_masses.mass_Ar   + 
                this.mass_He   * atoms_per_molecule.mass_He   / molecular_masses.mass_He   + 
                this.mass_H2   * atoms_per_molecule.mass_H2   / molecular_masses.mass_H2    
            );
        }
        this.mean_molecular_mass    = function() {
            return this.total_mass() / this.molecule_count();
        }
        // use the Law of Dulong and Petit to find specific heat capacity for constant pressure, in Joules/(kilogram*Kelvin)
        this.specific_heat_capacity = function() {
            const mean_degrees_of_freedom = 3;
            return mean_degrees_of_freedom * Thermodynamics.BOLTZMANN_CONSTANT * this.atom_count() / this.total_mass();
        }
        // calculation from https://en.wikibooks.org/wiki/Introduction_to_Chemical_Engineering_Processes/The_most_important_point#Density_of_Liquid_Mixtures
        this.density        = function() {
            var specific_volume = 0;
            var total_mass = this.total_mass();
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                specific_volume += (this[pool] / total_mass) / liquid_densities[pool]; 
            }
            return 1. / specific_volume;
        }
        this.molecular_density    = function() {
            return this.molecule_count() / this.total_mass();
        }
        // "rayleigh_scattering_cross_section" indicates the rayleigh scattering cross section for surface air.
        // This is the cross sectional area of a single particle that can scatter a ray of light of given wavelength.
        // Multiply it by surface_molecular_density() to get a scattering coefficient, 
        //  then use the scattering coefficient to find the fraction of intensity lost to rayleigh scattering via Beer's law. 
        this.rayleigh_scattering_cross_section = function(wavelength) {
            const π = Math.PI;
            const λ = wavelength;
            const R = mean_molecular_refraction_between_diameters(0, λ);
            // see Platt (2007)
            // Platt states σ = 24*π^3/λ^4 * ((n*n-1)/(n*n+2))^2 / (count/volume)^2
            // and R = (n*n-1)/(n*n+2) * volume / count
            // So that simplifies to σ = 24*π^3/λ^4 * R^2
            return 24*π*π*π*R*R / (λ*λ*λ*λ);
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

