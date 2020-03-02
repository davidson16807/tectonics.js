

vec3 get_rgb_fraction_of_light_transmitted_through_ocean(
    in float cos_incident_angle, in float fluid_depth,
    in vec3  beta_ray,           in vec3  beta_mie,          in vec3  beta_abs
){
    float sigma  = fluid_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_by_ocean(
    in float cos_view_angle, 
    in float cos_light_angle, 
    in float cos_scatter_angle, 
    in float fluid_depth,
    in vec3  refracted_light_rgb_intensity,
    in vec3  beta_ray,       in vec3  beta_mie,          in vec3  beta_abs
){
    float NV = cos_view_angle;
    float NL = cos_light_angle;
    float VL = cos_scatter_angle;

    vec3 I = refracted_light_rgb_intensity;

    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);

    vec3  beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3  beta_sum   = beta_ray + beta_mie + beta_abs;

    // "sigma_v"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_l" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    float sigma_v  = fluid_depth / NV;
    float sigma_l = fluid_depth / NL;
    float sigma_ratio = 1. + NV/NL;

    return I 
        // incoming fraction: the fraction of light that scatters towards camera
        *     beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_v * sigma_ratio * beta_sum) - 1.)
        /               (-sigma_ratio * beta_sum);
}
