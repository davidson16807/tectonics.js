CONST(float) BIG = 1e20;
CONST(float) SMALL = 1e-20;
CONST(int)   MAX_LIGHT_COUNT = 9;

// "oplus" is the o-plus operator,
//   or the reciprocal of the sum of reciprocals.
// It's a handy function that comes up a lot in some physics problems.
// It's pretty useful for preventing division by zero.
FUNC(float) oplus(IN(float) a, IN(float) b){
    return 1. / (1./a + 1./b);
}

// "approx_air_column_density_ratio_along_2d_ray_for_curved_world" 
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
FUNC(float) approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    IN(float) a, 
    IN(float) b, 
    IN(float) z2, 
    IN(float) R
){
    // GUIDE TO VARIABLE NAMES:
    //  capital letters indicate surface values, e.g. "R" is planet radius
    //  "x*" distance along the ray from closest approach
    //  "z*" distance from the center of the world at closest approach
    //  "R*" distance ("radius") from the center of the world
    //  "h*" distance ("height") from the center of the world
    //  "*0" variable at reference point
    //  "*1" variable at which the top of the atmosphere occurs
    //  "*2" the square of a variable
    //  "d*dx" a derivative, a rate of change over distance along the ray
    VAR(float) X  = sqrt(max(R*R -z2, 0.));
    VAR(float) div0_fix = 1./sqrt((X*X+R) * 0.5*PI);
    VAR(float) ra = sqrt(a*a+z2);
    VAR(float) rb = sqrt(b*b+z2);
    VAR(float) sa = 1./(abs(a)/ra + div0_fix) *     exp(R-ra);
    VAR(float) sb = 1./(abs(b)/rb + div0_fix) *     exp(R-rb);
    VAR(float) S  = 1./(abs(X)/R  + div0_fix) * min(exp(R-sqrt(z2)),1.);
    return sign(b)*(S-sb) - sign(a)*(S-sa);
}

// "approx_air_column_density_ratio_along_2d_ray_for_curved_world" 
//   calculates column density ratio of air for a ray emitted from the surface of a world to a desired distance, 
//   taking into account the curvature of the world.
// It does this by making a quadratic approximation for the height above the surface.
// The derivative of this approximation never reaches 0, and this allows us to find a closed form solution 
//   for the column density ratio using integration by substitution.
// "x_start" and "x_stop" are distances along the ray from closest approach.
//   If there is no intersection, they are the distances from the closest approach to the upper bound.
//   Negative numbers indicate the rays are firing towards the ground.
// "z2" is the closest distance from the ray to the center of the world, squared.
// "r" is the radius of the world.
// "H" is the scale height of the atmosphere.
FUNC(float) approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    IN(float) x_start, 
    IN(float) x_stop, 
    IN(float) z2, 
    IN(float) r, 
    IN(float) H
){
    VAR(float) X = sqrt(max(r*r -z2, 0.));
    // if ray is obstructed
    if (x_start < X && -X < x_stop && z2 < r*r)
    {
        // return ludicrously big number to represent obstruction
        return BIG;
    }
    VAR(float) sigma = 
        H * approx_air_column_density_ratio_along_2d_ray_for_curved_world(
            x_start / H,
            x_stop  / H,
            z2      /(H*H),
            r       / H
        );
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
    IN(float) r, 
    IN(float) H
){
    VAR(float) xz = dot(-P,V);           // distance ("radius") from the ray to the center of the world at closest approach, squared
    VAR(float) z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, r, H );
}

// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
FUNC(vec3) get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
    IN(vec3)  view_origin,     IN(vec3) view_direction,
    IN(vec3)  world_position,  IN(float) world_radius,
    IN(vec3 [MAX_LIGHT_COUNT]) light_directions, 
    IN(vec3 [MAX_LIGHT_COUNT]) light_rgb_intensities,
    IN(int)                    light_count,
    IN(vec3) background_rgb_intensity,
    IN(float) atmosphere_scale_height,
    IN(vec3) beta_ray, IN(vec3) beta_mie, IN(vec3)  beta_abs
){
    // For an excellent introduction to what we're try to do here, see Alan Zucconi: 
    //   https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // We will be using most of the same terminology and variable names.

    // GUIDE TO VARIABLE NAMES:
    //  Uppercase letters indicate vectors.
    //  Lowercase letters indicate scalars.
    //  Going for terseness because I tried longhand names and trust me, you can't read them.
    //  "x*"     distance along a ray, either from the ray origin or from closest approach
    //  "z*"     distance from the center of the world to closest approach
    //  "r*"     a distance ("radius") from the center of the world
    //  "h*"     a distance ("height") from the surface of the world
    //  "*v*"    property of the view ray, the ray cast from the viewer to the object being viewed
    //  "*l*"    property of the light ray, the ray cast from the object to the light source
    //  "*2"     the square of a variable
    //  "*_i"    property of an iteration within the raymarch
    //  "beta*"  a scattering coefficient, the number of e-foldings in light intensity per unit distance
    //  "gamma*" a phase factor, the fraction of light that's scattered in a certain direction
    //  "rho*"   a density ratio, the density of air relative to surface density
    //  "sigma*" a column density ratio, the density of a column of air relative to surface density
    //  "I*"     intensity of source lighting for each color channel
    //  "E*"     intensity of light cast towards the viewer for each color channel
    //  "*_ray"  property of rayleigh scattering
    //  "*_mie"  property of mie scattering
    //  "*_abs"  property of absorption

    VAR(vec3)  P = view_origin - world_position;
    VAR(vec3)  V = view_direction;
    VAR(vec3)  I_back = background_rgb_intensity;
    VAR(float) r = world_radius;
    VAR(float) H = atmosphere_scale_height;

    const VAR(float) STEP_COUNT = 16.;// number of steps taken while marching along the view ray

    VAR(float) xv  = dot(-P,V);           // distance from view ray origin to closest approach
    VAR(float) zv2 = dot( P,P) - xv * xv; // squared distance from the view ray to the center of the world at closest approach

    VAR(float) xv_in_air;      // distance along the view ray at which the ray enters the atmosphere
    VAR(float) xv_out_air;     // distance along the view ray at which the ray exits the atmosphere
    VAR(float) xv_in_world;    // distance along the view ray at which the ray enters the surface of the world
    VAR(float) xv_out_world;   // distance along the view ray at which the ray enters the surface of the world

    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    bool is_scattered  = try_get_relation_between_ray_and_sphere(r + 12.*H, zv2, xv, xv_in_air,   xv_out_air  );
    bool is_obstructed = try_get_relation_between_ray_and_sphere(r,         zv2, xv, xv_in_world, xv_out_world);

    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!is_scattered){ return I_back; }

    // cosine of angle between view and light directions
    VAR(float) VL; 

    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    VAR(float) gamma_ray;
    VAR(float) gamma_mie;
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    VAR(vec3)  beta_sum   = beta_ray + beta_mie + beta_abs;
    VAR(vec3)  beta_gamma;
    
    VAR(float) xv_start = max(xv_in_air, 0.);
    VAR(float) xv_stop  = is_obstructed? xv_in_world : xv_out_air;
    VAR(float) dx       = (xv_stop - xv_start) / STEP_COUNT;
    VAR(float) xvi      = xv_start - xv + 0.5 * dx;

    VAR(vec3)  L;           // unit vector pointing to light source
    VAR(vec3)  I;           // vector indicating intensity of light source for each color channel
    VAR(float) xl;          // distance from light ray origin to closest approach
    VAR(float) zl2;         // squared distance ("radius") of the light ray at closest for a single iteration of the view ray march
    VAR(float) r2;          // squared distance ("radius") from the center of the world for a single iteration of the view ray march
    VAR(float) h;           // distance ("height") from the surface of the world for a single iteration of the view ray march
    VAR(float) sigma_v;     // columnar density encountered along the view ray,  relative to surface density
    VAR(float) sigma_l;     // columnar density encountered along the light ray, relative to surface density
    VAR(vec3)  E = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera

    for (VAR(float) i = 0.; i < STEP_COUNT; ++i)
    {
        r2  = xvi*xvi+zv2;
        h   = sqrt(r2) - r;
        sigma_v = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xv, xvi, zv2, r, H );

        for (VAR(int) j = 0; j < MAX_LIGHT_COUNT; ++j)
        {
            if (j >= light_count) { break; }
            L   = light_directions[j];
            I   = light_rgb_intensities[j];
            VL  = dot(V, L);
            xl  = dot(P+V*(xvi+xv),-L);
            zl2 = r2 - xl*xl; 
            sigma_l = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xl, 3.*r, zl2, r, H );
            gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
            gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);
            beta_gamma= beta_ray * gamma_ray + beta_mie * gamma_mie;

            E += I
                // incoming fraction: the fraction of light that scatters towards camera
                * exp(-h/H) * beta_gamma * dx
                // outgoing fraction: the fraction of light that scatters away from camera
                * exp(-beta_sum * (sigma_l + sigma_v));
        }

        xvi  += dx;
    }

    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    sigma_v  = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xv, xv_stop-xv_start-xv, zv2, r, H );
    E += I_back * exp(-beta_sum * sigma_v);

    return E;
}


FUNC(vec3) get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
    IN(vec3)  segment_origin, IN(vec3)  segment_direction, IN(float) segment_length,
    IN(vec3)  world_position, IN(float) world_radius,      IN(float) atmosphere_scale_height,
    IN(vec3)  beta_ray,       IN(vec3)  beta_mie,          IN(vec3)  beta_abs
){
    VAR(vec3)  O = world_position;
    VAR(float) r = world_radius;
    VAR(float) H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    VAR(float) sigma  = approx_air_column_density_ratio_along_3d_ray_for_curved_world (segment_origin-world_position, segment_direction, segment_length, r, H);
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

    // "sigma_v"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_l" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    VAR(float) sigma_v  = ocean_depth / NV;
    VAR(float) sigma_l = ocean_depth / NL;
    VAR(float) sigma_ratio = 1. + NV/NL;

    return I 
        // incoming fraction: the fraction of light that scatters towards camera
        *     beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_v * sigma_ratio * beta_sum) - 1.)
        /               (-sigma_ratio * beta_sum);
}

FUNC(vec3) get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(
    IN(float) cos_incident_angle, IN(float) ocean_depth,
    IN(vec3)  beta_ray,           IN(vec3)  beta_mie,          IN(vec3)  beta_abs
){
    VAR(float) sigma  = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}