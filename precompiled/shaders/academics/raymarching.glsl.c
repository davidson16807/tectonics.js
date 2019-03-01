const float BIG = 1e20;
const float SMALL = 1e-20;

// "approx_air_column_density_ratio_along_ray_for_flat_world" 
//   calculates column density ratio of air for a ray emitted from given height to a desired lateral distance, 
//   assumes height varies linearly along the path, i.e. the world is flat.
float approx_air_column_density_ratio_along_ray_for_flat_world(float b, float m, float x, float H){
    return -H/m * exp(-(m*x+b)/H);
}
// "approx_air_column_density_ratio_along_ray_for_curved_world" 
//   calculates column density ratio of air for a ray emitted from the surface of a world to a desired distance, 
//   taking into account the curvature of the world.
// It does this by making two linear approximations for height:
//   one for the lower atmosphere, one for the upper atmosphere.
// These are represented by the two call outs to approx_air_column_density_ratio_along_ray_for_flat_world().
// "x_start" and "x_stop" are distances along the ray from closest approach.
//   If there is no intersection, they are the distances from the closest approach to the upper bound.
//   Negative numbers indicate the rays are firing towards the ground.
// "z2" is the closest distance from the ray to the center of the world, squared.
// "R" is the radius of the world.
// "H" is the scale height of the atmosphere.
float approx_air_column_density_ratio_along_ray_for_curved_world(float x_start, float x_stop, float z2, float R, float H){

    // guide to variable names:
    //  "f*" fraction of travel distance through atmosphere, "dx"
    //  "x*" distance along the ray from closest approach
    //  "R*" distance from the center of the world
    //  "*m" variable at which the slope of linear height approximation is calculated
    //  "*b" variable at which the intercept of linear height approximation is calculated
    //  "*0" variable at which the surface of the world occurs
    //  "*1" variable at which linear height approximation switches from first to second
    //  "*2" variable at which the top of the atmosphere occurs

    float R2  = R + 12.*H;
    float x2  = sqrt(max(R2*R2-z2, 0.));
    float x0  = sqrt(max(R *R -z2, 0.));
    float dx  = x2 - x0;

    // if ray is obstructed
    if (x_start < x0 && -x0 < x_stop && z2 < R*R)
    {
        // return ludicrously big number to represent obstruction
        return BIG;
    }

    float f0  = 0.00*0.33;
    float f0b = 0.20*0.33;
    float f0m = 0.50*0.33;
    float f1  = 1.00*0.33;
    float f1b = 1.20*0.33;
    float f1m = 1.50*0.33;

    float x0b = x0 + dx*f0b;
    float x0m = x0 + dx*f0m;
    float x1  = x0 + dx*f1 ;
    float x1b = x0 + dx*f1b;
    float x1m = x0 + dx*f1m;

    float m0  = x0m / sqrt(x0m*x0m + z2);
    float b0  = sqrt(x0b*x0b + z2) - R;

    float m1 = x1m / sqrt(x1m*x1m + z2);
    float b1 = sqrt(x1b*x1b + z2) - R;
    
    float sigma_reference =
        approx_air_column_density_ratio_along_ray_for_flat_world(b0, m0, x0-x0b, H)
      + approx_air_column_density_ratio_along_ray_for_flat_world(b1, m1, x1-x1b, H);

    float abs_x_stop = abs(x_stop);
    float sign_x_stop = sign(x_stop);
    float abs_sigma_stop =
        approx_air_column_density_ratio_along_ray_for_flat_world(b0, m0, clamp(abs_x_stop,  x0, x1)-x0b, H)
      + approx_air_column_density_ratio_along_ray_for_flat_world(b1, m1, max  (abs_x_stop,  x1)    -x1b, H)
      - sigma_reference;

    float abs_x_start = abs(x_start);
    float sign_x_start = sign(x_start);
    float abs_sigma_start =
        approx_air_column_density_ratio_along_ray_for_flat_world(b0, m0, clamp(abs_x_start, x0, x1)-x0b, H)
      + approx_air_column_density_ratio_along_ray_for_flat_world(b1, m1, max  (abs_x_start, x1)    -x1b, H)
      - sigma_reference;

    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return sign_x_stop  * min(abs_sigma_stop,  BIG) 
         - sign_x_start * min(abs_sigma_start, BIG);
}
// "try_approx_air_column_density_ratio_along_ray" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_ray_2d() and approx_reference_air_column_density_ratio_along_ray.
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
float approx_air_column_density_ratio_along_line_segment (
	vec3  segment_origin, 
    vec3  segment_direction,
    float segment_length,
	vec3  world_position, 
	float world_radius, 
	float atmosphere_scale_height
){
    vec3  O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;

    float z2;  			 // distance ("radius") from the ray to the center of the world at closest approach, squared
    float x_z; 			 // distance from the origin at which closest approach occurs

    get_relation_between_ray_and_point(
		world_position, 
    	segment_origin,  segment_direction, 
		z2,			x_z 
	);

    return approx_air_column_density_ratio_along_ray_for_curved_world( 0.-x_z, segment_length-x_z, z2, R, H );
}

// TODO: multiple light sources
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_intensity_of_light_scattered_from_atmosphere(
    vec3  view_origin, vec3 view_direction,
    vec3  world_position, float world_radius,
    vec3  light_direction, vec3 light_rgb_intensity,
    vec3  background_rgb_intensity,
    float atmosphere_scale_height,
    vec3  beta_ray,       vec3  beta_mie,          vec3  beta_abs
){
    vec3  P = view_origin;
    vec3  V = view_direction;

    vec3  L = light_direction;
    vec3  I_sun  = light_rgb_intensity;
    vec3  I_back = background_rgb_intensity;

    vec3  O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;

    float unused1, unused2, unused3, unused4; // used for passing unused output parameters to functions

    const float STEP_COUNT = 16.;// number of steps taken while marching along the view ray

    bool  is_scattered;   // whether view ray will enter the atmosphere
    bool  is_obstructed;  // whether view ray will enter the surface of a world
    float z2;             // distance ("radius") from the view ray to the center of the world at closest approach, squared
    float xz;             // distance along the view ray at which closest approach occurs
    float x_in_atmo;      // distance along the view ray at which the ray enters the atmosphere
    float x_out_atmo;     // distance along the view ray at which the ray exits the atmosphere
    float x_in_world;     // distance along the view ray at which the ray enters the surface of the world
    float x_out_world;    // distance along the view ray at which the ray enters the surface of the world
    float x_start;        // distance along the view ray at which scattering starts, either because it's the start of the ray or the start of the atmosphere 
    float x_stop;         // distance along the view ray at which scattering no longer occurs, either due to hitting the world or leaving the atmosphere
    
    float dx;             // distance between steps while marching along the view ray
    float x;              // distance traversed while marching along the view ray
    float sigma_V;        // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface

    vec3  P_i;            // absolute position while marching along the view ray
    float h_i;            // distance ("height") from the surface of the world while marching along the view ray
    float sigma_L;        // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface

    // cosine of angle between view and light directions
    float VL = dot(V, L); 

    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    vec3  E = vec3(0); 

    // Rayleigh and Mie phase factors,
    // A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // This factor indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    // The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
    // and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);

    vec3  beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3  beta_sum   = beta_ray + beta_mie + beta_abs;

    get_relation_between_ray_and_point(
        O, P, V, 
        z2, xz 
    );
    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    is_scattered   = try_get_relation_between_ray_and_sphere(
        R + 12.*H, z2, xz, 
        x_in_atmo,  x_out_atmo
    );
    is_obstructed = try_get_relation_between_ray_and_sphere(
        R,         z2, xz,
        x_in_world, x_out_world 
    );

    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!is_scattered)
    {
        return I_back;
    }
    
    x_start = max(x_in_atmo, 0.);
    x_stop  = is_obstructed? x_in_world : x_out_atmo;
    dx = (x_stop - x_start) / STEP_COUNT;
    x  =  x_start + 0.5 * dx;

    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        P_i = P + V * x;
        h_i      = sqrt((x-xz)*(x-xz)+z2) - R;
        sigma_V  = approx_air_column_density_ratio_along_line_segment (P_i, -V, x,    O, R, H);
        sigma_L  = approx_air_column_density_ratio_along_line_segment (P_i,  L, 3.*R, O, R, H);

        E += I_sun
            // incoming fraction: the fraction of light that scatters towards camera
            * exp(-h_i/H) * beta_gamma * dx
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * (sigma_V + sigma_L));

        x += dx;
    }

    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    E += I_back * exp(-beta_sum * sigma_V);

    return E;
}


vec3 get_rgb_fraction_of_refracted_light_transmitted_through_atmosphere(
    vec3  segment_origin, vec3  segment_direction, float segment_length,
    vec3  world_position, float world_radius,      float atmosphere_scale_height,
    vec3  beta_ray,       vec3  beta_mie,          vec3  beta_abs
){
    vec3  O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma  = approx_air_column_density_ratio_along_line_segment (segment_origin, segment_direction, segment_length, O, R, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}

vec3 get_rgb_intensity_of_light_scattered_from_fluid(
    float cos_view_angle, 
    float cos_light_angle, 
    float cos_scatter_angle, 
    float ocean_depth,
    vec3  refracted_light_rgb_intensity,
    vec3  beta_ray,       vec3  beta_mie,          vec3  beta_abs
){
    float NV = cos_view_angle;
    float NL = cos_light_angle;
    float LV = cos_scatter_angle;

    vec3 I = refracted_light_rgb_intensity;

    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(LV);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(LV);

    vec3  beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3  beta_sum   = beta_ray + beta_mie + beta_abs;

    // "sigma_V"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_L" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within water
    float sigma_V  = ocean_depth / NV;
    float sigma_L = ocean_depth / NL;
    float sigma_ratio = 1. + NV/NL;

    return I 
        // incoming fraction: the fraction of light that scatters towards camera
        *     beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_V * sigma_ratio * beta_sum) - 1.)
        /               (-sigma_ratio * beta_sum);
}

vec3 get_rgb_fraction_of_refracted_light_transmitted_through_fluid(
    float cos_incident_angle, float ocean_depth,
    vec3  beta_ray,       vec3  beta_mie,          vec3  beta_abs
){
    float sigma  = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}