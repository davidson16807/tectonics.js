#define GL_ES
#include "precompiled/shaders/academics/cross_platform_macros.glsl.c"
#include "precompiled/shaders/academics/units.glsl.c"
#include "precompiled/shaders/academics/math/constants.glsl.c"
#include "precompiled/shaders/academics/math/geometry.glsl.c"
#include "precompiled/shaders/academics/physics/constants.glsl.c"
#include "precompiled/shaders/academics/physics/emission.glsl.c"
#include "precompiled/shaders/academics/physics/scattering.glsl.c"
#include "precompiled/shaders/academics/physics/reflectance.glsl.c"
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
