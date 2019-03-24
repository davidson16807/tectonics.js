
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
FUNC(float) solve_fraction_of_light_emitted_by_black_body_below_wavelength(
    IN(float) wavelength, 
    IN(float) temperature
){ 
    CONST(float) iterations = 2.;
    CONST(float) h = PLANCK_CONSTANT;
    CONST(float) k = BOLTZMANN_CONSTANT;
    CONST(float) c = SPEED_OF_LIGHT;

    VAR(float) L = wavelength;
    VAR(float) T = temperature;

    VAR(float) C2 = h*c/k;
    VAR(float) z  = C2 / (L*T);
    VAR(float) z2 = z*z;
    VAR(float) z3 = z2*z;
    
    VAR(float) sum = 0.;
    VAR(float) n2=0.;
    VAR(float) n3=0.;
    for (VAR(float) n=1.; n <= iterations; n++) {
        n2 = n*n;
        n3 = n2*n;
        sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
    }
    return 15.*sum/(PI*PI*PI*PI);
}
FUNC(float) solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
    IN(float) lo, 
    IN(float) hi, 
    IN(float) temperature
){
    return  solve_fraction_of_light_emitted_by_black_body_below_wavelength(hi, temperature) - 
            solve_fraction_of_light_emitted_by_black_body_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
FUNC(float) get_intensity_of_light_emitted_by_black_body(
    IN(float) temperature
){
    VAR(float) T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
FUNC(vec3) solve_rgb_intensity_of_light_emitted_by_black_body(
    IN(float) temperature
){
    return get_intensity_of_light_emitted_by_black_body(temperature)
         * vec3(
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
           );
}