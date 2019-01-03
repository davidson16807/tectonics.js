#include "precompiled/shaders/academics/optics.glsl.c"

uniform sampler2D surface_light;
varying vec2 	vUv;

// minimum viable product:
// we need to support multiple lights, since we need to render average insolation across millions of years
uniform float 	star_temperature;
uniform vec3 	star_offset;

// minimum viable product:
// support only one world, that being the model's focus
uniform vec3 	world_pos;
uniform float 	world_radius;
uniform float 	world_atmospheric_height;


// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
bool try_get_ray_and_sphere_intersection_distances(
		vec3  ray_origin, 
		vec3  ray_direction, // NOTE: this must be a normalized vector!
		vec3  sphere_origin, 
		float sphere_radius, 
		out float entrance_distance, 
		out float exit_distance
	)
{
	// Find the vector projection (AKA "location of closest approach")
	// and the vector rejection (AKA "distance of closest approach")
	vec3 sphere_offset = sphere_origin - ray_origin;
	float sphere_radius2 = sphere_radius * sphere_radius;
	float ray_projection = 
		dot(sphere_offset, ray_direction);
	float ray_rejection2 =  
		dot(sphere_offset, sphere_offset) - ray_projection * ray_projection;
	// If the vector rejection is further out than 
	if (ray_rejection2 > sphere_radius2) return false;

	// Now use the pythagorean theorem 
	float intersection_distance = sqrt(sphere_radius2 - ray_rejection2);
	entrance_distance = ray_projection - intersection_distance;
	exit_distance     = ray_projection + intersection_distance;

	return true;
}

void main() {
	vec4 surface_color = texture2D( surface_light, vUv );
	gl_FragColor = surface_color;
}