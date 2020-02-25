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
struct maybe_vec2
{
    glm.vec2 value;
    bool exists;
};
struct maybe_float
{
    float value;
    bool exists;
};
maybe_float get_distance_along_3d_line_to_plane(
    in glm.vec3 A0,
    in glm.vec3 A,
    in glm.vec3 B0,
    in glm.vec3 N
){
    return maybe_float( -dot(A0 - B0, N) / dot(A, N), abs(dot(A, N)) < SMALL);
}
maybe_vec2 get_distances_along_3d_line_to_sphere(
    in glm.vec3 A0,
    in glm.vec3 A,
    in glm.vec3 B0,
    in float r
){
    float xz = dot(B0 - A0, A);
    float z = length(A0 + A * xz - B0);
    float y2 = r * r - z * z;
    float dxr = sqrt(max(y2, 1e-10));
    return maybe_vec2(
        glm.vec2(xz - dxr, xz + dxr),
        y2 > 0.
    );
}
maybe_vec2 get_distances_along_line_to_negation(
    in maybe_vec2 positive,
    in maybe_vec2 negative
) {
    // as long as intersection with positive exists, 
    // and negative doesn't completely surround it, there will be an intersection
    bool exists =
        positive.exists && !(negative.value.x < positive.value.x && positive.value.y < negative.value.y);
    // find the first region of intersection
    float entrance = !negative.exists ? positive.value.x : min(negative.value.y, positive.value.x);
    float exit = !negative.exists ? positive.value.y : min(negative.value.x, positive.value.y);
    // if the first region is behind us, find the second region
    if (exit < 0. && 0. < positive.value.y)
    {
        entrance = negative.value.y;
        exit = positive.value.y;
    }
    return maybe_vec2( glm.vec2(entrance, exit), exists );
}
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
    r0
){
    // GUIDE TO VARIABLE NAMES:
    //  "x*" distance along the ray from closest approach
    //  "z*" distance from the center of the world at closest approach
    //  "r*" distance ("radius") from the center of the world
    //  "*0" variable at reference point
    //  "*2" the square of a variable
    //  "ch" a nudge we give to prevent division by zero, analogous to the Chapman function
    const float SQRT_HALF_PI = sqrt(Math.PI/2.);
    const float k = 0.6; // "k" is an empirically derived constant
    float x0 = sqrt(max(r0*r0 - z2, 0.));
    float abs_a = abs(a);
    float abs_b = abs(b);
    float z = sqrt(z2);
    float sqrt_z = sqrt(z);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float ch0 = (1./(2.*r0) + 1.) * SQRT_HALF_PI * sqrt_z + k*x0;
    float cha = (1./(2.*ra) + 1.) * SQRT_HALF_PI * sqrt_z + k*abs_a;
    float chb = (1./(2.*rb) + 1.) * SQRT_HALF_PI * sqrt_z + k*abs_b;
    float s0 = min(exp(r0- z),1.) / ( x0/r0 + 1./ch0);
    float sa = exp(r0-ra) / (abs_a/ra + 1./cha);
    float sb = exp(r0-rb) / (abs_b/rb + 1./chb);
    return sign(b)*(s0-sb) - sign(a)*(s0-sa);
}
// "approx_air_column_density_ratio_along_3d_ray_for_curved_world" 
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
function approx_air_column_density_ratio_along_3d_ray_for_curved_world(
    a,
    b,
    y2,
    z2,
    r0
){
    // GUIDE TO VARIABLE NAMES:
    //  "x*" distance along the ray from closest approach
    //  "y*" distance along an axis at closest approach
    //  "z*" distance along an axis at closest approach
    //  "r*" distance ("radius") from the center of the world 
    //  "*0" variable at reference point
    //  "*2" the square of a variable
    //  "ch" a nudge we give to prevent division by zero, analogous to the Chapman function
    const float SQRT_HALF_PI = sqrt(Math.PI/2.);
    const float k = 0.6; // "k" is an empirically derived constant
    float x0 = sqrt(max(r0*r0 - y2 - z2, 0.));
    float abs_a = abs(a);
    float abs_b = abs(b);
    float rmin = sqrt(y2+z2);
    float sqrt_rmin = sqrt(rmin);
    float ra = sqrt(a*a+y2+z2);
    float rb = sqrt(b*b+y2+z2);
    float ch0 = (1./(2.*r0) + 1.) * SQRT_HALF_PI * sqrt_rmin + k*x0;
    float cha = (1./(2.*ra) + 1.) * SQRT_HALF_PI * sqrt_rmin + k*abs_a;
    float chb = (1./(2.*rb) + 1.) * SQRT_HALF_PI * sqrt_rmin + k*abs_b;
    float s0 = min(exp(r0-rmin),1.) / ( x0/r0 + 1./ch0);
    float sa = exp(r0-ra ) / (abs_a/ra + 1./cha);
    float sb = exp(r0-rb ) / (abs_b/rb + 1./chb);
    return sign(b)*(s0-sb) - sign(a)*(s0-sa);
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
    float X = sqrt(max(r*r -z2, 0.));
    // if ray is obstructed
    if (x_start < X && -X < x_stop && z2 < r*r)
    {
        // return ludicrously big number to represent obstruction
        return BIG;
    }
    float sigma =
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
    float xz = dot(-P,V); // distance ("radius") from the ray to the center of the world at closest approach, squared
    float z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, r, H );
}
function get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
    segment_origin, segment_direction, segment_length,
    world_position, world_radius, atmosphere_scale_height,
    beta_ray, beta_mie, beta_abs
){
    glm.vec3 O = world_position;
    float r = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma = approx_air_column_density_ratio_along_3d_ray_for_curved_world (segment_origin-world_position, segment_direction, segment_length, r, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
function get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
    view_origin, view_direction, view_start_length, view_stop_length,
    world_position, world_radius,
    light_direction, light_rgb_intensity,
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
    //  "z*"     distance from the center of the world to closest approach
    //  "r*"     a distance ("radius") from the center of the world
    //  "h*"     a distance ("height") from the surface of the world
    //  "*v*"    property of the view ray, the ray cast from the viewer to the object being viewed
    //  "*l*"    property of the light ray, the ray cast from the object to the light source
    //  "*2"     the square of a variable
    //  "*i"    property of an iteration within the raymarch
    //  "beta*"  a scattering coefficient, the number of e-foldings in light intensity per unit distance
    //  "gamma*" a phase factor, the fraction of light that's scattered in a certain direction
    //  "rho*"   a density ratio, the density of air relative to surface density
    //  "sigma*" a column density ratio, the density of a column of air relative to surface density
    //  "I*"     intensity of source lighting for each color channel
    //  "E*"     intensity of light cast towards the viewer for each color channel
    //  "*_ray"  property of rayleigh scattering
    //  "*_mie"  property of mie scattering
    //  "*_abs"  property of absorption
    glm.vec3 V0= view_origin;
    glm.vec3 V = view_direction;
    float v0= view_start_length;
    float v1= view_stop_length;
    glm.vec3 P = view_origin - world_position;
    glm.vec3 L = light_direction; // unit vector pointing to light source
    glm.vec3 I = light_rgb_intensity; // vector indicating intensity of light source for each color channel
    glm.vec3 O = world_position;
    float r = world_radius;
    float H = atmosphere_scale_height;
    float v = dot(-P,V); // distance from view ray origin to closest approach
    float z2 = dot( P,P) - v * v; // squared distance from the view ray to the center of the world at closest approach
    // cosine of angle between view and light directions
    float VL;
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray;
    float gamma_mie;
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    glm.vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    glm.vec3 beta_gamma;
    const float STEP_COUNT = 16.; // number of steps taken while marching along the view ray
    float dx = (v1 - v0) / STEP_COUNT;
    float vi = v0 - v + 0.5 * dx;
    float l; // distance from light ray origin to closest approach
    float zl2; // squared distance ("radius") of the light ray at closest for a single iteration of the view ray march
    float r2; // squared distance ("radius") from the center of the world for a single iteration of the view ray march
    float h; // distance ("height") from the surface of the world for a single iteration of the view ray march
    float sigma_v; // columnar density encountered along the view ray,  relative to surface density
    float sigma_l; // columnar density encountered along the light ray, relative to surface density
    glm.vec3 E = glm.vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        r2 = vi*vi+z2;
        h = sqrt(r2) - r;
        sigma_v = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-v, vi, z2, r, H );
        VL = dot(V, -L);
        l = dot(P+V*(vi+v),-L);
        zl2 = r2 - l*l;
        sigma_l = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-l, 3.*r, zl2, r, H );
        gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
        gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);
        beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
        E += I
            // incoming fraction: the fraction of light that scatters towards camera
            * exp(-h/H) * beta_gamma * dx
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * (sigma_l + sigma_v));
        vi += dx;
    }
    return E;
}
function get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
    cos_view_angle,
    cos_light_angle,
    cos_scatter_angle,
    ocean_depth,
    refracted_light_rgb_intensity,
    beta_ray, beta_mie, beta_abs
){
    float NV = cos_view_angle;
    float NL = cos_light_angle;
    float LV = cos_scatter_angle;
    glm.vec3 I = refracted_light_rgb_intensity;
    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(LV);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(LV);
    glm.vec3 beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    glm.vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    // "sigma_v"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_l" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    float sigma_v = ocean_depth / NV;
    float sigma_l = ocean_depth / NL;
    float sigma_ratio = 1. + NV/NL;
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
    float sigma = ocean_depth / cos_incident_angle;
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
