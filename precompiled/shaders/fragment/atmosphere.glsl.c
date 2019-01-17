#define GL_ES
#include "precompiled/shaders/academics/cross_platform_macros.glsl.c"
#include "precompiled/shaders/academics/units.glsl.c"
#include "precompiled/shaders/academics/math/constants.glsl.c"
#include "precompiled/shaders/academics/math/geometry.glsl.c"
#include "precompiled/shaders/academics/physics/constants.glsl.c"
#include "precompiled/shaders/academics/physics/emission.glsl.c"
#include "precompiled/shaders/academics/physics/scattering.glsl.c"
#include "precompiled/shaders/academics/psychophysics.glsl.c"
#include "precompiled/shaders/academics/electronics.glsl.c"


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
const float star_luminosity  = SOLAR_LUMINOSITY;

// scattering coefficients at sea level, in meters
// we use vec3 to represent rgb color channels
const vec3 betaR = vec3(5.5e-6, 13.0e-6, 22.4e-6); // Rayleigh 
const vec3 betaM = vec3(21e-6); // Mie

// scale height (m)
// thickness of the atmosphere if its density were uniform
// we use a vec2: x is rayleigh scattering, y is mie scattering
const vec2 scale_heights = vec2(7994, 1200);

vec3 get_rgb_intensity_of_light_ray_through_atmosphere(
	vec3 view_origin, vec3 view_direction,
	vec3 world_position, float world_radius,
	vec3 light_direction, vec3 light_rgb_intensity,
	vec3 background_rgb_intensity,
	vec2 atmosphere_scale_heights

){

	// NOTE: 3 scale heights should capture ~95% of the atmosphere's mass, 
	//   so this should be enough to be aesthetically appealing.
	float atmosphere_height = 3. * max(atmosphere_scale_heights.x, atmosphere_scale_heights.y);

	float view_r_closest2; 					// distance ("radius") from the view ray to the center of the world at closest approach, squared; never used, but may in the future
	float view_x_closest;					// distance along the view ray at which closest approach occurs; never used, but may in the future
	float view_x_enter;    					// distance along the view ray at which the ray enters the atmosphere, never used
	float view_x_exit;						// distance along the view ray at which the ray exits the atmosphere

	const float VIEW_MARCH_STEP_COUNT = 16.;// number of steps taken while marching along the view ray
	float view_march_dx;					// distance between steps while marching along the view ray
	float view_march_x;						// distance traversed while marching along the view ray
	float view_march_h;						// distance ("height") from the surface of the world while marching along the view ray
	vec3  view_march_pos;					// absolute position while marching along the view ray

	float light_r_closest2; 				// distance ("radius") from the light ray to the center of the world at closest approach, squared; never used, but may in the future
	float light_x_closest;					// distance along the light ray at which closest approach occurs; never used, but may in the future
	float light_x_enter;					// distance along the light ray at which the ray enters the atmosphere; never used
	float light_x_exit;						// distance along the light ray at which the ray exits the atmosphere

	const float LIGHT_MARCH_STEP_COUNT = 8.;// number of steps taken while marching along the light ray
	float light_march_dx;					// distance between steps while marching along the light ray
	float light_march_x;					// distance traversed while marching along the light ray
	float light_march_h;					// distance ("height") from the surface of the world while marching along the light ray
	vec3  light_march_pos=  vec3(0);		// absolute position while marching along the light ray

	bool is_interaction = try_get_relation_between_ray_and_sphere(
		view_origin,     view_direction,
		world_position,  world_radius + atmosphere_height,
		view_r_closest2, view_x_closest, 
		view_x_enter,    view_x_exit 
	);

	view_march_dx = (view_x_exit - view_x_enter) / VIEW_MARCH_STEP_COUNT;
	view_march_x  =  view_x_enter + 0.5 * view_march_dx;

	for (float i = 0.; i < VIEW_MARCH_STEP_COUNT; ++i)
	{
		view_march_pos = view_origin + view_direction * view_march_x;
		view_march_h   = length(view_march_pos - world_position) - world_radius;


		// NOTE: we do not capture the return value since at this point we're always guaranteed to be in the atmosphere
		try_get_relation_between_ray_and_sphere( 
			view_march_pos,  light_direction,
			world_position,  world_radius + atmosphere_height,
			light_r_closest2,light_x_closest, 
			light_x_enter,   light_x_exit 
		);

	    light_march_dx = light_x_exit / LIGHT_MARCH_STEP_COUNT;
		light_march_x  = 0.5 * light_march_dx;

		for (float j = 0.; j < LIGHT_MARCH_STEP_COUNT; ++j)
		{
			light_march_pos = view_march_pos + light_direction * light_march_x;
			light_march_h   = length(light_march_pos - world_position) - world_radius;



			light_march_x += light_march_dx;
		}

		view_march_x += view_march_dx;
	}

	return vec3(0);
}

void main() {

	vec4 surface_color = texture2D( surface_light, vUv );

	vec2 screenspace   = vUv;
    vec2 clipspace     = 2.0 * screenspace - 1.0;
	vec3 ray_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
	vec3 ray_origin    = view_matrix_inverse[3].xyz * reference_distance;

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
	// if (!is_interaction) {
	// 	gl_FragColor = vec4(0);
	// 	return;
	// } 
	// gl_FragColor = mix(surface_color, vec4(normalize(ray_origin),1), 0.5);
	gl_FragColor = mix(surface_color, vec4(vec3(distance_to_exit/reference_distance/5.),1), 0.5);
	// gl_FragColor = surface_color;


	// NOTES:
	// solids are modeled as a gas where attenuation coefficient is super high
	// space is   modeled as a gas where attenuation coefficient is super low
}
