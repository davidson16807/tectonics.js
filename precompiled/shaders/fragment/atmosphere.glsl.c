#define GL_ES
#include "precompiled/shaders/cross_platform_macros.glsl.c"
#include "precompiled/shaders/academics/geometry.glsl.c"
#include "precompiled/shaders/academics/optics.glsl.c"


varying vec2  vUv;
uniform sampler2D surface_light;

// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;

uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;

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



void main() {

	vec4 surface_color = texture2D( surface_light, vUv );

	vec2 screenspace   = vUv;
    vec2 clipspace     = 2.0 * screenspace - 1.0;
	vec3 ray_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
	vec3 ray_origin    = view_matrix_inverse[3].xyz * reference_distance;

	// ray_origin ;
		
	// NOTE: 3 scale heights should capture 95% of the atmosphere's mass, 
	//   enough to be aesthetically appealing.
	float atmosphere_height = 3. * max(scale_heights.x, scale_heights.y);

	// Determine relevant metrics for calculating optical depth.
	float distance_at_closest_approach2, distance_to_closest_approach;
	float distance_to_entrance, distance_to_exit;
	bool is_interaction = try_get_relation_between_ray_and_sphere(
		ray_origin,     ray_direction,
		world_position, world_radius + atmosphere_height,
		distance_at_closest_approach2, distance_to_closest_approach, 
		distance_to_entrance, distance_to_exit
	);


	// gl_FragColor = mix(surface_color, vec4(normalize(ray_direction),1), 0.5);
	// return;
	if (!is_interaction) {
		gl_FragColor = vec4(0);
		return;
	} else {
		// gl_FragColor = vec4(1);
		gl_FragColor = mix(surface_color, vec4(normalize(ray_origin),1), 0.5);// surface_color;
	}

	// NOTES:
	// solids are modeled as a gas where attenuation coefficient is super high
	// space is   modeled as a gas where attenuation coefficient is super low
}
