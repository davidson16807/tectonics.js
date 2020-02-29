
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
    vec3  V  = A0-B0;
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
