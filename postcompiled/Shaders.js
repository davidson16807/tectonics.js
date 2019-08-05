var vertexShaders = {};
vertexShaders.equirectangular = `
// NOTE: these macros are here to allow porting the code between several languages
const float PI = 3.14159265358979323846264338327950288419716939937510;
// VIEW PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
uniform float reference_distance;
varying vec3 view_direction_v;
varying vec3 view_origin_v;
varying vec4 position_v;
// WORLD PROPERTIES
uniform float sealevel;
uniform float world_radius;
attribute float displacement;
attribute vec3 gradient;
attribute float surface_temperature;
attribute float snow_coverage;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
varying float displacement_v;
varying vec3 gradient_v;
varying float surface_temperature_v;
varying float snow_coverage_v;
varying float plant_coverage_v;
varying float scalar_v;
// MISCELLANEOUS PROPERTIES
uniform float map_projection_offset;
uniform float animation_phase_angle;
attribute float vector_fraction_traversed;
varying float vector_fraction_traversed_v;
float lon(vec3 pos) {
    return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
    return asin(pos.y / length(pos));
}
void main() {
    displacement_v = displacement;
    gradient_v = gradient;
    plant_coverage_v = plant_coverage;
    surface_temperature_v = surface_temperature;
    snow_coverage_v = snow_coverage;
    scalar_v = scalar;
    position_v = modelMatrix * vec4( position, 1.0 );
    float height = displacement > sealevel? 0.005 : 0.0;
    float index_offset = map_projection_offset;
    float focus = lon(cameraPosition) + index_offset;
    float lon_focused = mod(lon(position_v.xyz) - focus, 2.*PI) - PI;
    float lat_focused = lat(position_v.xyz); //+ (map_projection_offset*PI);
    bool is_on_edge = lon_focused > PI*0.9 || lon_focused < -PI*0.9;
    vec4 displaced = vec4(
        lon_focused + index_offset,
        lat(position_v.xyz), //+ (map_projection_offset*PI), 
        is_on_edge? 0. : length(position),
        1);
    mat4 scaleMatrix = mat4(1);
    scaleMatrix[3] = viewMatrix[3] * reference_distance / world_radius;
    gl_Position = projectionMatrix * scaleMatrix * displaced;
    view_direction_v = -position_v.xyz;
    view_direction_v.y = 0.;
    view_direction_v = normalize(view_direction_v);
    view_origin_v = view_matrix_inverse[3].xyz * reference_distance;
    view_origin_v.y = 0.;
    view_origin_v = normalize(view_origin_v);
}
`;
vertexShaders.texture = `
// NOTE: these macros are here to allow porting the code between several languages
const float PI = 3.14159265358979323846264338327950288419716939937510;
// VIEW PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
uniform float reference_distance;
varying vec3 view_direction_v;
varying vec3 view_origin_v;
varying vec4 position_v;
// WORLD PROPERTIES
uniform float sealevel;
uniform float world_radius;
attribute float displacement;
attribute vec3 gradient;
attribute float surface_temperature;
attribute float snow_coverage;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
varying float displacement_v;
varying vec3 gradient_v;
varying float surface_temperature_v;
varying float snow_coverage_v;
varying float plant_coverage_v;
varying float scalar_v;
// MISCELLANEOUS PROPERTIES
uniform float map_projection_offset;
uniform float animation_phase_angle;
attribute float vector_fraction_traversed;
varying float vector_fraction_traversed_v;
float lon(vec3 pos) {
    return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
    return asin(pos.y / length(pos));
}
void main() {
    displacement_v = displacement;
    gradient_v = gradient;
    plant_coverage_v = plant_coverage;
    snow_coverage_v = snow_coverage;
    surface_temperature_v = surface_temperature;
    scalar_v = scalar;
    position_v = modelMatrix * vec4( position, 1.0 );
    float index_offset = map_projection_offset;
    float focus = lon(cameraPosition) + index_offset;
    float lon_focused = mod(lon(position_v.xyz) - focus, 2.*PI) - PI + index_offset;
    float lat_focused = lat(position_v.xyz); //+ (map_projection_offset*PI);
    float height = displacement > sealevel? 0.005 : 0.0;
    gl_Position = vec4(
        lon_focused / PI,
        lat_focused / (PI/2.),
        -height,
        1);
    view_direction_v = -position_v.xyz;
    view_direction_v.y = 0.;
    view_direction_v = normalize(view_direction_v);
    view_origin_v = view_matrix_inverse[3].xyz * reference_distance;
    view_origin_v.y = 0.;
    view_origin_v = normalize(view_origin_v);
}
`;
vertexShaders.orthographic = `
// NOTE: these macros are here to allow porting the code between several languages
const float PI = 3.14159265358979323846264338327950288419716939937510;
// VIEW PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
uniform float reference_distance;
varying vec3 view_direction_v;
varying vec3 view_origin_v;
varying vec4 position_v;
// WORLD PROPERTIES
uniform float sealevel;
uniform float world_radius;
attribute float displacement;
attribute vec3 gradient;
attribute float surface_temperature;
attribute float snow_coverage;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
varying float displacement_v;
varying vec3 gradient_v;
varying float surface_temperature_v;
varying float snow_coverage_v;
varying float plant_coverage_v;
varying float scalar_v;
// MISCELLANEOUS PROPERTIES
uniform float map_projection_offset;
uniform float animation_phase_angle;
attribute float vector_fraction_traversed;
varying float vector_fraction_traversed_v;
void main() {
    displacement_v = displacement;
    gradient_v = gradient;
    plant_coverage_v = plant_coverage;
    snow_coverage_v = snow_coverage;
    surface_temperature_v = surface_temperature;
    scalar_v = scalar;
    vector_fraction_traversed_v = vector_fraction_traversed;
    position_v = modelMatrix * vec4( position, 1.0 );
    float surface_height = max(displacement - sealevel, 0.);
    vec4 displacement = vec4( position * (world_radius + surface_height) / reference_distance, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * displacement;
    vec2 clipspace = gl_Position.xy / gl_Position.w;
    view_direction_v = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    view_origin_v = view_matrix_inverse[3].xyz * reference_distance;
}
`;
vertexShaders.passthrough = `
// NOTE: these macros are here to allow porting the code between several languages
const float PI = 3.14159265358979323846264338327950288419716939937510;
// VIEW PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
uniform float reference_distance;
varying vec3 view_direction_v;
varying vec3 view_origin_v;
varying vec4 position_v;
// WORLD PROPERTIES
uniform float sealevel;
uniform float world_radius;
attribute float displacement;
attribute vec3 gradient;
attribute float surface_temperature;
attribute float snow_coverage;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
varying float displacement_v;
varying vec3 gradient_v;
varying float surface_temperature_v;
varying float snow_coverage_v;
varying float plant_coverage_v;
varying float scalar_v;
// MISCELLANEOUS PROPERTIES
uniform float map_projection_offset;
uniform float animation_phase_angle;
attribute float vector_fraction_traversed;
varying float vector_fraction_traversed_v;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
var fragmentShaders = {};
fragmentShaders.atmosphere = `
// NOTE: these macros are here to allow porting the code between several languages
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.;
const float KELVIN = 1.;
const float MICROGRAM = 1e-9; // kilograms
const float MILLIGRAM = 1e-6; // kilograms
const float GRAM = 1e-3; // kilograms
const float KILOGRAM = 1.; // kilograms
const float TON = 1000.; // kilograms
const float NANOMETER = 1e-9; // meters
const float MICROMETER = 1e-6; // meters
const float MILLIMETER = 1e-3; // meters
const float METER = 1.; // meters
const float KILOMETER = 1000.; // meters
const float MOLE = 6.02214076e23;
const float MILLIMOLE = MOLE / 1e3;
const float MICROMOLE = MOLE / 1e6;
const float NANOMOLE = MOLE / 1e9;
const float FEMTOMOLE = MOLE / 1e12;
const float SECOND = 1.; // seconds
const float MINUTE = 60.; // seconds
const float HOUR = MINUTE*60.; // seconds
const float DAY = HOUR*24.; // seconds
const float WEEK = DAY*7.; // seconds
const float MONTH = DAY*29.53059; // seconds
const float YEAR = DAY*365.256363004; // seconds
const float MEGAYEAR = YEAR*1e6; // seconds
const float NEWTON = KILOGRAM * METER / (SECOND * SECOND);
const float JOULE = NEWTON * METER;
const float WATT = JOULE / SECOND;
const float EARTH_MASS = 5.972e24; // kilograms
const float EARTH_RADIUS = 6.367e6; // meters
const float STANDARD_GRAVITY = 9.80665; // meters/second^2
const float STANDARD_TEMPERATURE = 273.15; // kelvin
const float STANDARD_PRESSURE = 101325.; // pascals
const float ASTRONOMICAL_UNIT = 149597870700.;// meters
const float GLOBAL_SOLAR_CONSTANT = 1361.; // watts/meter^2
const float JUPITER_MASS = 1.898e27; // kilograms
const float JUPITER_RADIUS = 71e6; // meters
const float SOLAR_MASS = 2e30; // kilograms
const float SOLAR_RADIUS = 695.7e6; // meters
const float SOLAR_LUMINOSITY = 3.828e26; // watts
const float SOLAR_TEMPERATURE = 5772.; // kelvin
const float PI = 3.14159265358979323846264338327950288419716939937510;
float get_surface_area_of_sphere(
    in float radius
) {
    return 4.*PI*radius*radius;
}
// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
void get_relation_between_ray_and_point(
    in vec3 point_position,
    in vec3 ray_origin,
    in vec3 V,
    out float z2,
    out float xz
){
    vec3 P = point_position - ray_origin;
    xz = dot(P, V);
    z2 = dot(P, P) - xz * xz;
}
bool try_get_relation_between_ray_and_sphere(
    in float sphere_radius,
    in float z2,
    in float xz,
    out float distance_to_entrance,
    out float distance_to_exit
){
    float sphere_radius2 = sphere_radius * sphere_radius;
    float distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - z2, 1e-10));
    distance_to_entrance = xz - distance_from_closest_approach_to_exit;
    distance_to_exit = xz + distance_from_closest_approach_to_exit;
    return (distance_to_exit > 0. && z2 < sphere_radius*sphere_radius);
}
const float SPEED_OF_LIGHT = 299792458. * METER / SECOND;
const float BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const float STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER*METER* KELVIN*KELVIN*KELVIN*KELVIN);
const float PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
float solve_fraction_of_light_emitted_by_black_body_below_wavelength(
    in float wavelength,
    in float temperature
){
    const float iterations = 2.;
    const float h = PLANCK_CONSTANT;
    const float k = BOLTZMANN_CONSTANT;
    const float c = SPEED_OF_LIGHT;
    float L = wavelength;
    float T = temperature;
    float C2 = h*c/k;
    float z = C2 / (L*T);
    float z2 = z*z;
    float z3 = z2*z;
    float sum = 0.;
    float n2=0.;
    float n3=0.;
    for (float n=1.; n <= iterations; n++) {
        n2 = n*n;
        n3 = n2*n;
        sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
    }
    return 15.*sum/(PI*PI*PI*PI);
}
float solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
    in float lo,
    in float hi,
    in float temperature
){
    return solve_fraction_of_light_emitted_by_black_body_below_wavelength(hi, temperature) -
            solve_fraction_of_light_emitted_by_black_body_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
float get_intensity_of_light_emitted_by_black_body(
    in float temperature
){
    float T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
vec3 solve_rgb_intensity_of_light_emitted_by_black_body(
    in float temperature
){
    return get_intensity_of_light_emitted_by_black_body(temperature)
         * vec3(
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
           );
}
// Rayleigh phase function factor [-1, 1]
float get_fraction_of_rayleigh_scattered_light_scattered_by_angle(
    in float cos_scatter_angle
){
    return 3. * (1. + cos_scatter_angle*cos_scatter_angle)
    / //------------------------
                (16. * PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
float get_fraction_of_mie_scattered_light_scattered_by_angle(
    in float cos_scatter_angle
){
    const float g = 0.76;
    return (1. - g*g)
    / //---------------------------------------------
        ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
float approx_fraction_of_mie_scattered_light_scattered_by_angle_fast(
    in float cos_scatter_angle
){
    const float g = 0.76;
    const float k = 1.55*g - 0.55 * (g*g*g);
    return (1. - k*k)
    / //-------------------------------------------
        (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// "get_fraction_of_light_reflected_on_surface_head_on" finds the fraction of light that's reflected
//   by a boundary between materials when striking head on.
//   It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
//   The refractive indices can be provided as parameters in any order.
float get_fraction_of_light_reflected_on_surface_head_on(
    in float refractivate_index1,
    in float refractivate_index2
){
    float n1 = refractivate_index1;
    float n2 = refractivate_index2;
    float sqrtR0 = ((n1-n2)/(n1+n2));
    float R0 = sqrtR0 * sqrtR0;
    return R0;
}
// "get_fraction_of_light_reflected_on_surface" returns Fresnel reflectance.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
float get_fraction_of_light_reflected_on_surface(
    in float cos_incident_angle,
    in float characteristic_reflectance
){
    float R0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_rgb_fraction_of_light_reflected_on_surface" returns Fresnel reflectance for each color channel.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
vec3 get_rgb_fraction_of_light_reflected_on_surface(
    in float cos_incident_angle,
    in vec3 characteristic_reflectance
){
    vec3 R0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_fraction_of_light_masked_or_shaded_by_surface" is Schlick's fast approximation for Smith's function
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for even more details.
float get_fraction_of_light_masked_or_shaded_by_surface(
    in float cos_view_angle,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float v = cos_view_angle;
    float k = sqrt(2.*m*m/PI);
    return v/(v-k*v+k);
}
// "get_fraction_of_microfacets_with_angle" 
//   This is also known as the Beckmann Surface Normal Distribution Function.
//   This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
//   see Hoffmann 2015 for a gentle introduction to the concept.
//   see Schlick (1994) for even more details.
float get_fraction_of_microfacets_with_angle(
    in float cos_angle_of_deviation,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float t = cos_angle_of_deviation;
    return exp((t*t-1.)/(m*m*t*t))/(m*m*t*t*t*t);
}
const float BIG = 1e20;
const float SMALL = 1e-20;
const int MAX_LIGHT_COUNT = 9;
// "oplus" is the o-plus operator,
//   or the reciprocal of the sum of reciprocals.
// It's a handy function that comes up a lot in some physics problems.
// It's pretty useful for preventing division by zero.
float oplus(in float a, in float b){
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
float approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    in float a,
    in float b,
    in float z2,
    in float R
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
    float X = sqrt(max(R*R -z2, 0.));
    float div0_fix = 1./sqrt((X*X+R) * 0.5*PI);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float sa = 1./(abs(a)/ra + div0_fix) * exp(R-ra);
    float sb = 1./(abs(b)/rb + div0_fix) * exp(R-rb);
    float S = 1./(abs(X)/R + div0_fix) * min(exp(R-sqrt(z2)),1.);
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
float approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    in float x_start,
    in float x_stop,
    in float z2,
    in float r,
    in float H
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
float approx_air_column_density_ratio_along_3d_ray_for_curved_world (
    in vec3 P,
    in vec3 V,
    in float x,
    in float r,
    in float H
){
    float xz = dot(-P,V); // distance ("radius") from the ray to the center of the world at closest approach, squared
    float z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, r, H );
}
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
    in vec3 view_origin, in vec3 view_direction,
    in vec3 world_position, in float world_radius,
    in vec3 [MAX_LIGHT_COUNT] light_directions,
    in vec3 [MAX_LIGHT_COUNT] light_rgb_intensities,
    in int light_count,
    in vec3 background_rgb_intensity,
    in float atmosphere_scale_height,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
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
    vec3 P = view_origin - world_position;
    vec3 V = view_direction;
    vec3 I_back = background_rgb_intensity;
    float r = world_radius;
    float H = atmosphere_scale_height;
    const float STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    float xv = dot(-P,V); // distance from view ray origin to closest approach
    float zv2 = dot( P,P) - xv * xv; // squared distance from the view ray to the center of the world at closest approach
    float xv_in_air; // distance along the view ray at which the ray enters the atmosphere
    float xv_out_air; // distance along the view ray at which the ray exits the atmosphere
    float xv_in_world; // distance along the view ray at which the ray enters the surface of the world
    float xv_out_world; // distance along the view ray at which the ray enters the surface of the world
    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    bool is_scattered = try_get_relation_between_ray_and_sphere(r + 12.*H, zv2, xv, xv_in_air, xv_out_air );
    bool is_obstructed = try_get_relation_between_ray_and_sphere(r, zv2, xv, xv_in_world, xv_out_world);
    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!is_scattered){ return I_back; }
    // cosine of angle between view and light directions
    float VL;
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray;
    float gamma_mie;
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    vec3 beta_gamma;
    float xv_start = max(xv_in_air, 0.);
    float xv_stop = is_obstructed? xv_in_world : xv_out_air;
    float dx = (xv_stop - xv_start) / STEP_COUNT;
    float xvi = xv_start - xv + 0.5 * dx;
    vec3 L; // unit vector pointing to light source
    vec3 I; // vector indicating intensity of light source for each color channel
    float xl; // distance from light ray origin to closest approach
    float zl2; // squared distance ("radius") of the light ray at closest for a single iteration of the view ray march
    float r2; // squared distance ("radius") from the center of the world for a single iteration of the view ray march
    float h; // distance ("height") from the surface of the world for a single iteration of the view ray march
    float sigma_v; // columnar density encountered along the view ray,  relative to surface density
    float sigma_l; // columnar density encountered along the light ray, relative to surface density
    vec3 E = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        r2 = xvi*xvi+zv2;
        h = sqrt(r2) - r;
        sigma_v = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xv, xvi, zv2, r, H );
        for (int j = 0; j < MAX_LIGHT_COUNT; ++j)
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
vec3 get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
    in vec3 segment_origin, in vec3 segment_direction, in float segment_length,
    in vec3 world_position, in float world_radius, in float atmosphere_scale_height,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    vec3 O = world_position;
    float r = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma = approx_air_column_density_ratio_along_3d_ray_for_curved_world (segment_origin-world_position, segment_direction, segment_length, r, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
    in float cos_view_angle,
    in float cos_light_angle,
    in float cos_scatter_angle,
    in float ocean_depth,
    in vec3 refracted_light_rgb_intensity,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
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
    vec3 beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
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
vec3 get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(
    in float cos_incident_angle, in float ocean_depth,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    float sigma = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (
    in float x,
    in float edge0,
    in float edge1,
    in float height
){
    float center = (edge1 + edge0) / 2.;
    float width = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
    return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (
    in float w
){
    return vec3(
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
const float GAMMA = 2.2;
vec3 get_rgb_intensity_of_rgb_signal(in vec3 signal
){
    return vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
vec3 get_rgb_signal_of_rgb_intensity(in vec3 intensity
){
    return vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
varying vec2 vUv;
uniform sampler2D background_rgb_signal_texture;
// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever world's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
// VIEW PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
uniform float reference_distance;
uniform float shaderpass_visibility;
// WORLD PROPERTIES ------------------------------------------------------------
uniform vec3 world_position;
uniform float world_radius;
// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3 light_rgb_intensities [MAX_LIGHT_COUNT];
uniform vec3 light_directions [MAX_LIGHT_COUNT];
uniform int light_count;
uniform float insolation_max;
// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3 surface_air_rayleigh_scattering_coefficients;
uniform vec3 surface_air_mie_scattering_coefficients;
uniform vec3 surface_air_absorption_coefficients;
bool isnan(float x)
{
    return !(0. <= x || x <= 0.);
}
bool isbig(float x)
{
    return abs(x)>BIG;
}
vec2 get_chartspace(vec2 bottomleft, vec2 topright, vec2 screenspace){
    return screenspace * abs(topright - bottomleft) + bottomleft;
}
vec3 line(float y, vec2 chartspace, float line_width, vec3 line_color){
    return abs(y-chartspace.y) < line_width? line_color : vec3(1.);
}
vec3 chart_scratch(vec2 screenspace){
    vec2 bottomleft = vec2(-500e3, -100e3);
    vec2 topright = vec2( 500e3, 100e3);
    vec2 chartspace = get_chartspace(bottomleft, topright, screenspace);
    float line_width = 0.01 * abs(topright - bottomleft).y;
    float y = chartspace.x;
    return line(y, chartspace, line_width, vec3(1,0,0));
}
void main() {
    vec2 screenspace = vUv;
    // gl_FragColor = vec4(chart_scratch(screenspace), 1);
    // return;
    vec2 clipspace = 2.0 * screenspace - 1.0;
    vec3 view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    vec3 view_origin = view_matrix_inverse[3].xyz * reference_distance;
    vec4 background_rgb_signal = texture2D( background_rgb_signal_texture, vUv );
    vec3 background_rgb_intensity = insolation_max * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
    // "beta_air_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3 beta_ray = surface_air_rayleigh_scattering_coefficients;
    vec3 beta_mie = surface_air_mie_scattering_coefficients;
    vec3 beta_abs = surface_air_absorption_coefficients;
    vec3 rgb_intensity =
        get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
            view_origin, view_direction,
            world_position, world_radius,
            light_directions, // rgb vectors indicating intensities of light sources
            light_rgb_intensities, // unit vectors indicating directions to light sources
            light_count,
            background_rgb_intensity,
            atmosphere_scale_height,
            beta_ray, beta_mie, beta_abs
        );
    rgb_intensity = mix(background_rgb_intensity, rgb_intensity, shaderpass_visibility);
    // TODO: move this to a separate shader pass!
    // see https://learnopengl.com/Advanced-Lighting/HDR for an intro to tone mapping
    float exposure_intensity = 150.; // Watts/m^2
    vec3 ldr_tone_map = 1.0 - exp(-rgb_intensity/exposure_intensity);
    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(ldr_tone_map), 1);
    // gl_FragColor = 3.*background_rgb_signal;
}
`;
fragmentShaders.heatmap = `
varying float displacement_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying vec4 position_v;
uniform float sealevel;
uniform float ocean_visibility;
//converts float from 0-1 to a heat map visualtion
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
vec4 heat (float v) {
    float value = 1.-v;
    return (0.5+0.5*smoothstep(0.0, 0.1, value))*vec4(
        smoothstep(0.5, 0.3, value),
        value < 0.3 ? smoothstep(0.0, 0.3, value) : smoothstep(1.0, 0.6, value),
        smoothstep(0.4, 0.6, value),
        1
    );
}
void main() {
    vec4 color_without_ocean = heat( scalar_v );
    vec4 color_with_ocean = displacement_v < sealevel * ocean_visibility? mix(vec4(0.), color_without_ocean, 0.5) : color_without_ocean;
    gl_FragColor = color_with_ocean;
}
`;
fragmentShaders.colorscale = `
varying float displacement_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying vec4 position_v;
uniform float sealevel;
uniform float ocean_visibility;
uniform vec3 min_color;
uniform vec3 max_color;
void main() {
    vec4 color_without_ocean = mix(
        vec4(min_color,1.),
        vec4(max_color,1.),
        scalar_v
    );
    vec4 color_with_ocean = displacement_v < sealevel * ocean_visibility? mix(vec4(0.), color_without_ocean, 0.5) : color_without_ocean;
    gl_FragColor = color_with_ocean;
}
`;
fragmentShaders.passthrough = `
uniform sampler2D input_texture;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D( input_texture, vUv );
}
`;
fragmentShaders.realistic = `
// NOTE: these macros are here to allow porting the code between several languages
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.;
const float KELVIN = 1.;
const float MICROGRAM = 1e-9; // kilograms
const float MILLIGRAM = 1e-6; // kilograms
const float GRAM = 1e-3; // kilograms
const float KILOGRAM = 1.; // kilograms
const float TON = 1000.; // kilograms
const float NANOMETER = 1e-9; // meters
const float MICROMETER = 1e-6; // meters
const float MILLIMETER = 1e-3; // meters
const float METER = 1.; // meters
const float KILOMETER = 1000.; // meters
const float MOLE = 6.02214076e23;
const float MILLIMOLE = MOLE / 1e3;
const float MICROMOLE = MOLE / 1e6;
const float NANOMOLE = MOLE / 1e9;
const float FEMTOMOLE = MOLE / 1e12;
const float SECOND = 1.; // seconds
const float MINUTE = 60.; // seconds
const float HOUR = MINUTE*60.; // seconds
const float DAY = HOUR*24.; // seconds
const float WEEK = DAY*7.; // seconds
const float MONTH = DAY*29.53059; // seconds
const float YEAR = DAY*365.256363004; // seconds
const float MEGAYEAR = YEAR*1e6; // seconds
const float NEWTON = KILOGRAM * METER / (SECOND * SECOND);
const float JOULE = NEWTON * METER;
const float WATT = JOULE / SECOND;
const float EARTH_MASS = 5.972e24; // kilograms
const float EARTH_RADIUS = 6.367e6; // meters
const float STANDARD_GRAVITY = 9.80665; // meters/second^2
const float STANDARD_TEMPERATURE = 273.15; // kelvin
const float STANDARD_PRESSURE = 101325.; // pascals
const float ASTRONOMICAL_UNIT = 149597870700.;// meters
const float GLOBAL_SOLAR_CONSTANT = 1361.; // watts/meter^2
const float JUPITER_MASS = 1.898e27; // kilograms
const float JUPITER_RADIUS = 71e6; // meters
const float SOLAR_MASS = 2e30; // kilograms
const float SOLAR_RADIUS = 695.7e6; // meters
const float SOLAR_LUMINOSITY = 3.828e26; // watts
const float SOLAR_TEMPERATURE = 5772.; // kelvin
const float PI = 3.14159265358979323846264338327950288419716939937510;
float get_surface_area_of_sphere(
    in float radius
) {
    return 4.*PI*radius*radius;
}
// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
void get_relation_between_ray_and_point(
    in vec3 point_position,
    in vec3 ray_origin,
    in vec3 V,
    out float z2,
    out float xz
){
    vec3 P = point_position - ray_origin;
    xz = dot(P, V);
    z2 = dot(P, P) - xz * xz;
}
bool try_get_relation_between_ray_and_sphere(
    in float sphere_radius,
    in float z2,
    in float xz,
    out float distance_to_entrance,
    out float distance_to_exit
){
    float sphere_radius2 = sphere_radius * sphere_radius;
    float distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - z2, 1e-10));
    distance_to_entrance = xz - distance_from_closest_approach_to_exit;
    distance_to_exit = xz + distance_from_closest_approach_to_exit;
    return (distance_to_exit > 0. && z2 < sphere_radius*sphere_radius);
}
const float SPEED_OF_LIGHT = 299792458. * METER / SECOND;
const float BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const float STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER*METER* KELVIN*KELVIN*KELVIN*KELVIN);
const float PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
float solve_fraction_of_light_emitted_by_black_body_below_wavelength(
    in float wavelength,
    in float temperature
){
    const float iterations = 2.;
    const float h = PLANCK_CONSTANT;
    const float k = BOLTZMANN_CONSTANT;
    const float c = SPEED_OF_LIGHT;
    float L = wavelength;
    float T = temperature;
    float C2 = h*c/k;
    float z = C2 / (L*T);
    float z2 = z*z;
    float z3 = z2*z;
    float sum = 0.;
    float n2=0.;
    float n3=0.;
    for (float n=1.; n <= iterations; n++) {
        n2 = n*n;
        n3 = n2*n;
        sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
    }
    return 15.*sum/(PI*PI*PI*PI);
}
float solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
    in float lo,
    in float hi,
    in float temperature
){
    return solve_fraction_of_light_emitted_by_black_body_below_wavelength(hi, temperature) -
            solve_fraction_of_light_emitted_by_black_body_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
float get_intensity_of_light_emitted_by_black_body(
    in float temperature
){
    float T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
vec3 solve_rgb_intensity_of_light_emitted_by_black_body(
    in float temperature
){
    return get_intensity_of_light_emitted_by_black_body(temperature)
         * vec3(
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
             solve_fraction_of_light_emitted_by_black_body_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
           );
}
// Rayleigh phase function factor [-1, 1]
float get_fraction_of_rayleigh_scattered_light_scattered_by_angle(
    in float cos_scatter_angle
){
    return 3. * (1. + cos_scatter_angle*cos_scatter_angle)
    / //------------------------
                (16. * PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
float get_fraction_of_mie_scattered_light_scattered_by_angle(
    in float cos_scatter_angle
){
    const float g = 0.76;
    return (1. - g*g)
    / //---------------------------------------------
        ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
float approx_fraction_of_mie_scattered_light_scattered_by_angle_fast(
    in float cos_scatter_angle
){
    const float g = 0.76;
    const float k = 1.55*g - 0.55 * (g*g*g);
    return (1. - k*k)
    / //-------------------------------------------
        (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// "get_fraction_of_light_reflected_on_surface_head_on" finds the fraction of light that's reflected
//   by a boundary between materials when striking head on.
//   It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
//   The refractive indices can be provided as parameters in any order.
float get_fraction_of_light_reflected_on_surface_head_on(
    in float refractivate_index1,
    in float refractivate_index2
){
    float n1 = refractivate_index1;
    float n2 = refractivate_index2;
    float sqrtR0 = ((n1-n2)/(n1+n2));
    float R0 = sqrtR0 * sqrtR0;
    return R0;
}
// "get_fraction_of_light_reflected_on_surface" returns Fresnel reflectance.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
float get_fraction_of_light_reflected_on_surface(
    in float cos_incident_angle,
    in float characteristic_reflectance
){
    float R0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_rgb_fraction_of_light_reflected_on_surface" returns Fresnel reflectance for each color channel.
//   Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
//   It is the fraction of light that causes specular reflection.
//   Here, we use Schlick's fast approximation for Fresnel reflectance.
//   see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for implementation details
vec3 get_rgb_fraction_of_light_reflected_on_surface(
    in float cos_incident_angle,
    in vec3 characteristic_reflectance
){
    vec3 R0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_fraction_of_light_masked_or_shaded_by_surface" is Schlick's fast approximation for Smith's function
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for even more details.
float get_fraction_of_light_masked_or_shaded_by_surface(
    in float cos_view_angle,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float v = cos_view_angle;
    float k = sqrt(2.*m*m/PI);
    return v/(v-k*v+k);
}
// "get_fraction_of_microfacets_with_angle" 
//   This is also known as the Beckmann Surface Normal Distribution Function.
//   This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
//   see Hoffmann 2015 for a gentle introduction to the concept.
//   see Schlick (1994) for even more details.
float get_fraction_of_microfacets_with_angle(
    in float cos_angle_of_deviation,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float t = cos_angle_of_deviation;
    return exp((t*t-1.)/(m*m*t*t))/(m*m*t*t*t*t);
}
const float BIG = 1e20;
const float SMALL = 1e-20;
const int MAX_LIGHT_COUNT = 9;
// "oplus" is the o-plus operator,
//   or the reciprocal of the sum of reciprocals.
// It's a handy function that comes up a lot in some physics problems.
// It's pretty useful for preventing division by zero.
float oplus(in float a, in float b){
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
float approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    in float a,
    in float b,
    in float z2,
    in float R
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
    float X = sqrt(max(R*R -z2, 0.));
    float div0_fix = 1./sqrt((X*X+R) * 0.5*PI);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float sa = 1./(abs(a)/ra + div0_fix) * exp(R-ra);
    float sb = 1./(abs(b)/rb + div0_fix) * exp(R-rb);
    float S = 1./(abs(X)/R + div0_fix) * min(exp(R-sqrt(z2)),1.);
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
float approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    in float x_start,
    in float x_stop,
    in float z2,
    in float r,
    in float H
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
float approx_air_column_density_ratio_along_3d_ray_for_curved_world (
    in vec3 P,
    in vec3 V,
    in float x,
    in float r,
    in float H
){
    float xz = dot(-P,V); // distance ("radius") from the ray to the center of the world at closest approach, squared
    float z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, r, H );
}
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
    in vec3 view_origin, in vec3 view_direction,
    in vec3 world_position, in float world_radius,
    in vec3 [MAX_LIGHT_COUNT] light_directions,
    in vec3 [MAX_LIGHT_COUNT] light_rgb_intensities,
    in int light_count,
    in vec3 background_rgb_intensity,
    in float atmosphere_scale_height,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
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
    vec3 P = view_origin - world_position;
    vec3 V = view_direction;
    vec3 I_back = background_rgb_intensity;
    float r = world_radius;
    float H = atmosphere_scale_height;
    const float STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    float xv = dot(-P,V); // distance from view ray origin to closest approach
    float zv2 = dot( P,P) - xv * xv; // squared distance from the view ray to the center of the world at closest approach
    float xv_in_air; // distance along the view ray at which the ray enters the atmosphere
    float xv_out_air; // distance along the view ray at which the ray exits the atmosphere
    float xv_in_world; // distance along the view ray at which the ray enters the surface of the world
    float xv_out_world; // distance along the view ray at which the ray enters the surface of the world
    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    bool is_scattered = try_get_relation_between_ray_and_sphere(r + 12.*H, zv2, xv, xv_in_air, xv_out_air );
    bool is_obstructed = try_get_relation_between_ray_and_sphere(r, zv2, xv, xv_in_world, xv_out_world);
    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!is_scattered){ return I_back; }
    // cosine of angle between view and light directions
    float VL;
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray;
    float gamma_mie;
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    vec3 beta_gamma;
    float xv_start = max(xv_in_air, 0.);
    float xv_stop = is_obstructed? xv_in_world : xv_out_air;
    float dx = (xv_stop - xv_start) / STEP_COUNT;
    float xvi = xv_start - xv + 0.5 * dx;
    vec3 L; // unit vector pointing to light source
    vec3 I; // vector indicating intensity of light source for each color channel
    float xl; // distance from light ray origin to closest approach
    float zl2; // squared distance ("radius") of the light ray at closest for a single iteration of the view ray march
    float r2; // squared distance ("radius") from the center of the world for a single iteration of the view ray march
    float h; // distance ("height") from the surface of the world for a single iteration of the view ray march
    float sigma_v; // columnar density encountered along the view ray,  relative to surface density
    float sigma_l; // columnar density encountered along the light ray, relative to surface density
    vec3 E = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        r2 = xvi*xvi+zv2;
        h = sqrt(r2) - r;
        sigma_v = approx_air_column_density_ratio_along_2d_ray_for_curved_world(-xv, xvi, zv2, r, H );
        for (int j = 0; j < MAX_LIGHT_COUNT; ++j)
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
vec3 get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
    in vec3 segment_origin, in vec3 segment_direction, in float segment_length,
    in vec3 world_position, in float world_radius, in float atmosphere_scale_height,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    vec3 O = world_position;
    float r = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma = approx_air_column_density_ratio_along_3d_ray_for_curved_world (segment_origin-world_position, segment_direction, segment_length, r, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
    in float cos_view_angle,
    in float cos_light_angle,
    in float cos_scatter_angle,
    in float ocean_depth,
    in vec3 refracted_light_rgb_intensity,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
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
    vec3 beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
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
vec3 get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(
    in float cos_incident_angle, in float ocean_depth,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    float sigma = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (
    in float x,
    in float edge0,
    in float edge1,
    in float height
){
    float center = (edge1 + edge0) / 2.;
    float width = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
    return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (
    in float w
){
    return vec3(
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
const float GAMMA = 2.2;
vec3 get_rgb_intensity_of_rgb_signal(in vec3 signal
){
    return vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
vec3 get_rgb_signal_of_rgb_intensity(in vec3 intensity
){
    return vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever world's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
// VIEW SETTINGS ---------------------------------------------------------------
uniform float reference_distance;
uniform float ocean_visibility;
uniform float sediment_visibility;
uniform float plant_visibility;
uniform float snow_visibility;
uniform float shadow_visibility;
uniform float specular_visibility;
// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3 light_rgb_intensities [MAX_LIGHT_COUNT];
uniform vec3 light_directions [MAX_LIGHT_COUNT];
uniform int light_count;
uniform float insolation_max;
// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3 surface_air_rayleigh_scattering_coefficients;
uniform vec3 surface_air_mie_scattering_coefficients;
uniform vec3 surface_air_absorption_coefficients;
// SEA PROPERTIES -------------------------------------------------------
uniform float sealevel;
uniform vec3 ocean_rayleigh_scattering_coefficients;
uniform vec3 ocean_mie_scattering_coefficients;
uniform vec3 ocean_absorption_coefficients;
// WORLD PROPERTIES ------------------------------------------------------------
uniform vec3 world_position; // location for the center of the world, in meters
uniform float world_radius; // radius of the world being rendered, in meters
varying float displacement_v;
varying vec3 gradient_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying float surface_temperature_v;
varying vec4 position_v;
varying vec3 view_direction_v;
// "SOLAR_RGB_LUMINOSITY" is the rgb luminosity of earth's sun, in Watts.
//   It is used to convert the above true color values to absorption coefficients.
//   You can also generate these numbers by calling solve_rgb_intensity_of_light_emitted_by_black_body(SOLAR_TEMPERATURE)
const vec3 SOLAR_RGB_LUMINOSITY = vec3(7247419., 8223259., 8121487.);
const float AIR_REFRACTIVE_INDEX = 1.000277;
const float WATER_REFRACTIVE_INDEX = 1.333;
const float WATER_ROOT_MEAN_SLOPE_SQUARED = 0.18;
const vec3 LAND_COLOR_MAFIC = vec3(50,45,50)/255.; // observed on lunar maria 
const vec3 LAND_COLOR_FELSIC = vec3(214,181,158)/255.; // observed color of rhyolite sample
const vec3 LAND_COLOR_SAND = vec3(245,215,145)/255.;
const vec3 LAND_COLOR_PEAT = vec3(100,85,60)/255.;
const float LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE = 0.04; // NOTE: "0.04" is a representative value for plastics and other diffuse reflectors
const float LAND_ROOT_MEAN_SLOPE_SQUARED = 0.2;
const vec3 JUNGLE_COLOR = vec3(30,50,10)/255.;
const float JUNGLE_ROOT_MEAN_SLOPE_SQUARED = 30.0;
const vec3 SNOW_COLOR = vec3(0.9, 0.9, 0.9);
const float SNOW_REFRACTIVE_INDEX = 1.333;
// TODO: calculate airglow for nightside using scattering equations from atmosphere.glsl.c, 
//   also keep in mind this: https://en.wikipedia.org/wiki/Airglow
const float AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR = 0.000001;
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
// "get_rgb_intensity_of_light_from_surface_of_world" 
//   traces a ray of light through the atmosphere and into a surface,
// NOTE: this function does not trace the ray out of the atmosphere,
//   since that is a job that only our atmosphere shader is capable of doing.
//   Nor does it determine emission, since it is designed to be looped 
//   over several light sources, and this would oversaturate the contribution from emission.
vec3 get_rgb_intensity_of_light_from_surface_of_world(
    // light properties
    in vec3 light_direction,
    in vec3 light_rgb_intensity,
    // atmoshere properties
    in float world_radius,
    in float atmosphere_scale_height,
    in vec3 atmosphere_beta_ray,
    in vec3 atmosphere_beta_mie,
    in vec3 atmosphere_beta_abs,
    in float atmosphere_ambient_light_factor,
    // surface properties
    in vec3 surface_position,
    in vec3 surface_normal,
    in float surface_slope_root_mean_squared,
    in vec3 surface_diffuse_color_rgb_fraction,
    in vec3 surface_specular_color_rgb_fraction,
    // ocean properties
    in float ocean_depth,
    in vec3 ocean_beta_ray,
    in vec3 ocean_beta_mie,
    in vec3 ocean_beta_abs,
    // view properties
    in vec3 view_direction
){
    // NOTE: the single letter variable names here are industry standard, learn them!
    // Uppercase indicates vectors
    // lowercase indicates scalars
    // "P" is the origin of the rays: the surface of the planet
    vec3 P = surface_position;
    // "N" is the surface normal
    vec3 N = surface_normal;
    // "V" is the normal vector indicating the direction from the view
    // TODO: standardize view_direction as view from surface to camera
    vec3 V = view_direction;
    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;
    // "H" is the halfway vector between normal and view.
    // It represents the surface normal that's needed to cause reflection.
    // It can also be thought of as the surface normal of a microfacet that's 
    //   producing the reflections seen by the camera.
    vec3 H = normalize(V+L);
    // Here we setup  several useful dot products of unit vectors
    //   we can think of them as the cosines of the angles formed between them,
    //   or their "cosine similarity": https://en.wikipedia.org/wiki/Cosine_similarity
    float LV = dot(L,V);
    float NV = abs(dot(N,V));
    float NL = abs(dot(N,L));
    float NH = dot(N,H);
    float HV = max(dot(V,H), 0.);
    // "F0" is the characteristic fresnel reflectance.
    //   it is the fraction of light that's immediately reflected when striking the surface head on.
    vec3 F0 = surface_specular_color_rgb_fraction;
    // "m" is the "ROOT_MEAN_SLOPE_SQUARED", the root mean square of the slope of all microfacets 
    // see https://www.desmos.com/calculator/0tqwgsjcje for a way to estimate it using a function to describe the surface
    float m = surface_slope_root_mean_squared;
    // "D" is the diffuse reflection fraction, essentially the color of the surface
    vec3 D = surface_diffuse_color_rgb_fraction;
    // "I_sun" is the rgb Intensity of Incoming Incident light, A.K.A. "Insolation"
    vec3 I_sun = light_rgb_intensity;
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    vec3 I_surface = I_sun
      * get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
            // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the world
            1.000001 * P, L, 3.*world_radius, vec3(0), world_radius,
            atmosphere_scale_height, atmosphere_beta_ray, atmosphere_beta_mie, atmosphere_beta_abs
        );
    // "E_surface_reflected" is the intensity of light that is immediately reflected by the surface, A.K.A. "specular" reflection
    vec3 E_surface_reflected = I_surface
        * get_rgb_fraction_of_light_reflected_on_surface(HV, F0)
        * get_fraction_of_light_masked_or_shaded_by_surface(NV, m)
        * get_fraction_of_microfacets_with_angle(NH, m)
        / (4.*PI); // NOTE: NV*VL should appear here in the denominator, but I can't get it to work
    // "I_surface_refracted" is the intensity of light that is not immediately reflected, 
    //   but penetrates into the material, either to be absorbed, scattered away, 
    //   or scattered back to the view as diffuse reflection.
    // We would ideally like to negate the integral of reflectance over all possible angles, 
    //   but finding that is hard, so let's just negate the reflectance for the angle at which it occurs the most, or "HV"
    vec3 I_surface_refracted =
        I_surface * (1. - get_rgb_fraction_of_light_reflected_on_surface(HV, F0));
      //+ I_sun     *  atmosphere_ambient_light_factor;
    // If sea is present, "E_ocean_scattered" is the rgb intensity of light 
    //   scattered by the sea towards the camera. Otherwise, it equals 0.
    vec3 E_ocean_scattered =
        get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
            NV, NL, LV, ocean_depth, I_surface_refracted,
            ocean_beta_ray, ocean_beta_mie, ocean_beta_abs
        );
    // if sea is present, "I_ocean_trasmitted" is the rgb intensity of light 
    //   that reaches the ground after being filtered by air and sea. 
    //   Otherwise, it equals I_surface_refracted.
    vec3 I_ocean_trasmitted= I_surface_refracted
        * get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(NL, ocean_depth, ocean_beta_ray, ocean_beta_mie, ocean_beta_abs);
    // "E_diffuse" is diffuse reflection of any nontrasparent component beneath the transparent surface,
    // It effectively describes diffuse reflection as understood within the phong model of reflectance.
    vec3 E_diffuse = I_ocean_trasmitted * NL * surface_diffuse_color_rgb_fraction;
    // if sea is present, "E_ocean_transmitted" is the fraction 
    //   of E_diffuse that makes it out of the sea. Otheriwse, it equals E_diffuse
    vec3 E_ocean_transmitted = E_diffuse
        * get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(NV, ocean_depth, ocean_beta_ray, ocean_beta_mie, ocean_beta_abs);
    return
        E_surface_reflected
      + E_ocean_transmitted
      + E_ocean_scattered;
}
void main() {
    bool is_ocean = sealevel > displacement_v;
    bool is_visible_ocean = sealevel * ocean_visibility > displacement_v;
    float ocean_depth = max(sealevel*ocean_visibility - displacement_v, 0.);
    float surface_height = max(displacement_v - sealevel*ocean_visibility, 0.);
    // TODO: pass felsic_coverage in from attribute
    // we currently guess how much rock is felsic depending on displacement
    // Absorption coefficients are physically based.
    // Scattering coefficients have been determined aesthetically.
    float felsic_coverage = smoothstep(sealevel - 4000., sealevel+5000., displacement_v);
    float mineral_coverage = displacement_v > sealevel? smoothstep(sealevel + 10000., sealevel, displacement_v) : 0.;
    float organic_coverage = smoothstep(30., -30., surface_temperature_v);
    float snow_coverage = snow_coverage_v;
    float plant_coverage = plant_coverage_v * (!is_visible_ocean? 1. : 0.);
    // TODO: more sensible microfacet model
    vec3 color_of_bedrock = mix(LAND_COLOR_MAFIC, LAND_COLOR_FELSIC, felsic_coverage);
    vec3 color_with_sediment = mix(color_of_bedrock, mix(LAND_COLOR_SAND, LAND_COLOR_PEAT, organic_coverage), mineral_coverage * sediment_visibility);
    vec3 color_with_plants = mix(color_with_sediment, JUNGLE_COLOR, !is_ocean? plant_coverage * plant_visibility * sediment_visibility : 0.);
    vec3 color_with_snow = mix(color_with_plants, SNOW_COLOR, snow_coverage * snow_visibility);
    // "n" is the surface normal for a perfectly smooth sphere
    vec3 n = normalize(position_v.xyz);
    vec3 surface_position =
        n * (world_radius + surface_height);
    vec3 surface_normal =
        normalize(n + gradient_v);
    float surface_slope_root_mean_squared =
        is_visible_ocean?
            WATER_ROOT_MEAN_SLOPE_SQUARED :
            mix(LAND_ROOT_MEAN_SLOPE_SQUARED, JUNGLE_ROOT_MEAN_SLOPE_SQUARED, plant_coverage);
    vec3 surface_diffuse_color_rgb_fraction =
        get_rgb_intensity_of_rgb_signal(color_with_snow);
    // TODO: model refractive index as a function of wavelength
    vec3 surface_specular_color_rgb_fraction =
        shadow_visibility * specular_visibility * // turn off specular reflection if darkness is disabled
        vec3(mix(
            is_visible_ocean?
            get_fraction_of_light_reflected_on_surface_head_on(WATER_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX) :
            LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE,
            get_fraction_of_light_reflected_on_surface_head_on(SNOW_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX),
            snow_coverage*snow_visibility
        ));
    float ocean_visible_depth = mix(ocean_depth, 0., snow_coverage*snow_coverage*snow_coverage*snow_visibility);
    vec3 E_surface_reemitted = vec3(0);
    for (int i = 0; i < MAX_LIGHT_COUNT; ++i)
    {
        if (i >= light_count){ break; }
        vec3 light_direction = normalize(mix(n, light_directions[i], shadow_visibility));
        vec3 light_rgb_intensity = light_rgb_intensities[i];
        E_surface_reemitted +=
            get_rgb_intensity_of_light_from_surface_of_world(
                // light properties
                light_direction,
                light_rgb_intensity,
                // atmosphere properties
                world_radius,
                atmosphere_scale_height,
                surface_air_rayleigh_scattering_coefficients,
                surface_air_mie_scattering_coefficients,
                surface_air_absorption_coefficients,
                AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR,
                // surface properties
                surface_position,
                surface_normal,
                surface_slope_root_mean_squared,
                surface_diffuse_color_rgb_fraction,
                surface_specular_color_rgb_fraction,
                // ocean properties
                ocean_visible_depth,
                ocean_rayleigh_scattering_coefficients,
                ocean_mie_scattering_coefficients,
                ocean_absorption_coefficients,
                // view properties
                -view_direction_v
            );
    }
    vec3 E_surface_emitted = solve_rgb_intensity_of_light_emitted_by_black_body(surface_temperature_v);
    // NOTE: we do not filter E_total by atmospheric scattering
    //   that job is done by the atmospheric shader pass, in "atmosphere.glsl.c"
    vec3 E_total =
          E_surface_emitted
        + E_surface_reemitted;
    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(E_total/insolation_max),1);
}
`;
fragmentShaders.surface_normal_map = `
varying float displacement_v;
varying vec3 gradient_v;
varying vec4 position_v;
uniform float sealevel;
uniform float ocean_visibility;
void main() {
    // CODE to generate a tangent-space normal map:
    // "n" is the surface normal for a perfectly smooth sphere
    vec3 n = normalize(position_v.xyz);
    // "N" is the actual surface normal as reported by the gradient of displacement
    vec3 N = normalize(n + gradient_v);
    // "j" is coordinate basis for the y axis
    vec3 j = vec3(0,1,0);
    // "u" is the left/right axis on a uv map
    vec3 u = normalize(cross(n, j));
    // "v" is the up/down axis on a uv map
    vec3 v = normalize(cross(n, u));
    // to find the tangent-space normal map, we simply have to map N to the u/v/n coordinate space
    // in other words, we take the dot product between n and the respective u/v/n coordinate bases.
    gl_FragColor = vec4((2.*vec3(dot(N, u), dot(N, v), dot(N, n))-1.), 1);
}
`;
fragmentShaders.topographic = `
varying float displacement_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying vec4 position_v;
uniform float sealevel;
uniform float ocean_visibility;
//converts a float ranging from [-1,1] to a topographic map visualization
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
void main() {
    //deep ocean
    vec3 color = vec3(0,0,0.8);
    //shallow ocean
    color = mix(
        color,
        vec3(0.5,0.5,1),
        smoothstep(-1., -0.01, scalar_v)
    );
    //lowland
    color = mix(
        color,
        vec3(0,0.55,0),
        smoothstep(-0.01, 0.01, scalar_v)
    );
    //highland
    color = mix(
        color,
        vec3(0.95,0.95,0),
        smoothstep(0., 0.45, scalar_v)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0),
        smoothstep(0.2, 0.7, scalar_v)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0.5),
        smoothstep(0.4, 0.8, scalar_v)
    );
    //snow cap
    color = mix(
        color,
        vec3(0.95),
        smoothstep(0.75, 1., scalar_v)
    );
    gl_FragColor = vec4(color, 1.);
}
`;
fragmentShaders.vector_field = `
const float PI = 3.14159265358979;
uniform float animation_phase_angle;
varying float vector_fraction_traversed_v;
void main() {
    float state = (cos(2.*PI*vector_fraction_traversed_v - animation_phase_angle) + 1.) / 2.;
    gl_FragColor = vec4(state) * vec4(vec3(0.8),0.) + vec4(vec3(0.2),0.);
}
`;
