
/*
"get_fraction_of_microfacets_accessible_to_ray" is Schlick's fast approximation for Smith's function
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for even more details.
*/
float get_fraction_of_microfacets_accessible_to_ray(
    in float cos_view_angle, 
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float v = cos_view_angle;
    // float k = m/2.0; return 2.0*v/(v+sqrt(m*m+(1.0-m*m)*v*v)); // Schlick-GGX
    float k = m*sqrt(2./PI); return v/(v*(1.0-k)+k); // Schlick-Beckmann
}
/*
"get_fraction_of_microfacets_with_angle" 
  This is also known as the Beckmann Surface Normal Distribution Function.
  This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
  see Hoffmann 2015 for a gentle introduction to the concept.
  see Schlick (1994) for even more details.
*/
float get_fraction_of_microfacets_with_angle(
    in float cos_angle_of_deviation, 
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float t = cos_angle_of_deviation;
    float m2 = m*m;
    float t2 = t*t;
    float u = t2*(m2-1.0)+1.0; return m2/(PI*u*u);
    //return exp((t*t-1.)/max(m*m*t*t, 0.1))/max(PI*m*m*t*t*t*t, 0.1);
}
/*
"get_fraction_of_light_reflected_from_facet_head_on" finds the fraction of light that's reflected
  by a boundary between materials when striking head on.
  It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
  The refractive indices can be provided as parameters in any order.
*/
float get_fraction_of_light_reflected_from_facet_head_on(
    in float refractivate_index1, 
    in float refractivate_index2
){
    float n1 = refractivate_index1;
    float n2 = refractivate_index2;
    float sqrtF0 = ((n1-n2)/(n1+n2));
    float F0 = sqrtF0 * sqrtF0;
    return F0;
}
/*
"get_rgb_fraction_of_light_reflected_from_facet" returns Fresnel reflectance for each color channel.
  Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
  It is the fraction of light that causes specular reflection.
  Here, we use Schlick's fast approximation for Fresnel reflectance.
  see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for implementation details
*/
vec3 get_rgb_fraction_of_light_reflected_from_facet(
    in float cos_incident_angle, 
    in vec3 characteristic_reflectance
){
    vec3 F0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return F0 + (1.-F0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
/*
"get_fraction_of_light_reflected_from_material" is a fast approximation to the Cook-Torrance Specular BRDF.
  It is the fraction of light that reflects from a material to the viewer.
  see Hoffmann 2015 for a gentle introduction to the concept
*/
vec3 get_fraction_of_light_reflected_from_material(
    in float NL, in float NH, in float NV, in float HV, 
    in float root_mean_slope_squared,
    in vec3 characteristic_reflectance
){
    float m = root_mean_slope_squared;
    vec3  F0 = characteristic_reflectance;
    return 1.0
        * get_fraction_of_microfacets_accessible_to_ray(NL, m) 
        * get_fraction_of_microfacets_with_angle(NH, m)
        * get_fraction_of_microfacets_accessible_to_ray(NV, m) 
        * get_rgb_fraction_of_light_reflected_from_facet(HV, F0)
        / max(4.*PI*NV*NL, 0.001); 
}
