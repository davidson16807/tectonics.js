#include "precompiled/shaders/academics/optics.glsl.c"

uniform sampler2D surface_light;
varying vec2 	vUv;

// minimum viable product:
// we need to support multiple lights, since we need to render average insolation across millions of years
uniform float 	star_temperature;
uniform vec3 	star_offset;

// TODO: convert this to meters
// minimum viable product:
// support only one world, that being the model's focus
const vec3 		world_pos = vec3(0, 0, 0);
const float 	world_radius = 1.0; //6360e3 * METER;
const float 	atmosphere_radius = 6420e3/6360e3;// * METER;

// scattering coefficients at sea level (m)
const vec3 betaR = vec3(5.5e-6, 13.0e-6, 22.4e-6); // Rayleigh 
const vec3 betaM = vec3(21e-6); // Mie

// scale height (m)
// thickness of the atmosphere if its density were uniform
const float hR = 7994.0; // Rayleigh
const float hM = 1200.0; // Mie

vec3 sun_dir = vec3(0, 1, 0);
const float sun_power = 20.0;

const int num_samples = 16;
const int num_samples_light = 8;

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

void get_ray_for_pixel(
	vec2 fragment_coordinates,
	vec2 resolution,
	float field_of_view,
	vec3 camera_origin,
	vec3 camera_direction,
	out vec3 ray_origin,
	out vec3 ray_direction
){
	// TODO: figure out how this code works and annotate it better
	vec2 aspect_ratio = vec2(resolution.x / resolution.y, 1);
	float tan_field_of_view_ratio = tan(radians(field_of_view));
	vec2 point_ndc = fragment_coordinates.xy / resolution.xy;
	vec3 camera_local_point = vec3((2.0 * point_ndc - 1.0) * aspect_ratio * tan_field_of_view_ratio, -1.0);

	vec3 fwd = camera_direction;
	vec3 up = vec3(0, 1, 0);
	vec3 right = cross(up, fwd);
	up = cross(fwd, right);

	ray_origin    = camera_origin;
	ray_direction = normalize(fwd + up * camera_local_point.y + right * camera_local_point.x);
}

void main() {

	vec4 surface_color = texture2D( surface_light, vUv );
	gl_FragColor = surface_color;

	// get_ray_for_pixel()
	// try_get_ray_and_sphere_intersection_distances()
	// for each sample:
	//     try_get_ray_and_sphere_intersection_distances()

	// NOTES:
	// solids are modeled as a gas where attenuation coefficient is super high
	// space is   modeled as a gas where attenuation coefficient is super low
}