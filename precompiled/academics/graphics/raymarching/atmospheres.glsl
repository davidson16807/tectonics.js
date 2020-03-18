

// "approx_air_column_density_ratio_through_atmosphere" 
//   calculates the distance you would need to travel 
//   along the surface to encounter the same number of particles in the column. 
// It does this by finding an integral using integration by substitution, 
//   then tweaking that integral to prevent division by 0. 
// All distances are recorded in scale heights.
// "a" and "b" are distances along the ray from closest approach.
//   The ray is fired in the positive direction.
//   If there is no intersection with the planet, 
//   a and b are distances from the closest approach to the upper bound.
// "z2" is the closest distance from the ray to the center of the world, squared.
// "r0" is the radius of the world.
float approx_air_column_density_ratio_through_atmosphere(
    in float a,
    in float b,
    in float z2,
    in float r0
){
    // GUIDE TO VARIABLE NAMES:
    //  "x*" distance along the ray from closest approach
    //  "z*" distance from the center of the world at closest approach
    //  "r*" distance ("radius") from the center of the world
    //  "*0" variable at reference point
    //  "*2" the square of a variable
    //  "ch" a nudge we give to prevent division by zero, analogous to the Chapman function
    const float SQRT_HALF_PI = sqrt(PI/2.);
    const float k = 0.6; // "k" is an empirically derived constant
    float x0 = sqrt(max(r0*r0 - z2, SMALL));
    // if obstructed by the world, approximate answer by using a ludicrously large number
    if (a < x0 && -x0 < b && z2 < r0*r0) { return BIG; }
    float abs_a  = abs(a);
    float abs_b  = abs(b);
    float z      = sqrt(z2);
    float sqrt_z = sqrt(z);
    float ra     = sqrt(a*a+z2);
    float rb     = sqrt(b*b+z2);
    float ch0    = (1. - 1./(2.*r0)) * SQRT_HALF_PI * sqrt_z + k*x0;
    float cha    = (1. - 1./(2.*ra)) * SQRT_HALF_PI * sqrt_z + k*abs_a;
    float chb    = (1. - 1./(2.*rb)) * SQRT_HALF_PI * sqrt_z + k*abs_b;
    float s0     = min(exp(r0- z),1.) / max( x0/r0 + 1./ch0, SMALL);
    float sa     = exp(r0-ra) / max(abs_a/ra + 1./cha, SMALL);
    float sb     = exp(r0-rb) / max(abs_b/rb + 1./chb, SMALL);
    return sign(b)*(s0-sb) - sign(a)*(s0-sa);
}

vec3 get_rgb_fraction_of_light_transmitted_through_atmosphere(
    in vec3  view_origin,    in vec3  view_direction, in float view_start_length,      in float view_stop_length, 
    in vec3  world_position, in float world_radius,   in float atmosphere_scale_height,
    in vec3  beta_ray,       in vec3  beta_mie,       in vec3  beta_abs
){
    float h   = atmosphere_scale_height;
    float r   = world_radius / h;
    vec3  V0  = (view_origin + view_direction * view_start_length - world_position) / h;
    vec3  V1  = (view_origin + view_direction * view_stop_length  - world_position) / h;
    vec3  V   = view_direction;   // unit vector pointing to pixel being viewed
    float v0  = dot(V0,V);
    float v1  = dot(V1,V);
    float zv2 = dot(V0,V0) - v0*v0; 
    vec3  beta_sum = (beta_ray + beta_mie + beta_abs)*h;
    float sigma = approx_air_column_density_ratio_through_atmosphere(v0,v1,zv2,r);
    return exp(-sigma * beta_sum);
}

// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_fraction_of_distant_light_scattered_by_atmosphere(
    vec3 view_origin,     vec3 view_direction, float view_start_length, float view_stop_length,
    vec3 world_position,  float world_radius,  
    vec3 light_direction, float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3  beta_abs
){
    // For an excellent introduction to what we're try to do here, see Alan Zucconi: 
    //   https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // We will be using most of the same terminology and variable names.

    // GUIDE TO VARIABLE NAMES:
    //  Uppercase letters indicate vectors.
    //  Lowercase letters indicate scalars.
    //  Going for terseness because I tried longhand names and trust me, you can't read them.
    //  "*v*"    property of the view ray, the ray cast from the viewer to the object being viewed
    //  "*l*"    property of the light ray, the ray cast from the object to the light source
    //  "y*"     distance from the center of the world to the plane shared by view and light ray
    //  "z*"     distance from the center of the world to along the plane shared by the view and light ray 
    //  "r*"     a distance ("radius") from the center of the world
    //  "h*"     the atmospheric scale height, the distance at which air density reduces by a factor of e
    //  "*2"     the square of a variable
    //  "*0"     property at the start of the raymarch
    //  "*1"     property at the end of the raymarch
    //  "*i"     property during an iteration of the raymarch
    //  "d*"     the change in a property across iterations of the raymarch
    //  "beta*"  a scattering coefficient, the number of e-foldings in light intensity per unit distance
    //  "gamma*" a phase factor, the fraction of light that's scattered in a certain direction
    //  "sigma*" a column density ratio, the density of a column of air relative to surface density
    //  "F*"     fraction of source light that reaches the viewer due to scattering for each color channel
    //  "*_ray"  property of rayleigh scattering
    //  "*_mie"  property of mie scattering
    //  "*_abs"  property of absorption

    // setup variable shorthands
    // express all distances in scale heights 
    // express all positions relative to world origin
    float h  = atmosphere_scale_height;
    float r  = world_radius / h;
    vec3  V0 = (view_origin + view_direction * view_start_length - world_position) / h;
    vec3  V1 = (view_origin + view_direction * view_stop_length  - world_position) / h;
    vec3  V  = view_direction;   // unit vector pointing to pixel being viewed
    float v0 = dot(V0,V);
    float v1 = dot(V1,V);
    vec3  L  = light_direction;  // unit vector pointing to light source
    float VL = dot(V,L);

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
    const float STEP_COUNT = 16.; 
    float dv  = (v1 - v0) / STEP_COUNT;
    float vi  = v0;
    float dl  = dv*VL;
    float li  = dot(V0,L);
    float y   = dot(V0,normalize(cross(V,L))); 
    float y2  = y*y;
    float zv2 = dot(V0,V0) - y2 - v0*v0; 
    float zl2 = 0.0; 

    float sigma;       // columnar density encountered along the entire path, relative to surface density, effectively the distance along the surface needed to obtain a similar column density
    vec3  F = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera

    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        zl2 = vi*vi + zv2 - li*li;
        sigma = approx_air_column_density_ratio_through_atmosphere(v0, vi,   y2+zv2, r )
              + approx_air_column_density_ratio_through_atmosphere(li, 3.*r, y2+zl2, r );

        F += exp(r-sqrt(vi*vi+y2+zv2) - beta_sum*sigma) * beta_gamma * dv;
            // NOTE: the above is equivalent to the incoming fraction multiplied by the outgoing fraction:
            // incoming fraction: the fraction of light that scatters towards camera
            //   exp(r-sqrt(vi*vi+y2+zv2)) * beta_gamma * dv
            // outgoing fraction: the fraction of light that scatters away from camera
            // * exp(-beta_sum * sigma);

        vi += dv;
        li += dl;
    }

    return F;
}
