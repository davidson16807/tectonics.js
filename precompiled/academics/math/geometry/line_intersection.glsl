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
             !shape1.exists ? shape2.value.y  : !shape2.exists ? shape1.value.y  : max(shape1.value.y,  shape2.value.y )),
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
    float exit     = !negative.exists ? positive.value.y : min(negative.value.x, positive.value.y);
    // if the first region is behind us, find the second region
    if (exit < 0. && 0. < positive.value.y)
    {
        entrance = negative.value.y;
        exit     = positive.value.y;
    }
    return maybe_vec2( vec2(entrance, exit), exists );
}


maybe_vec2 get_distances_along_line_to_intersection(
    in maybe_vec2 shape1,
    in maybe_vec2 shape2
) {
    float x = shape1.exists && shape2.exists ? max(shape1.value.x, shape2.value.x) : 0.0;
    float y  = shape1.exists && shape2.exists ? min(shape1.value.y,  shape2.value.y ) : 0.0;
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
    hit = get_distance_along_line_to_union(hit,  hit3);
    hit = get_distance_along_line_to_union(hit,  hit4);
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
    float entrance = max(tube.value.y,  a_in);
    float exit     = min(tube.value.x, a_out);
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
    maybe_vec2 ring  = get_distances_along_line_to_negation(outer, inner);
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
