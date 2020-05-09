var vertexShaders = {};
vertexShaders.equirectangular = `
const float PI = 3.14159265358979323846264338327950288419716939937510;
const float PHI = 1.6180339887;
const float BIG = 1e20;
const float SMALL = 1e-20;
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
const float PI = 3.14159265358979323846264338327950288419716939937510;
const float PHI = 1.6180339887;
const float BIG = 1e20;
const float SMALL = 1e-20;
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
const float PI = 3.14159265358979323846264338327950288419716939937510;
const float PHI = 1.6180339887;
const float BIG = 1e20;
const float SMALL = 1e-20;
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
const float PI = 3.14159265358979323846264338327950288419716939937510;
const float PHI = 1.6180339887;
const float BIG = 1e20;
const float SMALL = 1e-20;
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
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.0;
const float KELVIN = 1.0;
const float DALTON = 1.66053907e-27; // kilograms
const float MICROGRAM = 1e-9; // kilograms
const float MILLIGRAM = 1e-6; // kilograms
const float GRAM = 1e-3; // kilograms
const float KILOGRAM = 1.0; // kilograms
const float TON = 1000.; // kilograms
const float PICOMETER = 1e-12; // meters
const float NANOMETER = 1e-9; // meters
const float MICROMETER = 1e-6; // meters
const float MILLIMETER = 1e-3; // meters
const float METER = 1.0; // meters
const float KILOMETER = 1000.; // meters
const float MOLE = 6.02214076e23;
const float MILLIMOLE = MOLE / 1e3;
const float MICROMOLE = MOLE / 1e6;
const float NANOMOLE = MOLE / 1e9;
const float PICOMOLE = MOLE / 1e12;
const float FEMTOMOLE = MOLE / 1e15;
const float SECOND = 1.0; // seconds
const float MINUTE = 60.0; // seconds
const float HOUR = MINUTE*60.0; // seconds
const float DAY = HOUR*24.0; // seconds
const float WEEK = DAY*7.0; // seconds
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
const float LIGHT_YEAR = 9.4607304725808e15; // meters
const float PARSEC = 3.08567758149136727891393;//meters
const float GALACTIC_MASS = 2e12*SOLAR_MASS; // kilograms
const float GALACTIC_YEAR = 250.0*MEGAYEAR; // seconds
const float GALACTIC_RADIUS = 120e3*LIGHT_YEAR;// meters
struct maybe_int
{
    int value;
    bool exists;
};
struct maybe_float
{
    float value;
    bool exists;
};
struct maybe_vec2
{
    vec2 value;
    bool exists;
};
struct maybe_vec3
{
    vec3 value;
    bool exists;
};
struct maybe_vec4
{
    vec4 value;
    bool exists;
};
const float PI = 3.14159265358979323846264338327950288419716939937510;
const float PHI = 1.6180339887;
const float BIG = 1e20;
const float SMALL = 1e-20;
/*
"oplus" is the o-plus operator,
  or the reciprocal of the sum of reciprocals.
It's a handy function that comes up a lot in some physics problems.
It's pretty useful for preventing division by zero.
*/
float oplus(in float a, in float b){
    return 1. / (1./a + 1./b);
}
/*
"bump" is the Alan Zucconi bump function.
It's a fast and easy way to approximate any kind of wavelet or gaussian function
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
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
// 2D FUNCTIONS CHECKING IF POINT IS IN REGION
/*
A0 point position
B0 sphere origin
r  radius
*/
bool is_2d_point_in_circle(in vec2 A0, in vec2 B0, in float r)
{
    return length(A0-B0) < r;
}
/*
A0 point position
B0 ellipsis center
R  ellipsis radius along each coordinate axis
*/
bool is_2d_point_in_ellipsis(in vec2 A0, in vec2 B0, in vec2 R)
{
    return length((A0-B0)/R) < 1.0;
}
/*
A0 point position
B0 rectangle center
R  rectangle length along each coordinate axis
*/
bool is_2d_point_in_axis_aligned_rectangle(in vec2 A0, in vec2 B0, in vec2 R)
{
    return all(lessThan(abs((A0-B0)/R), vec2(1)));
}
/*
A0 point position
B0 line reference
N  surface normal of region, normalized

NOTE: in this case, N only needs to indicate the direction facing outside, 
 it need not be perfectly normal to B
*/
bool is_2d_point_in_region_bounded_by_line(in vec2 A0, in vec2 B0, in vec2 N)
{
    return dot(A0-B0, N) < 0.;
}
/*
A0 point position
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
*/
bool is_2d_point_in_triangle(in vec2 A0, in vec2 B1, in vec2 B2, in vec2 B3)
{
    // INTUITION: if A falls within a triangle,
    //  the angle between A and any side will always be less than the angle
    //  between that side and the side adjacent to it
    vec2 B2B1hat = normalize(B2-B1);
    vec2 B3B2hat = normalize(B3-B2);
    vec2 B1B3hat = normalize(B1-B3);
    return dot(normalize(A0-B1), B2B1hat) > dot(-B1B3hat, B2B1hat)
        && dot(normalize(A0-B2), B3B2hat) > dot(-B2B1hat, B3B2hat)
        && dot(normalize(A0-B3), B1B3hat) > dot(-B3B2hat, B1B3hat);
}
// 3D FUNCTIONS CHECKING IF POINT IS IN REGION
/*
A0 point position
B0 sphere origin
r  radius
*/
bool is_3d_point_in_sphere(in vec3 A0, in vec3 B0, in float r)
{
    return length(A0-B0) < r;
}
/*
A0 point position
B0 ellipsoid center
R  radius
*/
bool is_3d_point_in_ellipsoid(in vec3 A0, in vec3 B0, in vec3 R)
{
    return length((A0-B0)/R) < 1.0;
}
/*
A0 point position
B0 rectangle center
R  rectangle length along each coordinate axis
*/
bool is_3d_point_in_axis_aligned_rectangle(in vec3 A0, in vec3 B0, in vec3 R)
{
    return all(lessThan(abs((A0-B0)/R), vec3(1)));
}
/*
A0 point position
B0 plane reference
N  vertex normal
*/
bool is_3d_point_in_region_bounded_by_plane(in vec3 A0, in vec3 B0, in vec3 N)
{
    return dot(A0-B0, N) < 0.;
}
/*
A0 point position
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
B4 vertex position 4
*/
bool is_3d_point_in_tetrahedron(in vec3 A0, in vec3 B1, in vec3 B2, in vec3 B3, in vec3 B4)
{
    // INTUITION: for each triangle, make sure A0 lies on the same side as the remaining vertex
    vec3 B2xB3 = cross(B2-B1, B3-B1);
    vec3 B3xB1 = cross(B3-B2, B1-B2);
    vec3 B1xB2 = cross(B1-B3, B2-B3);
   return sign(dot(A0-B1, B2xB3)) == sign(dot(B4-B1, B2xB3))
        && sign(dot(A0-B2, B3xB1)) == sign(dot(A0-B2, B3xB1))
        && sign(dot(A0-B3, B1xB2)) == sign(dot(A0-B3, B1xB2))
        ;
}
/*
A0 point position
B0 sphere origin
r  radius
*/
float get_distance_of_2d_point_to_circle(in vec2 A0, in vec2 B0, in float r)
{
    return length(A0-B0) - r;
}
/*
A0 point position
B0 box center
B  box dimentsions
*/
float get_distance_of_2d_point_to_rectangle(in vec2 A0, in vec2 B0, in vec2 B)
{
  vec2 q = abs(B0) - B;
  return length(max(q,0.0)) + min(max(q.x,q.y),0.0);
}
/*
A0 point position
B0 ellipsis center
R  ellipsis radius along each coordinate axis
*/
float guess_distance_of_2d_point_to_ellipsis(in vec2 A0, in vec2 B0, in vec2 R)
{
    float u = length((A0-B0)/R);
    float v = length((A0-B0)/(R*R));
    return u*(u-1.0)/v;
}
/*
A0 point position
B0 line reference
N  surface normal of region, normalized

NOTE: in this case, N only needs to indicate the direction facing outside, 
 it need not be perfectly normal to B
*/
float get_distance_of_2d_point_to_region_bounded_by_line(in vec2 A0, in vec2 B0, in vec2 N)
{
    return dot(A0-B0, N);
}
// 3D FUNCTIONS CHECKING IF POINT IS IN REGION
/*
A0 point position
B0 sphere origin
r  radius
*/
float get_distance_of_3d_point_to_sphere(in vec3 A0, in vec3 B0, in float r)
{
    return length(A0-B0) - r;
}
vec3 get_surface_normal_of_sphere(in vec3 A0, in vec3 B0)
{
    return normalize(A0-B0);
}
/*
A0 point position
B0 ellipsoid center
R  ellipsoid radius along each coordinate axis
*/
float guess_distance_of_3d_point_to_ellipsoid(in vec3 A0, in vec3 B0, in vec3 R)
{
    vec3 V = A0-B0;
    float u = length(V/R);
    float v = length(V/(R*R));
    return u*(u-1.0)/v;
}
/*
A0 point position
B0 plane reference
N  vertex normal
*/
float get_distance_of_3d_point_to_region_bounded_by_plane(in vec3 A0, in vec3 B0, in vec3 N)
{
    return dot(A0-B0, N);
}
/*
A0 point position
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
B4 vertex position 4
*/
/*
float get_distance_of_3d_point_to_tetrahedron(in vec3 A0, in vec3 B1, in vec3 B2, in vec3 B3, in vec3 B4)
{
    // INTUITION: for each triangle, make sure A0 lies on the same side as the remaining vertex
    vec3 B2xB3 = cross(B2-B1, B3-B1);
    vec3 B3xB1 = cross(B3-B2, B1-B2);
    vec3 B1xB2 = cross(B1-B3, B2-B3);
    return sign(dot(A0-B1, B2xB3)) == sign(dot(B4-B1, B2xB3)) 
        && sign(dot(A0-B2, B3xB1)) == sign(dot(A0-B2, B3xB1)) 
        && sign(dot(A0-B3, B1xB2)) == sign(dot(A0-B3, B1xB2)) 
        ;
}
*/
//#include "precompiled/academics/math/geometry/point_intersection.glsl"
maybe_vec2 get_bounding_distances_along_ray(in maybe_vec2 distances_along_line){
    return maybe_vec2(
        vec2(
          max(min(distances_along_line.value.x, distances_along_line.value.y), 0.0),
          max(distances_along_line.value.x, distances_along_line.value.y)
        ),
        distances_along_line.exists && max(distances_along_line.value.x, distances_along_line.value.y) > 0.
      );
}
maybe_float get_nearest_distance_along_ray(in maybe_vec2 distances_along_line){
    return maybe_float(
        distances_along_line.value.x < 0.0? distances_along_line.value.y :
        distances_along_line.value.y < 0.0? distances_along_line.value.x :
        min(distances_along_line.value.x, distances_along_line.value.y),
        distances_along_line.exists && max(distances_along_line.value.x, distances_along_line.value.y) > 0.
      );
}
maybe_float get_distance_along_line_to_union(
    in maybe_float shape1,
    in maybe_float shape2
) {
    return maybe_float(
        !shape1.exists ? shape2.value : !shape2.exists ? shape1.value : min(shape1.value, shape2.value),
        shape1.exists || shape2.exists
    );
}
maybe_vec2 get_distances_along_line_to_union(
    in maybe_vec2 shape1,
    in maybe_vec2 shape2
) {
    return maybe_vec2(
        vec2(!shape1.exists ? shape2.value.x : !shape2.exists ? shape1.value.x : min(shape1.value.x, shape2.value.x),
             !shape1.exists ? shape2.value.y : !shape2.exists ? shape1.value.y : max(shape1.value.y, shape2.value.y )),
        shape1.exists || shape2.exists
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
    return maybe_vec2( vec2(entrance, exit), exists );
}
maybe_vec2 get_distances_along_line_to_intersection(
    in maybe_vec2 shape1,
    in maybe_vec2 shape2
) {
    float x = shape1.exists && shape2.exists ? max(shape1.value.x, shape2.value.x) : 0.0;
    float y = shape1.exists && shape2.exists ? min(shape1.value.y, shape2.value.y ) : 0.0;
    return maybe_vec2(vec2(x,y), shape1.exists && shape2.exists && x < y);
}
float get_distance_along_2d_line_nearest_to_point(
    in vec2 A0,
    in vec2 A,
    in vec2 B0
){
    return dot(B0 - A0, A);
}
/*
A0 line reference
A  line direction, normalized
B0 line reference
B  line direction, normalized
*/
maybe_float get_distance_along_2d_line_to_line(
    in vec2 A0,
    in vec2 A,
    in vec2 B0,
    in vec2 B
){
    vec2 D = B0 - A0;
    // offset
    vec2 R = D - dot(D, A) * A;
    // rejection
    return maybe_float(
        length(R) / dot(B, normalize(-R)),
        abs(abs(dot(A, B)) - 1.0) > 0.0
    );
}
/*
A0 line reference
A  line direction, normalized
B0 ray origin
B  ray direction, normalized
*/
maybe_float get_distance_along_2d_line_to_ray(
    in vec2 A0,
    in vec2 A,
    in vec2 B0,
    in vec2 B
){
    // INTUITION: same as the line-line intersection, but now results are only valid if distance > 0
    vec2 D = B0 - A0;
    // offset
    vec2 R = D - dot(D, A) * A;
    // rejection
    float xB = length(R) / dot(B, normalize(-R));
    // distance along B
    float xA = xB / dot(B, A);
    // distance along A
    return maybe_float(xB, abs(abs(dot(A, B)) - 1.0) > 0.0 && xA > 0.0);
}
/*
A0 line reference
A  line direction, normalized
B0 line segment endpoint 1
B1 line segment endpoint 2
*/
maybe_float get_distance_along_2d_line_to_line_segment(
    in vec2 A0,
    in vec2 A,
    in vec2 B1,
    in vec2 B2
){
    // INTUITION: same as the line-line intersection, but now results are only valid if 0 < distance < |B2-B1|
    vec2 B = normalize(B2 - B1);
    vec2 D = B1 - A0;
    // offset
    vec2 R = D - dot(D, A) * A;
    // rejection
    float xB = length(R) / dot(B, normalize(-R));
    // distance along B
    float xA = xB / dot(B, A);
    // distance along A
    return maybe_float(xB, abs(abs(dot(A, B)) - 1.0) > 0.0 && 0. < xA && xA < length(B2 - B1));
}
maybe_vec2 get_distances_along_2d_line_to_circle(
    in vec2 A0,
    in vec2 A,
    in vec2 B0,
    in float r
){
    vec2 D = B0 - A0;
    float xz = dot(D, A);
    float z2 = dot(D, D) - xz * xz;
    float y2 = r * r - z2;
    float dxr = sqrt(max(y2, 1e-10));
    return maybe_vec2(vec2(xz - dxr, xz + dxr), y2 > 0.);
}
/*
A0 line reference
A  line direction, normalized
B1 vertex position 1
B2 vertex position 2
*/
maybe_vec2 get_distances_along_2d_line_to_triangle(
    in vec2 A0,
    in vec2 A,
    in vec2 B1,
    in vec2 B2,
    in vec2 B3
){
    maybe_float line1 = get_distance_along_2d_line_to_line_segment(A0, A, B1, B2);
    maybe_float line2 = get_distance_along_2d_line_to_line_segment(A0, A, B2, B3);
    maybe_float line3 = get_distance_along_2d_line_to_line_segment(A0, A, B3, B1);
    return maybe_vec2(
        vec2(min(line1.value, min(line2.value, line3.value)),
             max(line1.value, max(line2.value, line3.value))),
        line1.exists || line2.exists || line3.exists
    );
}
float get_distance_along_3d_line_nearest_to_point(
    in vec3 A0,
    in vec3 A,
    in vec3 B0
){
    return dot(B0 - A0, A);
}
/*
A0 line reference
A  line direction, normalized
B0 line reference
B  line direction, normalized
*/
maybe_float get_distance_along_3d_line_nearest_to_line(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 B
){
    vec3 D = B0 - A0;
    // offset
    vec3 C = normalize(cross(B, A));
    // cross
    vec3 R = D - dot(D, A) * A - dot(D, C) * C;
    // rejection
    return maybe_float(
        length(R) / -dot(B, normalize(R)),
        abs(abs(dot(A, B)) - 1.0) > 0.0
    );
}
/*
A0 line reference
A  line direction, normalized
B0 ray origin
B  ray direction, normalized
*/
maybe_float get_distance_along_3d_line_nearest_to_ray(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 B
){
    vec3 D = B0 - A0;
    // offset
    vec3 R = D - dot(D, A) * A;
    // rejection
    float xB = length(R) / dot(B, normalize(-R));
    // distance along B
    float xA = xB / dot(B, A);
    // distance along A
    return maybe_float(xB, abs(abs(dot(A, B)) - 1.0) > 0.0 && xA > 0.0);
}
/*
A0 line reference
A  line direction, normalized
B1 line segment endpoint 1
B2 line segment endpoint 2
*/
maybe_float get_distance_along_3d_line_nearest_to_line_segment(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 B1
){
    vec3 B = normalize(B1 - B0);
    vec3 D = B0 - A0;
    // offset
    vec3 R = D - dot(D, A) * A;
    // rejection
    float xB = length(R) / dot(B, normalize(-R));
    // distance along B
    float xA = xB / dot(B, A);
    // distance along A
    return maybe_float(xB, abs(abs(dot(A, B)) - 1.0) > 0.0 && 0. < xA && xA < length(B1 - B0));
}
/*
A0 line reference
A  line direction, normalized
B0 plane reference
N  plane surface normal, normalized
*/
maybe_float get_distance_along_3d_line_to_plane(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 N
){
    return maybe_float( -dot(A0 - B0, N) / dot(A, N), abs(dot(A, N)) < SMALL);
}
/*
A0 line reference
A  line direction, normalized
B0 circle origin
N  circle surface normal, normalized
r  circle radius
*/
maybe_float get_distance_along_3d_line_to_circle(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 N,
    in float r
){
    // intersection(plane, sphere)
    maybe_float t = get_distance_along_3d_line_to_plane(A0, A, B0, N);
    return maybe_float(t.value, is_3d_point_in_sphere(A0 + A * t.value, B0, r));
}
/*
A0 line reference
A  line direction, normalized
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
*/
maybe_float get_distance_along_3d_line_to_triangle(
    in vec3 A0,
    in vec3 A,
    in vec3 B1,
    in vec3 B2,
    in vec3 B3
){
    // intersection(face plane, edge plane, edge plane, edge plane)
    vec3 B0 = (B1 + B2 + B3) / 3.;
    vec3 N = normalize(cross(B1 - B2, B2 - B3));
    maybe_float t = get_distance_along_3d_line_to_plane(A0, A, B0, N);
    vec3 At = A0 + A * t.value;
    vec3 B2B1hat = normalize(B2 - B1);
    vec3 B3B2hat = normalize(B3 - B2);
    vec3 B1B3hat = normalize(B1 - B3);
    return maybe_float(t.value,
        dot(normalize(At - B1), B2B1hat) > dot(-B1B3hat, B2B1hat) &&
        dot(normalize(At - B2), B3B2hat) > dot(-B2B1hat, B3B2hat) &&
        dot(normalize(At - B3), B1B3hat) > dot(-B3B2hat, B1B3hat)
    );
}
/*
A0 line reference
A  line direction, normalized
B0 sphere origin
R  sphere radius along each coordinate axis
*/
maybe_vec2 get_distances_along_3d_line_to_sphere(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in float r
){
    float xz = dot(B0 - A0, A);
    float z = length(A0 + A * xz - B0);
    float y2 = r * r - z * z;
    float dxr = sqrt(max(y2, 1e-10));
    return maybe_vec2(
        vec2(xz - dxr, xz + dxr),
        y2 > 0.
    );
}
/*
A0 line reference
A  line direction, normalized
B0 ellipsoid center
R  ellipsoid radius along each coordinate axis
*/
maybe_float get_distance_along_3d_line_to_ellipsoid(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 R
){
    // NOTE: shamelessly copy pasted, all credit goes to Inigo: 
    // https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
    vec3 Or = (A0 - B0) / R;
    vec3 Ar = A / R;
    float ArAr = dot(Ar, Ar);
    float OrAr = dot(Or, Ar);
    float OrOr = dot(Or, Or);
    float h = OrAr * OrAr - ArAr * (OrOr - 1.0);
    return maybe_float(
        (-OrAr - sqrt(h)) / ArAr,
        h >= 0.0
    );
}
/*
A0 line reference
A  line direction, normalized
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
B4 vertex position 4
*/
maybe_float get_distance_along_3d_line_to_tetrahedron(
    in vec3 A0,
    in vec3 A,
    in vec3 B1,
    in vec3 B2,
    in vec3 B3,
    in vec3 B4
){
    maybe_float hit1 = get_distance_along_3d_line_to_triangle(A0, A, B1, B2, B3);
    maybe_float hit2 = get_distance_along_3d_line_to_triangle(A0, A, B2, B3, B4);
    maybe_float hit3 = get_distance_along_3d_line_to_triangle(A0, A, B3, B4, B1);
    maybe_float hit4 = get_distance_along_3d_line_to_triangle(A0, A, B4, B1, B2);
    maybe_float hit;
    hit = get_distance_along_line_to_union(hit1, hit2);
    hit = get_distance_along_line_to_union(hit, hit3);
    hit = get_distance_along_line_to_union(hit, hit4);
    return hit;
}
/*
A0 line reference
A  line direction, normalized
B0 cylinder reference
B  cylinder direction, normalized
r  cylinder radius
*/
maybe_vec2 get_distances_along_3d_line_to_infinite_cylinder(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 B,
    in float r
){
    // INTUITION: simplify the problem by using a coordinate system based around the line and the tube center
    // see closest-approach-between-line-and-cylinder-visualized.scad
    // implementation shamelessly copied from Inigo: 
    // https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
    vec3 D = A0 - B0;
    float BA = dot(B, A);
    float BD = dot(B, D);
    float a = 1.0 - BA * BA;
    float b = dot(D, A) - BD * BA;
    float c = dot(D, D) - BD * BD - r * r;
    float h = sqrt(max(b * b - a * c, 0.0));
    return maybe_vec2(
        vec2((-b + h) / a, (-b - h) / a),
        h > 0.0
    );
}
/*
A0 line reference
A  line direction, normalized
B1 cylinder endpoint 1
B2 cylinder endpoing 2
r  cylinder radius
*/
maybe_vec2 get_distances_along_3d_line_to_cylinder(
    in vec3 A0,
    in vec3 A,
    in vec3 B1,
    in vec3 B2,
    in float r
){
    vec3 B = normalize(B2 - B1);
    maybe_float a1 = get_distance_along_3d_line_to_plane(A0, A, B1, B);
    maybe_float a2 = get_distance_along_3d_line_to_plane(A0, A, B2, B);
    float a_in = min(a1.value, a2.value);
    float a_out = max(a1.value, a2.value);
    maybe_vec2 ends = maybe_vec2(vec2(a_in, a_out), a1.exists || a2.exists);
    maybe_vec2 tube = get_distances_along_3d_line_to_infinite_cylinder(A0, A, B1, B, r);
    maybe_vec2 cylinder = get_distances_along_line_to_intersection(tube, ends);
    // TODO: do we need this line?
    float entrance = max(tube.value.y, a_in);
    float exit = min(tube.value.x, a_out);
    return maybe_vec2(
        vec2(entrance, exit),
        tube.exists && entrance < exit
    );
}
/*
A0 line reference
A  line direction, normalized
B1 capsule endpoint 1
B2 capsule endpoing 2
r  capsule radius
*/
maybe_vec2 get_distances_along_3d_line_to_capsule(
    in vec3 A0,
    in vec3 A,
    in vec3 B1,
    in vec3 B2,
    in float r
){
    maybe_vec2 cylinder = get_distances_along_3d_line_to_cylinder(A0, A, B1, B2, r);
    maybe_vec2 sphere1 = get_distances_along_3d_line_to_sphere(A0, A, B1, r);
    maybe_vec2 sphere2 = get_distances_along_3d_line_to_sphere(A0, A, B2, r);
    maybe_vec2 spheres = get_distances_along_line_to_union(sphere1, sphere2);
    maybe_vec2 capsule = get_distances_along_line_to_union(spheres, cylinder);
    return capsule;
}
/*
A0 line reference
A  line direction, normalized
B1 ring endpoint 1
B2 ring endpoing 2
ro ring outer radius
ri ring inner radius
*/
maybe_vec2 get_distances_along_3d_line_to_ring(
    in vec3 A0,
    in vec3 A,
    in vec3 B1,
    in vec3 B2,
    in float ro,
    in float ri
){
    maybe_vec2 outer = get_distances_along_3d_line_to_cylinder(A0, A, B1, B2, ro);
    maybe_vec2 inner = get_distances_along_3d_line_to_cylinder(A0, A, B1, B2, ri);
    maybe_vec2 ring = get_distances_along_line_to_negation(outer, inner);
    return ring;
}
/*
A0 line reference
A  line direction, normalized
B0 cone vertex
B  cone direction, normalized
cosb cosine of cone half angle
*/
maybe_float get_distance_along_3d_line_to_infinite_cone(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 B,
    in float cosb
){
    vec3 D = A0 - B0;
    float a = dot(A, B) * dot(A, B) - cosb * cosb;
    float b = 2. * (dot(A, B) * dot(D, B) - dot(A, D) * cosb * cosb);
    float c = dot(D, B) * dot(D, B) - dot(D, D) * cosb * cosb;
    float det = b * b - 4. * a * c;
    if (det < 0.)
    {
        return maybe_float(0.0, false);
    }
    det = sqrt(det);
    float t1 = (-b - det) / (2. * a);
    float t2 = (-b + det) / (2. * a);
    // This is a bit messy; there ought to be a more elegant solution.
    float t = t1;
    if (t < 0. || t2 > 0. && t2 < t)
    {
        t = t2;
    }
    else {
        t = t1;
    }
    vec3 cp = A0 + t * A - B0;
    float h = dot(cp, B);
    return maybe_float(t, t > 0. && h > 0.);
}
/*
A0 line reference
A  line direction, normalized
B0 cone vertex
B  cone direction, normalized
r  cone radius
h  cone height
*/
maybe_float get_distance_along_3d_line_to_cone(
    in vec3 A0,
    in vec3 A,
    in vec3 B0,
    in vec3 B,
    in float r,
    in float h
){
    maybe_float end = get_distance_along_3d_line_to_circle(A0, A, B0 + B * h, B, r);
    maybe_float cone = get_distance_along_3d_line_to_infinite_cone(A0, A, B0, B, cos(atan(r / h)));
    cone.exists = cone.exists && dot(A0 +cone.value * A - B0, B) <= h;
    cone = get_distance_along_line_to_union(end, cone);
    return cone;
}
/*
A0 line reference
A  line direction, normalized
B1 cone endpoint 1
B2 cone endpoint 2
r1 cone endpoint 1 radius
r2 cone endpoint 2 radius
*/
maybe_float get_distance_along_3d_line_to_capped_cone(
    in vec3 A0,
    in vec3 A,
    in vec3 B1,
    in vec3 B2,
    in float r1,
    in float r2
){
    float dh = length(B2 - B1);
    float dr = r2 - r1;
    float rmax = max(r2, r1);
    float rmin = min(r2, r1);
    float hmax = rmax * dr / dh;
    float hmin = rmin * dr / dh;
    vec3 B = sign(dr) * normalize(B2 - B1);
    vec3 Bmax = (r2 > r1? B2 : B1);
    vec3 B0 = Bmax - B * hmax;
    vec3 Bmin = Bmax - B * hmin;
    maybe_float end1 = get_distance_along_3d_line_to_circle(A0, A, Bmax, B, rmax);
    maybe_float end2 = get_distance_along_3d_line_to_circle(A0, A, Bmin, B, rmin);
    maybe_float cone = get_distance_along_3d_line_to_infinite_cone(A0, A, B0, B, cos(atan(rmax / hmax)));
    float c_h = dot(A0 + cone.value * A - B0, B);
    cone.exists = cone.exists && hmin <= c_h && c_h <= hmax;
    cone = get_distance_along_line_to_union(cone, end1);
    cone = get_distance_along_line_to_union(cone, end2);
    return cone;
}
const float SPEED_OF_LIGHT = 299792.458 * METER / SECOND;
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
/*
"get_fraction_of_microfacets_accessible_to_ray" is Schlick's fast approximation for Smith's function
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for even more details.
*/
float get_fraction_of_microfacets_accessible_to_ray(
    in float cos_view_angle,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float v = cos_view_angle;
    // float k = m/2.0; return 2.0*v/(v+sqrt(m*m+(1.0-m*m)*v*v)); // Schlick-GGX
    float k = m*sqrt(2./PI); return v/(v*(1.0-k)+k); // Schlick-Beckmann
}
/*
"get_fraction_of_microfacets_with_angle" 
  This is also known as the Beckmann Surface Normal Distribution Function.
  This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
  see Hoffmann 2015 for a gentle introduction to the concept.
  see Schlick (1994) for even more details.
*/
float get_fraction_of_microfacets_with_angle(
    in float cos_angle_of_deviation,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float t = cos_angle_of_deviation;
    float m2 = m*m;
    float t2 = t*t;
    float u = t2*(m2-1.0)+1.0; return m2/(PI*u*u);
    //return exp((t*t-1.)/max(m*m*t*t, 0.1))/max(PI*m*m*t*t*t*t, 0.1);
}
/*
"get_fraction_of_light_reflected_from_facet_head_on" finds the fraction of light that's reflected
  by a boundary between materials when striking head on.
  It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
  The refractive indices can be provided as parameters in any order.
*/
float get_fraction_of_light_reflected_from_facet_head_on(
    in float refractivate_index1,
    in float refractivate_index2
){
    float n1 = refractivate_index1;
    float n2 = refractivate_index2;
    float sqrtF0 = ((n1-n2)/(n1+n2));
    float F0 = sqrtF0 * sqrtF0;
    return F0;
}
/*
"get_rgb_fraction_of_light_reflected_from_facet" returns Fresnel reflectance for each color channel.
  Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
  It is the fraction of light that causes specular reflection.
  Here, we use Schlick's fast approximation for Fresnel reflectance.
  see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for implementation details
*/
vec3 get_rgb_fraction_of_light_reflected_from_facet(
    in float cos_incident_angle,
    in vec3 characteristic_reflectance
){
    vec3 F0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return F0 + (1.-F0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
/*
"get_fraction_of_light_reflected_from_material" is a fast approximation to the Cook-Torrance Specular BRDF.
  It is the fraction of light that reflects from a material to the viewer.
  see Hoffmann 2015 for a gentle introduction to the concept
*/
vec3 get_fraction_of_light_reflected_from_material(
    in float NL, in float NH, in float NV, in float HV,
    in float root_mean_slope_squared,
    in vec3 characteristic_reflectance
){
    float m = root_mean_slope_squared;
    vec3 F0 = characteristic_reflectance;
    return 1.0
        * get_fraction_of_microfacets_accessible_to_ray(NL, m)
        * get_fraction_of_microfacets_with_angle(NH, m)
        * get_fraction_of_microfacets_accessible_to_ray(NV, m)
        * get_rgb_fraction_of_light_reflected_from_facet(HV, F0)
        / max(4.*PI*NV*NL, 0.001);
}
/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
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
/*
"GAMMA" is the constant that's used to map between 
rgb signals sent to a monitor and their actual intensity
*/
const float GAMMA = 2.2;
/* 
This function returns a rgb vector that quickly approximates a spectral "bump".
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
vec3 get_rgb_intensity_of_rgb_signal(
    in vec3 signal
){
    return vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
vec3 get_rgb_signal_of_rgb_intensity(
    in vec3 intensity
){
    return vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
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
    float abs_a = abs(a);
    float abs_b = abs(b);
    float z = sqrt(z2);
    float sqrt_z = sqrt(z);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float ch0 = (1. - 1./(2.*r0)) * SQRT_HALF_PI * sqrt_z + k*x0;
    float cha = (1. - 1./(2.*ra)) * SQRT_HALF_PI * sqrt_z + k*abs_a;
    float chb = (1. - 1./(2.*rb)) * SQRT_HALF_PI * sqrt_z + k*abs_b;
    float s0 = min(exp(r0- z),1.) / (x0/r0 + 1./ch0);
    float sa = exp(r0-ra) / max(abs_a/ra + 1./cha, 0.01);
    float sb = exp(r0-rb) / max(abs_b/rb + 1./chb, 0.01);
    return max( sign(b)*(s0-sb) - sign(a)*(s0-sa), 0.0 );
}
vec3 get_rgb_fraction_of_light_transmitted_through_atmosphere(
    in vec3 view_origin, in vec3 view_direction, in float view_start_length, in float view_stop_length,
    in vec3 world_position, in float world_radius, in float atmosphere_scale_height,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    float h = atmosphere_scale_height;
    float r = world_radius / h;
    vec3 V0 = (view_origin + view_direction * view_start_length - world_position) / h;
    vec3 V1 = (view_origin + view_direction * view_stop_length - world_position) / h;
    vec3 V = view_direction; // unit vector pointing to pixel being viewed
    float v0 = dot(V0,V);
    float v1 = dot(V1,V);
    float zv2 = dot(V0,V0) - v0*v0;
    vec3 beta_sum = (beta_ray + beta_mie + beta_abs)*h;
    float sigma = approx_air_column_density_ratio_through_atmosphere(v0,v1,zv2,r);
    return exp(-sigma * beta_sum);
}
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_fraction_of_distant_light_scattered_by_atmosphere(
    vec3 view_origin, vec3 view_direction, float view_start_length, float view_stop_length,
    vec3 world_position, float world_radius,
    vec3 light_direction, float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
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
    float h = atmosphere_scale_height;
    float r = world_radius / h;
    vec3 V0 = (view_origin + view_direction * view_start_length - world_position) / h;
    vec3 V1 = (view_origin + view_direction * view_stop_length - world_position) / h;
    vec3 V = view_direction; // unit vector pointing to pixel being viewed
    float v0 = dot(V0,V);
    float v1 = dot(V1,V);
    vec3 L = light_direction; // unit vector pointing to light source
    float VL = dot(V,L);
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    vec3 beta_sum = h*(beta_ray + beta_mie + beta_abs);
    vec3 beta_gamma = h*(beta_ray * gamma_ray + beta_mie * gamma_mie);
    // number of iterations within the raymarch
    const float STEP_COUNT = 6.;
    float dv = (v1 - v0) / STEP_COUNT;
    float vi = v0;
    float dl = dv*VL;
    float li = dot(V0,L);
    float y = dot(V0,normalize(cross(V,L)));
    float y2 = y*y;
    float zv2 = dot(V0,V0) - y2 - v0*v0;
    float zl2 = 0.0;
    float sigma; // columnar density encountered along the entire path, relative to surface density, effectively the distance along the surface needed to obtain a similar column density
    vec3 F = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        zl2 = vi*vi + zv2 - li*li;
        sigma = approx_air_column_density_ratio_through_atmosphere(v0, vi, y2+zv2, r )
              + approx_air_column_density_ratio_through_atmosphere(li, 3.*r, y2+zl2, r );
        F += exp(r-sqrt(vi*vi+y2+zv2) - beta_sum*sigma) * beta_gamma * dv;
            // NOTE: the above is equivalent to the incoming fraction multiplied by the outgoing fraction:
            // incoming fraction: the fraction of light that scatters towards camera
            //   exp(r-sqrt(vi*vi+y2+zv2)) * beta_gamma * dv
            // emission : 
            //   exp(r-sqrt(vi*vi+y2+zv2)) * beta_gamma * dv
            // outgoing fraction: the fraction of light that scatters away from camera
            // * exp(-beta_sum * sigma);
        vi += dv;
        li += dl;
    }
    return F;
}
const int MAX_LIGHT_COUNT = 9;
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
void main() {
    vec2 screenspace = vUv;
    vec2 clipspace = 2.0 * screenspace - 1.0;
    // "V0" is view origin
    vec3 V0 = view_matrix_inverse[3].xyz * reference_distance;
    // "V" is view direction
    vec3 V = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    // "O" is world origin
    vec3 O = vec3(0);
    // "r" is world radius
    float r = world_radius;
    // "H" is atmospheric scale height
    float H = atmosphere_scale_height;
    // "I_back" is background light intensity
    vec3 I_back = insolation_max * get_rgb_intensity_of_rgb_signal(
        texture2D( background_rgb_signal_texture, vUv ).rgb
    );
    // "beta_air_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3 beta_ray = surface_air_rayleigh_scattering_coefficients;
    vec3 beta_mie = surface_air_mie_scattering_coefficients;
    vec3 beta_abs = surface_air_absorption_coefficients;
    // check for intersection with the atmosphere
    // We only set it to 12 scale heights because we are using this parameter for raymarching, and not a closed form solution
    maybe_vec2 v_atmosphere_region = get_distances_along_3d_line_to_sphere(V0, V, O, r + 12.*H);
    maybe_vec2 v_obstructed_region = get_distances_along_3d_line_to_sphere(V0, V, O, r);
    maybe_vec2 v_scatter_region = get_distances_along_line_to_negation(v_atmosphere_region, v_obstructed_region);
    // "E" is the rgb intensity of light emitted towards the camera
    vec3 E = vec3(0);
    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (v_scatter_region.exists)
    {
        // start of march along view ray
        float v0 = max(v_scatter_region.value.x, 0.0);
        // end of march along view ray
        float v1 = max(v_scatter_region.value.y, 0.0);
        for (int i = 0; i < MAX_LIGHT_COUNT; ++i)
        {
            // HACK: for some reason calulating y2 within get_rgb_fraction_of_distant_light_scattered_by_atmosphere
            // causes the render to break when running on more than 1 light source
            if (i >= 1) { break; }
            E += light_rgb_intensities[i]
               * get_rgb_fraction_of_distant_light_scattered_by_atmosphere(
                     V0, V, v0, v1, O, r, light_directions[i], H, beta_ray, beta_mie, beta_abs
                 );
        }
        // now calculate the intensity of light that traveled straight in from the background, and add it to the total
        E += I_back
           * get_rgb_fraction_of_light_transmitted_through_atmosphere(
                 V0, V, 0.0, v1*0.999, O, r, H, beta_ray, beta_mie, beta_abs
             );
    }
    else
    {
        E = I_back;
    }
    // TODO: move this to a separate shader pass!
    // see https://learnopengl.com/Advanced-Lighting/HDR for an intro to tone mapping
    float exposure_intensity = 150.; // Watts/m^2
    vec3 ldr_tone_map = 1.0 - exp(-E/exposure_intensity);
    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(ldr_tone_map), 1);
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
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.0;
const float KELVIN = 1.0;
const float DALTON = 1.66053907e-27; // kilograms
const float MICROGRAM = 1e-9; // kilograms
const float MILLIGRAM = 1e-6; // kilograms
const float GRAM = 1e-3; // kilograms
const float KILOGRAM = 1.0; // kilograms
const float TON = 1000.; // kilograms
const float PICOMETER = 1e-12; // meters
const float NANOMETER = 1e-9; // meters
const float MICROMETER = 1e-6; // meters
const float MILLIMETER = 1e-3; // meters
const float METER = 1.0; // meters
const float KILOMETER = 1000.; // meters
const float MOLE = 6.02214076e23;
const float MILLIMOLE = MOLE / 1e3;
const float MICROMOLE = MOLE / 1e6;
const float NANOMOLE = MOLE / 1e9;
const float PICOMOLE = MOLE / 1e12;
const float FEMTOMOLE = MOLE / 1e15;
const float SECOND = 1.0; // seconds
const float MINUTE = 60.0; // seconds
const float HOUR = MINUTE*60.0; // seconds
const float DAY = HOUR*24.0; // seconds
const float WEEK = DAY*7.0; // seconds
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
const float LIGHT_YEAR = 9.4607304725808e15; // meters
const float PARSEC = 3.08567758149136727891393;//meters
const float GALACTIC_MASS = 2e12*SOLAR_MASS; // kilograms
const float GALACTIC_YEAR = 250.0*MEGAYEAR; // seconds
const float GALACTIC_RADIUS = 120e3*LIGHT_YEAR;// meters
const float PI = 3.14159265358979323846264338327950288419716939937510;
const float PHI = 1.6180339887;
const float BIG = 1e20;
const float SMALL = 1e-20;
/*
"oplus" is the o-plus operator,
  or the reciprocal of the sum of reciprocals.
It's a handy function that comes up a lot in some physics problems.
It's pretty useful for preventing division by zero.
*/
float oplus(in float a, in float b){
    return 1. / (1./a + 1./b);
}
/*
"bump" is the Alan Zucconi bump function.
It's a fast and easy way to approximate any kind of wavelet or gaussian function
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
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
const float SPEED_OF_LIGHT = 299792.458 * METER / SECOND;
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
/*
"get_fraction_of_microfacets_accessible_to_ray" is Schlick's fast approximation for Smith's function
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for even more details.
*/
float get_fraction_of_microfacets_accessible_to_ray(
    in float cos_view_angle,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float v = cos_view_angle;
    // float k = m/2.0; return 2.0*v/(v+sqrt(m*m+(1.0-m*m)*v*v)); // Schlick-GGX
    float k = m*sqrt(2./PI); return v/(v*(1.0-k)+k); // Schlick-Beckmann
}
/*
"get_fraction_of_microfacets_with_angle" 
  This is also known as the Beckmann Surface Normal Distribution Function.
  This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
  see Hoffmann 2015 for a gentle introduction to the concept.
  see Schlick (1994) for even more details.
*/
float get_fraction_of_microfacets_with_angle(
    in float cos_angle_of_deviation,
    in float root_mean_slope_squared
){
    float m = root_mean_slope_squared;
    float t = cos_angle_of_deviation;
    float m2 = m*m;
    float t2 = t*t;
    float u = t2*(m2-1.0)+1.0; return m2/(PI*u*u);
    //return exp((t*t-1.)/max(m*m*t*t, 0.1))/max(PI*m*m*t*t*t*t, 0.1);
}
/*
"get_fraction_of_light_reflected_from_facet_head_on" finds the fraction of light that's reflected
  by a boundary between materials when striking head on.
  It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
  The refractive indices can be provided as parameters in any order.
*/
float get_fraction_of_light_reflected_from_facet_head_on(
    in float refractivate_index1,
    in float refractivate_index2
){
    float n1 = refractivate_index1;
    float n2 = refractivate_index2;
    float sqrtF0 = ((n1-n2)/(n1+n2));
    float F0 = sqrtF0 * sqrtF0;
    return F0;
}
/*
"get_rgb_fraction_of_light_reflected_from_facet" returns Fresnel reflectance for each color channel.
  Fresnel reflectance is the fraction of light that's immediately reflected upon striking the surface.
  It is the fraction of light that causes specular reflection.
  Here, we use Schlick's fast approximation for Fresnel reflectance.
  see https://en.wikipedia.org/wiki/Schlick%27s_approximation for a summary 
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for implementation details
*/
vec3 get_rgb_fraction_of_light_reflected_from_facet(
    in float cos_incident_angle,
    in vec3 characteristic_reflectance
){
    vec3 F0 = characteristic_reflectance;
    float _1_u = 1.-cos_incident_angle;
    return F0 + (1.-F0) * _1_u*_1_u*_1_u*_1_u*_1_u;
}
/*
"get_fraction_of_light_reflected_from_material" is a fast approximation to the Cook-Torrance Specular BRDF.
  It is the fraction of light that reflects from a material to the viewer.
  see Hoffmann 2015 for a gentle introduction to the concept
*/
vec3 get_fraction_of_light_reflected_from_material(
    in float NL, in float NH, in float NV, in float HV,
    in float root_mean_slope_squared,
    in vec3 characteristic_reflectance
){
    float m = root_mean_slope_squared;
    vec3 F0 = characteristic_reflectance;
    return 1.0
        * get_fraction_of_microfacets_accessible_to_ray(NL, m)
        * get_fraction_of_microfacets_with_angle(NH, m)
        * get_fraction_of_microfacets_accessible_to_ray(NV, m)
        * get_rgb_fraction_of_light_reflected_from_facet(HV, F0)
        / max(4.*PI*NV*NL, 0.001);
}
/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
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
/*
"GAMMA" is the constant that's used to map between 
rgb signals sent to a monitor and their actual intensity
*/
const float GAMMA = 2.2;
/* 
This function returns a rgb vector that quickly approximates a spectral "bump".
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
vec3 get_rgb_intensity_of_rgb_signal(
    in vec3 signal
){
    return vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
vec3 get_rgb_signal_of_rgb_intensity(
    in vec3 intensity
){
    return vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
vec3 get_rgb_fraction_of_light_transmitted_through_ocean(
    in float cos_incident_angle, in float fluid_depth,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    float sigma = fluid_depth / max(cos_incident_angle, 0.001);
    return exp(-sigma * (beta_ray + beta_mie + beta_abs));
}
vec3 get_rgb_intensity_of_light_scattered_by_ocean(
    in float cos_view_angle,
    in float cos_light_angle,
    in float cos_scatter_angle,
    in float fluid_depth,
    in vec3 refracted_light_rgb_intensity,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
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
    vec3 beta_gamma = beta_ray * gamma_ray + beta_mie * gamma_mie;
    vec3 beta_sum = beta_ray + beta_mie + beta_abs;
    // "sigma_v" is the column density, relative to the surface, that's along the view ray.
    // "sigma_l" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    float sigma_v = fluid_depth / NV;
    float sigma_l = fluid_depth / NL;
    float sigma_ratio = 1. + NV/max(NL, 0.001);
    return I
        // incoming fraction: the fraction of light that scatters towards camera
        * beta_gamma
        // outgoing fraction: the fraction of light that scatters away from camera
        * (1. - exp(-sigma_v * sigma_ratio * beta_sum))
        / (sigma_ratio * beta_sum);
}
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
    float abs_a = abs(a);
    float abs_b = abs(b);
    float z = sqrt(z2);
    float sqrt_z = sqrt(z);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float ch0 = (1. - 1./(2.*r0)) * SQRT_HALF_PI * sqrt_z + k*x0;
    float cha = (1. - 1./(2.*ra)) * SQRT_HALF_PI * sqrt_z + k*abs_a;
    float chb = (1. - 1./(2.*rb)) * SQRT_HALF_PI * sqrt_z + k*abs_b;
    float s0 = min(exp(r0- z),1.) / (x0/r0 + 1./ch0);
    float sa = exp(r0-ra) / max(abs_a/ra + 1./cha, 0.01);
    float sb = exp(r0-rb) / max(abs_b/rb + 1./chb, 0.01);
    return max( sign(b)*(s0-sb) - sign(a)*(s0-sa), 0.0 );
}
vec3 get_rgb_fraction_of_light_transmitted_through_atmosphere(
    in vec3 view_origin, in vec3 view_direction, in float view_start_length, in float view_stop_length,
    in vec3 world_position, in float world_radius, in float atmosphere_scale_height,
    in vec3 beta_ray, in vec3 beta_mie, in vec3 beta_abs
){
    float h = atmosphere_scale_height;
    float r = world_radius / h;
    vec3 V0 = (view_origin + view_direction * view_start_length - world_position) / h;
    vec3 V1 = (view_origin + view_direction * view_stop_length - world_position) / h;
    vec3 V = view_direction; // unit vector pointing to pixel being viewed
    float v0 = dot(V0,V);
    float v1 = dot(V1,V);
    float zv2 = dot(V0,V0) - v0*v0;
    vec3 beta_sum = (beta_ray + beta_mie + beta_abs)*h;
    float sigma = approx_air_column_density_ratio_through_atmosphere(v0,v1,zv2,r);
    return exp(-sigma * beta_sum);
}
// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
vec3 get_rgb_fraction_of_distant_light_scattered_by_atmosphere(
    vec3 view_origin, vec3 view_direction, float view_start_length, float view_stop_length,
    vec3 world_position, float world_radius,
    vec3 light_direction, float atmosphere_scale_height,
    vec3 beta_ray, vec3 beta_mie, vec3 beta_abs
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
    float h = atmosphere_scale_height;
    float r = world_radius / h;
    vec3 V0 = (view_origin + view_direction * view_start_length - world_position) / h;
    vec3 V1 = (view_origin + view_direction * view_stop_length - world_position) / h;
    vec3 V = view_direction; // unit vector pointing to pixel being viewed
    float v0 = dot(V0,V);
    float v1 = dot(V1,V);
    vec3 L = light_direction; // unit vector pointing to light source
    float VL = dot(V,L);
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(VL);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(VL);
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    vec3 beta_sum = h*(beta_ray + beta_mie + beta_abs);
    vec3 beta_gamma = h*(beta_ray * gamma_ray + beta_mie * gamma_mie);
    // number of iterations within the raymarch
    const float STEP_COUNT = 6.;
    float dv = (v1 - v0) / STEP_COUNT;
    float vi = v0;
    float dl = dv*VL;
    float li = dot(V0,L);
    float y = dot(V0,normalize(cross(V,L)));
    float y2 = y*y;
    float zv2 = dot(V0,V0) - y2 - v0*v0;
    float zl2 = 0.0;
    float sigma; // columnar density encountered along the entire path, relative to surface density, effectively the distance along the surface needed to obtain a similar column density
    vec3 F = vec3(0); // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (float i = 0.; i < STEP_COUNT; ++i)
    {
        zl2 = vi*vi + zv2 - li*li;
        sigma = approx_air_column_density_ratio_through_atmosphere(v0, vi, y2+zv2, r )
              + approx_air_column_density_ratio_through_atmosphere(li, 3.*r, y2+zl2, r );
        F += exp(r-sqrt(vi*vi+y2+zv2) - beta_sum*sigma) * beta_gamma * dv;
            // NOTE: the above is equivalent to the incoming fraction multiplied by the outgoing fraction:
            // incoming fraction: the fraction of light that scatters towards camera
            //   exp(r-sqrt(vi*vi+y2+zv2)) * beta_gamma * dv
            // emission : 
            //   exp(r-sqrt(vi*vi+y2+zv2)) * beta_gamma * dv
            // outgoing fraction: the fraction of light that scatters away from camera
            // * exp(-beta_sum * sigma);
        vi += dv;
        li += dl;
    }
    return F;
}
const int MAX_LIGHT_COUNT = 9;
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
// TODO: calculate airglow for nightside using scattering equations from atmosphere.glsl, 
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
    // "V" is the normal vector indicating the direction to the view
    // TODO: standardize view_direction as view from surface to camera
    vec3 V = view_direction;
    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;
    // "H" is the halfway vector between normal and view.
    // It represents the surface normal that's needed to cause reflection.
    // It can also be thought of as the surface normal of a microfacet that's 
    //   producing the reflections seen by the camera.
    vec3 H = normalize(V+L);
    // Here we setup several useful dot products of unit vectors
    float NL = max(dot(N,L), 0.0);
    float NH = max(dot(N,H), 0.0);
    float NV = max(dot(N,V), 0.0);
    float HV = max(dot(V,H), 0.0);
    float VL = max(dot(L,V), 0.0);
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
    vec3 I_surface = I_sun * NL
      * get_rgb_fraction_of_light_transmitted_through_atmosphere(
            // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the world
            1.000001 * P, L, 0.0, 3.0*world_radius, vec3(0), world_radius,
            atmosphere_scale_height, atmosphere_beta_ray, atmosphere_beta_mie, atmosphere_beta_abs
        );
    // "E_surface_reflected" is the intensity of light that is immediately reflected by the surface
    vec3 E_surface_reflected = I_surface * get_fraction_of_light_reflected_from_material(NL,NH,NV, HV, m,F0);
        //get_fraction_of_light_reflected_from_material(NL,NH,NV,max(dot(V,H),0.),m,F0);
    // "I_surface_refracted" is the intensity of light that is not immediately reflected, 
    //   but penetrates into the material, either to be absorbed, scattered away, 
    //   or scattered back to the view as diffuse reflection.
    // Since energy is conserved, everything from I_surface has to get either reflected, diffused, or absorbed
    // We would ideally like to negate the integral of reflectance over all possible viewing angles, 
    //   but finding that is hard, so let's just negate the reflectance for the viewing angle at which it occurs the most
    vec3 I_surface_refracted = I_surface; // * (1.0 - get_fraction_of_light_reflected_from_material(NL,1.0,NL,NL,m,F0));
      //+ I_sun     *  atmosphere_ambient_light_factor;
    // If sea is present, "E_ocean_scattered" is the rgb intensity of light 
    //   scattered by the sea towards the camera. Otherwise, it equals 0.
    vec3 E_ocean_scattered =
        get_rgb_intensity_of_light_scattered_by_ocean(
            NV, NL, VL, ocean_depth, I_surface_refracted,
            ocean_beta_ray, ocean_beta_mie, ocean_beta_abs
        );
    // if sea is present, "I_ocean_trasmitted" is the rgb intensity of light 
    //   that reaches the ground after being filtered by air and sea. 
    //   Otherwise, it equals I_surface_refracted.
    vec3 I_ocean_trasmitted= I_surface_refracted
        * get_rgb_fraction_of_light_transmitted_through_ocean(NL, ocean_depth, ocean_beta_ray, ocean_beta_mie, ocean_beta_abs);
    // "E_diffuse" is diffuse reflection of any nontrasparent component beneath the transparent surface,
    // It effectively describes diffuse reflection as understood within the phong model of reflectance.
    vec3 E_diffuse = I_ocean_trasmitted * D;
    // if sea is present, "E_ocean_transmitted" is the fraction 
    //   of E_diffuse that makes it out of the sea. Otheriwse, it equals E_diffuse
    vec3 E_ocean_transmitted = E_diffuse
        * get_rgb_fraction_of_light_transmitted_through_ocean(NV, ocean_depth, ocean_beta_ray, ocean_beta_mie, ocean_beta_abs);
    if (!(all(greaterThanEqual(E_surface_reflected, vec3(0))))) { return vec3(1,0,0); }
    if (!(all(greaterThanEqual(E_ocean_transmitted, vec3(0))))) { return vec3(0,1,0); }
    if (!(all(greaterThanEqual(E_ocean_scattered, vec3(0))))) { return vec3(0,0,1); }
    if (!(all(lessThan(E_surface_reflected+E_ocean_transmitted+E_ocean_scattered, I_sun)))) { return vec3(1,1,0); }
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
            get_fraction_of_light_reflected_from_facet_head_on(WATER_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX) :
            LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE,
            get_fraction_of_light_reflected_from_facet_head_on(SNOW_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX),
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
    //   that job is done by the atmospheric shader pass, in "atmosphere.glsl"
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
