
/*
"approx_air_column_density_ratio_through_air_of_centrifuge" 
  calculates the distance you would need to travel 
  along the wall of a centrifuge to encounter the same number of particles 
  in the specified column. 
It does this by finding an integral using integration by substitution, 
  then tweaking that integral to prevent division by 0. 
All distances are recorded in scale heights.
"a" and "b" are distances along the ray from closest approach.
  The ray is fired in the positive direction.
  If there is no intersection with the planet, 
  a and b are distances from the closest approach to the upper bound.
"z2" is the closest distance from the ray to the center of the world, squared.
"r0" is the radius of the centrifuge.
"m"  is the "slope", the distance travelled parallel to the surface 
  per unit traveled perpendicular to the surface
*/
float approx_fast_column_density_ratio_through_air_of_centrifuge(
    in float a, 
    in float b, 
    in float z2, 
    in float r0,
    in float m
){
    /*
    "F" is our "fudge factor".
    It's an amount added to a well reasoned approximation that's
     based on integration by substitution.
    We derive it empirically by calculating its real value using 
     numerical integration, then fit it to a Pade approximate 
     using a genetic algorithm in combination with the method described 
     by Schlick (1994). 
    See ramblings/centrifuge_column_density_optimization.py 
     for the code used to generate this approximation.
    */
    float Fa = (0.03 - 2.2*a - 0.06*a*z2) / (2.2 + 2.2*a*a + 0.9*z2);
    float Fb = (0.03 - 2.2*b - 0.06*b*z2) / (2.2 + 2.2*b*b + 0.9*z2);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float rho_a = exp(ra-r0);
    float rho_b = exp(rb-r0);
    float Ia = rho_a / (Fa + a/ra + 1.0/a);
    float Ib = rho_b / (Fb + b/rb + 1.0/b);
    return m*(Ib - Ia);
}

float solve_air_column_density_ratio_through_air_of_centrifuge(
    in float a, 
    in float b, 
    in float z2, 
    in float r0,
    in float m
){
    /*
    "solve_air_column_density_ratio_through_air_of_centrifuge" is a
    slower alternative to "approx_fast_air_column_density_ratio_through_air_of_centrifuge"
    */
    const int STEP_COUNT = 16;
    float x = 0.0;
    float dx = (b-a)/float(STEP_COUNT);
    float sigma = 0.0;
    for(int i = 0; i<STEP_COUNT; i++){
        sigma += m*exp(sqrt(x*x+z2)-r0)*dx;
    }
    return sigma;
}
#define ASSERT(test, color) if (!(test)) { return color; }

vec3 get_rgb_fraction_of_light_transmitted_through_air_of_centrifuge(
    in vec3  view_origin,          in vec3  view_direction,       in float view_start_length, in float view_stop_length, 
    in vec3  centrifuge_endpoint1, in vec3  centrifuge_endpoint2, in float centrifuge_inner_radius, in float centrifuge_outer_radius, 
    in float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3  beta_abs
){
    float h   = atmosphere_scale_height;
    float r   = centrifuge_inner_radius / h;
    vec3  B   = normalize(centrifuge_endpoint2 - centrifuge_endpoint1);
    // V, V0, and V1: vector projections onto 2d profile of centrifuge
    vec3  D   = (view_direction * (view_stop_length - view_start_length)) / h; 
    vec3  V0  = (view_origin + view_direction * view_start_length - centrifuge_endpoint1) / h; V0 -= B*dot(V0,B);
    vec3  V1  = (view_origin + view_direction * view_stop_length  - centrifuge_endpoint1) / h; V1 -= B*dot(V1,B);
    vec3  V   = view_direction; V -= B*dot(V,B); V = normalize(V);
    float v0  = dot(V0,V);
    float v1  = dot(V1,V);
    float zv2 = dot(V0,V0) - v0*v0; 
    float VA  = dot(V,B);
    vec3  beta_sum   = h*(beta_ray + beta_mie + beta_abs);
    float sigma = approx_fast_column_density_ratio_through_air_of_centrifuge(v0,v1,zv2,r,dot(D,B)/(v1-v0));
    return exp(-sigma * beta_sum);
}

vec3 get_rgb_fraction_of_distant_light_scattered_by_air_of_centrifuge(
    in vec3  view_origin,          in vec3  view_direction,       in float view_start_length, in float view_stop_length, 
    in vec3  centrifuge_endpoint1, in vec3  centrifuge_endpoint2, in float centrifuge_inner_radius, in float centrifuge_outer_radius, 
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
    float h   = atmosphere_scale_height;
    float ri  = centrifuge_inner_radius / h;
    float ro  = centrifuge_outer_radius / h;
    vec3  B0  = centrifuge_endpoint1/h;
    vec3  B1  = centrifuge_endpoint2/h;
    vec3  B   = normalize(centrifuge_endpoint2 - centrifuge_endpoint1);
    vec3  L   = light_direction;  // unit vector pointing to light source
    // V, V0, and V1: vector projections onto 2d profile of centrifuge
    vec3  D   = (view_direction * (view_stop_length - view_start_length)) / h; 
    vec3  V0  = (view_origin + view_direction * view_start_length - centrifuge_endpoint1) / h; 
    vec3  V1  = (view_origin + view_direction * view_stop_length  - centrifuge_endpoint1) / h;
    vec3  V   = view_direction; 
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
    const float STEP_COUNT = 64.; 
    float dv  = length(V1-V0) / STEP_COUNT;
    float vi  = 0.;
    float dl  = dv*VL;

    vec3  V02d = V0 - B*dot(V0,B);
    float v02d = dot(V02d,V);
    vec3  V12d = V1 - B*dot(V1,B);
    float v12d = dot(V12d,V);
    float mv   = sqrt(1.-dot(V,B)*dot(V,B));
    float ml   = sqrt(1.-dot(L,B)*dot(L,B));  
    float sigma;       // columnar density encountered along the entire path, relative to surface density, effectively the distance along the surface needed to obtain a similar column density
    vec3  F = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera

    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        vec3  Vi   = V0+V*vi; 
        
        maybe_float wall_along_light_ray = get_nearest_distance_along_ray(get_distances_along_3d_line_to_infinite_cylinder(Vi, L, B0, B, ri));
        float b = dot(B, Vi+L*wall_along_light_ray.value);
        //if(wall_along_light_ray.exists && 0.0<b&&b<length(B1-B0)) { continue; }

        vec3  Vi2d = Vi - B*dot(Vi,B);
        float vi2d = dot(Vi2d,V);
        float zv2  = dot(Vi2d,Vi2d) - vi2d*vi2d; 
        float li2d = dot(Vi2d,L);
        float zl2  = vi2d*vi2d + zv2 - li2d*li2d;
        
        ///*
        sigma =  approx_fast_column_density_ratio_through_air_of_centrifuge(v02d, vi2d,  zv2, ri, mv)
               + approx_fast_column_density_ratio_through_air_of_centrifuge(li2d, 3.*ri, zl2, ri, ml);
        //*/
        /*
        sigma =  solve_air_column_density_ratio_through_air_of_centrifuge(v02d, vi2d,  zv2, ri, mv)
               + solve_air_column_density_ratio_through_air_of_centrifuge(li2d, 3.*ri, zl2, ri, ml);
        */
        F += exp(ri-sqrt(vi2d*vi2d+zv2) - beta_sum*sigma) * beta_gamma * dv;
            // NOTE: the above is equivalent to the incoming fraction multiplied by the outgoing fraction:
            // incoming fraction: the fraction of light that scatters towards camera
            //   exp(sqrt(vi*vi+zv2)-ri) * beta_gamma * dv
            // outgoing fraction: the fraction of light that scatters away from camera
            // * exp(-beta_sum * sigma);

        vi += dv;
        //li += dl;
    }

    return F;
}
