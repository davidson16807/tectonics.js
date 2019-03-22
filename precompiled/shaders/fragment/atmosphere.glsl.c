#define GL_ES
#include "precompiled/cross_platform_macros.glsl.c"
#include "precompiled/academics/units.glsl.c"
#include "precompiled/academics/math/constants.glsl.c"
#include "precompiled/academics/math/geometry.glsl.c"
#include "precompiled/academics/physics/constants.glsl.c"
#include "precompiled/academics/physics/emission.glsl.c"
#include "precompiled/academics/physics/scattering.glsl.c"
#include "precompiled/academics/physics/reflectance.glsl.c"
#include "precompiled/academics/raymarching.glsl.c"
#include "precompiled/academics/psychophysics.glsl.c"
#include "precompiled/academics/electronics.glsl.c"


varying vec2  vUv;
uniform sampler2D background_rgb_signal_texture;


// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever world's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 

// VIEW PROPERTIES -----------------------------------------------------------
uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;
uniform float reference_distance;
uniform float shaderpass_visibility;

// WORLD PROPERTIES ------------------------------------------------------------
uniform vec3  world_position;
uniform float world_radius;

// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3  light_rgb_intensities [MAX_LIGHT_COUNT];
uniform vec3  light_directions      [MAX_LIGHT_COUNT];
uniform int   light_count;
uniform float insolation_max;

// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3  surface_air_rayleigh_scattering_coefficients; 
uniform vec3  surface_air_mie_scattering_coefficients; 
uniform vec3  surface_air_absorption_coefficients; 


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

    vec4  background_rgb_signal    = texture2D( background_rgb_signal_texture, vUv );
    vec3  background_rgb_intensity = insolation_max * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
        
    // "beta_air_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3  beta_ray = surface_air_rayleigh_scattering_coefficients;
    vec3  beta_mie = surface_air_mie_scattering_coefficients;
    vec3  beta_abs = surface_air_absorption_coefficients; 

    vec3 rgb_intensity = 
        get_rgb_intensity_of_light_scattered_from_air_for_curved_world(
            view_origin,    view_direction,
            world_position, world_radius,
            light_directions,      // rgb vectors indicating intensities of light sources
            light_rgb_intensities, // unit vectors indicating directions to light sources
            light_count,
            background_rgb_intensity,
            atmosphere_scale_height,
            beta_ray, beta_mie, beta_abs
        );

    rgb_intensity = mix(background_rgb_intensity, rgb_intensity, shaderpass_visibility);

    // TODO: move this to a separate shader pass!
    // see https://learnopengl.com/Advanced-Lighting/HDR for an intro to tone mapping
    float exposure_intensity = 150.; // Watts/m^2
    vec3  ldr_tone_map = 1.0 - exp(-rgb_intensity/exposure_intensity);

    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(ldr_tone_map), 1);
    // gl_FragColor = 3.*background_rgb_signal;
}
