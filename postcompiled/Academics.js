const DEGREE = 3.141592653589793238462643383279502884197169399 / 180.;
const RADIAN = 1.0;
const KELVIN = 1.0;
const DALTON = 1.66053907e-27;
// kilograms
const MICROGRAM = 1e-9;
// kilograms
const MILLIGRAM = 1e-6;
// kilograms
const GRAM = 1e-3;
// kilograms
const KILOGRAM = 1.0;
// kilograms
const TON = 1000.;
// kilograms
const PICOMETER = 1e-12;
// meters
const NANOMETER = 1e-9;
// meters
const MICROMETER = 1e-6;
// meters
const MILLIMETER = 1e-3;
// meters
const METER = 1.0;
// meters
const KILOMETER = 1000.;
// meters
const MOLE = 6.02214076e23;
const MILLIMOLE = MOLE / 1e3;
const MICROMOLE = MOLE / 1e6;
const NANOMOLE = MOLE / 1e9;
const PICOMOLE = MOLE / 1e12;
const FEMTOMOLE = MOLE / 1e15;
const SECOND = 1.0;
// seconds
const MINUTE = 60.0;
// seconds
const HOUR = MINUTE * 60.0;
// seconds
const DAY = HOUR * 24.0;
// seconds
const WEEK = DAY * 7.0;
// seconds
const MONTH = DAY * 29.53059;
// seconds
const YEAR = DAY * 365.256363004;
// seconds
const MEGAYEAR = YEAR * 1e6;
// seconds
const NEWTON = KILOGRAM * METER / (SECOND * SECOND);
const JOULE = NEWTON * METER;
const WATT = JOULE / SECOND;
const EARTH_MASS = 5.972e24;
// kilograms
const EARTH_RADIUS = 6.367e6;
// meters
const STANDARD_GRAVITY = 9.80665;
// meters/second^2
const STANDARD_TEMPERATURE = 273.15;
// kelvin
const STANDARD_PRESSURE = 101325.;
// pascals
const ASTRONOMICAL_UNIT = 149597870700.;
// meters
const GLOBAL_SOLAR_CONSTANT = 1361.;
// watts/meter^2
const JUPITER_MASS = 1.898e27;
// kilograms
const JUPITER_RADIUS = 71e6;
// meters
const SOLAR_MASS = 2e30;
// kilograms
const SOLAR_RADIUS = 695.7e6;
// meters
const SOLAR_LUMINOSITY = 3.828e26;
// watts
const SOLAR_TEMPERATURE = 5772.;
// kelvin
const LIGHT_YEAR = 9.4607304725808e15;
// meters
const PARSEC = 3.08567758149136727891393;
//meters
const GALACTIC_MASS = 2e12 * SOLAR_MASS;
// kilograms
const GALACTIC_YEAR = 250.0 * MEGAYEAR;
// seconds
const GALACTIC_RADIUS = 120e3 * LIGHT_YEAR;
function maybe_int(
 /*bool*/ exists
){
    return {
        value:value,
        exists:exists
    };
}

function maybe_float(
 /*bool*/ exists
){
    return {
        value:value,
        exists:exists
    };
}

function maybe_vec2(
 /*bool*/ exists
){
    return {
        value:value,
        exists:exists
    };
}

function maybe_vec3(
 /*bool*/ exists
){
    return {
        value:value,
        exists:exists
    };
}

function maybe_vec4(
 /*bool*/ exists
){
    return {
        value:value,
        exists:exists
    };
}

const PI = 3.14159265358979323846264338327950288419716939937510;
const PHI = 1.6180339887;
const BIG = 1e20;
const SMALL = 1e-20;
/*
"oplus" is the o-plus operator,
  or the reciprocal of the sum of reciprocals.
It's a handy function that comes up a lot in some physics problems.
It's pretty useful for preventing division by zero.
*/
/*float*/
function oplus(
     /*float*/ a,
     /*float*/ b
){
    return 1. / (1. / a + 1. / b);
}

/*
"bump" is the Alan Zucconi bump function.
It's a fast and easy way to approximate any kind of wavelet or gaussian function
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
/*float*/
function bump(
     /*float*/ x,
     /*float*/ edge0,
     /*float*/ edge1,
     /*float*/ height
){
    let center = (edge1 + edge0) / 2.;
    let width = (edge1 - edge0) / 2.;
    let offset = (x - center) / width;
    return height * glm.max( 1. - offset * offset,  0.);
}

//#include "precompiled/academics/math/geometry/point_intersection.glsl"
/*maybe_vec2*/
function get_bounding_distances_along_ray(
     /*maybe_vec2*/ distances_along_line
){
    return maybe_vec2( glm.vec2( glm.max( glm.min( distances_along_line.value.x,  distances_along_line.value.y),  0.0),  glm.max( distances_along_line.value.x,  distances_along_line.value.y)),  distances_along_line.exists && glm.max( distances_along_line.value.x,  distances_along_line.value.y) > 0.);
}

/*maybe_float*/
function get_nearest_distance_along_ray(
     /*maybe_vec2*/ distances_along_line
){
    return maybe_float( distances_along_line.value.x < 0.0? distances_along_line.value.y : distances_along_line.value.y < 0.0? distances_along_line.value.x : glm.min( distances_along_line.value.x,  distances_along_line.value.y),  distances_along_line.exists && glm.max( distances_along_line.value.x,  distances_along_line.value.y) > 0.);
}

/*maybe_float*/
function get_distance_along_line_to_union(
     /*maybe_float*/ shape1,
     /*maybe_float*/ shape2
){
    return maybe_float( !shape1.exists? shape2.value : !shape2.exists? shape1.value : glm.min( shape1.value,  shape2.value),  shape1.exists || shape2.exists);
}

/*maybe_vec2*/
function get_distances_along_line_to_union(
     /*maybe_vec2*/ shape1,
     /*maybe_vec2*/ shape2
){
    return maybe_vec2( glm.vec2( !shape1.exists? shape2.value.x : !shape2.exists? shape1.value.x : glm.min( shape1.value.x,  shape2.value.x),  !shape1.exists? shape2.value.y : !shape2.exists? shape1.value.y : glm.max( shape1.value.y,  shape2.value.y)),  shape1.exists || shape2.exists);
}

/*maybe_vec2*/
function get_distances_along_line_to_negation(
     /*maybe_vec2*/ positive,
     /*maybe_vec2*/ negative
){
    // as long as intersection with positive exists, 
    // and negative doesn't completely surround it, there will be an intersection
    let exists = positive.exists && !(negative.value.x < positive.value.x && positive.value.y < negative.value.y);
    // find the first region of intersection
    let entrance = !negative.exists? positive.value.x : glm.min( negative.value.y,  positive.value.x);
    let exit = !negative.exists? positive.value.y : glm.min( negative.value.x,  positive.value.y);
    // if the first region is behind us, find the second region
    if (exit < 0. && 0. < positive.value.y){
        entrance = negative.value.y;
        exit = positive.value.y;
    }

    return maybe_vec2( glm.vec2( entrance,  exit),  exists);
}

/*maybe_vec2*/
function get_distances_along_line_to_intersection(
     /*maybe_vec2*/ shape1,
     /*maybe_vec2*/ shape2
){
    let x = shape1.exists && shape2.exists? glm.max( shape1.value.x,  shape2.value.x) : 0.0;
    let y = shape1.exists && shape2.exists? glm.min( shape1.value.y,  shape2.value.y) : 0.0;
    return maybe_vec2( glm.vec2( x,  y),  shape1.exists && shape2.exists && x < y);
}

/*float*/
function get_distance_along_2d_line_nearest_to_point(
     /*vec2*/ A0,
     /*vec2*/ A,
     /*vec2*/ B0
){
    return glm.dot( B0['-']( A0),  A);
}

/*
A0 line reference
A  line direction, normalized
B0 line reference
B  line direction, normalized
*/
/*maybe_float*/
function get_distance_along_2d_line_to_line(
     /*vec2*/ A0,
     /*vec2*/ A,
     /*vec2*/ B0,
     /*vec2*/ B
){
    let D = B0['-']( A0);
    // offset
    let R = D['-']( A['*']( glm.dot( D,  A)));
    // rejection
    return maybe_float( glm.length( R) / glm.dot( B,  glm.normalize( (R)["*"]( -1))),  glm.abs( glm.abs( glm.dot( A,  B)) - 1.0) > 0.0);
}

/*
A0 line reference
A  line direction, normalized
B0 ray origin
B  ray direction, normalized
*/
/*maybe_float*/
function get_distance_along_2d_line_to_ray(
     /*vec2*/ A0,
     /*vec2*/ A,
     /*vec2*/ B0,
     /*vec2*/ B
){
    // INTUITION: same as the line-line intersection, but now results are only valid if distance > 0
    let D = B0['-']( A0);
    // offset
    let R = D['-']( A['*']( glm.dot( D,  A)));
    // rejection
    let xB = glm.length( R) / glm.dot( B,  glm.normalize( (R)["*"]( -1)));
    // distance along B
    let xA = xB / glm.dot( B,  A);
    // distance along A
    return maybe_float( xB,  glm.abs( glm.abs( glm.dot( A,  B)) - 1.0) > 0.0 && xA > 0.0);
}

/*
A0 line reference
A  line direction, normalized
B0 line segment endpoint 1
B1 line segment endpoint 2
*/
/*maybe_float*/
function get_distance_along_2d_line_to_line_segment(
     /*vec2*/ A0,
     /*vec2*/ A,
     /*vec2*/ B1,
     /*vec2*/ B2
){
    // INTUITION: same as the line-line intersection, but now results are only valid if 0 < distance < |B2-B1|
    let B = glm.normalize( B2['-']( B1));
    let D = B1['-']( A0);
    // offset
    let R = D['-']( A['*']( glm.dot( D,  A)));
    // rejection
    let xB = glm.length( R) / glm.dot( B,  glm.normalize( (R)["*"]( -1)));
    // distance along B
    let xA = xB / glm.dot( B,  A);
    // distance along A
    return maybe_float( xB,  glm.abs( glm.abs( glm.dot( A,  B)) - 1.0) > 0.0 && 0. < xA && xA < glm.length( B2['-']( B1)));
}

/*maybe_vec2*/
function get_distances_along_2d_line_to_circle(
     /*vec2*/ A0,
     /*vec2*/ A,
     /*vec2*/ B0,
     /*float*/ r
){
    let D = B0['-']( A0);
    let xz = glm.dot( D,  A);
    let z2 = glm.dot( D,  D) - xz * xz;
    let y2 = r * r - z2;
    let dxr = glm.sqrt( glm.max( y2,  1e-10));
    return maybe_vec2( glm.vec2( xz - dxr,  xz + dxr),  y2 > 0.);
}

/*
A0 line reference
A  line direction, normalized
B1 vertex position 1
B2 vertex position 2
*/
/*maybe_vec2*/
function get_distances_along_2d_line_to_triangle(
     /*vec2*/ A0,
     /*vec2*/ A,
     /*vec2*/ B1,
     /*vec2*/ B2,
     /*vec2*/ B3
){
    let line1 = get_distance_along_2d_line_to_line_segment( A0,  A,  B1,  B2);
    let line2 = get_distance_along_2d_line_to_line_segment( A0,  A,  B2,  B3);
    let line3 = get_distance_along_2d_line_to_line_segment( A0,  A,  B3,  B1);
    return maybe_vec2( glm.vec2( glm.min( line1.value,  glm.min( line2.value,  line3.value)),  glm.max( line1.value,  glm.max( line2.value,  line3.value))),  line1.exists || line2.exists || line3.exists);
}

/*float*/
function get_distance_along_3d_line_nearest_to_point(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0
){
    return glm.dot( B0['-']( A0),  A);
}

/*
A0 line reference
A  line direction, normalized
B0 line reference
B  line direction, normalized
*/
/*maybe_float*/
function get_distance_along_3d_line_nearest_to_line(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ B
){
    let D = B0['-']( A0);
    // offset
    let C = glm.normalize( glm.cross( B,  A));
    // cross
    let R = D['-']( (A['*']( glm.dot( D,  A)))['-']( C['*']( glm.dot( D,  C))));
    // rejection
    return maybe_float( glm.length( R) / -glm.dot( B,  glm.normalize( R)),  glm.abs( glm.abs( glm.dot( A,  B)) - 1.0) > 0.0);
}

/*
A0 line reference
A  line direction, normalized
B0 ray origin
B  ray direction, normalized
*/
/*maybe_float*/
function get_distance_along_3d_line_nearest_to_ray(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ B
){
    let D = B0['-']( A0);
    // offset
    let R = D['-']( A['*']( glm.dot( D,  A)));
    // rejection
    let xB = glm.length( R) / glm.dot( B,  glm.normalize( (R)["*"]( -1)));
    // distance along B
    let xA = xB / glm.dot( B,  A);
    // distance along A
    return maybe_float( xB,  glm.abs( glm.abs( glm.dot( A,  B)) - 1.0) > 0.0 && xA > 0.0);
}

/*
A0 line reference
A  line direction, normalized
B1 line segment endpoint 1
B2 line segment endpoint 2
*/
/*maybe_float*/
function get_distance_along_3d_line_nearest_to_line_segment(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ B1
){
    let B = glm.normalize( B1['-']( B0));
    let D = B0['-']( A0);
    // offset
    let R = D['-']( A['*']( glm.dot( D,  A)));
    // rejection
    let xB = glm.length( R) / glm.dot( B,  glm.normalize( (R)["*"]( -1)));
    // distance along B
    let xA = xB / glm.dot( B,  A);
    // distance along A
    return maybe_float( xB,  glm.abs( glm.abs( glm.dot( A,  B)) - 1.0) > 0.0 && 0. < xA && xA < glm.length( B1['-']( B0)));
}

/*
A0 line reference
A  line direction, normalized
B0 plane reference
N  plane surface normal, normalized
*/
/*maybe_float*/
function get_distance_along_3d_line_to_plane(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ N
){
    return maybe_float( -glm.dot( A0['-']( B0),  N) / glm.dot( A,  N),  glm.abs( glm.dot( A,  N)) < SMALL);
}

/*
A0 line reference
A  line direction, normalized
B0 circle origin
N  circle surface normal, normalized
r  circle radius
*/
/*maybe_float*/
function get_distance_along_3d_line_to_circle(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ N,
     /*float*/ r
){
    // intersection(plane, sphere)
    let t = get_distance_along_3d_line_to_plane( A0,  A,  B0,  N);
    return maybe_float( t.value,  is_3d_point_in_sphere( A0['+']( A['*']( t.value)),  B0,  r));
}

/*
A0 line reference
A  line direction, normalized
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
*/
/*maybe_float*/
function get_distance_along_3d_line_to_triangle(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B1,
     /*vec3*/ B2,
     /*vec3*/ B3
){
    // intersection(face plane, edge plane, edge plane, edge plane)
    let B0 = ((B1['+']( B2['+']( B3))))['/']( 3.);
    let N = glm.normalize( glm.cross( B1['-']( B2),  B2['-']( B3)));
    let t = get_distance_along_3d_line_to_plane( A0,  A,  B0,  N);
    let At = A0['+']( A['*']( t.value));
    let B2B1hat = glm.normalize( B2['-']( B1));
    let B3B2hat = glm.normalize( B3['-']( B2));
    let B1B3hat = glm.normalize( B1['-']( B3));
    return maybe_float( t.value,  glm.dot( glm.normalize( At['-']( B1)),  B2B1hat) > glm.dot( (B1B3hat)["*"]( -1),  B2B1hat) && glm.dot( glm.normalize( At['-']( B2)),  B3B2hat) > glm.dot( (B2B1hat)["*"]( -1),  B3B2hat) && glm.dot( glm.normalize( At['-']( B3)),  B1B3hat) > glm.dot( (B3B2hat)["*"]( -1),  B1B3hat));
}

/*
A0 line reference
A  line direction, normalized
B0 sphere origin
R  sphere radius along each coordinate axis
*/
/*maybe_vec2*/
function get_distances_along_3d_line_to_sphere(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*float*/ r
){
    let xz = glm.dot( B0['-']( A0),  A);
    let z = glm.length( A0['+']( (A['*']( xz))['-']( B0)));
    let y2 = r * r - z * z;
    let dxr = glm.sqrt( glm.max( y2,  1e-10));
    return maybe_vec2( glm.vec2( xz - dxr,  xz + dxr),  y2 > 0.);
}

/*
A0 line reference
A  line direction, normalized
B0 ellipsoid center
R  ellipsoid radius along each coordinate axis
*/
/*maybe_float*/
function get_distance_along_3d_line_to_ellipsoid(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ R
){
    // NOTE: shamelessly copy pasted, all credit goes to Inigo: 
    // https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
    let Or = ((A0['-']( B0)))['/']( R);
    let Ar = A['/']( R);
    let ArAr = glm.dot( Ar,  Ar);
    let OrAr = glm.dot( Or,  Ar);
    let OrOr = glm.dot( Or,  Or);
    let h = OrAr * OrAr - ArAr * (OrOr - 1.0);
    return maybe_float( (-OrAr - glm.sqrt( h)) / ArAr,  h >= 0.0);
}

/*
A0 line reference
A  line direction, normalized
B1 vertex position 1
B2 vertex position 2
B3 vertex position 3
B4 vertex position 4
*/
/*maybe_float*/
function get_distance_along_3d_line_to_tetrahedron(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B1,
     /*vec3*/ B2,
     /*vec3*/ B3,
     /*vec3*/ B4
){
    let hit1 = get_distance_along_3d_line_to_triangle( A0,  A,  B1,  B2,  B3);
    let hit2 = get_distance_along_3d_line_to_triangle( A0,  A,  B2,  B3,  B4);
    let hit3 = get_distance_along_3d_line_to_triangle( A0,  A,  B3,  B4,  B1);
    let hit4 = get_distance_along_3d_line_to_triangle( A0,  A,  B4,  B1,  B2);
    let hit;
    hit = get_distance_along_line_to_union( hit1,  hit2);
    hit = get_distance_along_line_to_union( hit,  hit3);
    hit = get_distance_along_line_to_union( hit,  hit4);
    return hit;
}

/*
A0 line reference
A  line direction, normalized
B0 cylinder reference
B  cylinder direction, normalized
r  cylinder radius
*/
/*maybe_vec2*/
function get_distances_along_3d_line_to_infinite_cylinder(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ B,
     /*float*/ r
){
    // INTUITION: simplify the problem by using a coordinate system based around the line and the tube center
    // see closest-approach-between-line-and-cylinder-visualized.scad
    // implementation shamelessly copied from Inigo: 
    // https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
    let D = A0['-']( B0);
    let BA = glm.dot( B,  A);
    let BD = glm.dot( B,  D);
    let a = 1.0 - BA * BA;
    let b = glm.dot( D,  A) - BD * BA;
    let c = glm.dot( D,  D) - BD * BD - r * r;
    let h = glm.sqrt( glm.max( b * b - a * c,  0.0));
    return maybe_vec2( glm.vec2( (-b + h) / a,  (-b - h) / a),  h > 0.0);
}

/*
A0 line reference
A  line direction, normalized
B1 cylinder endpoint 1
B2 cylinder endpoing 2
r  cylinder radius
*/
/*maybe_vec2*/
function get_distances_along_3d_line_to_cylinder(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B1,
     /*vec3*/ B2,
     /*float*/ r
){
    let B = glm.normalize( B2['-']( B1));
    let a1 = get_distance_along_3d_line_to_plane( A0,  A,  B1,  B);
    let a2 = get_distance_along_3d_line_to_plane( A0,  A,  B2,  B);
    let a_in = glm.min( a1.value,  a2.value);
    let a_out = glm.max( a1.value,  a2.value);
    let ends = maybe_vec2( glm.vec2( a_in,  a_out),  a1.exists || a2.exists);
    let tube = get_distances_along_3d_line_to_infinite_cylinder( A0,  A,  B1,  B,  r);
    let cylinder = get_distances_along_line_to_intersection( tube,  ends);
    // TODO: do we need this line?
    let entrance = glm.max( tube.value.y,  a_in);
    let exit = glm.min( tube.value.x,  a_out);
    return maybe_vec2( glm.vec2( entrance,  exit),  tube.exists && entrance < exit);
}

/*
A0 line reference
A  line direction, normalized
B1 capsule endpoint 1
B2 capsule endpoing 2
r  capsule radius
*/
/*maybe_vec2*/
function get_distances_along_3d_line_to_capsule(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B1,
     /*vec3*/ B2,
     /*float*/ r
){
    let cylinder = get_distances_along_3d_line_to_cylinder( A0,  A,  B1,  B2,  r);
    let sphere1 = get_distances_along_3d_line_to_sphere( A0,  A,  B1,  r);
    let sphere2 = get_distances_along_3d_line_to_sphere( A0,  A,  B2,  r);
    let spheres = get_distances_along_line_to_union( sphere1,  sphere2);
    let capsule = get_distances_along_line_to_union( spheres,  cylinder);
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
/*maybe_vec2*/
function get_distances_along_3d_line_to_ring(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B1,
     /*vec3*/ B2,
     /*float*/ ro,
     /*float*/ ri
){
    let outer = get_distances_along_3d_line_to_cylinder( A0,  A,  B1,  B2,  ro);
    let inner = get_distances_along_3d_line_to_cylinder( A0,  A,  B1,  B2,  ri);
    let ring = get_distances_along_line_to_negation( outer,  inner);
    return ring;
}

/*
A0 line reference
A  line direction, normalized
B0 cone vertex
B  cone direction, normalized
cosb cosine of cone half angle
*/
/*maybe_float*/
function get_distance_along_3d_line_to_infinite_cone(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ B,
     /*float*/ cosb
){
    let D = A0['-']( B0);
    let a = glm.dot( A,  B) * glm.dot( A,  B) - cosb * cosb;
    let b = 2. * (glm.dot( A,  B) * glm.dot( D,  B) - glm.dot( A,  D) * cosb * cosb);
    let c = glm.dot( D,  B) * glm.dot( D,  B) - glm.dot( D,  D) * cosb * cosb;
    let det = b * b - 4. * a * c;
    if (det < 0.){
        return maybe_float( 0.0,  false);
    }

    det = glm.sqrt( det);
    let t1 = (-b - det) / (2. * a);
    let t2 = (-b + det) / (2. * a);
    // This is a bit messy; there ought to be a more elegant solution.
    let t = t1;
    if (t < 0. || t2 > 0. && t2 < t){
        t = t2;
    }
    else {
        t = t1;
    }

    let cp = A0['+']( (A['*']( t))['-']( B0));
    let h = glm.dot( cp,  B);
    return maybe_float( t,  t > 0. && h > 0.);
}

/*
A0 line reference
A  line direction, normalized
B0 cone vertex
B  cone direction, normalized
r  cone radius
h  cone height
*/
/*maybe_float*/
function get_distance_along_3d_line_to_cone(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B0,
     /*vec3*/ B,
     /*float*/ r,
     /*float*/ h
){
    let end = get_distance_along_3d_line_to_circle( A0,  A,  B0['+']( B['*']( h)),  B,  r);
    let cone = get_distance_along_3d_line_to_infinite_cone( A0,  A,  B0,  B,  Math.cos( Math.atan( r / h)));
    cone.exists = cone.exists && glm.dot( A0['+']( (A['*']( cone.value))['-']( B0)),  B) <= h;
    cone = get_distance_along_line_to_union( end,  cone);
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
/*maybe_float*/
function get_distance_along_3d_line_to_capped_cone(
     /*vec3*/ A0,
     /*vec3*/ A,
     /*vec3*/ B1,
     /*vec3*/ B2,
     /*float*/ r1,
     /*float*/ r2
){
    let dh = glm.length( B2['-']( B1));
    let dr = r2 - r1;
    let rmax = glm.max( r2,  r1);
    let rmin = glm.min( r2,  r1);
    let hmax = rmax * dr / dh;
    let hmin = rmin * dr / dh;
    let B = glm.normalize( B2['-']( B1))['*']( glm.sign( dr));
    let Bmax = (r2 > r1? B2 : B1);
    let B0 = Bmax['-']( B['*']( hmax));
    let Bmin = Bmax['-']( B['*']( hmin));
    let end1 = get_distance_along_3d_line_to_circle( A0,  A,  Bmax,  B,  rmax);
    let end2 = get_distance_along_3d_line_to_circle( A0,  A,  Bmin,  B,  rmin);
    let cone = get_distance_along_3d_line_to_infinite_cone( A0,  A,  B0,  B,  Math.cos( Math.atan( rmax / hmax)));
    let c_h = glm.dot( A0['+']( (A['*']( cone.value))['-']( B0)),  B);
    cone.exists = cone.exists && hmin <= c_h && c_h <= hmax;
    cone = get_distance_along_line_to_union( cone,  end1);
    cone = get_distance_along_line_to_union( cone,  end2);
    return cone;
}

const SPEED_OF_LIGHT = 299792.458 * METER / SECOND;
const BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER * METER * KELVIN * KELVIN * KELVIN * KELVIN);
const PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
/*float*/
function solve_fraction_of_light_emitted_by_black_body_below_wavelength(
     /*float*/ wavelength,
     /*float*/ temperature
){
    const iterations = 2.;
    const h = PLANCK_CONSTANT;
    const k = BOLTZMANN_CONSTANT;
    const c = SPEED_OF_LIGHT;
    let L = wavelength;
    let T = temperature;
    let C2 = h * c / k;
    let z = C2 / (L * T);
    let z2 = z * z;
    let z3 = z2 * z;
    let sum = 0.;
    let n2 = 0.;
    let n3 = 0.;
    for (let n = 1.; n <= iterations; n++) {
        n2 = n * n;
        n3 = n2 * n;
        sum += (z3 + 3. * z2 / n + 6. * z / n2 + 6. / n3) * Math.exp( -n * z) / n;
    }

    return 15. * sum / (PI * PI * PI * PI);
}

/*float*/
function solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
     /*float*/ lo,
     /*float*/ hi,
     /*float*/ temperature
){
    return solve_fraction_of_light_emitted_by_black_body_below_wavelength( hi,  temperature) - solve_fraction_of_light_emitted_by_black_body_below_wavelength( lo,  temperature);
}

// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
/*float*/
function get_intensity_of_light_emitted_by_black_body(
     /*float*/ temperature
){
    let T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T * T * T * T;
}

/*vec3*/
function solve_rgb_intensity_of_light_emitted_by_black_body(
     /*float*/ temperature
){
    return glm.vec3( solve_fraction_of_light_emitted_by_black_body_between_wavelengths( 600e-9 * METER,  700e-9 * METER,  temperature),  solve_fraction_of_light_emitted_by_black_body_between_wavelengths( 500e-9 * METER,  600e-9 * METER,  temperature),  solve_fraction_of_light_emitted_by_black_body_between_wavelengths( 400e-9 * METER,  500e-9 * METER,  temperature))['*']( get_intensity_of_light_emitted_by_black_body( temperature));
}

// Rayleigh phase function factor [-1, 1]
/*float*/
function get_fraction_of_rayleigh_scattered_light_scattered_by_angle(
     /*float*/ cos_scatter_angle
){
    return 3. * (1. + cos_scatter_angle * cos_scatter_angle) / //------------------------
                (16. * PI);
}

// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
/*float*/
function get_fraction_of_mie_scattered_light_scattered_by_angle(
     /*float*/ cos_scatter_angle
){
    const g = 0.76;
    return (1. - g * g) / //---------------------------------------------
        ((4. + PI) * Math.pow( 1. + g * g - 2. * g * cos_scatter_angle,  1.5));
}

// Schlick's fast approximation to the Henyey-Greenstein phase function factor
// Pharr and  Humphreys [2004] equivalence to g above
/*float*/
function approx_fraction_of_mie_scattered_light_scattered_by_angle_fast(
     /*float*/ cos_scatter_angle
){
    const g = 0.76;
    const k = 1.55 * g - 0.55 * (g * g * g);
    return (1. - k * k) / //-------------------------------------------
        (4. * PI * (1. + k * cos_scatter_angle) * (1. + k * cos_scatter_angle));
}

/*
"get_fraction_of_microfacets_accessible_to_ray" is Schlick's fast approximation for Smith's function
  see Hoffmann 2015 for a gentle introduction to the concept
  see Schlick (1994) for even more details.
*/
/*float*/
function get_fraction_of_microfacets_accessible_to_ray(
     /*float*/ cos_view_angle,
     /*float*/ root_mean_slope_squared
){
    let m = root_mean_slope_squared;
    let v = cos_view_angle;
    // float k = m/2.0; return 2.0*v/(v+sqrt(m*m+(1.0-m*m)*v*v)); // Schlick-GGX
    let k = m * glm.sqrt( 2. / PI);
    return v / (v * (1.0 - k) + k);
    // Schlick-Beckmann
}

/*
"get_fraction_of_microfacets_with_angle" 
  This is also known as the Beckmann Surface Normal Distribution Function.
  This is the probability of finding a microfacet whose surface normal deviates from the average by a certain angle.
  see Hoffmann 2015 for a gentle introduction to the concept.
  see Schlick (1994) for even more details.
*/
/*float*/
function get_fraction_of_microfacets_with_angle(
     /*float*/ cos_angle_of_deviation,
     /*float*/ root_mean_slope_squared
){
    let m = root_mean_slope_squared;
    let t = cos_angle_of_deviation;
    let m2 = m * m;
    let t2 = t * t;
    let u = t2 * (m2 - 1.0) + 1.0;
    return m2 / (PI * u * u);
    //return exp((t*t-1.)/max(m*m*t*t, 0.1))/max(PI*m*m*t*t*t*t, 0.1);
}

/*
"get_fraction_of_light_reflected_from_facet_head_on" finds the fraction of light that's reflected
  by a boundary between materials when striking head on.
  It is also known as the "characteristic reflectance" within the fresnel reflectance equation.
  The refractive indices can be provided as parameters in any order.
*/
/*float*/
function get_fraction_of_light_reflected_from_facet_head_on(
     /*float*/ refractivate_index1,
     /*float*/ refractivate_index2
){
    let n1 = refractivate_index1;
    let n2 = refractivate_index2;
    let sqrtF0 = ((n1 - n2) / (n1 + n2));
    let F0 = sqrtF0 * sqrtF0;
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
/*vec3*/
function get_rgb_fraction_of_light_reflected_from_facet(
     /*float*/ cos_incident_angle,
     /*vec3*/ characteristic_reflectance
){
    let F0 = characteristic_reflectance;
    let _1_u = 1. - cos_incident_angle;
    return F0['+']( ((F0['-']( 1.)))['*']( _1_u * _1_u * _1_u * _1_u * _1_u));
}

/*
"get_fraction_of_light_reflected_from_material" is a fast approximation to the Cook-Torrance Specular BRDF.
  It is the fraction of light that reflects from a material to the viewer.
  see Hoffmann 2015 for a gentle introduction to the concept
*/
/*vec3*/
function get_fraction_of_light_reflected_from_material(
     /*float*/ NL,
     /*float*/ NH,
     /*float*/ NV,
     /*float*/ HV,
     /*float*/ root_mean_slope_squared,
     /*vec3*/ characteristic_reflectance
){
    let m = root_mean_slope_squared;
    let F0 = characteristic_reflectance;
    return ((((get_rgb_fraction_of_light_reflected_from_facet( HV,  F0)['/']( glm.max( 4. * PI * NV * NL,  0.001)))['*']( get_fraction_of_microfacets_accessible_to_ray( NV,  m)))['*']( get_fraction_of_microfacets_with_angle( NH,  m)))['*']( get_fraction_of_microfacets_accessible_to_ray( NL,  m)))['*']( 1.0);
}

/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
/*vec3*/
function get_rgb_signal_of_wavelength(
     /*float*/ w
){
    return glm.vec3( bump( w,  530e-9,  690e-9,  1.00) + bump( w,  410e-9,  460e-9,  0.15),  bump( w,  465e-9,  635e-9,  0.75) + bump( w,  420e-9,  700e-9,  0.15),  bump( w,  400e-9,  570e-9,  0.45) + bump( w,  570e-9,  625e-9,  0.30));
}

/*
"GAMMA" is the constant that's used to map between 
rgb signals sent to a monitor and their actual intensity
*/
const GAMMA = 2.2;
/* 
This function returns a rgb vector that quickly approximates a spectral "bump".
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
/*vec3*/
function get_rgb_intensity_of_rgb_signal(
     /*vec3*/ signal
){
    return glm.vec3( Math.pow( signal.x,  GAMMA),  Math.pow( signal.y,  GAMMA),  Math.pow( signal.z,  GAMMA));
}

/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
/*vec3*/
function get_rgb_signal_of_rgb_intensity(
     /*vec3*/ intensity
){
    return glm.vec3( Math.pow( intensity.x,  1. / GAMMA),  Math.pow( intensity.y,  1. / GAMMA),  Math.pow( intensity.z,  1. / GAMMA));
}

/*vec3*/
function get_rgb_fraction_of_light_transmitted_through_ocean(
     /*float*/ cos_incident_angle,
     /*float*/ fluid_depth,
     /*vec3*/ beta_ray,
     /*vec3*/ beta_mie,
     /*vec3*/ beta_abs
){
    let sigma = fluid_depth / glm.max( cos_incident_angle,  0.001);
    return Math.exp( ((beta_ray['+']( beta_mie['+']( beta_abs))))['*']( -sigma));
}

/*vec3*/
function get_rgb_intensity_of_light_scattered_by_ocean(
     /*float*/ cos_view_angle,
     /*float*/ cos_light_angle,
     /*float*/ cos_scatter_angle,
     /*float*/ fluid_depth,
     /*vec3*/ refracted_light_rgb_intensity,
     /*vec3*/ beta_ray,
     /*vec3*/ beta_mie,
     /*vec3*/ beta_abs
){
    let NV = cos_view_angle;
    let NL = cos_light_angle;
    let VL = cos_scatter_angle;
    let I = refracted_light_rgb_intensity;
    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    let gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle( VL);
    let gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle( VL);
    let beta_gamma = (beta_ray['*']( gamma_ray))['+']( beta_mie['*']( gamma_mie));
    let beta_sum = beta_ray['+']( beta_mie['+']( beta_abs));
    // "sigma_v" is the column density, relative to the surface, that's along the view ray.
    // "sigma_l" is the column density, relative to the surface, that's along the light ray.
    // "sigma_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within ocean
    let sigma_v = fluid_depth / NV;
    let sigma_l = fluid_depth / NL;
    let sigma_ratio = 1. + NV / glm.max( NL,  0.001);
    return I['*']( beta_gamma['*']( ((Math.exp( (beta_sum['*']( sigma_ratio))['*']( -sigma_v))['-']( 1.)))['/']( (beta_sum['*']( sigma_ratio)))));
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
/*float*/
function approx_air_column_density_ratio_through_atmosphere(
     /*float*/ a,
     /*float*/ b,
     /*float*/ z2,
     /*float*/ r0
){
    // GUIDE TO VARIABLE NAMES:
    //  "x*" distance along the ray from closest approach
    //  "z*" distance from the center of the world at closest approach
    //  "r*" distance ("radius") from the center of the world
    //  "*0" variable at reference point
    //  "*2" the square of a variable
    //  "ch" a nudge we give to prevent division by zero, analogous to the Chapman function
    const SQRT_HALF_PI = glm.sqrt( PI / 2.);
    const k = 0.6;
    // "k" is an empirically derived constant
    let x0 = glm.sqrt( glm.max( r0 * r0 - z2,  SMALL));
    // if obstructed by the world, approximate answer by using a ludicrously large number
    if (a < x0 && -x0 < b && z2 < r0 * r0){
        return BIG;
    }

    let abs_a = glm.abs( a);
    let abs_b = glm.abs( b);
    let z = glm.sqrt( z2);
    let sqrt_z = glm.sqrt( z);
    let ra = glm.sqrt( a * a + z2);
    let rb = glm.sqrt( b * b + z2);
    let ch0 = (1. - 1. / (2. * r0)) * SQRT_HALF_PI * sqrt_z + k * x0;
    let cha = (1. - 1. / (2. * ra)) * SQRT_HALF_PI * sqrt_z + k * abs_a;
    let chb = (1. - 1. / (2. * rb)) * SQRT_HALF_PI * sqrt_z + k * abs_b;
    let s0 = glm.min( Math.exp( r0 - z),  1.) / (x0 / r0 + 1. / ch0);
    let sa = Math.exp( r0 - ra) / glm.max( abs_a / ra + 1. / cha,  0.01);
    let sb = Math.exp( r0 - rb) / glm.max( abs_b / rb + 1. / chb,  0.01);
    return glm.max( glm.sign( b) * (s0 - sb) - glm.sign( a) * (s0 - sa),  0.0);
}

/*vec3*/
function get_rgb_fraction_of_light_transmitted_through_atmosphere(
     /*vec3*/ view_origin,
     /*vec3*/ view_direction,
     /*float*/ view_start_length,
     /*float*/ view_stop_length,
     /*vec3*/ world_position,
     /*float*/ world_radius,
     /*float*/ atmosphere_scale_height,
     /*vec3*/ beta_ray,
     /*vec3*/ beta_mie,
     /*vec3*/ beta_abs
){
    let h = atmosphere_scale_height;
    let r = world_radius / h;
    let V0 = ((view_origin['+']( (view_direction['*']( view_start_length))['-']( world_position))))['/']( h);
    let V1 = ((view_origin['+']( (view_direction['*']( view_stop_length))['-']( world_position))))['/']( h);
    let V = view_direction;
    // unit vector pointing to pixel being viewed
    let v0 = glm.dot( V0,  V);
    let v1 = glm.dot( V1,  V);
    let zv2 = glm.dot( V0,  V0) - v0 * v0;
    let beta_sum = ((beta_ray['+']( beta_mie['+']( beta_abs))))['*']( h);
    let sigma = approx_air_column_density_ratio_through_atmosphere( v0,  v1,  zv2,  r);
    return Math.exp( beta_sum['*']( -sigma));
}

// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
/*vec3*/
function get_rgb_fraction_of_distant_light_scattered_by_atmosphere(
     /*vec3*/ view_origin,
     /*vec3*/ view_direction,
     /*float*/ view_start_length,
     /*float*/ view_stop_length,
     /*vec3*/ world_position,
     /*float*/ world_radius,
     /*vec3*/ light_direction,
     /*float*/ atmosphere_scale_height,
     /*vec3*/ beta_ray,
     /*vec3*/ beta_mie,
     /*vec3*/ beta_abs
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
    let h = atmosphere_scale_height;
    let r = world_radius / h;
    let V0 = ((view_origin['+']( (view_direction['*']( view_start_length))['-']( world_position))))['/']( h);
    let V1 = ((view_origin['+']( (view_direction['*']( view_stop_length))['-']( world_position))))['/']( h);
    let V = view_direction;
    // unit vector pointing to pixel being viewed
    let v0 = glm.dot( V0,  V);
    let v1 = glm.dot( V1,  V);
    let L = light_direction;
    // unit vector pointing to light source
    let VL = glm.dot( V,  L);
    // "gamma_*" indicates the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine, A.K.A. "VL").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    let gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle( VL);
    let gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle( VL);
    // "beta_*" indicates the rest of the fractional loss.
    // it is dependant on wavelength, and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    let beta_sum = ((beta_ray['+']( beta_mie['+']( beta_abs))))['*']( h);
    let beta_gamma = (((beta_ray['*']( gamma_ray))['+']( beta_mie['*']( gamma_mie))))['*']( h);
    // number of iterations within the raymarch
    const STEP_COUNT = 6.;
    let dv = (v1 - v0) / STEP_COUNT;
    let vi = v0;
    let dl = dv * VL;
    let li = glm.dot( V0,  L);
    let y = glm.dot( V0,  glm.normalize( glm.cross( V,  L)));
    let y2 = y * y;
    let zv2 = glm.dot( V0,  V0) - y2 - v0 * v0;
    let zl2 = 0.0;
    let sigma;
    // columnar density encountered along the entire path, relative to surface density, effectively the distance along the surface needed to obtain a similar column density
    let F = glm.vec3( 0);
    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    for (let i = 0.; i < STEP_COUNT; ++i) {
        zl2 = vi * vi + zv2 - li * li;
        sigma = approx_air_column_density_ratio_through_atmosphere( v0,  vi,  y2 + zv2,  r) + approx_air_column_density_ratio_through_atmosphere( li,  3. * r,  y2 + zl2,  r);
        F += Math.exp( ((beta_sum['*']( sigma))['-']( glm.sqrt( vi * vi + y2 + zv2)))['-']( r))['*']( beta_gamma['*']( dv));
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


