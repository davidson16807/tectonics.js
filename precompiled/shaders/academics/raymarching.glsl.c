CONST(float) BIG = 1e20;
CONST(float) SMALL = 1e-20;

// "approx_air_column_density_ratio_along_2d_ray_for_curved_world" 
//   calculates column density ratio of air for a ray emitted from the surface of a world to a desired distance, 
//   taking into account the curvature of the world.
// It does this by making two linear approximations for height:
//   one for the lower atmosphere, one for the upper atmosphere.
// These are represented by the two call outs to get_air_column_density_ratio_along_2d_ray_for_flat_world().
// "x_start" and "x_stop" are distances along the ray from closest approach.
//   If there is no intersection, they are the distances from the closest approach to the upper bound.
//   Negative numbers indicate the rays are firing towards the ground.
// "z2" is the closest distance from the ray to the center of the world, squared.
// "R" is the radius of the world.
// "H" is the scale height of the atmosphere.
FUNC(float) approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    IN(float) x_start, 
    IN(float) x_stop, 
    IN(float) z2, 
    IN(float) R, 
    IN(float) H
){

    // guide to variable names:
    //  "x*" distance along the ray from closest approach
    //  "z*" distance from the center of the world at closest approach
    //  "R*" distance from the center of the world
    //  "*b" variable at which the slope and intercept of the height approximation
    //  "*0" variable at which the surface of the world occurs
    //  "*1" variable at which the top of the atmosphere occurs

    // "a" is the factor by which we "stretch out" the quadratic height approximation
    //   this is done to ensure we do not divide by zero when we perform integration by substitution
    CONST(float) a = 0.45;
    // "b" is the fraction along the path from the surface to the top of the atmosphere 
    //   at which we sample for the slope and intercept of our height approximation
    CONST(float) b = 0.45;

    VAR(float) R1 = R + 6.*H;
    VAR(float) x1 = sqrt(max(R1*R1-z2, 0.));
    VAR(float) x0 = sqrt(max(R *R -z2, 0.));
    VAR(float) xb = x0+(x1-x0)*b;

    // if ray is obstructed
    if (x_start < x0 && -x0 < x_stop && z2 < R*R)
    {
        // return ludicrously big number to represent obstruction
        return BIG;
    }

    VAR(float) dx0      = x0          -xb;
    VAR(float) dx_stop  = abs(x_stop )-xb;
    VAR(float) dx_start = abs(x_start)-xb;

    VAR(float) xb2_z2  = xb*xb + z2;
    VAR(float) d2hdx2  = z2 / sqrt(xb2_z2*xb2_z2*xb2_z2);
    VAR(float) dhdx    = xb / sqrt(xb2_z2); 
    VAR(float) hb      = sqrt(xb*xb + z2) - R;
    VAR(float) h0      = (0.5 * a * d2hdx2 * dx0      + dhdx) * dx0      + hb;
    VAR(float) h_stop  = (0.5 * a * d2hdx2 * dx_stop  + dhdx) * dx_stop  + hb;
    VAR(float) h_start = (0.5 * a * d2hdx2 * dx_start + dhdx) * dx_start + hb;

    VAR(float) rho0  = exp(-h0/H);
    VAR(float) sigma = 
        sign(x_stop ) * max(H/dhdx * (rho0 - exp(-h_stop /H)), 0.) 
      - sign(x_start) * max(H/dhdx * (rho0 - exp(-h_start/H)), 0.);

    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return min(abs(sigma),BIG);
}
// "try_approx_air_column_density_ratio_along_ray" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_ray_2d() and approx_reference_air_column_density_ratio_along_ray.
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
FUNC(float) approx_air_column_density_ratio_along_3d_ray_for_curved_world (
    IN(vec3)  P, 
    IN(vec3)  V,
    IN(float) x,
    IN(float) R, 
    IN(float) H
){
    VAR(float) xz = dot(-P,V);           // distance ("radius") from the ray to the center of the world at closest approach, squared
    VAR(float) z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs

    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, R, H );
}

// TODO: multiple light sources
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
FUNC(vec3) get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
    IN(vec3)  view_origin,     IN(vec3) view_direction,
    IN(vec3)  world_position,  IN(float) world_radius,
    IN(vec3)  light_direction, IN(vec3) light_rgb_intensity,
    IN(vec3)  background_rgb_intensity,
    IN(float) atmosphere_scale_height,
    IN(vec3)  beta_ray,        IN(vec3)  beta_mie,           IN(vec3)  beta_abs
){
    // NOTE: we are only using geocentric coordinates within this function!
    VAR(vec3)  P = view_origin - world_position;
    VAR(vec3)  V = view_direction;

    VAR(vec3)  L = light_direction;
    VAR(vec3)  I_sun  = light_rgb_intensity;
    VAR(vec3)  I_back = background_rgb_intensity;

    VAR(float) R = world_radius;
    VAR(float) H = atmosphere_scale_height;

    VAR(float) unused1, unused2, unused3, unused4; // used for passing unused output parameters to functions

    const VAR(float) STEP_COUNT = 64.;// number of steps taken while marching along the view ray

    bool  is_scattered;   // whether view ray will enter the atmosphere
    bool  is_obstructed;  // whether view ray will enter the surface of a world
    VAR(float) z2;             // distance ("radius") from the view ray to the center of the world at closest approach, squared
    VAR(float) xz;             // distance along the view ray at which closest approach occurs
    VAR(float) x_in_atmo;      // distance along the view ray at which the ray enters the atmosphere
    VAR(float) x_out_atmo;     // distance along the view ray at which the ray exits the atmosphere
    VAR(float) x_in_world;     // distance along the view ray at which the ray enters the surface of the world
    VAR(float) x_out_world;    // distance along the view ray at which the ray enters the surface of the world
    VAR(float) x_start;        // distance along the view ray at which scattering starts, either because it's the start of the ray or the start of the atmosphere 
    VAR(float) x_stop;         // distance along the view ray at which scattering no longer occurs, either due to hitting the world or leaving the atmosphere
    
    VAR(float) dx;             // distance between steps while marching along the view ray
    VAR(float) x;              // distance traversed while marching along the view ray
    VAR(float) sigma;          // columnar density ratios for rayleigh and mie scattering, found by marching along the full path of light. This expresses the quantity of air encountered by light, relative to air density on the surface

    VAR(vec3)  P_i;            // absolute position while marching along the view ray
    VAR(float) h_i;            // distance ("height") from the surface of the world while marching along the view ray
    VAR(float) sigma_L;        // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface

    // cosine of angle between view and light directions
    VAR(float) VL = dot(V, L); 

    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    VAR(vec3)  E = vec3(0); 

    // Rayleigh and Mie phase factors,
    // A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // This factor indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    // The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
    // and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    VAR(float) gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    VAR(float) gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);

    VAR(vec3)  beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    VAR(vec3)  beta_sum   = beta_ray + beta_mie + beta_abs;

    xz = dot(-P,V);
    z2 = dot( P,P) - xz * xz;

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


    for (VAR(float) i = 0.; i < STEP_COUNT; ++i)
    {
        P_i = P + V * x;
        h_i = sqrt((x-xz)*(x-xz)+z2) - R;
        sigma = 
            approx_air_column_density_ratio_along_3d_ray_for_curved_world (P_i, -V, x,    R, H)
          + approx_air_column_density_ratio_along_3d_ray_for_curved_world (P_i,  L, 3.*R, R, H);

        E += I_sun
            // incoming fraction: the fraction of light that scatters towards camera
            * exp(-h_i/H) * beta_gamma * dx
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * (sigma));

        x += dx;
    }

    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    sigma  = approx_air_column_density_ratio_along_3d_ray_for_curved_world (P_i, -V, 3.*R, R, H);
    E += I_back * exp(-beta_sum * sigma);

    return E;
}


FUNC(vec3) get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
    IN(vec3)  segment_origin, IN(vec3)  segment_direction, IN(float) segment_length,
    IN(vec3)  world_position, IN(float) world_radius,      IN(float) atmosphere_scale_height,
    IN(vec3)  beta_ray,       IN(vec3)  beta_mie,          IN(vec3)  beta_abs
){
    VAR(vec3)  O = world_position;
    VAR(float) R = world_radius;
    VAR(float) H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    VAR(float) sigma  = approx_air_column_density_ratio_along_3d_ray_for_curved_world (segment_origin-world_position, segment_direction, segment_length, R, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}

FUNC(vec3) get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
    IN(float) cos_view_angle, 
    IN(float) cos_light_angle, 
    IN(float) cos_scatter_angle, 
    IN(float) ocean_depth,
    IN(vec3)  refracted_light_rgb_intensity,
    IN(vec3)  beta_ray,       IN(vec3)  beta_mie,          IN(vec3)  beta_abs
){
    VAR(float) NV = cos_view_angle;
    VAR(float) NL = cos_light_angle;
    VAR(float) LV = cos_scatter_angle;

    VAR(vec3) I = refracted_light_rgb_intensity;

    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    VAR(float) gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(LV);
    VAR(float) gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(LV);

    VAR(vec3)  beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    VAR(vec3)  beta_sum   = beta_ray + beta_mie + beta_abs;

    // "sigma_V"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_L" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    VAR(float) sigma_V  = ocean_depth / NV;
    VAR(float) sigma_L = ocean_depth / NL;
    VAR(float) sigma_ratio = 1. + NV/NL;

    return I 
        // incoming fraction: the fraction of light that scatters towards camera
        *     beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_V * sigma_ratio * beta_sum) - 1.)
        /               (-sigma_ratio * beta_sum);
}

FUNC(vec3) get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(
    IN(float) cos_incident_angle, IN(float) ocean_depth,
    IN(vec3)  beta_ray,           IN(vec3)  beta_mie,          IN(vec3)  beta_abs
){
    VAR(float) sigma  = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}