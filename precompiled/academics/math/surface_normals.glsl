
/*
A1 vertex 1 position
A2 vertex 2 position
A3 vertex 3 position
*/
vec3 get_surface_normal_of_triangle( in vec3 A1, in vec3 A2, in vec3 A3 )
{
    return normalize( cross(A2-A1, A3-A1) );
}
/*
A0 point position
B0 sphere origin
r  radius
*/
vec3 get_surface_normal_of_point_near_sphere( in vec3 A0, in vec3 B0, in float r )
{
    return normalize( A0-B0 );
}
/*
A0 point position
B0 ellipsoid center
R  ellipsoid radius along each coordinate axis
*/
vec3 guess_surface_normal_of_point_near_ellipsoid(in vec3 A0, in vec3 B0, in vec3 R)
{
    vec3  V  = A0-B0;
    return normalize( V/R );
}
/*
A0 point position
B0 cylinder reference
B  cylinder direction, normalized
*/
vec3 get_surface_normal_of_point_near_infinite_cylinder( in vec3 A0, in vec3 B0, in vec3 B )
{
    // INTUITION: equivalent to the normalized vector rejection
    vec3 D = A0-B0;
    return normalize( D - B*dot(D, B) );
}
/*
A0 point position
B1 cylinder endpoint 1
B2 cylinder endpoing 2
*/
vec3 get_surface_normal_of_point_near_cylinder( in vec3 A0, in vec3 B1, in vec3 B2 )
{
    vec3 D = A0-B1;
    vec3 B = normalize(B2-B1);
    float DB = dot(D,B);
    return 0.f < DB? -B : DB < length(D)? B : normalize( D-B*DB );
}
