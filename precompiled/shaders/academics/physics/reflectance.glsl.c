// "get_fraction_of_light_reflected_on_surface_head_on" finds the fraction of light that's reflected
//   by a boundary between materials when striking head on.
//   It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
//   The refractive indices can be provided as parameters in any order.
FUNC(float) get_fraction_of_light_reflected_on_surface_head_on(
    IN(float) refractivate_index1, 
    IN(float) refractivate_index2
){
    VAR(float) n1 = refractivate_index1;
    VAR(float) n2 = refractivate_index2;
    VAR(float) sqrtR0 = ((n1-n2)/(n1+n2));
    VAR(float) R0 = sqrtR0 * sqrtR0;
    return R0;
}
// "get_fraction_of_light_reflected_on_surface" returns Fresnel reflectance.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
FUNC(float) get_fraction_of_light_reflected_on_surface(
    IN(float) cos_incident_angle, 
    IN(float) characteristic_reflectance
){
    VAR(float) R0 = characteristic_reflectance;
    VAR(float) _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_rgb_fraction_of_light_reflected_on_surface" returns Fresnel reflectance for each color channel.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
FUNC(vec3) get_rgb_fraction_of_light_reflected_on_surface(
    IN(float) cos_incident_angle, 
    IN(vec3) characteristic_reflectance
){
    VAR(vec3) R0 = characteristic_reflectance;
    VAR(float) _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_fraction_of_light_masked_or_shaded_by_surface" is Schlick's fast approximation for Smith's function
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for even more details.
FUNC(float) get_fraction_of_light_masked_or_shaded_by_surface(
    IN(float) cos_view_angle, 
    IN(float) root_mean_slope_squared
){
    VAR(float) m = root_mean_slope_squared;
    VAR(float) v = cos_view_angle;
    VAR(float) k = sqrt(2.*m*m/PI);
    return v/(v-k*v+k); 
}
// "get_fraction_of_microfacets_with_angle" 
//   This is also known as the Beckmann Surface Normal Distribution Function.
//   This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
//   see Hoffmann 2015 for a gentle introduction to the concept.
//   see Schlick (1994) for even more details.
FUNC(float) get_fraction_of_microfacets_with_angle(
    IN(float) cos_angle_of_deviation, 
    IN(float) root_mean_slope_squared
){
    VAR(float) m = root_mean_slope_squared;
    VAR(float) t = cos_angle_of_deviation;
    return exp((t*t-1.)/(m*m*t*t))/(m*m*t*t*t*t);
}

