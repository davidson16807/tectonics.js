
const int MAX_LIGHT_COUNT = 9;

// "approx_air_column_density_ratio_along_2d_ray_for_spherical_world" 
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
float approx_air_column_density_ratio_along_2d_ray_for_spherical_world(
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
    const float SQRT_HALF_PI  = sqrt(PI/2.);
    const float k = 0.6; // "k" is an empirically derived constant
    float x0     = sqrt(max(r0*r0 - z2, 0.));
    // if obstructed by the world, approximate answer by using a ludicrously large number
    if (a < x0 && -x0 < b && z2 < r0*r0) { return BIG; }
    float abs_a  = abs(a);
    float abs_b  = abs(b);
    float z      = sqrt(z2);
    float sqrt_z = sqrt(z);
    float ra     = sqrt(a*a+z2);
    float rb     = sqrt(b*b+z2);
    float ch0    = (1./(2.*r0) + 1.) * SQRT_HALF_PI * sqrt_z + k*x0;
    float cha    = (1./(2.*ra) + 1.) * SQRT_HALF_PI * sqrt_z + k*abs_a;
    float chb    = (1./(2.*rb) + 1.) * SQRT_HALF_PI * sqrt_z + k*abs_b;
    float s0     = min(exp(r0- z),1.) / (   x0/r0 + 1./ch0);
    float sa     =     exp(r0-ra)     / (abs_a/ra + 1./cha);
    float sb     =     exp(r0-rb)     / (abs_b/rb + 1./chb);
    return sign(b)*(s0-sb) - sign(a)*(s0-sa);
}

// "approx_air_column_density_ratio_along_3d_ray_for_spherical_world" 
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
float approx_air_column_density_ratio_along_3d_ray_for_spherical_world(
    in float a, 
    in float b, 
    in float y2,
    in float z2, 
    in float r0
){
    // GUIDE TO VARIABLE NAMES:
    //  "x*" distance along the ray from closest approach
    //  "y*" distance along an axis at closest approach
    //  "z*" distance along an axis at closest approach
    //  "r*" distance ("radius") from the center of the world 
    //  "*0" variable at reference point
    //  "*2" the square of a variable
    //  "ch" a nudge we give to prevent division by zero, analogous to the Chapman function
    const float SQRT_HALF_PI  = sqrt(PI/2.);
    const float k = 0.6; // "k" is an empirically derived constant
    float x0     = sqrt(max(r0*r0 - y2 - z2, 0.));
    float rmin   = sqrt(y2+z2);
    if (a < x0 && -x0 < b && y2+z2 < r0*r0) { return BIG; }
    float abs_a  = abs(a);
    float abs_b  = abs(b);
    float sqrt_rmin = sqrt(rmin);
    float ra     = sqrt(a*a+y2+z2);
    float rb     = sqrt(b*b+y2+z2);
    float ch0    = (1./(2.*r0) + 1.) * SQRT_HALF_PI * sqrt_rmin + k*x0;
    float cha    = (1./(2.*ra) + 1.) * SQRT_HALF_PI * sqrt_rmin + k*abs_a;
    float chb    = (1./(2.*rb) + 1.) * SQRT_HALF_PI * sqrt_rmin + k*abs_b;
    float s0     = min(exp(r0-rmin),1.) / (   x0/r0 + 1./ch0);
    float sa     =     exp(r0-ra  )     / (abs_a/ra + 1./cha);
    float sb     =     exp(r0-rb  )     / (abs_b/rb + 1./chb);
    return sign(b)*(s0-sb) - sign(a)*(s0-sa);
}

// "approx_air_column_density_ratio_along_3d_ray_for_spherical_world" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_3d_ray_for_spherical_world().
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
float approx_air_column_density_ratio_along_3d_ray_for_spherical_world (
    in vec3  P, 
    in vec3  V,
    in float x,
    in float r, 
    in float h
){
    float xz = dot(-P,V);           // distance ("radius") from the ray to the center of the world at closest approach, squared
    float z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return h * approx_air_column_density_ratio_along_2d_ray_for_spherical_world( (0.-xz)/h, (x-xz)/h, z2/(h*h), r/h );
}

vec3 get_rgb_fraction_of_light_transmitted_through_air_of_spherical_world(
    in vec3  segment_origin, in vec3  segment_direction, in float segment_start_length,    in float segment_stop_length, 
    in vec3  world_position, in float world_radius,      in float atmosphere_scale_height,
    in vec3  beta_ray,       in vec3  beta_mie,          in vec3  beta_abs
){
    vec3  O = world_position;
    float r = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma  = approx_air_column_density_ratio_along_3d_ray_for_spherical_world (segment_origin-world_position, segment_direction, segment_stop_length - segment_start_length, r, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}

// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_fraction_of_distant_light_scattered_by_air_of_spherical_world(
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
    beta_ray *= h;
    beta_mie *= h;
    beta_abs *= h;

    float VL = dot(V,L);

    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);

    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    vec3  beta_sum   = beta_ray + beta_mie + beta_abs;
    vec3  beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    
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
        sigma = approx_air_column_density_ratio_along_3d_ray_for_spherical_world(v0, vi,   y2, zv2, r )
              + approx_air_column_density_ratio_along_3d_ray_for_spherical_world(li, 3.*r, y2, zl2, r );

        F +=// incoming fraction: the fraction of light that scatters towards camera
              exp(r-sqrt(vi*vi+y2+zv2)) * beta_gamma * dv
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * sigma);

        vi += dv;
        li += dl;
    }

    return F;
}


vec3 get_rgb_fraction_of_light_transmitted_through_fluid_along_flat_surface(
    in float cos_incident_angle, in float ocean_depth,
    in vec3  beta_ray,           in vec3  beta_mie,          in vec3  beta_abs
){
    float sigma  = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_by_fluid_along_flat_surface(
    in float cos_view_angle, 
    in float cos_light_angle, 
    in float cos_scatter_angle, 
    in float ocean_depth,
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
    float sigma_v  = ocean_depth / NV;
    float sigma_l = ocean_depth / NL;
    float sigma_ratio = 1. + NV/NL;

    return I 
        // incoming fraction: the fraction of light that scatters towards camera
        *     beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_v * sigma_ratio * beta_sum) - 1.)
        /               (-sigma_ratio * beta_sum);
}
