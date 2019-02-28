var vertexShaders = {};
vertexShaders.equirectangular = `
const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
attribute float displacement;
attribute vec3 gradient;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
attribute float vector_fraction_traversed;
varying float vDisplacement;
varying vec3 vGradient;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;
varying vec3 vClipspace;
varying vec4 vNormal;
uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
float lon(vec3 pos) {
 return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
 return asin(pos.y / length(pos));
}
void main() {
 vDisplacement = displacement;
 vGradient = gradient;
 vPlantCoverage = plant_coverage;
 vSurfaceTemp = surface_temp;
 vIceCoverage = ice_coverage;
 vScalar = scalar;
 vPosition = modelMatrix * vec4( position, 1.0 );
 vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
 float height = displacement > sealevel? 0.005 : 0.0;
 float index_offset = INDEX_SPACING * index;
 float focus = lon(cameraPosition) + index_offset;
 float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI;
 float lat_focused = lat(modelPos.xyz); //+ (index*PI);
 bool is_on_edge = lon_focused > PI*0.9 || lon_focused < -PI*0.9;
 vec4 displaced = vec4(
  lon_focused + index_offset,
  lat(modelPos.xyz), //+ (index*PI), 
  is_on_edge? 0. : length(position),
  1);
 mat4 scaleMatrix = mat4(1);
 scaleMatrix[3] = viewMatrix[3] * reference_distance / world_radius;
 gl_Position = projectionMatrix * scaleMatrix * displaced;
 vClipspace = gl_Position.xyz / gl_Position.w; //perspective divide/normalize
}
`;
vertexShaders.texture = `
const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
attribute float displacement;
attribute vec3 gradient;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
attribute float vector_fraction_traversed;
varying float vDisplacement;
varying vec3 vGradient;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;
varying vec3 vClipspace;
varying vec4 vNormal;
uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
float lon(vec3 pos) {
 return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
 return asin(pos.y / length(pos));
}
void main() {
 vDisplacement = displacement;
 vGradient = gradient;
 vPlantCoverage = plant_coverage;
 vIceCoverage = ice_coverage;
 vSurfaceTemp = surface_temp;
 vScalar = scalar;
 vPosition = modelMatrix * vec4( position, 1.0 );
 vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
 float index_offset = INDEX_SPACING * index;
 float focus = lon(cameraPosition) + index_offset;
 float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
 float lat_focused = lat(modelPos.xyz); //+ (index*PI);
 float height = displacement > sealevel? 0.005 : 0.0;
 gl_Position = vec4(
        lon_focused / PI,
  lat_focused / (PI/2.),
  -height,
  1);
 vClipspace = gl_Position.xyz / gl_Position.w; //perspective divide/normalize
}
`;
vertexShaders.orthographic = `
const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
attribute float displacement;
attribute vec3 gradient;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute vec3 vector;
attribute float vector_fraction_traversed;
varying float vDisplacement;
varying vec3 vGradient;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;
varying vec3 vClipspace;
varying vec4 vNormal;
uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
void main() {
 vDisplacement = displacement;
 vGradient = gradient;
 vPlantCoverage = plant_coverage;
 vIceCoverage = ice_coverage;
 vSurfaceTemp = surface_temp;
 vScalar = scalar;
 vVectorFractionTraversed = vector_fraction_traversed;
 vPosition = modelMatrix * vec4( position, 1.0 );
 float surface_height = max(displacement - sealevel, 0.);
 vec4 displacement = vec4( position * (world_radius + surface_height) / reference_distance, 1.0 );
 gl_Position = projectionMatrix * modelViewMatrix * displacement;
 vClipspace = gl_Position.xyz / gl_Position.w; //perspective divide/normalize
}
`;
vertexShaders.passthrough = `
varying vec2 vUv;
void main() {
 vUv = uv;
 gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
var fragmentShaders = {};
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
const float NANOMETER = 1e-9; // meter
const float MICROMETER = 1e-6; // meter
const float MILLIMETER = 1e-3; // meter
const float METER = 1.; // meter
const float KILOMETER = 1000.; // meter
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
const float ASTRONOMICAL_UNIT = 149597870700.; // meters
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
 in vec3 ray_direction,
 out float distance_at_closest_approach2,
 out float distance_to_closest_approach
){
 vec3 ray_to_point = point_position - ray_origin;
 distance_to_closest_approach = dot(ray_to_point, ray_direction);
 distance_at_closest_approach2 =
  dot(ray_to_point, ray_to_point) -
  distance_to_closest_approach * distance_to_closest_approach;
}
bool try_get_relation_between_ray_and_sphere(
 in float sphere_radius,
 in float distance_at_closest_approach2,
 in float distance_to_closest_approach,
 out float distance_to_entrance,
 out float distance_to_exit
){
 float sphere_radius2 = sphere_radius * sphere_radius;
 float distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - distance_at_closest_approach2, 1e-10));
 distance_to_entrance = distance_to_closest_approach - distance_from_closest_approach_to_exit;
 distance_to_exit = distance_to_closest_approach + distance_from_closest_approach_to_exit;
 return (distance_to_exit > 0. && distance_at_closest_approach2 < sphere_radius*sphere_radius);
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
vec3 get_rgb_intensity_of_light_emitted_by_black_body(
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
float get_fraction_of_rayleigh_scattered_light_scattered_by_angle(in float cos_scatter_angle)
{
 return
   3. * (1. + cos_scatter_angle*cos_scatter_angle)
 / //------------------------
    (16. * PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
float get_fraction_of_mie_scattered_light_scattered_by_angle(in float cos_scatter_angle)
{
 const float g = 0.76;
 return
      (1. - g*g)
 / //---------------------------------------------
  ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
float get_schlick_phase_factor(in float cos_scatter_angle)
{
 const float g = 0.76;
 const float k = 1.55*g - 0.55 * (g*g*g);
 return
     (1. - k*k)
 / //-------------------------------------------
  (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// "get_characteristic_reflectance" finds the fraction of light that's reflected
//   by a boundary between materials when striking head on.
//   The refractive indices can be provided as parameters in any order.
float get_characteristic_reflectance(in float refractivate_index1, in float refractivate_index2)
{
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
float get_fraction_of_light_reflected_on_surface(in float cos_incident_angle, in float characteristic_reflectance)
{
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
vec3 get_rgb_fraction_of_light_reflected_on_surface(in float cos_incident_angle, in vec3 characteristic_reflectance)
{
 vec3 R0 = characteristic_reflectance;
 float _1_u = 1.-cos_incident_angle;
 return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_fraction_of_reflected_light_masked_or_shaded" is Schlick's fast approximation for Smith's function
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for even more details.
float get_fraction_of_reflected_light_masked_or_shaded(in float cos_view_angle, in float root_mean_slope_squared)
{
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
float get_fraction_of_microfacets_with_angle(in float cos_angle_of_deviation, in float root_mean_slope_squared)
{
 float m = root_mean_slope_squared;
 float t = cos_angle_of_deviation;
    return exp((t*t-1.)/(m*m*t*t))/(m*m*t*t*t*t);
}
const float BIG = 1e20;
const float SMALL = 1e-20;
// "get_height_along_ray_over_world" gets the height at a point along the path
//   for a ray traveling over a world.
// NOTE: all input distances are relative to closest approach!
float get_height_along_ray_over_world(float x, float z2, float R){
    return sqrt(max(x*x + z2, 0.)) - R;
}
// "get_height_change_rate_along_ray_over_world" gets the rate at which height changes for a distance traveled along the path
//   for a ray traveling through the atmosphere.
// NOTE: all input distances are relative to closest approach!
float get_height_change_rate_along_ray_over_world(float x, float z2){
    return x / sqrt(max(x*x + z2, 0.));
}
// "get_air_density_ratio_at_height" gets the density ratio of an height within the atmosphere
// the "density ratio" is density expressed as a fraction of a surface value
float get_air_density_ratio_at_height(
    float h,
    float H
){
    return exp(-h/H);
}
// "approx_air_column_density_ratio_along_ray_from_samples" returns an approximation 
//   for the columnar density ratio encountered by a ray traveling through the atmosphere.
// It is the integral of get_air_density_ratio_at_height() along the path of the ray, 
//   taking into account the height at every point along the path.
// We can't solve the integral in the usual fashion due to singularities
//   (see https://www.wolframalpha.com/input/?i=integrate+exp(-sqrt(x%5E2%2Bz%5E2)%2FH)+dx)
//   so we use a linear approximation for the height.
// Our linear approximation gets its slope and intercept from sampling
//   at points along the path (xm and xb respectively)
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_from_samples(float x, float xm, float xb, float z2, float R, float H){
 float m = get_height_change_rate_along_ray_over_world(xm,z2);
 float b = get_height_along_ray_over_world(xb,z2,R);
 float h = m*(x-xb) + b;
    return -H/m * exp(-h/H);
}
// "approx_air_column_density_ratio_along_ray_for_segment" is a convenience wrapper for approx_air_column_density_ratio_along_ray_from_samples(), 
//   which calculates sensible values of xm and xb for the user 
//   given a specified range around which the approximation must be valid.
// The range is indicated by its lower bounds (xmin) and width (dx).
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_for_segment(float x, float xmin, float dx, float z2, float R, float H){
    const float fm = 0.5;
    const float fb = 0.2;
    float xm = xmin + fm*dx;
    float xb = xmin + fb*dx;
    float xmax = xmin + dx;
    return approx_air_column_density_ratio_along_ray_from_samples(clamp(x, xmin, xmax), xm, xb, z2,R,H);
}
// "approx_air_column_density_ratio_along_ray_for_absx" is a convenience wrapper for approx_air_column_density_ratio_along_ray_for_segment().
// It returns an approximation of columnar density ratio encountered from 
//   the surface of a world to a given upper bound, "x"
// Unlike approx_air_column_density_ratio_along_ray_from_samples() and approx_air_column_density_ratio_along_ray_for_segment(), 
//   it should be appropriate for any value of x, no matter if it's positive or negative.
// It does this by making two linear approximations for height:
//   one for the lower atmosphere, one for the upper atmosphere.
// These are represented by the two call outs to approx_air_column_density_ratio_along_ray_for_segment().
// "x" is the distance along the ray from closest approach to the upper bound (always positive),
//   or from the closest approach to the upper bound, if there is no intersection.
// "x_atmo" is the distance along the ray from closest approach to the top of the atmosphere (always positive)
// "x_world" is the distance along the ray from closest approach to the surface of the world (always positive)
// "sigma0" is the columnar density ratio generated by this equation when x is on the surface of the world;
//   it is used to express values for columnar density ratio relative to the surface of the world.
// "z2" is the closest distance from the ray to the center of the world, squared.
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_for_absx(float x, float x_world, float x_atmo, float sigma0, float z2, float R, float H){
    // sanitize x_world so it's always positive
    x_world = abs(x_world);
    // sanitize x_atmo so it's always positive
    x_atmo = abs(x_atmo);
    // sanitize x so it's always positive and greater than x_world
    x = max(abs(x)-x_world, 0.) + x_world;
    // "dx" is the width of the bounds covered by our linear approximations
    float dx = (x_atmo-x_world)/3.;
    return
        approx_air_column_density_ratio_along_ray_for_segment(x, x_world, dx, z2,R,H)
      + approx_air_column_density_ratio_along_ray_for_segment(x, x_world+dx, dx, z2,R,H)
      - sigma0;
}
// "approx_reference_air_column_density_ratio_along_ray" is a convenience wrapper for approx_air_column_density_ratio_along_ray_for_absx().
// It returns a reference value that can be passed to approx_air_column_density_ratio_along_ray_2d().
// NOTE: all input distances are relative to closest approach!
float approx_reference_air_column_density_ratio_along_ray(float x_world, float x_atmo, float z2, float R, float H){
    return approx_air_column_density_ratio_along_ray_for_absx(x_world, x_world, x_atmo, 0., z2, R, H);
}
// "approx_air_column_density_ratio_along_ray_2d" is a convenience wrapper for approx_air_column_density_ratio_along_ray_for_absx().
// It returns a approximation of columnar density ratio that should be appropriate for any value of x.
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_2d (float x_start, float x_stop, float x_world, float x_atmo, float sigma0, float z2, float R, float H){
    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return
        sign(x_stop) * min(approx_air_column_density_ratio_along_ray_for_absx(x_stop, x_world, x_atmo, sigma0, z2, R, H), BIG) -
     sign(x_start) * min(approx_air_column_density_ratio_along_ray_for_absx(x_start, x_world, x_atmo, sigma0, z2, R, H), BIG);
}
// "try_approx_air_column_density_ratio_along_ray" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_ray_2d() and approx_reference_air_column_density_ratio_along_ray.
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
float approx_air_column_density_ratio_along_line_segment (
 vec3 segment_origin,
    vec3 segment_direction,
    float segment_length,
 vec3 world_position,
 float world_radius,
 float atmosphere_scale_height
){
    vec3 O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    float z2; // distance ("radius") from the ray to the center of the world at closest approach, squared
    float x_z; // distance from the origin at which closest approach occurs
    float x_in_atmo; // distance from the origin at which the ray enters the atmosphere
    float x_out_atmo; // distance from the origin at which the ray exits the atmosphere
    float x_in_world; // distance from the origin at which the ray strikes the surface of the world
    float x_out_world; // distance from the origin at which the ray exits the world, assuming it could pass through
    get_relation_between_ray_and_point(
  world_position,
     segment_origin, segment_direction,
  z2, x_z
 );
    try_get_relation_between_ray_and_sphere(
        world_radius,
        z2, x_z,
        x_in_world, x_out_world
    );
    bool is_obstructed =
        0. < x_out_world && x_out_world < segment_length &&
        z2 < world_radius*world_radius;
    if (is_obstructed)
    {
     return BIG;
    }
    // NOTE: "12." is the number of scale heights needed to reach the official edge of space on Earth.
    // It should be sufficiently high to work for any world
    try_get_relation_between_ray_and_sphere(
        R + 12. * H,
        z2, x_z,
        x_in_atmo, x_out_atmo
    );
    // NOTE: "sigma0" the column density ratio returned by approx_air_column_density_ratio_along_ray_for_absx() for the surface
    float sigma0 = approx_reference_air_column_density_ratio_along_ray(
     x_out_world-x_z, x_out_atmo-x_z,
     z2, R, H
 );
    return approx_air_column_density_ratio_along_ray_2d(
     0.-x_z, segment_length-x_z,
     x_out_world-x_z, x_out_atmo-x_z, sigma0,
     z2, R, H
 );
}
// TODO: multiple light sources
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_intensity_of_light_scattered_from_atmosphere(
    vec3 view_origin, vec3 view_direction,
    vec3 world_position, float world_radius,
    vec3 light_direction, vec3 light_rgb_intensity,
    vec3 background_rgb_intensity,
    float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    vec3 P = view_origin;
    vec3 V = view_direction;
    vec3 L = light_direction;
    vec3 I_sun = light_rgb_intensity;
    vec3 I_back = background_rgb_intensity;
    vec3 O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    float unused1, unused2, unused3, unused4; // used for passing unused output parameters to functions
    const float STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    bool V_is_scattered; // whether view ray will enter the atmosphere
    bool V_is_obstructed; // whether view ray will enter the surface of a world
    float z_V2; // distance ("radius") from the view ray to the center of the world at closest approach, squared
    float x_Vz; // distance along the view ray at which closest approach occurs
    float x_V_in_atmo; // distance along the view ray at which the ray enters the atmosphere
    float x_V_out_atmo; // distance along the view ray at which the ray exits the atmosphere
    float x_V_in_world; // distance along the view ray at which the ray enters the surface of the world
    float x_V_out_world; // distance along the view ray at which the ray enters the surface of the world
    float x_V_start; // distance along the view ray at which scattering starts, either because it's the start of the ray or the start of the atmosphere 
    float x_V_stop; // distance along the view ray at which scattering no longer occurs, either due to hitting the world or leaving the atmosphere
    float dx_V; // distance between steps while marching along the view ray
    float x_V; // distance traversed while marching along the view ray
    float sigma_V; // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface
    vec3 P_i; // absolute position while marching along the view ray
    float h_i; // distance ("height") from the surface of the world while marching along the view ray
    float sigma_L; // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface
    // cosine of angle between view and light directions
    float VL = dot(V, L);
    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    vec3 E = vec3(0);
    // Rayleigh and Mie phase factors,
    // A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // This factor indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    // The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
    // and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);
    vec3 beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    get_relation_between_ray_and_point(
        O, P, V,
        z_V2, x_Vz
    );
    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    V_is_scattered = try_get_relation_between_ray_and_sphere(
        R + 4.*H, z_V2, x_Vz,
        x_V_in_atmo, x_V_out_atmo
    );
    V_is_obstructed = try_get_relation_between_ray_and_sphere(
        R, z_V2, x_Vz,
        x_V_in_world, x_V_out_world
    );
    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!V_is_scattered)
    {
        return I_back;
    }
    x_V_start = max(x_V_in_atmo, 0.);
    x_V_stop = V_is_obstructed? x_V_in_world : x_V_out_atmo;
    dx_V = (x_V_stop - x_V_start) / STEP_COUNT;
    x_V = x_V_start + 0.5 * dx_V;
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        P_i = P + V * x_V;
        h_i = get_height_along_ray_over_world(x_V-x_Vz, z_V2, R);
        sigma_V = approx_air_column_density_ratio_along_line_segment (P_i, -V, x_V, O, R, H);
        sigma_L = approx_air_column_density_ratio_along_line_segment (P_i, L, 3.*R, O, R, H);
        E += I_sun
            // incoming fraction: the fraction of light that scatters towards camera
            * exp(-h_i/H) * beta_gamma * dx_V
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * (sigma_V + sigma_L));
        x_V += dx_V;
    }
    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    E += I_back * exp(-beta_sum * sigma_V);
    return E;
}
vec3 get_rgb_fraction_of_refracted_light_transmitted_through_atmosphere(
    vec3 segment_origin, vec3 segment_direction, float segment_length,
    vec3 world_position, float world_radius, float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    vec3 O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma = approx_air_column_density_ratio_along_line_segment (segment_origin, segment_direction, segment_length, O, R, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_from_fluid(
    float cos_view_angle,
    float cos_light_angle,
    float cos_scatter_angle,
    float ocean_depth,
    vec3 refracted_light_rgb_intensity,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
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
    // "sigma_V"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_L" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within water
    float sigma_V = ocean_depth / NV;
    float sigma_L = ocean_depth / NL;
    float sigma_ratio = 1. + NV/NL;
    return I
        // incoming fraction: the fraction of light that scatters towards camera
        * beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_V * sigma_ratio * beta_sum) - 1.)
        / (-sigma_ratio * beta_sum);
}
vec3 get_rgb_fraction_of_refracted_light_transmitted_through_fluid(
    float cos_incident_angle, float ocean_depth,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    float sigma = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (in float x, in float edge0, in float edge1, in float height)
{
    float center = (edge1 + edge0) / 2.;
    float width = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
 return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (in float w)
{
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
vec3 get_rgb_intensity_of_rgb_signal(in vec3 signal)
{
 return vec3(
  pow(signal.x, GAMMA),
  pow(signal.y, GAMMA),
  pow(signal.z, GAMMA)
 );
}
vec3 get_rgb_signal_of_rgb_intensity(in vec3 intensity)
{
 return vec3(
  pow(intensity.x, 1./GAMMA),
  pow(intensity.y, 1./GAMMA),
  pow(intensity.z, 1./GAMMA)
 );
}
varying float vDisplacement;
varying vec3 vGradient;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying float vSurfaceTemp;
varying vec4 vPosition;
varying vec3 vClipspace;
// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;
// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
// VIEW SETTINGS ---------------------------------------------------------------
uniform float sealevel;
uniform float sealevel_mod;
uniform float darkness_mod;
uniform float ice_mod;
// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3 light_rgb_intensity;
uniform vec3 light_direction;
uniform float insolation_max;
// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3 atmosphere_surface_rayleigh_scattering_coefficients;
uniform vec3 atmosphere_surface_mie_scattering_coefficients;
uniform vec3 atmosphere_surface_absorption_coefficients;
// SEA PROPERTIES -------------------------------------------------------
uniform vec3 sea_rayleigh_scattering_coefficients;
uniform vec3 sea_mie_scattering_coefficients;
uniform vec3 sea_absorption_coefficients;
// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3 world_position;
// radius of the world being rendered, in meters
uniform float world_radius;
// "SOLAR_RGB_LUMINOSITY" is the rgb luminosity of earth's sun, in Watts.
//   It is used to convert the above true color values to absorption coefficients.
//   You can also generate these numbers by calling get_rgb_intensity_of_light_emitted_by_black_body(SOLAR_TEMPERATURE)
const vec3 SOLAR_RGB_LUMINOSITY = vec3(7247419., 8223259., 8121487.);
const float AIR_REFRACTIVE_INDEX = 1.000277;
const vec3 WATER_COLOR_DEEP = vec3(0.04,0.04,0.2);
const vec3 WATER_COLOR_SHALLOW = vec3(0.04,0.58,0.54);
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
void main() {
    vec2 clipspace = vClipspace.xy;
    vec3 view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    // vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;
    bool is_ocean = vDisplacement < sealevel * sealevel_mod;
    float ocean_depth = max(sealevel*sealevel_mod - vDisplacement, 0.);
    float surface_height = max(vDisplacement - sealevel*sealevel_mod, 0.);
    // TODO: pass felsic_coverage in from attribute
    // we currently guess how much rock is felsic depending on displacement
    // Absorption coefficients are physically based.
    // Scattering coefficients have been determined aesthetically.
    float felsic_coverage = smoothstep(sealevel - 4000., sealevel+5000., vDisplacement);
    float mineral_coverage = vDisplacement > sealevel? smoothstep(sealevel + 10000., sealevel, vDisplacement) : 0.;
    float organic_coverage = smoothstep(30., -30., vSurfaceTemp);
    float ice_coverage = vIceCoverage;
    float plant_coverage = vPlantCoverage * (vDisplacement > sealevel? 1. : 0.);
    // "beta_sea_*" variables are the scattering coefficients for seawater
    vec3 beta_sea_ray = sea_rayleigh_scattering_coefficients;
    vec3 beta_sea_mie = sea_mie_scattering_coefficients;
    vec3 beta_sea_abs = sea_absorption_coefficients;
    // "beta_air_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3 beta_air_ray = atmosphere_surface_rayleigh_scattering_coefficients;
    vec3 beta_air_mie = atmosphere_surface_mie_scattering_coefficients;
    vec3 beta_air_abs = atmosphere_surface_absorption_coefficients;
    // "m" is the "ROOT_MEAN_SLOPE_SQUARED", the root mean square of the slope of all microfacets 
    // see https://www.desmos.com/calculator/0tqwgsjcje for a way to estimate it using a function to describe the surface
    float m = is_ocean? WATER_ROOT_MEAN_SLOPE_SQUARED : mix(LAND_ROOT_MEAN_SLOPE_SQUARED, JUNGLE_ROOT_MEAN_SLOPE_SQUARED, plant_coverage);
    // "F0" is the characteristic fresnel reflectance.
    //   it is the fraction of light that's immediately reflected when striking the surface head on.
    // TODO: model refractive index as a function of wavelength
    vec3 F0 = vec3(mix(
        is_ocean? get_characteristic_reflectance(WATER_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX) : LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE,
        get_characteristic_reflectance(SNOW_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX),
        ice_coverage*ice_mod
    ));
    // "N" is the surface normal
    vec3 N = normalize(normalize(vPosition.xyz) + vGradient);
    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;
    // "V" is the normal vector indicating the direction from the view
    vec3 V = -view_direction;
    // "H" is the halfway vector between normal and view.
    // It represents the surface normal that's needed to cause reflection.
    // It can also be thought of as the surface normal of a microfacet that's 
    //   producing the reflections seen by the camera.
    vec3 H = normalize(V+L);
    // Here we setup  several useful dot products of unit vectors
    //   we can think of them as the cosines of the angles formed between them,
    //   or their "cosine similarity": https://en.wikipedia.org/wiki/Cosine_similarity
    float LV = (dot(L,V));
    float NV = max(dot(N,V), 0.);
    float NL = max(dot(N,L), 0.);
    float NH = (dot(N,H));
    float HV = max(dot(V,H), 0.);
    // "I_max" is the maximum possible intensity within the viewing frame.
    // For Earth, this would be the global solar constant.
    float I_max = insolation_max;
    // "I_sun" is the rgb Intensity of Incoming Incident light, A.K.A. "Insolation"
    vec3 I_sun = light_rgb_intensity;
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    vec3 I_surface = I_sun
        * get_rgb_fraction_of_refracted_light_transmitted_through_atmosphere(
            // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the planet
            1.0003 * vPosition.xyz * reference_distance, L, 3.*world_radius,
            world_position, world_radius, atmosphere_scale_height, beta_air_ray, beta_air_mie, beta_air_abs
        );
    vec3 E_surface_reflected = I_surface
        * get_rgb_fraction_of_light_reflected_on_surface(HV, F0)
        * get_fraction_of_reflected_light_masked_or_shaded(NV, m)
        * get_fraction_of_microfacets_with_angle(NH, m)
        / (4.*PI);
    // "I_surface_refracted" is the fraction of light that is not immediately reflected, 
    //   but penetrates into the material, either to be absorbed, scattered away, 
    //   or scattered back to the view as diffuse reflection.
    // Unlike I_surface_reflected, we do not consider it striking 
    //     the ideal microfacet for reflection ("HV"), but instead the most common one ("NV").
    vec3 I_surface_refracted =
        I_surface * (1. - get_rgb_fraction_of_light_reflected_on_surface(NV, F0)) +
        I_sun * AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR;
    // If sea is present, "E_sea_scattered" is the rgb intensity of light 
    //   scattered by the sea towards the camera. Otherwise, it equals 0.
    vec3 E_sea_scattered =
        get_rgb_intensity_of_light_scattered_from_fluid(
            NV, NL, LV, ocean_depth, I_surface_refracted,
            beta_sea_ray, beta_sea_mie, beta_sea_abs
        );
    // if sea is present, "I_sea_trasmitted" is the rgb intensity of light 
    //   that reaches the ground after being filtered by air and sea. Otherwise, it equals I_surface_refracted.
    vec3 I_sea_trasmitted= I_surface_refracted
        * get_rgb_fraction_of_refracted_light_transmitted_through_fluid(NL, ocean_depth, beta_sea_ray, beta_sea_mie, beta_sea_abs);
    // TODO: more sensible microfacet model
    vec3 bedrock_color = mix(LAND_COLOR_MAFIC, LAND_COLOR_FELSIC, felsic_coverage);
    vec3 soil_color = mix(bedrock_color, mix(LAND_COLOR_SAND, LAND_COLOR_PEAT, organic_coverage), mineral_coverage);
    vec3 canopy_color = mix(soil_color, JUNGLE_COLOR, plant_coverage);
    vec3 bottom_color = get_rgb_intensity_of_rgb_signal(@UNCOVERED);
    // "E_bottom_diffused" is diffuse reflection of any nontrasparent component beneath the transparent surface,
    // It effectively describes diffuse reflection as understood within the phong model of reflectance.
    vec3 E_bottom_diffused = I_sea_trasmitted * NL * bottom_color;
    // if sea is present, "E_sea_transmitted" is the fraction 
    //   of E_bottom_diffused that makes it out of the sea. Otheriwse, it equals E_bottom_diffused
    vec3 E_sea_transmitted = E_bottom_diffused
        * get_rgb_fraction_of_refracted_light_transmitted_through_fluid(NV, ocean_depth, beta_sea_ray, beta_sea_mie, beta_sea_abs);
    vec3 E_surface_diffused =
        mix(E_sea_transmitted + E_sea_scattered,
            I_surface_refracted * NL * SNOW_COLOR,
            ice_coverage*ice_coverage*ice_coverage*ice_mod);
    vec3 E_surface_emitted = get_rgb_intensity_of_light_emitted_by_black_body(vSurfaceTemp);
    // NOTE: we do not filter E_total by atmospheric scattering
    //   that job is done by the atmospheric shader pass, in "atmosphere.glsl.c"
    vec3 E_total =
          E_surface_reflected
        + E_surface_emitted
        + E_surface_diffused;
    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(E_total/I_max),1);
    // // CODE to generate a tangent-space normal map:
    // vec3 n = normalize(vPosition.xyz);
    // vec3 y = vec3(0,1,0);
    // vec3 u = normalize(cross(n, y));
    // vec3 v = normalize(cross(n, u));
    // vec3 w = n;
    // vec3 g = normalize(vGradient);
    // gl_FragColor = vec4((2.*vec3(dot(N, u), dot(N, v), dot(N, w))-1.), 1);
}
`;
fragmentShaders.monochromatic = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
void main() {
 vec4 uncovered = mix(
  vec4(@MINCOLOR,1.),
  vec4(@MAXCOLOR,1.),
  vScalar
 );
 vec4 ocean = mix(vec4(0.), uncovered, 0.5);
 vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 gl_FragColor = sea_covered;
}
`;
fragmentShaders.heatmap = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
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
 vec4 uncovered = heat( vScalar );
 vec4 ocean = mix(vec4(0.), uncovered, 0.5);
 vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 gl_FragColor = sea_covered;
}
`;
fragmentShaders.topographic = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
//converts a float ranging from [-1,1] to a topographic map visualization
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
void main() {
    //deep ocean
    vec3 color = vec3(0,0,0.8);
    //shallow ocean
    color = mix(
        color,
        vec3(0.5,0.5,1),
        smoothstep(-1., -0.01, vScalar)
    );
    //lowland
    color = mix(
        color,
        vec3(0,0.55,0),
        smoothstep(-0.01, 0.01, vScalar)
    );
    //highland
    color = mix(
        color,
        vec3(0.95,0.95,0),
        smoothstep(0., 0.45, vScalar)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0),
        smoothstep(0.2, 0.7, vScalar)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0.5),
        smoothstep(0.4, 0.8, vScalar)
    );
    //snow cap
    color = mix(
        color,
        vec3(0.95),
        smoothstep(0.75, 1., vScalar)
    );
 gl_FragColor = vec4(color, 1.);
}
`;
fragmentShaders.vectorField = `
const float PI = 3.14159265358979;
uniform float animation_phase_angle;
varying float vVectorFractionTraversed;
void main() {
 float state = (cos(2.*PI*vVectorFractionTraversed - animation_phase_angle) + 1.) / 2.;
 gl_FragColor = vec4(state) * vec4(vec3(0.8),0.) + vec4(vec3(0.2),0.);
}
`;
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
const float NANOMETER = 1e-9; // meter
const float MICROMETER = 1e-6; // meter
const float MILLIMETER = 1e-3; // meter
const float METER = 1.; // meter
const float KILOMETER = 1000.; // meter
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
const float ASTRONOMICAL_UNIT = 149597870700.; // meters
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
 in vec3 ray_direction,
 out float distance_at_closest_approach2,
 out float distance_to_closest_approach
){
 vec3 ray_to_point = point_position - ray_origin;
 distance_to_closest_approach = dot(ray_to_point, ray_direction);
 distance_at_closest_approach2 =
  dot(ray_to_point, ray_to_point) -
  distance_to_closest_approach * distance_to_closest_approach;
}
bool try_get_relation_between_ray_and_sphere(
 in float sphere_radius,
 in float distance_at_closest_approach2,
 in float distance_to_closest_approach,
 out float distance_to_entrance,
 out float distance_to_exit
){
 float sphere_radius2 = sphere_radius * sphere_radius;
 float distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - distance_at_closest_approach2, 1e-10));
 distance_to_entrance = distance_to_closest_approach - distance_from_closest_approach_to_exit;
 distance_to_exit = distance_to_closest_approach + distance_from_closest_approach_to_exit;
 return (distance_to_exit > 0. && distance_at_closest_approach2 < sphere_radius*sphere_radius);
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
vec3 get_rgb_intensity_of_light_emitted_by_black_body(
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
float get_fraction_of_rayleigh_scattered_light_scattered_by_angle(in float cos_scatter_angle)
{
 return
   3. * (1. + cos_scatter_angle*cos_scatter_angle)
 / //------------------------
    (16. * PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
float get_fraction_of_mie_scattered_light_scattered_by_angle(in float cos_scatter_angle)
{
 const float g = 0.76;
 return
      (1. - g*g)
 / //---------------------------------------------
  ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
float get_schlick_phase_factor(in float cos_scatter_angle)
{
 const float g = 0.76;
 const float k = 1.55*g - 0.55 * (g*g*g);
 return
     (1. - k*k)
 / //-------------------------------------------
  (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// "get_characteristic_reflectance" finds the fraction of light that's reflected
//   by a boundary between materials when striking head on.
//   The refractive indices can be provided as parameters in any order.
float get_characteristic_reflectance(in float refractivate_index1, in float refractivate_index2)
{
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
float get_fraction_of_light_reflected_on_surface(in float cos_incident_angle, in float characteristic_reflectance)
{
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
vec3 get_rgb_fraction_of_light_reflected_on_surface(in float cos_incident_angle, in vec3 characteristic_reflectance)
{
 vec3 R0 = characteristic_reflectance;
 float _1_u = 1.-cos_incident_angle;
 return R0 + (1.-R0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
// "get_fraction_of_reflected_light_masked_or_shaded" is Schlick's fast approximation for Smith's function
//   see Hoffmann 2015 for a gentle introduction to the concept
//   see Schlick (1994) for even more details.
float get_fraction_of_reflected_light_masked_or_shaded(in float cos_view_angle, in float root_mean_slope_squared)
{
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
float get_fraction_of_microfacets_with_angle(in float cos_angle_of_deviation, in float root_mean_slope_squared)
{
 float m = root_mean_slope_squared;
 float t = cos_angle_of_deviation;
    return exp((t*t-1.)/(m*m*t*t))/(m*m*t*t*t*t);
}
const float BIG = 1e20;
const float SMALL = 1e-20;
// "get_height_along_ray_over_world" gets the height at a point along the path
//   for a ray traveling over a world.
// NOTE: all input distances are relative to closest approach!
float get_height_along_ray_over_world(float x, float z2, float R){
    return sqrt(max(x*x + z2, 0.)) - R;
}
// "get_height_change_rate_along_ray_over_world" gets the rate at which height changes for a distance traveled along the path
//   for a ray traveling through the atmosphere.
// NOTE: all input distances are relative to closest approach!
float get_height_change_rate_along_ray_over_world(float x, float z2){
    return x / sqrt(max(x*x + z2, 0.));
}
// "get_air_density_ratio_at_height" gets the density ratio of an height within the atmosphere
// the "density ratio" is density expressed as a fraction of a surface value
float get_air_density_ratio_at_height(
    float h,
    float H
){
    return exp(-h/H);
}
// "approx_air_column_density_ratio_along_ray_from_samples" returns an approximation 
//   for the columnar density ratio encountered by a ray traveling through the atmosphere.
// It is the integral of get_air_density_ratio_at_height() along the path of the ray, 
//   taking into account the height at every point along the path.
// We can't solve the integral in the usual fashion due to singularities
//   (see https://www.wolframalpha.com/input/?i=integrate+exp(-sqrt(x%5E2%2Bz%5E2)%2FH)+dx)
//   so we use a linear approximation for the height.
// Our linear approximation gets its slope and intercept from sampling
//   at points along the path (xm and xb respectively)
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_from_samples(float x, float xm, float xb, float z2, float R, float H){
 float m = get_height_change_rate_along_ray_over_world(xm,z2);
 float b = get_height_along_ray_over_world(xb,z2,R);
 float h = m*(x-xb) + b;
    return -H/m * exp(-h/H);
}
// "approx_air_column_density_ratio_along_ray_for_segment" is a convenience wrapper for approx_air_column_density_ratio_along_ray_from_samples(), 
//   which calculates sensible values of xm and xb for the user 
//   given a specified range around which the approximation must be valid.
// The range is indicated by its lower bounds (xmin) and width (dx).
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_for_segment(float x, float xmin, float dx, float z2, float R, float H){
    const float fm = 0.5;
    const float fb = 0.2;
    float xm = xmin + fm*dx;
    float xb = xmin + fb*dx;
    float xmax = xmin + dx;
    return approx_air_column_density_ratio_along_ray_from_samples(clamp(x, xmin, xmax), xm, xb, z2,R,H);
}
// "approx_air_column_density_ratio_along_ray_for_absx" is a convenience wrapper for approx_air_column_density_ratio_along_ray_for_segment().
// It returns an approximation of columnar density ratio encountered from 
//   the surface of a world to a given upper bound, "x"
// Unlike approx_air_column_density_ratio_along_ray_from_samples() and approx_air_column_density_ratio_along_ray_for_segment(), 
//   it should be appropriate for any value of x, no matter if it's positive or negative.
// It does this by making two linear approximations for height:
//   one for the lower atmosphere, one for the upper atmosphere.
// These are represented by the two call outs to approx_air_column_density_ratio_along_ray_for_segment().
// "x" is the distance along the ray from closest approach to the upper bound (always positive),
//   or from the closest approach to the upper bound, if there is no intersection.
// "x_atmo" is the distance along the ray from closest approach to the top of the atmosphere (always positive)
// "x_world" is the distance along the ray from closest approach to the surface of the world (always positive)
// "sigma0" is the columnar density ratio generated by this equation when x is on the surface of the world;
//   it is used to express values for columnar density ratio relative to the surface of the world.
// "z2" is the closest distance from the ray to the center of the world, squared.
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_for_absx(float x, float x_world, float x_atmo, float sigma0, float z2, float R, float H){
    // sanitize x_world so it's always positive
    x_world = abs(x_world);
    // sanitize x_atmo so it's always positive
    x_atmo = abs(x_atmo);
    // sanitize x so it's always positive and greater than x_world
    x = max(abs(x)-x_world, 0.) + x_world;
    // "dx" is the width of the bounds covered by our linear approximations
    float dx = (x_atmo-x_world)/3.;
    return
        approx_air_column_density_ratio_along_ray_for_segment(x, x_world, dx, z2,R,H)
      + approx_air_column_density_ratio_along_ray_for_segment(x, x_world+dx, dx, z2,R,H)
      - sigma0;
}
// "approx_reference_air_column_density_ratio_along_ray" is a convenience wrapper for approx_air_column_density_ratio_along_ray_for_absx().
// It returns a reference value that can be passed to approx_air_column_density_ratio_along_ray_2d().
// NOTE: all input distances are relative to closest approach!
float approx_reference_air_column_density_ratio_along_ray(float x_world, float x_atmo, float z2, float R, float H){
    return approx_air_column_density_ratio_along_ray_for_absx(x_world, x_world, x_atmo, 0., z2, R, H);
}
// "approx_air_column_density_ratio_along_ray_2d" is a convenience wrapper for approx_air_column_density_ratio_along_ray_for_absx().
// It returns a approximation of columnar density ratio that should be appropriate for any value of x.
// NOTE: all input distances are relative to closest approach!
float approx_air_column_density_ratio_along_ray_2d (float x_start, float x_stop, float x_world, float x_atmo, float sigma0, float z2, float R, float H){
    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return
        sign(x_stop) * min(approx_air_column_density_ratio_along_ray_for_absx(x_stop, x_world, x_atmo, sigma0, z2, R, H), BIG) -
     sign(x_start) * min(approx_air_column_density_ratio_along_ray_for_absx(x_start, x_world, x_atmo, sigma0, z2, R, H), BIG);
}
// "try_approx_air_column_density_ratio_along_ray" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_ray_2d() and approx_reference_air_column_density_ratio_along_ray.
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
float approx_air_column_density_ratio_along_line_segment (
 vec3 segment_origin,
    vec3 segment_direction,
    float segment_length,
 vec3 world_position,
 float world_radius,
 float atmosphere_scale_height
){
    vec3 O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    float z2; // distance ("radius") from the ray to the center of the world at closest approach, squared
    float x_z; // distance from the origin at which closest approach occurs
    float x_in_atmo; // distance from the origin at which the ray enters the atmosphere
    float x_out_atmo; // distance from the origin at which the ray exits the atmosphere
    float x_in_world; // distance from the origin at which the ray strikes the surface of the world
    float x_out_world; // distance from the origin at which the ray exits the world, assuming it could pass through
    get_relation_between_ray_and_point(
  world_position,
     segment_origin, segment_direction,
  z2, x_z
 );
    try_get_relation_between_ray_and_sphere(
        world_radius,
        z2, x_z,
        x_in_world, x_out_world
    );
    bool is_obstructed =
        0. < x_out_world && x_out_world < segment_length &&
        z2 < world_radius*world_radius;
    if (is_obstructed)
    {
     return BIG;
    }
    // NOTE: "12." is the number of scale heights needed to reach the official edge of space on Earth.
    // It should be sufficiently high to work for any world
    try_get_relation_between_ray_and_sphere(
        R + 12. * H,
        z2, x_z,
        x_in_atmo, x_out_atmo
    );
    // NOTE: "sigma0" the column density ratio returned by approx_air_column_density_ratio_along_ray_for_absx() for the surface
    float sigma0 = approx_reference_air_column_density_ratio_along_ray(
     x_out_world-x_z, x_out_atmo-x_z,
     z2, R, H
 );
    return approx_air_column_density_ratio_along_ray_2d(
     0.-x_z, segment_length-x_z,
     x_out_world-x_z, x_out_atmo-x_z, sigma0,
     z2, R, H
 );
}
// TODO: multiple light sources
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_intensity_of_light_scattered_from_atmosphere(
    vec3 view_origin, vec3 view_direction,
    vec3 world_position, float world_radius,
    vec3 light_direction, vec3 light_rgb_intensity,
    vec3 background_rgb_intensity,
    float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    vec3 P = view_origin;
    vec3 V = view_direction;
    vec3 L = light_direction;
    vec3 I_sun = light_rgb_intensity;
    vec3 I_back = background_rgb_intensity;
    vec3 O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    float unused1, unused2, unused3, unused4; // used for passing unused output parameters to functions
    const float STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    bool V_is_scattered; // whether view ray will enter the atmosphere
    bool V_is_obstructed; // whether view ray will enter the surface of a world
    float z_V2; // distance ("radius") from the view ray to the center of the world at closest approach, squared
    float x_Vz; // distance along the view ray at which closest approach occurs
    float x_V_in_atmo; // distance along the view ray at which the ray enters the atmosphere
    float x_V_out_atmo; // distance along the view ray at which the ray exits the atmosphere
    float x_V_in_world; // distance along the view ray at which the ray enters the surface of the world
    float x_V_out_world; // distance along the view ray at which the ray enters the surface of the world
    float x_V_start; // distance along the view ray at which scattering starts, either because it's the start of the ray or the start of the atmosphere 
    float x_V_stop; // distance along the view ray at which scattering no longer occurs, either due to hitting the world or leaving the atmosphere
    float dx_V; // distance between steps while marching along the view ray
    float x_V; // distance traversed while marching along the view ray
    float sigma_V; // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface
    vec3 P_i; // absolute position while marching along the view ray
    float h_i; // distance ("height") from the surface of the world while marching along the view ray
    float sigma_L; // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface
    // cosine of angle between view and light directions
    float VL = dot(V, L);
    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    vec3 E = vec3(0);
    // Rayleigh and Mie phase factors,
    // A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // This factor indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    // The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
    // and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);
    vec3 beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    get_relation_between_ray_and_point(
        O, P, V,
        z_V2, x_Vz
    );
    //   We only set it to 3 scale heights because we are using this parameter for raymarching, and not a closed form solution
    V_is_scattered = try_get_relation_between_ray_and_sphere(
        R + 4.*H, z_V2, x_Vz,
        x_V_in_atmo, x_V_out_atmo
    );
    V_is_obstructed = try_get_relation_between_ray_and_sphere(
        R, z_V2, x_Vz,
        x_V_in_world, x_V_out_world
    );
    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!V_is_scattered)
    {
        return I_back;
    }
    x_V_start = max(x_V_in_atmo, 0.);
    x_V_stop = V_is_obstructed? x_V_in_world : x_V_out_atmo;
    dx_V = (x_V_stop - x_V_start) / STEP_COUNT;
    x_V = x_V_start + 0.5 * dx_V;
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        P_i = P + V * x_V;
        h_i = get_height_along_ray_over_world(x_V-x_Vz, z_V2, R);
        sigma_V = approx_air_column_density_ratio_along_line_segment (P_i, -V, x_V, O, R, H);
        sigma_L = approx_air_column_density_ratio_along_line_segment (P_i, L, 3.*R, O, R, H);
        E += I_sun
            // incoming fraction: the fraction of light that scatters towards camera
            * exp(-h_i/H) * beta_gamma * dx_V
            // outgoing fraction: the fraction of light that scatters away from camera
            * exp(-beta_sum * (sigma_V + sigma_L));
        x_V += dx_V;
    }
    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    E += I_back * exp(-beta_sum * sigma_V);
    return E;
}
vec3 get_rgb_fraction_of_refracted_light_transmitted_through_atmosphere(
    vec3 segment_origin, vec3 segment_direction, float segment_length,
    vec3 world_position, float world_radius, float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    vec3 O = world_position;
    float R = world_radius;
    float H = atmosphere_scale_height;
    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma = approx_air_column_density_ratio_along_line_segment (segment_origin, segment_direction, segment_length, O, R, H);
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_from_fluid(
    float cos_view_angle,
    float cos_light_angle,
    float cos_scatter_angle,
    float ocean_depth,
    vec3 refracted_light_rgb_intensity,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
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
    // "sigma_V"  is the column density, relative to the surface, that's along the view ray.
    // "sigma_L" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within water
    float sigma_V = ocean_depth / NV;
    float sigma_L = ocean_depth / NL;
    float sigma_ratio = 1. + NV/NL;
    return I
        // incoming fraction: the fraction of light that scatters towards camera
        * beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_V * sigma_ratio * beta_sum) - 1.)
        / (-sigma_ratio * beta_sum);
}
vec3 get_rgb_fraction_of_refracted_light_transmitted_through_fluid(
    float cos_incident_angle, float ocean_depth,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
){
    float sigma = ocean_depth / cos_incident_angle;
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (in float x, in float edge0, in float edge1, in float height)
{
    float center = (edge1 + edge0) / 2.;
    float width = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
 return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (in float w)
{
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
vec3 get_rgb_intensity_of_rgb_signal(in vec3 signal)
{
 return vec3(
  pow(signal.x, GAMMA),
  pow(signal.y, GAMMA),
  pow(signal.z, GAMMA)
 );
}
vec3 get_rgb_signal_of_rgb_intensity(in vec3 intensity)
{
 return vec3(
  pow(intensity.x, 1./GAMMA),
  pow(intensity.y, 1./GAMMA),
  pow(intensity.z, 1./GAMMA)
 );
}
varying vec2 vUv;
uniform sampler2D surface_light;
// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;
// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3 world_position;
// radius of the world being rendered, in meters
uniform float world_radius;
// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3 light_rgb_intensity;
uniform vec3 light_direction;
uniform float insolation_max;
// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3 atmosphere_surface_rayleigh_scattering_coefficients;
uniform vec3 atmosphere_surface_mie_scattering_coefficients;
uniform vec3 atmosphere_surface_absorption_coefficients;
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
    vec4 background_rgb_signal = texture2D( surface_light, vUv );
    vec3 background_rgb_intensity = insolation_max * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
    // "beta_air_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3 beta_ray = atmosphere_surface_rayleigh_scattering_coefficients;
    vec3 beta_mie = atmosphere_surface_mie_scattering_coefficients;
    vec3 beta_abs = atmosphere_surface_absorption_coefficients;
    vec3 rgb_intensity =
        get_rgb_intensity_of_light_scattered_from_atmosphere(
            view_origin, view_direction,
            world_position, world_radius,
            light_direction, light_rgb_intensity,
            background_rgb_intensity,
            atmosphere_scale_height, beta_ray, beta_mie, beta_abs
        );
    // TODO: move this to a separate shader pass!
    // see https://learnopengl.com/Advanced-Lighting/HDR for an intro to tone mapping
    float exposure_intensity = 150.; // Watts/m^2
    vec3 ldr_tone_map = 1.0 - exp(-rgb_intensity/exposure_intensity);
    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(ldr_tone_map), 1);
    // gl_FragColor = 3.*background_rgb_signal;
}
`;
fragmentShaders.passthrough = `
uniform sampler2D input_texture;
varying vec2 vUv;
void main() {
 gl_FragColor = texture2D( input_texture, vUv );
}
`;
