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

vec3 get_density_ratios_at_height_in_atmosphere(
	float height, 
	vec3 atmosphere_scale_heights
){
	return exp(-height/atmosphere_scale_heights);
}

vec3 get_rgb_intensity_of_light_ray_through_atmosphere(
	vec3 view_origin, vec3 view_direction,
	vec3 world_position, float world_radius,
	vec3 light_direction, vec3 light_rgb_intensity,
	vec3 background_rgb_intensity,
	vec3 atmosphere_scale_heights,
	vec3 beta_ray,
	vec3 beta_mie,
	vec3 beta_abs
){

	float unused1, unused2, unused3, unused4;


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
	vec3  view_sigma;		  // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface

	bool  light_is_obscured;  // whether light ray will strike the surface of a world
	bool  light_is_obstructed;// whether light ray will strike the surface of a world
	float light_r_closest2;   // distance ("radius") from the light ray to the center of the world at closest approach, squared; never used, but may in the future
	float light_x_closest;	  // distance along the light ray at which closest approach occurs; never used, but may in the future
	float light_x_enter;	  // distance along the light ray at which the ray enters the atmosphere; never used
	float light_x_exit;		  // distance along the light ray at which the ray exits the atmosphere
	float light_x_strike;	  // distance along the light ray at which the ray strikes the surface of the world

	const float light_STEP_COUNT = 8.;// number of steps taken while marching along the light ray
	float light_dx;			  // distance between steps while marching along the light ray
	float light_x;			  // distance traversed while marching along the light ray
	float light_h;			  // distance ("height") from the surface of the world while marching along the light ray
	vec3  light_pos; 		  // absolute position while marching along the light ray
	vec3  light_sigma;		  // columnar density ratios for rayleigh and mie scattering, found by marching along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface


	// cosine of angle between view and light directions
	float cos_scatter_angle = dot(view_direction, light_direction); 

	// fraction of outgoing light transmitted across a given path
	vec3 fraction_outgoing = vec3(0);

	// fraction of incoming light transmitted across a given path
	vec3 fraction_incoming   = vec3(0);

	// total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
	vec3  total_rgb_intensity = vec3(0); 

	// Rayleigh and Mie phase factors,
	// A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
	// This factor indicates the fraction of sunlight scattered to a given angle (indicated by its cosine, A.K.A. "cos_scatter_angle").
	// It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
	// The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
	// and the density ratio, which is dependant on height
	// So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
	float gamma_ray = get_rayleigh_phase_factor(cos_scatter_angle);
	float gamma_mie = get_henyey_greenstein_phase_factor(cos_scatter_angle);
	float gamma_abs = 0.; // NOT USED YET

	// NOTE: 3 scale heights should capture ~95% of the atmosphere's mass,  
	//   so this should be enough to be aesthetically appealing.
	float atmosphere_height = 10. * max(atmosphere_scale_heights.x, atmosphere_scale_heights.y);

	view_is_obscured   = try_get_relation_between_ray_and_sphere(
		view_origin,     view_direction,
		world_position,  world_radius + atmosphere_height,
		unused1,         unused2, 
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
	view_sigma = vec3(0.);

	for (float i = 0.; i < VIEW_STEP_COUNT; ++i)
	{
		view_pos = view_origin + view_direction * view_x;
		view_h   = length(view_pos - world_position) - world_radius;

		view_sigma += view_dx * exp(-light_h/atmosphere_scale_heights);

		if (!view_is_obscured)
		{
			continue;
		}

		light_is_obscured = try_get_relation_between_ray_and_sphere( 
			view_pos,        light_direction,
			world_position,  world_radius + atmosphere_height,
			light_r_closest2,light_x_closest, 
			light_x_enter,   light_x_exit 
		);
		light_is_obstructed = try_get_relation_between_ray_and_sphere( 
			view_pos,        light_direction,
			world_position,  world_radius,
			unused1,         unused2,
			unused3,         unused4
		);

		// check if light will eventually intersect with the ground
		if (light_is_obstructed)
		{
			// continue;
		}

	    light_dx = light_x_exit / light_STEP_COUNT;
		light_x  = 0.5 * light_dx;
		light_sigma = vec3(0.);

		for (float j = 0.; j < light_STEP_COUNT; ++j)
		{
			light_pos = view_pos + light_direction * light_x;
			light_h   = length(light_pos - world_position) - world_radius;

			light_sigma += light_dx * exp(-light_h/atmosphere_scale_heights);

			light_x += light_dx;
		}

		fraction_outgoing    = exp(-beta_ray * (view_sigma.x + light_sigma.x) - beta_abs * view_sigma.z);
		fraction_incoming    = beta_ray * gamma_ray * view_dx * exp(-view_h/atmosphere_scale_heights.x);
		total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;

		fraction_outgoing    = exp(-beta_mie * (view_sigma.y + light_sigma.y) - beta_abs * view_sigma.z);
		fraction_incoming    = beta_mie * gamma_mie * view_dx* exp(-view_h/atmosphere_scale_heights.y);
		total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;

		view_x += view_dx;
	}

	//// now calculate intensity of light that traveled straight in from the background, and add it to the total
	fraction_outgoing = exp(-beta_abs * (view_sigma.z));
	total_rgb_intensity += background_rgb_intensity * fraction_outgoing;

	return total_rgb_intensity;
}

//TODO: turn these into uniforms!
const float light_temperature =  SOLAR_TEMPERATURE;
const vec3  light_position = vec3(ASTRONOMICAL_UNIT,0,0);
const float surface_gravity = 9.8*METER/(SECOND*SECOND);
const float average_molecular_mass_of_air = 4.8e-26 * KILOGRAM;
const float molecular_mass_of_water_vapor = 3.0e-26 * KILOGRAM;
const float atmosphere_temperature = 25. + STANDARD_TEMPERATURE;
const vec3 atmosphere_scale_heights = vec3(
	BOLTZMANN_CONSTANT * atmosphere_temperature / (surface_gravity * average_molecular_mass_of_air),  // ~14km
	BOLTZMANN_CONSTANT * atmosphere_temperature / (surface_gravity * molecular_mass_of_water_vapor),  // ~9km
	0 // NOTE: NOT USED
);
const vec3 atmosphere_surface_densities = vec3(
	1.217*KILOGRAM * (1.0 - 1.2e15/5.1e18), // earth's surface density times fraction of atmosphere that is not water vapor (by mass)
	1.217*KILOGRAM * (      1.2e15/5.1e18), // earth's surface density times fraction of atmosphere that is water vapor (by mass)
	0 // NOTE: NOT USED, intended to eventually represent absorption
);
void main() {
	vec2  screenspace   = vUv;
    vec2  clipspace     = 2.0 * screenspace - 1.0;
	vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
	vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;

	vec3  light_offset    = light_position - world_position;
	vec3  light_direction = normalize(light_offset);
	float light_distance  = length(light_offset);
	vec3  light_rgb_intensity = 
		  get_black_body_emissive_flux(SOLAR_TEMPERATURE)
		* get_surface_area_of_sphere(SOLAR_RADIUS) / get_surface_area_of_sphere(light_distance)
		* vec3(
			solve_black_body_fraction_between_wavelengths(600e-9*METER, 700e-9*METER, SOLAR_TEMPERATURE),
			solve_black_body_fraction_between_wavelengths(500e-9*METER, 600e-9*METER, SOLAR_TEMPERATURE),
			solve_black_body_fraction_between_wavelengths(400e-9*METER, 500e-9*METER, SOLAR_TEMPERATURE)
		  );

	float AESTHETIC_FACTOR1 = 0.3;
	vec4  background_rgb_signal    = texture2D( surface_light, vUv );
	vec3  background_rgb_intensity = AESTHETIC_FACTOR1 * light_rgb_intensity * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
		
	vec3 rgb_intensity = get_rgb_intensity_of_light_ray_through_atmosphere(
		view_origin,                view_direction,
		world_position,             world_radius,
		light_direction,            light_rgb_intensity,  // light direction and rgb intensity
		background_rgb_intensity,
		atmosphere_scale_heights,
		vec3(5.20e-6, 1.21e-5, 2.96e-5), // atmospheric scattering coefficients for the surface
		vec3(2.1e-9),
		vec3(0.)
	);

	// rgb_intensity = 1.0 - exp2( rgb_intensity * -1.0 ); // simple tonemap







	// gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_direction),1), 0.5);
	// return;
	// if (!is_interaction) {
	// 	gl_FragColor = vec4(0);
	// 	return;
	// } 
	// gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_origin),1), 0.5);
	// gl_FragColor = mix(background_rgb_signal, vec4(vec3(distance_to_exit/reference_distance/5.),1), 0.5);
	// gl_FragColor = mix(background_rgb_signal, vec4(10.0*get_rgb_signal_of_rgb_intensity(rgb_intensity),1), 0.5);
	float AESTHETIC_FACTOR2 = 0.1;
	gl_FragColor = vec4(AESTHETIC_FACTOR2*get_rgb_signal_of_rgb_intensity(rgb_intensity),1);
	// gl_FragColor = background_rgb_signal;


	// NOTES:
	// solids are modeled as a gas where attenuation coefficient is super high
	// space is   modeled as a gas where attenuation coefficient is super low
}
