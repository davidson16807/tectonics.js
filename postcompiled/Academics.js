// NOTE: these macros are here to allow porting the code between several languages
const DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const RADIAN = 1.;
const KELVIN = 1.;
const MICROGRAM = 1e-9; // kilograms
const MILLIGRAM = 1e-6; // kilograms
const GRAM = 1e-3; // kilograms
const KILOGRAM = 1.; // kilograms
const TON = 1000.; // kilograms
const NANOMETER = 1e-9; // meters
const MICROMETER = 1e-6; // meters
const MILLIMETER = 1e-3; // meters
const METER = 1.; // meters
const KILOMETER = 1000.; // meters
const MOLE = 6.02214076e23;
const MILLIMOLE = MOLE / 1e3;
const MICROMOLE = MOLE / 1e6;
const NANOMOLE = MOLE / 1e9;
const FEMTOMOLE = MOLE / 1e12;
const SECOND = 1.; // seconds
const MINUTE = 60.; // seconds
const HOUR = MINUTE*60.; // seconds
const DAY = HOUR*24.; // seconds
const WEEK = DAY*7.; // seconds
const MONTH = DAY*29.53059; // seconds
const YEAR = DAY*365.256363004; // seconds
const MEGAYEAR = YEAR*1e6; // seconds
const NEWTON = KILOGRAM * METER / (SECOND * SECOND);
const JOULE = NEWTON * METER;
const WATT = JOULE / SECOND;
const EARTH_MASS = 5.972e24; // kilograms
const EARTH_RADIUS = 6.367e6; // meters
const STANDARD_GRAVITY = 9.80665; // meters/second^2
const STANDARD_TEMPERATURE = 273.15; // kelvin
const STANDARD_PRESSURE = 101325.; // pascals
const ASTRONOMICAL_UNIT = 149597870700.;// meters
const GLOBAL_SOLAR_CONSTANT = 1361.; // watts/meter^2
const JUPITER_MASS = 1.898e27; // kilograms
const JUPITER_RADIUS = 71e6; // meters
const SOLAR_MASS = 2e30; // kilograms
const SOLAR_RADIUS = 695.7e6; // meters
const SOLAR_LUMINOSITY = 3.828e26; // watts
const SOLAR_TEMPERATURE = 5772.; // kelvin
function get_surface_area_of_sphere(
    radius
) {
    return 4.*Math.PI*radius*radius;
}
// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
function get_relation_between_ray_and_point(
    point_position,
    ray_origin,
    V,
    z2,
    xz
){
    let P = point_position - ray_origin;
    xz = dot(P, V);
    z2 = dot(P, P) - xz * xz;
}
function try_get_relation_between_ray_and_sphere(
    sphere_radius,
    z2,
    xz,
    distance_to_entrance,
    distance_to_exit
){
    let sphere_radius2 = sphere_radius * sphere_radius;
    let distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - z2, 1e-10));
    distance_to_entrance = xz - distance_from_closest_approach_to_exit;
    distance_to_exit = xz + distance_from_closest_approach_to_exit;
    return (distance_to_exit > 0. && z2 < sphere_radius*sphere_radius);
}
const SPEED_OF_LIGHT = 299792458. * METER / SECOND;
const BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER*METER* KELVIN*KELVIN*KELVIN*KELVIN);
const PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
function solve_fraction_of_light_emitted_by_black_body_below_wavelength(
    wavelength,
    temperature
){
    const iterations = 2.;
    const h = PLANCK_CONSTANT;
    const k = BOLTZMANN_CONSTANT;
    const c = SPEED_OF_LIGHT;
    let L = wavelength;
    let T = temperature;
    let C2 = h*c/k;
    let z = C2 / (L*T);
    let z2 = z*z;
    let z3 = z2*z;
    let sum = 0.;
    let n2=0.;
    let n3=0.;
    for (let n=1.; n <= iterations; n++) {
        n2 = n*n;
        n3 = n2*n;
        sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
    }
    return 15.*sum/(Math.PI*Math.PI*Math.PI*Math.PI);
}
function solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
    lo,
    hi,
    temperature
){
    return solve_fraction_of_light_emitted_by_black_body_below_wavelength(hi, temperature) -
            solve_fraction_of_light_emitted_by_black_body_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
function get_intensity_of_light_emitted_by_black_body(
    temperature
){
    let T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
function solve_rgb_intensity_of_light_emitted_by_black_body(
    temperature
){
    return get_intensity_of_light_emitted_by_black_body(temperature)
         * glm.vec3(
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
           );
}
// Rayleigh phase function factor [-1, 1]
function get_fraction_of_rayleigh_scattered_light_scattered_by_angle(
    cos_scatter_angle
){
    return 3. * (1. + cos_scatter_angle*cos_scatter_angle)
    / //------------------------
                (16. * Math.PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
function get_fraction_of_mie_scattered_light_scattered_by_angle(
    cos_scatter_angle
){
    const g = 0.76;
    return (1. - g*g)
    / //---------------------------------------------
        ((4. + Math.PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
function approx_fraction_of_mie_scattered_light_scattered_by_angle_fast(
    cos_scatter_angle
){
    const g = 0.76;
    const k = 1.55*g - 0.55 * (g*g*g);
    return (1. - k*k)
    / //-------------------------------------------
        (4. * Math.PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// "get_fraction_of_light_reflected_on_surface_head_on" finds the fraction of light that's reflected
//   by a boundary between materials when striking head on.
//   It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
//   The refractive indices can be provided as parameters in any order.
function get_fraction_of_light_reflected_on_surface_head_on(
    refractivate_index1,
    refractivate_index2
){
    let n1 = refractivate_index1;
    let n2 = refractivate_index2;
    let sqrtR0 = ((n1-n2)/(n1+n2));
    let R0 = sqrtR0 * sqrtR0;
    return R0;
}
// "get_fraction_of_light_reflected_on_surface" returns Fresnel reflectance.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
function get_fraction_of_light_reflected_on_surface(
    cos_incident_angle,
    characteristic_reflectance
){
    let R0 = characteristic_reflectance;
    let _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_rgb_fraction_of_light_reflected_on_surface" returns Fresnel reflectance for each color channel.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
function get_rgb_fraction_of_light_reflected_on_surface(
    cos_incident_angle,
    characteristic_reflectance
){
    let R0 = characteristic_reflectance;
    let _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_fraction_of_light_masked_or_shaded_by_surface" is Schlick's fast approximation for Smith's function
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for even more details.
function get_fraction_of_light_masked_or_shaded_by_surface(
    cos_view_angle,
    root_mean_slope_squared
){
    let m = root_mean_slope_squared;
    let v = cos_view_angle;
    let k = sqrt(2.*m*m/Math.PI);
    return v/(v-k*v+k);
}
// "get_fraction_of_microfacets_with_angle" 
//   This is also known as the Beckmann Surface Normal Distribution Function.
//   This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
//   see Hoffmann 2015 for a gentle introduction to the concept.
//   see Schlick (1994) for even more details.
function get_fraction_of_microfacets_with_angle(
    cos_angle_of_deviation,
    root_mean_slope_squared
){
    let m = root_mean_slope_squared;
    let t = cos_angle_of_deviation;
    return exp((t*t-1.)/(m*m*t*t))/(m*m*t*t*t*t);
}
const BIG = 1e20;
const SMALL = 1e-20;
const MAX_LIGHT_COUNT = 9;
// "oplus" is the o-plus operator,
//   or the reciprocal of the sum of reciprocals.
// It's a handy function that comes up a lot in some physics problems.
// It's pretty useful for preventing division by zero.
function oplus( a, b){
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
function approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    a,
    b,
    z2,
    R
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
    let X = sqrt(max(R*R -z2, 0.));
    let div0_fix = 1./sqrt((X*X+R) * 0.5*Math.PI);
    let ra = sqrt(a*a+z2);
    let rb = sqrt(b*b+z2);
    let sa = 1./(abs(a)/ra + div0_fix) * exp(R-ra);
    let sb = 1./(abs(b)/rb + div0_fix) * exp(R-rb);
    let S = 1./(abs(X)/R + div0_fix) * min(exp(R-sqrt(z2)),1.);
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
function approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    x_start,
    x_stop,
    z2,
    r,
    H
){
    let X = sqrt(max(r*r -z2, 0.));
    // if ray is obstructed
    if (x_start < X && -X < x_stop && z2 < r*r)
    {
        // return ludicrously big number to represent obstruction
        return BIG;
    }
    let sigma =
        H * approx_air_column_density_ratio_along_2d_ray_for_curved_world(
            x_start / H,
            x_stop / H,
            z2 /(H*H),
            r / H
        );
    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return min(abs(sigma),BIG);
}
// "try_approx_air_column_density_ratio_along_ray" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_ray_2d() and approx_reference_air_column_density_ratio_along_ray.
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
function approx_air_column_density_ratio_along_3d_ray_for_curved_world (
    P,
    V,
    x,
    r,
    H
){
    let xz = dot(-P,V); // distance ("radius") from the ray to the center of the world at closest approach, squared
    let z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, r, H );
}
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
function get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
    view_origin, view_direction,
    world_position, world_radius,
    light_directions,
    light_rgb_intensities,
    light_count,
    background_rgb_intensity,
    atmosphere_scale_height,
    beta_ray, beta_mie, beta_abs
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
    let P = view_origin - world_position;
    let V = view_direction;
    let I_back = background_rgb_intensity;
    let r = world_radius;
    let H = atmosphere_scale_height;
    const let STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    let xv = dot(-P,V); // distance from view ray origin to closest approach
    let zv2 = dot( P,P) - xv * xv; // squared distance from the view ray to the center of the world at closest approach
    let xv_in_air; // distance along the view ray at which the ray enters the atmosphere
    let xv_out_air; // distance along the view ray at which the ray exits the atmosphere
    let xv_in_world; // distance along the view ray at which the ray enters the surface of the world
    let xv_out_world; // distance along the view ray at which the ray enters the surface of the world
    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    bool is_scattered = try_get_relation_between_ray_and_sphere(r + 12.*H, zv2, xv, xv_in_air, xv_out_air );
    bool is_obstructed = try_get_relation_between_ray_and_sphere(r, zv2, xv, xv_in_world, xv_out_world);
    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!is_scattered){ return I_back; }
    // cosine of angle between view and light directions
    let VL;
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    let gamma_ray;
    let gamma_mie;
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    let beta_sum = beta_ray + beta_mie + beta_abs;
    let beta_gamma;
    let xv_start = max(xv_in_air, 0.);
    let xv_stop = is_obstructed? xv_in_world : xv_out_air;
    let dx = (xv_stop - xv_start) / STEP_COUNT;
    let xvi = xv_start - xv + 0.5 * dx;
    let L; // unit vector pointing to light source
    let I; // vector indicating intensity of light source for each color channel
    let xl; // distance from light ray origin to closest approach
    let zl2; // squared distance ("radius") of the light ray at closest for a single iteration of the view ray march
    let r2; // squared distance ("radius") from the center of the world for a single iteration of the view ray march
    let h; // distance ("height") from the surface of the world for a single iteration of the view ray march
    let sigma_v; // columnar density encountered along the view ray,  relative to surface density
    let sigma_l; // columnar density encountered along the light ray, relative to surface density
    let E = glm.vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (let i = 0.; i < STEP_COUNT; ++i)
    {
        r2 = xvi*xvi+zv2;
        h = sqrt(r2) - r;
        sigma_v = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xv, xvi, zv2, r, H );
        for (let j = 0; j < MAX_LIGHT_COUNT; ++j)
        {
            if (j >= light_count) { break; }
            L = light_directions[j];
            I = light_rgb_intensities[j];
            VL = dot(V, L);
            xl = dot(P+V*(xvi+xv),-L);
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
        xvi += dx;
    }
    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    sigma_v = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xv, xv_stop-xv_start-xv, zv2, r, H );
    E += I_back * exp(-beta_sum * sigma_v);
    return E;
}
function get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
    segment_origin, segment_direction, segment_length,
    world_position, world_radius, atmosphere_scale_height,
    beta_ray, beta_mie, beta_abs
){
    let O = world_position;
    let r = world_radius;
    let H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    let sigma = approx_air_column_density_ratio_along_3d_ray_for_curved_world (segment_origin-world_position, segment_direction, segment_length, r, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
function get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
    cos_view_angle,
    cos_light_angle,
    cos_scatter_angle,
    ocean_depth,
    refracted_light_rgb_intensity,
    beta_ray, beta_mie, beta_abs
){
    let NV = cos_view_angle;
    let NL = cos_light_angle;
    let LV = cos_scatter_angle;
    let I = refracted_light_rgb_intensity;
    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    let gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(LV);
    let gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(LV);
    let beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    let beta_sum = beta_ray + beta_mie + beta_abs;
    // "sigma_v"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_l" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    let sigma_v = ocean_depth / NV;
    let sigma_l = ocean_depth / NL;
    let sigma_ratio = 1. + NV/NL;
    return I
        // incoming fraction: the fraction of light that scatters towards camera
        * beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_v * sigma_ratio * beta_sum) - 1.)
        / (-sigma_ratio * beta_sum);
}
function get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(
    cos_incident_angle, ocean_depth,
    beta_ray, beta_mie, beta_abs
){
    let sigma = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
function bump (
    x,
    edge0,
    edge1,
    height
){
    let center = (edge1 + edge0) / 2.;
    let width = (edge1 - edge0) / 2.;
    let offset = (x - center) / width;
    return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
function get_rgb_signal_of_wavelength (
    w
){
    return glm.vec3(
        bump(w, 530e-9, 690e-9, 1.00)+
        bump(w, 410e-9, 460e-9, 0.15),
        bump(w, 465e-9, 635e-9, 0.75)+
        bump(w, 420e-9, 700e-9, 0.15),
        bump(w, 400e-9, 570e-9, 0.45)+
        bump(w, 570e-9, 625e-9, 0.30)
      );
}
// "GAMMA" is the constant that's used to map between 
//   rgb signals sent to a monitor and their actual intensity
const GAMMA = 2.2;
function get_rgb_intensity_of_rgb_signal( signal
){
    return glm.vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
function get_rgb_signal_of_rgb_intensity( intensity
){
    return glm.vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
