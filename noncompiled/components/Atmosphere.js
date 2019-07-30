'use strict';

// "Atmosphere" is a component that holds the mass pools of an atmosphere.
// It contains only orthogonal state variables,
//  and side-effect-free functions that return attributes derived from them.
// It encapsulates variables and functions that are probably not useful elsewhere,
//  but it intentionally does not encapsulate member attributes 
//  because all attributes are orthogonal
//  and this design makes it clear there's nothing that will bite the user. 
// It has no concept of climate, since that would require nonorthogonal state variables. 
// That responsibility is left to the "Climate" component.
// for more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
var Atmosphere = (function() {
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
    };
    // from http://hyperphysics.phy-astr.gsu.edu/hbase/Tables/heatcap.html
    const molecular_degrees_of_freedom = {
        mass_N2  : 5.0,
        mass_O2  : 5.1,
        mass_CO2 : 6.8,
        mass_H2O : 6.0,
        mass_CH4 : 6.0,
        mass_C2H6: 6.0,
        mass_Ar  : 3.0,
        mass_He  : 3.0,
        mass_H2  : 4.9,
    };
    // from https://en.wikipedia.org/wiki/Kinetic_diameter
    const molecular_diameters = {
        mass_N2  : 365 * Units.PICOMETER,
        mass_O2  : 346 * Units.PICOMETER,
        mass_CO2 : 330 * Units.PICOMETER,
        mass_H2O : 265 * Units.PICOMETER,
        mass_CH4 : 380 * Units.PICOMETER,
        mass_C2H6: 443 * Units.PICOMETER,
        mass_Ar  : 340 * Units.PICOMETER,
        mass_He  : 260 * Units.PICOMETER,
        mass_H2  : 289 * Units.PICOMETER,
    };
    // "molecular_refractions" can be thought of as a refractive tendency when applied to a volume per molecule
    // see description from https://encyclopedia2.thefreedictionary.com/Molecular+Refraction
    // or https://goldbook.iupac.org/terms/view/M03979 for the related concept, "molar refraction"
    // derived using refractive indices from https://www.engineeringtoolbox.com/refractive-index-d_1264.html
    // as well as https://refractiveindex.info/?shelf=organic&book=ethane&page=Loria
    const molecular_refractions = {
        mass_N2  : get_molecular_refraction_of_refractive_index_at_stp(1.000298),
        mass_O2  : get_molecular_refraction_of_refractive_index_at_stp(1.000271),
        mass_CO2 : get_molecular_refraction_of_refractive_index_at_stp(1.000449),
        mass_H2O : get_molecular_refraction_of_refractive_index_at_stp(1.000261),
        mass_CH4 : get_molecular_refraction_of_refractive_index_at_stp(1.000444),
        mass_C2H6: get_molecular_refraction_of_refractive_index_at_stp(1.000752),
        mass_Ar  : get_molecular_refraction_of_refractive_index_at_stp(1.000281),
        mass_He  : get_molecular_refraction_of_refractive_index_at_stp(1.000035),
        mass_H2  : get_molecular_refraction_of_refractive_index_at_stp(1.000132),
    }
    const molecular_absorption_cross_section = {
        mass_N2  : 
        mass_O2  : 
        mass_CO2 : 
        mass_H2O : 
        mass_CH4 : 
        mass_C2H6: 
        mass_Ar  : 
        mass_He  : 
        mass_H2  : 

        // NOTE: the remaining cross section function are here for possible future use
        mass_O3  : 
        mass_CO  : 
        mass_NO  : 
        mass_NO2 : 
        mass_NO2 : 

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

    function Atmosphere(parameters) {
        parameters = parameters || {};
        
        // INDEPENDANT STATE:
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
        // derived scalars, private
        // these are here to prevent saturating the user with functions that they will likely never use

        // "mean_molecular_refraction_between_diameters" returns the average molecular refraction 
        // for particles whose diameter falls within a range
        var mean_molecular_refraction_between_diameters = function(lo, hi) {
            var sum_molecular_refraction = 0;
            var sum_molecule_count = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var diameter = molecular_diameters[pool];
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
                this.mass_H    
            );
        }
        this.molecule_count         = function() {
            return (
                this.mass_N2   / molecular_masses.N2   + 
                this.mass_O2   / molecular_masses.O2   + 
                this.mass_CO2  / molecular_masses.CO2  + 
                this.mass_H2O  / molecular_masses.H2O  + 
                this.mass_CH4  / molecular_masses.CH4  + 
                this.mass_C2H6 / molecular_masses.C2H6 + 
                this.mass_Ar   / molecular_masses.Ar   + 
                this.mass_He   / molecular_masses.He   + 
                this.mass_H    / molecular_masses.H    ; 
            );
        }
        this.mean_molecular_mass    = function() {
            return this.total_mass() / this.molecule_count();
        }
        this.specific_heat_capacity = function() {
            var sum_heat_capacity = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var molecule_count = this_[pool] / molecular_masses[pool];
                var heat_capacity = molecular_degrees_of_freedom[pool] / 2 + 1;
                sum_heat_capacity += heat_capacity * molecule_count;
                sum_molecule_count += molecule_count;
            };
            return sum_heat_capacity / sum_molecule_count;
        }
        this.scale_height           = function(gravity, temperature) {
            return Thermodynamics.BOLTZMANN_CONSTANT * temperature / (this.mean_molecular_mass() * gravity);
        }
        this.surface_pressure       = function(gravity, surface_area) {
            return this.total_mass() * gravity / surface_area;
        }
        this.surface_density        = function(gravity, surface_area, temperature) {
            var total_mass = this.total_mass();
            var surface_pressure = total_mass * gravity / surface_area;
            return total_mass * surface_pressure / (this.molecule_count() * Thermodynamics.BOLTZMANN_CONSTANT * temperature);
        }
        this.surface_molecular_density    = function(gravity, surface_area, temperature) {
            return this.surface_density(gravity, surface_area, temperature) / this.mean_molecular_mass();
        }
        this.lapse_rate       = function(gravity) {
            return gravity / this.specific_heat_capacity();
        }
        // "rayleigh_scattering_cross_section" indicates the rayleigh scattering cross section for surface air.
        // This is the cross sectional area of a single particle that can scatter a ray of light of given wavelength.
        // Multiply it by surface_molecular_density() to get a scattering coefficient, 
        //  then use the scattering coefficient to find the fraction lost to rayleigh scattering via Beer's law. 
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
        //  then use the scattering coefficient to find the fraction lost to mie scattering via Beer's law.
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
            return π*r*r;
        }
        // "absorption_cross_section" indicates the absorption cross section for surface air.
        // This is the cross sectional area of a single particle that can scatter with a ray of light of given wavelength.
        // Multiply it by surface_molecular_density() to get an absorption coefficient, 
        //  then use the absorption coefficient to find the fraction lost to absorption via Beer's law.
        this.absorption_cross_section = function(wavelength) {
            var sum_cross_section = 0;
            for (var i = 0, li = mass_pools.length; i < li; i++) {
                var pool = mass_pools[i];
                var molecule_count = this_[pool] / molecular_masses[pool];
                var cross_section = molecular_absorption_cross_section[pool](wavelength);
                sum_cross_section += cross_section * molecule_count;
                sum_molecule_count += molecule_count;
            };
            return sum_cross_section / sum_molecule_count;
        }
        this.pressure_at_height     = function(gravity, surface_area, temperature, height) {
            this.surface_pressure(gravity, surface_area) * Math.exp(-height / this.scale_height(gravity, temperature));
        }
        this.density_at_height      = function(gravity, surface_area, temperature, height) {
            this.surface_pressure(gravity, surface_area) * Math.exp(-height / this.scale_height(gravity, temperature));
        }
        this.temperature_at_height  = function(gravity, surface_temperature, height) {
            surface_temperature - height * this.lapse_rate(gravity);
        }
    }

    return Atmosphere;
})();

