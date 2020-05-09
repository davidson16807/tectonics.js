
/*
"approx_fast_column_density_ratio_through_ring_system" 
  calculates the distance you would need to travel 
  along the center of a ring system to encounter the same number of particles 
  in the specified column. 
It does this by assuming a Gaussian density distribution 
 when travelling in the direction that's perpendicular to the ring.
All distances are recorded in scale heights.
"a" and "b" are distances along the ray from closest approach.
  The ray is fired in the positive direction.
"m"  is the "slope", the distance travelled parallel to the ring
  per unit traveled perpendicular to the ring.
*/
float approx_fast_column_density_ratio_through_ring_system(
    in float a,
    in float b,
    in float m
){
    return m*sqrt(PI)*(erf(b) - erf(a));
}
vec3 get_rgb_fraction_of_light_transmitted_through_ring_system(
    in vec3 view_origin, in vec3 view_direction, in float view_start_length, in float view_stop_length,
    vec3 ring_origin, vec3 ring_direction, float ring_scale_height, 
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    float h   = ring_scale_height;
    vec3  B0  = ring_origin/h;
    vec3  B   = ring_direction;
    vec3  D   = (view_direction * (view_stop_length - view_start_length)) / h; 
    vec3  V0  = (view_origin + view_direction * view_start_length - ring_origin) / h; 
    vec3  V1  = (view_origin + view_direction * view_stop_length  - ring_origin) / h;
    vec3  V   = view_direction;   // unit vector pointing to viewer

    float v02d = dot(V0,B);
    float v12d = dot(V1,B);
    float mv  = sqrt(1.-dot(V,B)*dot(V,B));
    vec3  beta_sum   = h*(beta_ray + beta_mie + beta_abs);
    float sigma = approx_fast_column_density_ratio_through_ring_system(v02d, v12d,  mv);
    return exp(-sigma * beta_sum);
}

vec3 get_rgb_fraction_of_distant_light_scattered_by_ring_system(
    vec3 view_origin, vec3 view_direction, float view_start_length, float view_stop_length,
    vec3 ring_origin, vec3 ring_direction, float ring_scale_height,
    vec3 light_direction, vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    // setup variable shorthands
    // express all distances in scale heights 
    // express all positions relative to world origin
    float h   = ring_scale_height;
    vec3  B0  = ring_origin/h;
    vec3  B   = ring_direction;
    vec3  L   = light_direction;  // unit vector pointing to light source
    vec3  D   = (view_direction * (view_stop_length - view_start_length)) / h; 
    vec3  V0  = (view_origin + view_direction * view_start_length - ring_origin) / h; 
    vec3  V1  = (view_origin + view_direction * view_stop_length  - ring_origin) / h;
    vec3  V   = view_direction;   // unit vector pointing to viewer
    float VL  = dot(V,L);

    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);

    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    vec3  beta_sum   = h*(beta_ray + beta_mie + beta_abs);
    vec3  beta_gamma = h*(beta_ray * gamma_ray + beta_mie * gamma_mie);
    
    // number of iterations within the raymarch
    const float STEP_COUNT = 8.; 
    float dv  = length(V1-V0) / STEP_COUNT;
    float vi  = 0.;
    float dl  = dv*VL;

    float v02d = dot(V0,B);
    float v12d = dot(V1,B);
    float mv   = sqrt(1.-dot(V,B)*dot(V,B));
    float ml   = sqrt(1.-dot(L,B)*dot(L,B));  
    float sigma;       // columnar density encountered along the entire path, relative to surface density, effectively the distance along the surface needed to obtain a similar column density
    vec3  F = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera

    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        vec3  Vi   = V0+V*vi; 
        
        float vi2d = dot(Vi,B);
        float li2d = dot(Vi,B*sign(dot(B,L)));
        
        ///*
        sigma =  approx_fast_column_density_ratio_through_ring_system(v02d, vi2d,  mv)
               + approx_fast_column_density_ratio_through_ring_system(li2d, 1e10, ml);
        //*/
        /*
        sigma =  solve_air_column_density_ratio_through_ring_system(v02d, vi2d,  mv)
               + solve_air_column_density_ratio_through_ring_system(li2d, 3.*ri, ml);
        */
        F +=
            // incoming fraction: the fraction of light that scatters towards camera
              exp(-vi2d*vi2d) * beta_gamma * dv
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * sigma);

        vi += dv;
        //li += dl;
    }

    return F;
}