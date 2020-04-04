// Thermodynamics is a namespace isolating all business logic relating to the transfer of radiation
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

const Thermodynamics = (function() {
    const Thermodynamics = {};

    // NOTE: this stays a private variable here until we can figure out where else to put it.
    const SPEED_OF_LIGHT = 299792458 * Units.METER / Units.SECOND; 

    Thermodynamics.BOLTZMANN_CONSTANT = 1.3806485279e-23 * Units.JOULE / Units.KELVIN;
    Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * Units.WATT / (Units.METER*Units.METER* Units.KELVIN*Units.KELVIN*Units.KELVIN*Units.KELVIN);
    Thermodynamics.PLANCK_CONSTANT = 6.62607004e-34 * Units.JOULE * Units.SECOND;
    Thermodynamics.MODERN_COSMIC_BACKGROUND_TEMPERATURE = 2.725 * Units.KELVIN;


    Thermodynamics.get_energy_of_photon_at_wavelength = function(wavelength) {
        return Thermodynamics.PLANCK_CONSTANT * SPEED_OF_LIGHT / wavelength;
    }

    // returns photon flux density in moles of photons per square meter per second
    Thermodynamics.get_photons_per_watt_emitted_by_black_body_between_wavelengths = function(lo, hi, temperature, sample_count, iterations_per_sample) {
        sample_count = sample_count || 1;
        iterations_per_sample = iterations_per_sample || 5;
        const range = hi-lo;
        const δλ = range / sample_count;
        const T = temperature;
        const F = Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths;
        const E = Thermodynamics.get_energy_of_photon_at_wavelength;
        let sum = 0;
        for (let λ = lo; λ < hi; λ += δλ) {
            sum += F(λ, λ+δλ, T, iterations_per_sample) / E(λ+δλ/2);
        }
        return sum;
    }

    // see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
    Thermodynamics.solve_fraction_of_light_emitted_by_black_body_below_wavelength = function(wavelength, temperature, iterations){ 
        iterations = iterations || 5;
        const π = Math.PI;
        const h = Thermodynamics.PLANCK_CONSTANT;
        const k = Thermodynamics.BOLTZMANN_CONSTANT;
        const c = SPEED_OF_LIGHT;
        const λ = wavelength;
        const T = temperature;
        const C2 = h*c/k;
        const z = C2 / (λ*T);
        const z2 = z*z;
        const z3 = z2*z;
        let sum = 0;
        for (let n=1, n2=0, n3=0; n < iterations; n++) {
            n2 = n*n;
            n3 = n2*n;
            sum += (z3 + 3*z2/n + 6*z/n2 + 6/n3) * Math.exp(-n*z) / n;
        }
        return 15*sum/(π*π*π*π);
    }
    Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths = function(lo, hi, temperature, iterations){
        iterations = iterations || 5;
        return     Thermodynamics.solve_fraction_of_light_emitted_by_black_body_below_wavelength(hi, temperature, iterations) - 
                Thermodynamics.solve_fraction_of_light_emitted_by_black_body_below_wavelength(lo, temperature, iterations);
    }
    Thermodynamics.solve_rgb_intensity_of_light_emitted_by_black_body = function(temperature){
        const I = Thermodynamics.get_intensity_of_light_emitted_by_black_body(temperature);
        return Vector(
                I * Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths(600e-9*Units.METER, 700e-9*Units.METER, temperature),
                I * Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths(500e-9*Units.METER, 600e-9*Units.METER, temperature),
                I * Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths(400e-9*Units.METER, 500e-9*Units.METER, temperature)
            );
    }



    // This calculates the radiation (in watts/m^2) that's emitted by a single object
    Thermodynamics.get_intensity_of_light_emitted_by_black_body = function(temperature) {
        return Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT * temperature * temperature * temperature * temperature;
    }
    // This calculates the radiation (in watts/m^2) that's emitted by the surface of an object.
    Thermodynamics.get_intensity_of_light_emitted_by_black_bodies = function(
            temperature,
            result
        ) {
        result = result || Float32Raster(temperature.grid);
        Float32Raster.fill(result, 1);
        ScalarField.mult_field    (result,         temperature,                         result);
        ScalarField.mult_field    (result,         temperature,                         result);
        ScalarField.mult_field    (result,         temperature,                         result);
        ScalarField.mult_field    (result,         temperature,                         result);
        ScalarField.mult_scalar    (result,         Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT,     result);

        return result;
    }







    // This calculates the uniform (non-field) temperature of a body given its luminosity 
    // TODO: put this under a new namespace? "Thermodynamics"? 
    Thermodynamics.get_equilibrium_temperature = function(heat) { 
        return Math.pow(heat/Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4); 
    } 
    // This calculates the temperature of a body given its luminosity
    // TODO: put this under a new namespace? "Thermodynamics"?
    Thermodynamics.get_equilibrium_temperatures = function(
            luminosity,
            result
        ) {
        result = result || Float32Raster(luminosity.grid);
        ScalarField.mult_scalar    (luminosity,     1/Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT,result);
        ScalarField.pow_scalar    (result,         1/4,                                         result);

        return result;
    }



    // calculates entropy given an energy and temperature,
    // returns results in Joules per Kelvin
    Thermodynamics.get_entropy = function(E, T) {
        return E/(Thermodynamics.BOLTZMANN_CONSTANT * T);
    }
    // calculates entropy given an energy flux and two temperature extremes,
    // returns results in Watts per Kelvin
    Thermodynamics.get_entropy_production = function(F, Th, Tc) {
        return F/(Thermodynamics.BOLTZMANN_CONSTANT * (Th - Tc));
    }




    Thermodynamics.guess_entropic_heat_flows = function(heat, heat_flow, result) {
        result = result || Float32Raster.FromExample(heat);

        Float32Dataset.normalize(heat, result, -heat_flow, heat_flow);
        ScalarTransport.fix_conserved_quantity_delta(result, 1e-5);

        return result;
    }
      // calculates entropic heat flow within a 2 box temperature model  
    // calculates heat flow within a 2 box temperature model 
    // using the Max Entropy Production Principle and Gradient Descent
    // for more information, see Lorenz et al. 2001: 
    // "Titan, Mars and Earth : Entropy Production by Latitudinal Heat Transport"
    Thermodynamics.solve_entropic_heat_flow = function(insolation_hot, insolation_cold, emission_coefficient, iterations) {
        iterations = iterations || 10;

        const Ih = insolation_hot;
        const Ic = insolation_cold;
        const β = emission_coefficient || 1.;
        // temperature given net energy flux

        const T = Thermodynamics.get_equilibrium_temperature;
        const S = Thermodynamics.get_entropy_production;

        // entropy production given heat flux
        function N(F, Ih, Ic) {
            return S(F, T((Ic+F)/β), T((Ih-F)/β));
        }
 
        // heat flow 
        let F = (Ih-Ic)/4; 
        let dF = F/iterations; // "dF" is a measure for how much F changes with each iteration 
        let dN;
        // reduce step_size by this fraction for each iteration 
        const annealing_factor = 0.8; 
        // amount to change F with each iteration
        for (let i = 0; i < iterations; i++) {
            // TODO: relax assumption that world must have earth-like rotation (e.g. tidally locked)
            dN = N(F-dF, Ih, Ic) - N(F+dF, Ih, Ic);
            F -= dF * Math.sign(dN);
            dF *= annealing_factor;
        }
        // console.log(T(Ih-2*F)-273.15, T(Ic+F)-273.15)
        return F;
    }




    return Thermodynamics;
})();
