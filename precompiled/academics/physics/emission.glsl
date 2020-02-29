
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
float solve_fraction_of_light_emitted_by_black_body_below_wavelength(
    in float wavelength, 
    in float temperature
){ 
    const float iterations = 2.;
    const float h = PLANCK_CONSTANT;
    const float k = BOLTZMANN_CONSTANT;
    const float c = SPEED_OF_LIGHT;

    float L = wavelength;
    float T = temperature;

    float C2 = h*c/k;
    float z  = C2 / (L*T);
    float z2 = z*z;
    float z3 = z2*z;
    
    float sum = 0.;
    float n2=0.;
    float n3=0.;
    for (float n=1.; n <= iterations; n++) {
        n2 = n*n;
        n3 = n2*n;
        sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
    }
    return 15.*sum/(PI*PI*PI*PI);
}
float solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
    in float lo, 
    in float hi, 
    in float temperature
){
    return  solve_fraction_of_light_emitted_by_black_body_below_wavelength(hi, temperature) - 
            solve_fraction_of_light_emitted_by_black_body_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
float get_intensity_of_light_emitted_by_black_body(
    in float temperature
){
    float T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
vec3 solve_rgb_intensity_of_light_emitted_by_black_body(
    in float temperature
){
    return get_intensity_of_light_emitted_by_black_body(temperature)
         * vec3(
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
           );
}