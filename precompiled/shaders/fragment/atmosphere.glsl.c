#define GL_ES
#include "precompiled/shaders/academics/cross_platform_macros.glsl.c"
#include "precompiled/shaders/academics/units.glsl.c"
#include "precompiled/shaders/academics/math/constants.glsl.c"
#include "precompiled/shaders/academics/math/geometry.glsl.c"
#include "precompiled/shaders/academics/physics/constants.glsl.c"
#include "precompiled/shaders/academics/physics/emission.glsl.c"
#include "precompiled/shaders/academics/physics/scattering.glsl.c"
#include "precompiled/shaders/academics/raymarching.glsl.c"
#include "precompiled/shaders/academics/psychophysics.glsl.c"
#include "precompiled/shaders/academics/electronics.glsl.c"


varying vec2  vUv;
uniform sampler2D surface_light;

// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;

// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;

// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3  world_position;
// radius of the world being rendered, in meters
uniform float world_radius;

// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3  light_rgb_intensity;
uniform vec3  light_direction;
uniform float insolation_max;

// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3  atmosphere_surface_rayleigh_scattering_coefficients; 
uniform vec3  atmosphere_surface_mie_scattering_coefficients; 
uniform vec3  atmosphere_surface_absorption_coefficients; 


bool isnan(float x)
{
	return !(0. <= x || x <= 0.);
}
bool isbig(float x)
{
	return abs(x)>BIG;
}

vec3 get_rgb_intensity_of_light_rays_through_atmosphere(
    vec3  view_origin, vec3 view_direction,
    vec3  world_position, float world_radius,
    vec3  light_direction, vec3 light_rgb_intensity,
    vec3  background_rgb_intensity,
    float atmosphere_scale_height,
    vec3  beta_ray,
    vec3  beta_mie,
    vec3  beta_abs
){

    float unused1, unused2, unused3, unused4; // used for passing unused output parameters to functions

    const float VIEW_STEP_COUNT = 16.;// number of steps taken while marching along the view ray

    bool  view_is_scattered;  // whether view ray will enter the atmosphere
    bool  view_is_obstructed; // whether view ray will enter the surface of a world
    float view_z2;            // distance ("radius") from the view ray to the center of the world at closest approach, squared
    float view_x_z;           // distance along the view ray at which closest approach occurs
    float view_x_enter_atmo;  // distance along the view ray at which the ray enters the atmosphere
    float view_x_exit_atmo;   // distance along the view ray at which the ray exits the atmosphere
    float view_x_enter_world; // distance along the view ray at which the ray enters the surface of the world
    float view_x_exit_world;  // distance along the view ray at which the ray enters the surface of the world
    float view_x_start;       // distance along the view ray at which scattering starts, either because it's the start of the ray or the start of the atmosphere 
    float view_x_stop;        // distance along the view ray at which scattering no longer occurs, either due to hitting the world or leaving the atmosphere
    
    float view_dx;            // distance between steps while marching along the view ray
    float view_x;             // distance traversed while marching along the view ray
    float view_sigma;         // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface

    vec3  light_origin;       // absolute position while marching along the view ray
    float light_h;            // distance ("height") from the surface of the world while marching along the view ray
    float light_sigma;        // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface

    // NOTE: "12." is the number of scale heights needed to reach the official edge of space on Earth.
    float atmosphere_height = 12. * atmosphere_scale_height;

    // "atmosphere_radius" is the distance from the center of the world to the top of the atmosphere
    float atmosphere_radius = world_radius + atmosphere_height;

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

    get_relation_between_ray_and_point(
		world_position, 
    	view_origin,        view_direction, 
		view_z2,			view_x_z 
	);
    view_is_scattered   = try_get_relation_between_ray_and_sphere(
        atmosphere_radius,
        view_z2,            view_x_z, 
        view_x_enter_atmo,  view_x_exit_atmo
    );
    view_is_obstructed = try_get_relation_between_ray_and_sphere(
        world_radius,
        view_z2,            view_x_z,
        view_x_enter_world, view_x_exit_world 
    );

    // if view ray does not interact with the atmosphere
    // don't bother running the raymarch algorithm
    if (!view_is_scattered)
    {
    	return background_rgb_intensity;
    }
    
	view_x_start = max(view_x_enter_atmo, 0.);
    view_x_stop  = view_is_obstructed? view_x_enter_world : view_x_exit_atmo;
    view_dx = (view_x_stop - view_x_start) / VIEW_STEP_COUNT;
    view_x  =  view_x_start + 0.5 * view_dx;

    for (float i = 0.; i < VIEW_STEP_COUNT; ++i)
    {
        light_origin = view_origin + view_direction * view_x;
        light_h      = get_height_along_ray_over_world(view_x-view_x_z, view_z2, world_radius);

    	view_sigma  = approx_air_column_density_ratio_along_ray (
			light_origin,  -view_direction,
			world_position, world_radius, atmosphere_scale_height
		);

    	light_sigma  = approx_air_column_density_ratio_along_ray (
			light_origin,   light_direction,
			world_position, world_radius, atmosphere_scale_height
		);

        total_rgb_intensity += light_rgb_intensity
        	// outgoing fraction: the fraction of light that scatters away from camera
        	* exp(-(beta_ray + beta_mie + beta_abs) * (view_sigma + light_sigma))
	        // incoming fraction: the fraction of light that scatters towards camera
	        * view_dx * exp(-light_h/atmosphere_scale_height) * (beta_ray * gamma_ray + beta_mie * gamma_mie);

        view_x += view_dx;
    }

    // now calculate the intensity of light that traveled straight in from the background, and add it to the total
    total_rgb_intensity += background_rgb_intensity 
        // outgoing fraction: the fraction of light that would travel straight towards camera, but gets diverted
    	* exp(-(beta_ray + beta_mie + beta_abs) * view_sigma);

    return total_rgb_intensity;
}

vec2 get_chartspace(vec2 bottomleft, vec2 topright, vec2 screenspace){
    return screenspace * abs(topright - bottomleft) + bottomleft;
}

vec3 line(float y, vec2 chartspace, float line_width, vec3 line_color){
    return abs(y-chartspace.y) < line_width? line_color : vec3(1.);
}

vec3 chart_scratch(vec2 screenspace){
    vec2 bottomleft = vec2(-500e3, -100e3);
    vec2 topright   = vec2( 500e3,  100e3);
    vec2 chartspace = get_chartspace(bottomleft, topright, screenspace);
    float line_width = 0.01 * abs(topright - bottomleft).y;
    float y = chartspace.x;

    return line(y,   chartspace, line_width, vec3(1,0,0));
}

void main() {
    vec2  screenspace   = vUv;

    // gl_FragColor = vec4(chart_scratch(screenspace), 1);
    // return;

    vec2  clipspace     = 2.0 * screenspace - 1.0;
    vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;

    float AESTHETIC_FACTOR1 = 0.5;
    vec4  background_rgb_signal    = texture2D( surface_light, vUv );
    vec3  background_rgb_intensity = AESTHETIC_FACTOR1 * insolation_max * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
        
    vec3 rgb_intensity = get_rgb_intensity_of_light_rays_through_atmosphere(
        view_origin,                view_direction,
        world_position,             world_radius,
        light_direction,            light_rgb_intensity,  // light direction and rgb intensity
        background_rgb_intensity,
        atmosphere_scale_height,
        atmosphere_surface_rayleigh_scattering_coefficients, 
        atmosphere_surface_mie_scattering_coefficients, 
        atmosphere_surface_absorption_coefficients 
    );

    // rgb_intensity = 1.0 - exp2( rgb_intensity * -1.0 ); // simple tonemap

    // gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_direction),1), 0.5);
    // return;
    // if (!is_interaction) {
    //  gl_FragColor = vec4(0);
    //  return;
    // } 
    // gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_origin),1), 0.5);
    // gl_FragColor = mix(background_rgb_signal, vec4(vec3(distance_to_exit/reference_distance/5.),1), 0.5);
    // gl_FragColor = mix(background_rgb_signal, vec4(10.0*get_rgb_signal_of_rgb_intensity(rgb_intensity),1), 0.5);
    float AESTHETIC_FACTOR2 = 0.1;
    gl_FragColor = vec4(AESTHETIC_FACTOR2*get_rgb_signal_of_rgb_intensity(rgb_intensity),1);
    // gl_FragColor = background_rgb_signal;
}
