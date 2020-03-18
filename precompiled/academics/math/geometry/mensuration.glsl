
/*
MENSURATION
this file contains functions for finding perimeters, areas, 
surface areas, and volumes of primitive shapes
*/

float get_perimeter_of_circle(
    in float radius
) {
    return 2.*PI*radius;
}
float get_area_of_circle(
    in float radius
) {
    return PI*radius*radius;
}
float get_perimeter_of_triangle(
    in vec2 vertex1,
    in vec2 vertex2,
    in vec2 vertex3
) {
    return length(vertex1-vertex2) + length(vertex2-vertex3) + length(vertex3-vertex1);
}
float get_area_of_triangle(
    in vec2 vertex1,
    in vec2 vertex2,
    in vec2 vertex3
) {
    // half the magnitude of the cross product
    return 0.5f * abs((vertex1.x*(vertex2.y-vertex3.y) + vertex2.x*(vertex3.y-vertex1.y)+ vertex3.x*(vertex1.y-vertex2.y)));
}
float get_surface_area_of_sphere(
    in float radius
) {
    return 4.*PI*radius*radius;
}
float get_volume_of_sphere(
    in float radius
) {
    return 4./3.*PI*radius*radius*radius;
}
float get_surface_area_of_tetrahedron(
    in vec3 vertex1,
    in vec3 vertex2,
    in vec3 vertex3,
    in vec3 vertex4
) {
    // each face is half the magnitude of the cross product
    return 0.5f * (
        length(cross(vertex1-vertex2, vertex1-vertex3)) + 
        length(cross(vertex1-vertex2, vertex1-vertex4)) +
        length(cross(vertex1-vertex3, vertex1-vertex4)) +
        length(cross(vertex2-vertex3, vertex2-vertex4)) 
    );
}
float get_volume_of_tetrahedron(
    in vec3 vertex1,
    in vec3 vertex2,
    in vec3 vertex3,
    in vec3 vertex4
) {
    // 1/6 the volume of a parallelipiped, which is the scalar triple product of its edges
    return dot(cross(vertex1-vertex2, vertex1-vertex3), vertex1-vertex4) / 6.f;
}
