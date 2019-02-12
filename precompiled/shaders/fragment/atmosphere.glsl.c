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
uniform vec3 light_rgb_intensity;
uniform vec3 light_direction;

// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3  atmosphere_surface_rayleigh_scattering_coefficients; 
uniform vec3  atmosphere_surface_mie_scattering_coefficients; 
uniform vec3  atmosphere_surface_absorption_coefficients; 


const float BIG = 1e50;
bool isnan(float x)
{
	return !(0. <= x || x <= 0.);
}
bool isbig(float x)
{
	return abs(x)>BIG;
}

// "get_h" gets the altitude at a point along the path
//   for a ray traveling through the atmosphere.
// NOTE: all input distances are relative to the world's center!
float get_h(float x, float z2, float R){
    return sqrt(max(x*x + z2, 0.)) - R;
}
// "get_dhdx" gets the rate at which altitude changes for a distance traveled along the path
//   for a ray traveling through the atmosphere.
// NOTE: all input distances are relative to the world's center!
float get_dhdx(float x, float z2){
    return x / sqrt(max(x*x + z2, 0.));
}
// "get_rho" gets the density ratio of an altitude within the atmosphere
// the "density ratio" is density expressed as a fraction of a surface value
float get_rho(
    float h, 
    float H
){
    return exp(-h/H);
}
// "approx_sigma_from_samples" returns an approximation 
//   for the columnar density ratio encountered by a ray traveling through the atmosphere.
// It is the integral of get_rho() along the path of the ray, 
//   taking into account the altitude at every point along the path.
// We can't solve the integral in the usual fashion due to singularities
//   (see https://www.wolframalpha.com/input/?i=integrate+exp(-sqrt(x%5E2%2Bz%5E2)%2FH)+dx)
//   so we use a linear approximation for the altitude.
// Our linear approximation gets its slope and intercept from sampling
//   at points along the path (xm and xb respectively)
// NOTE: all input distances are relative to the world's center!
float approx_sigma_from_samples(float x, float xm, float xb, float z2, float R, float H){
	float m = get_dhdx(xm,z2);
	float b = get_h(xb,z2,R);
	float h = m*(x-xb) + b;
    return -H/m * exp(-h/H);
}
// "approx_sigma_for_segment" is a convenience wrapper for approx_sigma_from_samples(), 
//   which calculates sensible values of xm and xb for the user 
//   given a specified range around which the approximation must be valid.
// The range is indicated by its lower bounds (xmin) and width (dx).
// NOTE: all input distances are relative to the world's center!
float approx_sigma_for_segment(float x, float xmin, float dx, float z2, float R, float H){
    const float fm = 0.5;
    const float fb = 0.2;

    float xm   = xmin + fm*dx;
    float xb   = xmin + fb*dx;
    float xmax = xmin +    dx;

    return approx_sigma_from_samples(clamp(x, xmin, xmax), xm, xb, z2,R,H);
}
// "approx_sigma_for_absx" is a convenience wrapper for approx_sigma_for_segment().
// It returns a approximation of columnar density ratio encountered from 
//   the surface of a world to a given upper bound.
// Unlike approx_sigma_from_samples() and approx_sigma_for_segment(), 
//   it should be appropriate for any value of x, no matter if it's positive or negative.
// It does this by making two linear approximations for height:
//   one for the lower atmosphere, one for the upper atmosphere.
// These are represented by the two call outs to approx_sigma_for_segment().
// "x" is the distance along the ray from the surface of the world to the upper bound,
//   or from the closest approach to the upper bound, if there is no intersection.
// "xtop" is the distance along the ray from closest approach to the the top of the atmosphere.
// "xR" is the distance along the ray from closest approach to the the surface of the world,
//   or "0." if there is no intersection.
// "sigma0" is the columnar density ratio generated by this equation at x=0,
//   it is used to express values for columnar density ratio relative to the surface of the world.
// "z2" is the closest distance from the ray to the center of the world, squared.
// NOTE: all input distances are relative to xR!
float approx_sigma_for_absx(float x, float xtop, float xR, float sigma0, float z2, float R, float H){
	// "nH" is the number of scale heights at which we encounter the "top" of the atmosphere.
    const float nH = 12.0;
    // "dx" is the width of the bounds covered by our linear approximations
    float dx = xtop/3.;
    // "absx" is the absolute value of x
    float absx = abs(x);

    return
        approx_sigma_for_segment(xR+absx, xR,    dx, z2,R,H) +
        approx_sigma_for_segment(xR+absx, xR+dx, dx, z2,R,H) -
        sigma0;
}
// "approx_sigma0" is a convenience wrapper for approx_sigma_for_absx().
// It returns a value for sigma0 that can be passed to approx_sigma().
float approx_sigma0(float xtop, float xR, float z2, float R, float H){
    return approx_sigma_for_absx(0., xtop, xR, 0., z2, R, H);
}
// "approx_sigma" is a convenience wrapper for approx_sigma_for_absx().
// It returns a approximation of columnar density ratio that should be appropriate for any value of x.
float approx_sigma(float x, float xtop, float xR, float sigma0, float z2, float R, float H){
    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return sign(x) * min(approx_sigma_for_absx(x, xtop, xR, sigma0, z2, R, H), BIG);
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

    float unused1, unused2, unused3, unused4;


    bool  view_is_scattered;  // whether view ray will enter the atmosphere
    bool  view_is_obstructed; // whether view ray will enter the surface of a world
    float view_z2;            // distance ("radius") from the view ray to the center of the world at closest approach, squared
    float view_x_z;           // distance along the view ray at which closest approach occurs
    float view_x_enter_atmo;  // distance along the view ray at which the ray enters the atmosphere
    float view_x_exit_atmo;   // distance along the view ray at which the ray exits the atmosphere
    float view_x_enter_world; // distance along the view ray at which the ray enters the surface of the world

    const float VIEW_STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    float view_dx;            // distance between steps while marching along the view ray
    float view_x;             // distance traversed while marching along the view ray
    float view_h;             // distance ("height") from the surface of the world while marching along the view ray
    float view_sigma;         // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface
    vec3  view_pos;           // absolute position while marching along the view ray

    bool  light_is_scattered; // whether light ray will enter the atmosphere
    bool  light_is_obstructed;// whether light ray will enter the surface of a world
    float light_z2;           // distance ("radius") from the light ray to the center of the world at closest approach, squared
    float light_x_z;          // distance along the light ray from start to where closest approach occurs
    float light_x_enter_atmo; // distance along the light ray from start to where the ray enters the atmosphere
    float light_x_enter_world;// distance along the light ray from start to where the ray enters the surface of the world
    float light_x_exit_atmo;  // distance along the light ray from start to where the ray exits the atmosphere
    float light_x_exit_world; // distance along the light ray from start to where the ray would exit the world, if it could pass through
    float light_sigma;        // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface
    float light_sigma0;       // reference columnar density ratio for the light ray. This is used to calculate an approximation for the true column density ratio.

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
    float gamma_abs = 0.; // NOT USED YET

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
        view_x_enter_world, unused3 
    );

    // if view does not interact with the atmosphere, 
    // do not bother running the raymarch algorithm
    if (!view_is_scattered)
    {
    	return background_rgb_intensity;
    }

    if (view_is_obstructed)
    {
        view_x_exit_atmo = view_x_enter_world;
    }

    view_dx = (view_x_exit_atmo - view_x_enter_atmo) / VIEW_STEP_COUNT;
    view_x  =  view_x_enter_atmo + 0.5 * view_dx;
    view_sigma = 0.;

    for (float i = 0.; i < VIEW_STEP_COUNT; ++i)
    {
        view_pos = view_origin + view_direction * view_x;
        view_h   = length(view_pos - world_position) - world_radius;

        // If sample point lies inside the planet, 
        //   then no light past this point will ever reach the camera.
        // NOTE: please consider this line if checking for multiple light sources 
        //   within the same viewray raymarching loop, since it could cause insidious problems
        if (view_h < 0.)
        {
            break;
        }

        view_sigma += view_dx * exp(-view_h/atmosphere_scale_height);

	    get_relation_between_ray_and_point(
			world_position, 
	    	view_pos,       light_direction, 
			light_z2,		light_x_z 
		);
        light_is_scattered = try_get_relation_between_ray_and_sphere( 
            world_radius + atmosphere_height,
			light_z2,		light_x_z,
            unused1,		light_x_exit_atmo 
        );
        light_is_obstructed = try_get_relation_between_ray_and_sphere( 
            world_radius,
			light_z2,		light_x_z,
            unused3,		light_x_exit_world
        );

        if (light_is_obstructed)
        {
            continue;
        }

        light_sigma0 = 
            approx_sigma0(                                       light_x_exit_atmo -light_x_exit_world, light_x_exit_world -light_x_z,               light_z2, world_radius, atmosphere_scale_height);
        // REMEMBER: all values for x passed to approx_sigma() are 
        //   distances relative to the *surface*
        light_sigma = 
            approx_sigma( light_x_exit_atmo -light_x_exit_world, light_x_exit_atmo -light_x_exit_world, light_x_exit_world -light_x_z, light_sigma0, light_z2, world_radius, atmosphere_scale_height)-
            approx_sigma(                   -light_x_exit_world, light_x_exit_atmo -light_x_exit_world, light_x_exit_world -light_x_z, light_sigma0, light_z2, world_radius, atmosphere_scale_height);

        fraction_outgoing    = exp(-beta_ray * (view_sigma + light_sigma) - beta_abs * view_sigma);
        fraction_incoming    = beta_ray * gamma_ray * view_dx * exp(-view_h/atmosphere_scale_height);
        total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;

        fraction_outgoing    = exp(-beta_mie * (view_sigma + light_sigma) - beta_abs * view_sigma);
        fraction_incoming    = beta_mie * gamma_mie * view_dx* exp(-view_h/atmosphere_scale_height);
        total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;

        view_x += view_dx;
    }

    //// now calculate intensity of light that traveled straight in from the background, and add it to the total
    fraction_outgoing = exp(-beta_abs * view_sigma);
    total_rgb_intensity += background_rgb_intensity * fraction_outgoing;

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

    float z = 6.35e6;
    float z2 = z*z;
    float light_x_enter_world = sqrt(max(world_radius*world_radius - z2, 0.));
    float light_x_enter_atmo = sqrt(max((world_radius+12.*atmosphere_scale_height)*(world_radius+12.*atmosphere_scale_height) - z2, 0.));
    float sigma0 = approx_sigma0(light_x_enter_atmo, light_x_enter_world, z2, world_radius, atmosphere_scale_height);
    float closed_form_approximation = approx_sigma(chartspace.x, light_x_enter_atmo, light_x_enter_world, sigma0, z2, world_radius, atmosphere_scale_height);

    const float LIGHT_STEP_COUNT = 8.;
    float light_dx = (chartspace.x) / LIGHT_STEP_COUNT;
    float light_x  = 0.5 * light_dx;
    float light_h = 0.;
    float iterative_approximation = 0.;
    for (float j = 0.; j < LIGHT_STEP_COUNT; ++j)
    {
        light_h = sqrt((light_x+light_x_enter_world)*(light_x+light_x_enter_world) + z2) - world_radius;

        iterative_approximation += light_dx * exp(-light_h/atmosphere_scale_height);

        light_x += light_dx;
    }

    return 
        line(iterative_approximation,   chartspace, line_width, vec3(1,0,0)) * 
        line(closed_form_approximation, chartspace, line_width, vec3(0,1,0));
}

void main() {
    vec2  screenspace   = vUv;
    gl_FragColor = vec4(chart_scratch(screenspace), 1);
    // return;

    vec2  clipspace     = 2.0 * screenspace - 1.0;
    vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;

    float AESTHETIC_FACTOR1 = 0.5;
    vec4  background_rgb_signal    = texture2D( surface_light, vUv );
    vec3  background_rgb_intensity = AESTHETIC_FACTOR1 * light_rgb_intensity * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
        
    vec3 rgb_intensity = get_rgb_intensity_of_light_rays_through_atmosphere(
        view_origin,                view_direction,
        world_position,             world_radius,
        light_direction,            light_rgb_intensity,  // light direction and rgb intensity
        background_rgb_intensity,
        atmosphere_scale_height,
        atmosphere_surface_rayleigh_scattering_coefficients, 
        atmosphere_surface_mie_scattering_coefficients, 
        vec3(0.)// atmosphere_surface_absorption_coefficients 
        
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


    // NOTES:
    // solids are modeled as a gas where attenuation coefficient is super high
    // space is   modeled as a gas where attenuation coefficient is super low
}
