#define GL_ES
#include "precompiled/shaders/cross_platform_macros.glsl.c"
#include "precompiled/shaders/academics/geometry.glsl.c"
#include "precompiled/shaders/academics/optics.glsl.c"


varying vec2  vUv;
uniform float aspect_ratio;
uniform float field_of_view;
uniform sampler2D surface_light;

// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;

// position of the camera, using reference_distance
uniform vec3  camera_position;
// position on which the camera is focusing, using reference_distance
uniform vec3  camera_focus;

// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3  world_position;
// radius of the world being rendered, in meters
uniform float world_radius;

//TODO: turn these into uniforms!
// temperature of the star, in kelvin
const float star_temperature = SOLAR_TEMPERATURE;
// location for the center of the star, in meters
const vec3  star_position    = vec3(1, 0, 0);
// total power output of the star
const   float star_luminosity  = SOLAR_LUMINOSITY;

// scattering coefficients at sea level, in meters
// we use vec3 to represent rgb color channels
const vec3 betaR = vec3(5.5e-6, 13.0e-6, 22.4e-6); // Rayleigh 
const vec3 betaM = vec3(21e-6); // Mie

// scale height (m)
// thickness of the atmosphere if its density were uniform
// we use a vec2: x is rayleigh scattering, y is mie scattering
const vec2 scale_heights = vec2(7994, 1200);

// maximum number of samples we alot ourselves for a single pixel
// considers samples taken across all stars
const int SAMPLE_BUDGET = 128;

const int SAMPLE_COUNT = 16;
const int SAMPLE_COUNT_LIGHT = 8;


void get_ray_for_pixel(
	IN (vec2)  screenspace,
	IN (float) aspect_ratio,
	IN (float) field_of_view, // NOTE: this is in radians, as with all angles! 
	IN (vec3)  camera_position,
	IN (vec3)  camera_direction,
	OUT(vec3)  ray_origin,
	OUT(vec3)  ray_direction
){
	// TODO: figure out how this code works and annotate it better
    vec2 clipspace = 2.0 * screenspace - 1.0;
	vec2 camera_local_point = vec2(clipspace * vec2(aspect_ratio, 1.) * tan(field_of_view));

	vec3 fwd = camera_direction;
	vec3 up = vec3(0, 1, 0);
	vec3 right = cross(up, fwd);
	up = cross(fwd, right);

	ray_origin    = camera_position;
	ray_direction = normalize(fwd + up * camera_local_point.y + right * camera_local_point.x);
}

void main() {

	vec4 surface_color = texture2D( surface_light, vUv );

	vec3 camera_direction = normalize(camera_position - camera_focus);

	vec3 ray_origin; 
	vec3 ray_direction;
	get_ray_for_pixel(
		vUv, aspect_ratio, field_of_view, 
		camera_position,   camera_direction, 
		ray_origin,        ray_direction 
	); 
	// ray_origin *= reference_distance;
		
	float atmosphere_height = 3. * max(scale_heights.x, scale_heights.y);

	// Determine relevant metrics for calculating optical depth.
	float distance_at_closest_approach2, distance_to_closest_approach;
	float distance_to_entrance, distance_to_exit;
	bool is_interaction = try_get_relation_between_ray_and_sphere(
		camera_position,   ray_direction,
		vec3(0), 1.,
		distance_at_closest_approach2, distance_to_closest_approach, 
		distance_to_entrance, distance_to_exit
	);

	if (!is_interaction) {
		gl_FragColor = vec4(0);
		return;
	} else {
		gl_FragColor = mix(surface_color, vec4(normalize(ray_direction),1), 0.5);// surface_color;
	}

	// NOTES:
	// solids are modeled as a gas where attenuation coefficient is super high
	// space is   modeled as a gas where attenuation coefficient is super low
}
