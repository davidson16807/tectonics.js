
// Rayleigh phase function factor [-1, 1]
FUNC(float) get_fraction_of_rayleigh_scattered_light_scattered_by_angle(
    IN(float) cos_scatter_angle
){
    return  3. * (1. + cos_scatter_angle*cos_scatter_angle)
    / //------------------------
                (16. * PI);
}

// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
FUNC(float) get_fraction_of_mie_scattered_light_scattered_by_angle(
    IN(float) cos_scatter_angle
){
    CONST(float) g = 0.76;
    return              (1. - g*g)
    / //---------------------------------------------
        ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}


// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
FUNC(float) approx_fraction_of_mie_scattered_light_scattered_by_angle_fast(
    IN(float) cos_scatter_angle
){
    CONST(float) g = 0.76;
    CONST(float) k = 1.55*g - 0.55 * (g*g*g);
    return          (1. - k*k)
    / //-------------------------------------------
        (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
