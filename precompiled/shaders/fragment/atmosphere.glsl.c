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


vec3 get_rgb_intensity_of_sun_ray_through_atmosphere(
	vec3 view_origin, vec3 view_direction,
	vec3 world_position, float world_radius,
	vec3 sun_direction, vec3 sun_rgb_intensity,
	vec3 background_rgb_intensity,
	vec2 atmosphere_scale_heights,
	vec2 atmosphere_surface_densities,
	mat3 atmosphere_mass_scattering_coefficients
){

	// NOTE: 3 scale heights should capture ~95% of the atmosphere's mass,  
	//   so this should be enough to be aesthetically appealing.
	float atmosphere_height = 4. * max(atmosphere_scale_heights.x, atmosphere_scale_heights.y);

	bool  view_is_obscured;   // whether view ray will strike the surface of a world
	bool  view_is_obstructed; // whether view ray will strike the surface of a world
	float view_r_closest2;	  // distance ("radius") from the view ray to the center of the world at closest approach, squared; never used, but may in the future
	float view_x_closest;	  // distance along the view ray at which closest approach occurs; never used, but may in the future
	float view_x_enter;   	  // distance along the view ray at which the ray enters the atmosphere, never used
	float view_x_exit;		  // distance along the view ray at which the ray exits the atmosphere
	float view_x_strike;	  // distance along the view ray at which the ray strikes the surface of the world

	const float VIEW_STEP_COUNT = 16.;// number of steps taken while marching along the view ray
	float view_dx;			  // distance between steps while marching along the view ray
	float view_x;			  // distance traversed while marching along the view ray
	float view_h;			  // distance ("height") from the surface of the world while marching along the view ray
	vec3  view_pos;			  // absolute position while marching along the view ray
	vec2  view_sigma;		  // column densities for rayleigh and mie scattering, expressed as a ratio to surface density, found by marching along the view ray

	bool  sun_is_obscured;    // whether light ray will strike the surface of a world
	bool  sun_is_obstructed;  // whether light ray will strike the surface of a world
	float sun_r_closest2;     // distance ("radius") from the light ray to the center of the world at closest approach, squared; never used, but may in the future
	float sun_x_closest;	  // distance along the light ray at which closest approach occurs; never used, but may in the future
	float sun_x_enter;	      // distance along the light ray at which the ray enters the atmosphere; never used
	float sun_x_exit;		  // distance along the light ray at which the ray exits the atmosphere
	float sun_x_strike;	      // distance along the light ray at which the ray strikes the surface of the world

	const float sun_STEP_COUNT = 8.;// number of steps taken while marching along the light ray
	float sun_dx;			  // distance between steps while marching along the light ray
	float sun_x;			  // distance traversed while marching along the light ray
	float sun_h;			  // distance ("height") from the surface of the world while marching along the light ray
	vec3  sun_pos; 		      // absolute position while marching along the light ray
	vec2  sun_sigma;		  // column densities for rayleigh and mie scattering, expressed as a ratio to surface density, found by marching along the light ray

	vec2  path_T;             // transmittance of light while marching from the view to the light source

	float unused1, unused2, unused3, unused4;

	view_is_obscured   = try_get_relation_between_ray_and_sphere(
		view_origin,     view_direction,
		world_position,  world_radius + atmosphere_height,
		view_r_closest2, view_x_closest, 
		view_x_enter,    view_x_exit
	);
	view_is_obstructed = try_get_relation_between_ray_and_sphere(
		view_origin,     view_direction,
		world_position,  world_radius,
		unused1,         unused2,
		view_x_strike,   unused3 
	);

	if (view_is_obstructed)
	{
		view_x_exit = view_x_strike;
	}

	view_dx = (view_x_exit - view_x_enter) / VIEW_STEP_COUNT;
	view_x  =  view_x_enter + 0.5 * view_dx;
	view_sigma = vec2(0.);

	for (float i = 0.; i < VIEW_STEP_COUNT; ++i)
	{
		view_pos = view_origin + view_direction * view_x;
		view_h   = length(view_pos - world_position) - world_radius;

		view_sigma += view_dx * atmosphere_surface_densities * exp(-sun_h/atmosphere_scale_heights);

		sun_is_obscured = try_get_relation_between_ray_and_sphere( 
			view_pos,        sun_direction,
			world_position,  world_radius + atmosphere_height,
			sun_r_closest2,  sun_x_closest, 
			sun_x_enter,     sun_x_exit 
		);
		sun_is_obstructed = try_get_relation_between_ray_and_sphere( 
			view_pos,        sun_direction,
			world_position,  world_radius,
			unused1,         unused2,
			unused3,         unused4
		);

		// check if light will eventually intersect with the ground
		if (sun_is_obstructed)
		{
			continue;
		}

	    sun_dx = sun_x_exit / sun_STEP_COUNT;
		sun_x  = 0.5 * sun_dx;
		sun_sigma = vec2(0.);

		for (float j = 0.; j < sun_STEP_COUNT; ++j)
		{
			sun_pos = view_pos + sun_direction * sun_x;
			sun_h   = length(sun_pos - world_position) - world_radius;

			sun_sigma += sun_dx * atmosphere_surface_densities * exp(-sun_h/atmosphere_scale_heights);

			sun_x += sun_dx;
		}

		path_T += exp(-(view_sigma + sun_sigma));

		view_x += view_dx;
	}

	return vec3(path_T.x + path_T.y, path_T.y, path_T.y);
}

//TODO: turn these into uniforms!
const float sun_temperature =  SOLAR_TEMPERATURE;
const vec3  sun_position = vec3(ASTRONOMICAL_UNIT,0,0);
const float surface_gravity = 9.8*METER/(SECOND*SECOND);
const float average_molecular_mass_of_air = 4.8e-26 * KILOGRAM;
const float molecular_mass_of_water_vapor = 3.0e-26 * KILOGRAM;
const float atmosphere_temperature = 25. + STANDARD_TEMPERATURE;
const vec2 atmosphere_scale_heights = vec2(
	BOLTZMANN_CONSTANT * atmosphere_temperature / (surface_gravity * average_molecular_mass_of_air),    // ~14km
	BOLTZMANN_CONSTANT * atmosphere_temperature / (surface_gravity * molecular_mass_of_water_vapor)  // ~9km
);
const vec2 atmosphere_surface_densities = vec2(
	1.217*KILOGRAM * (1.0 - 1.2e15/5.1e18), // earth's surface density times fraction of atmosphere that is not water vapor (by mass)
	1.217*KILOGRAM * (      1.2e15/5.1e18)  // earth's surface density times fraction of atmosphere that is water vapor (by mass)
);
const mat3 atmosphere_mass_scattering_coefficients = mat3(
	// NOTE: lovingly stolen from Valentine Galena, here: https://www.shadertoy.com/view/XtBXDz
	vec3(5.5e-6, 13.0e-6, 22.4e-6),
	vec3(21e-6),
	vec3(0) // NOTE: NOT USED
);
void main() {

	vec4  surface_color = texture2D( surface_light, vUv );

	vec2  screenspace   = vUv;
    vec2  clipspace     = 2.0 * screenspace - 1.0;
	vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
	vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;

	vec3  sun_offset    = sun_position - world_position;
	vec3  sun_direction = normalize(sun_offset);
	float sun_distance  = length(sun_offset);
	vec3  sun_rgb_intensity = 
		  get_black_body_emissive_flux(SOLAR_TEMPERATURE)
		* get_surface_area_of_sphere(SOLAR_RADIUS) / get_surface_area_of_sphere(sun_distance)
		* vec3(
			solve_black_body_fraction_between_wavelengths(600e-9*METER, 700e-9*METER, SOLAR_TEMPERATURE),
			solve_black_body_fraction_between_wavelengths(500e-9*METER, 600e-9*METER, SOLAR_TEMPERATURE),
			solve_black_body_fraction_between_wavelengths(400e-9*METER, 500e-9*METER, SOLAR_TEMPERATURE)
		  );
		
	vec3 rgb_intensity = get_rgb_intensity_of_sun_ray_through_atmosphere(
		view_origin,                view_direction,
		world_position,             world_radius,
		sun_direction,             sun_rgb_intensity,  // light direction and rgb intensity
		surface_color.xyz,
		atmosphere_scale_heights,
		atmosphere_surface_densities,  // atmosphere surface density, kilograms
		atmosphere_mass_scattering_coefficients // atmosphere mass scattering coefficient
	);








	// gl_FragColor = mix(surface_color, vec4(normalize(view_direction),1), 0.5);
	// return;
	// if (!is_interaction) {
	// 	gl_FragColor = vec4(0);
	// 	return;
	// } 
	// gl_FragColor = mix(surface_color, vec4(normalize(view_origin),1), 0.5);
	// gl_FragColor = mix(surface_color, vec4(vec3(distance_to_exit/reference_distance/5.),1), 0.5);
	gl_FragColor = mix(surface_color, vec4(1.*get_rgb_signal_of_rgb_intensity(rgb_intensity),1), 0.5);
	// gl_FragColor = surface_color;


	// NOTES:
	// solids are modeled as a gas where attenuation coefficient is super high
	// space is   modeled as a gas where attenuation coefficient is super low
}
