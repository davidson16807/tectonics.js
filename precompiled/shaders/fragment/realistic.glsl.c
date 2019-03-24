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

// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever world's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 

// VIEW SETTINGS ---------------------------------------------------------------
uniform float reference_distance;
uniform float ocean_visibility;
uniform float sediment_visibility;
uniform float plant_visibility;
uniform float snow_visibility;
uniform float shadow_visibility;
uniform float specular_visibility;

// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3  light_rgb_intensities [MAX_LIGHT_COUNT];
uniform vec3  light_directions [MAX_LIGHT_COUNT];
uniform int   light_count;
uniform float insolation_max;

// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3  surface_air_rayleigh_scattering_coefficients; 
uniform vec3  surface_air_mie_scattering_coefficients; 
uniform vec3  surface_air_absorption_coefficients; 

// SEA PROPERTIES -------------------------------------------------------
uniform float sealevel;
uniform vec3  ocean_rayleigh_scattering_coefficients; 
uniform vec3  ocean_mie_scattering_coefficients; 
uniform vec3  ocean_absorption_coefficients; 

// WORLD PROPERTIES ------------------------------------------------------------
uniform vec3  world_position; // location for the center of the world, in meters
uniform float world_radius;   // radius of the world being rendered, in meters

varying float displacement_v;
varying vec3  gradient_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying float surface_temperature_v;
varying vec4  position_v;
varying vec3  view_direction_v;


// "SOLAR_RGB_LUMINOSITY" is the rgb luminosity of earth's sun, in Watts.
//   It is used to convert the above true color values to absorption coefficients.
//   You can also generate these numbers by calling solve_rgb_intensity_of_light_emitted_by_black_body(SOLAR_TEMPERATURE)
const vec3  SOLAR_RGB_LUMINOSITY    = vec3(7247419., 8223259., 8121487.);

const float AIR_REFRACTIVE_INDEX   = 1.000277;

const float WATER_REFRACTIVE_INDEX = 1.333;
const float WATER_ROOT_MEAN_SLOPE_SQUARED = 0.18;

const vec3  LAND_COLOR_MAFIC    = vec3(50,45,50)/255.;      // observed on lunar maria 
const vec3  LAND_COLOR_FELSIC   = vec3(214,181,158)/255.;       // observed color of rhyolite sample
const vec3  LAND_COLOR_SAND     = vec3(245,215,145)/255.;
const vec3  LAND_COLOR_PEAT     = vec3(100,85,60)/255.;
const float LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE  = 0.04; // NOTE: "0.04" is a representative value for plastics and other diffuse reflectors
const float LAND_ROOT_MEAN_SLOPE_SQUARED = 0.2;

const vec3  JUNGLE_COLOR   = vec3(30,50,10)/255.;
const float JUNGLE_ROOT_MEAN_SLOPE_SQUARED = 30.0;

const vec3  SNOW_COLOR            = vec3(0.9, 0.9, 0.9); 
const float SNOW_REFRACTIVE_INDEX = 1.333; 

// TODO: calculate airglow for nightside using scattering equations from atmosphere.glsl.c, 
//   also keep in mind this: https://en.wikipedia.org/wiki/Airglow
const float AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR = 0.000001;

// TODO: multiple scattering events
// TODO: support for light sources from within atmosphere
// "get_rgb_intensity_of_light_from_surface_of_world" 
//   traces a ray of light through the atmosphere and into a surface,
// NOTE: this function does not trace the ray out of the atmosphere,
//   since that is a job that only our atmosphere shader is capable of doing.
//   Nor does it determine emission, since it is designed to be looped 
//   over several light sources, and this would oversaturate the contribution from emission.
FUNC(vec3) get_rgb_intensity_of_light_from_surface_of_world(
    // light properties
    IN(vec3)  light_direction,
    IN(vec3)  light_rgb_intensity,
    // atmoshere properties
    IN(float) world_radius, 
    IN(float) atmosphere_scale_height,
    IN(vec3)  atmosphere_beta_ray,
    IN(vec3)  atmosphere_beta_mie,
    IN(vec3)  atmosphere_beta_abs,
    IN(float) atmosphere_ambient_light_factor,
    // surface properties
    IN(vec3)  surface_position,
    IN(vec3)  surface_normal,
    IN(float) surface_slope_root_mean_squared,
    IN(vec3)  surface_diffuse_color_rgb_fraction,
    IN(vec3)  surface_specular_color_rgb_fraction,
    // ocean properties
    IN(float) ocean_depth,
    IN(vec3)  ocean_beta_ray,
    IN(vec3)  ocean_beta_mie,
    IN(vec3)  ocean_beta_abs,
    // view properties
    IN(vec3)  view_direction
){
    // NOTE: the single letter variable names here are industry standard, learn them!
    // Uppercase indicates vectors
    // lowercase indicates scalars

    // "P" is the origin of the rays: the surface of the planet
    vec3 P = surface_position;
    // "N" is the surface normal
    vec3 N = surface_normal;
    // "V" is the normal vector indicating the direction from the view
    // TODO: standardize view_direction as view from surface to camera
    vec3 V = view_direction;
    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;
    // "H" is the halfway vector between normal and view.
    // It represents the surface normal that's needed to cause reflection.
    // It can also be thought of as the surface normal of a microfacet that's 
    //   producing the reflections seen by the camera.
    vec3 H = normalize(V+L);

    // Here we setup  several useful dot products of unit vectors
    //   we can think of them as the cosines of the angles formed between them,
    //   or their "cosine similarity": https://en.wikipedia.org/wiki/Cosine_similarity
    float LV =     dot(L,V);
    float NV = abs(dot(N,V));
    float NL = abs(dot(N,L));
    float NH =     dot(N,H);
    float HV = max(dot(V,H), 0.);

    // "F0" is the characteristic fresnel reflectance.
    //   it is the fraction of light that's immediately reflected when striking the surface head on.
    vec3 F0 = surface_specular_color_rgb_fraction;
    // "m" is the "ROOT_MEAN_SLOPE_SQUARED", the root mean square of the slope of all microfacets 
    // see https://www.desmos.com/calculator/0tqwgsjcje for a way to estimate it using a function to describe the surface
    float m = surface_slope_root_mean_squared;
    // "D" is the diffuse reflection fraction, essentially the color of the surface
    vec3 D = surface_diffuse_color_rgb_fraction;

    // "I_sun" is the rgb Intensity of Incoming Incident light, A.K.A. "Insolation"
    vec3 I_sun = light_rgb_intensity;
    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    vec3 I_surface = I_sun 
      * get_rgb_fraction_of_light_transmitted_through_air_for_curved_world(
            // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the world
            1.000001 * P, L, 3.*world_radius, vec3(0), world_radius, 
            atmosphere_scale_height, atmosphere_beta_ray, atmosphere_beta_mie, atmosphere_beta_abs
        );
    // "E_surface_reflected" is the intensity of light that is immediately reflected by the surface, A.K.A. "specular" reflection
    vec3 E_surface_reflected = I_surface 
        * get_rgb_fraction_of_light_reflected_on_surface(HV, F0)
        * get_fraction_of_light_masked_or_shaded_by_surface(NV, m) 
        * get_fraction_of_microfacets_with_angle(NH, m)
        / (4.*PI); // NOTE: NV*VL should appear here in the denominator, but I can't get it to work
    // "I_surface_refracted" is the intensity of light that is not immediately reflected, 
    //   but penetrates into the material, either to be absorbed, scattered away, 
    //   or scattered back to the view as diffuse reflection.
    // We would ideally like to negate the integral of reflectance over all possible angles, 
    //   but finding that is hard, so let's just negate the reflectance for the angle at which it occurs the most, or "HV"
    vec3 I_surface_refracted = 
        I_surface * (1. - get_rgb_fraction_of_light_reflected_on_surface(HV, F0));
      //+ I_sun     *  atmosphere_ambient_light_factor;
    // If sea is present, "E_ocean_scattered" is the rgb intensity of light 
    //   scattered by the sea towards the camera. Otherwise, it equals 0.
    vec3 E_ocean_scattered = 
        get_rgb_intensity_of_light_scattered_from_fluid_for_flat_world(
            NV, NL, LV, ocean_depth, I_surface_refracted, 
            ocean_beta_ray, ocean_beta_mie, ocean_beta_abs
        );
    // if sea is present, "I_ocean_trasmitted" is the rgb intensity of light 
    //   that reaches the ground after being filtered by air and sea. 
    //   Otherwise, it equals I_surface_refracted.
    vec3 I_ocean_trasmitted= I_surface_refracted
        * get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(NL, ocean_depth, ocean_beta_ray, ocean_beta_mie, ocean_beta_abs);

    // "E_diffuse" is diffuse reflection of any nontrasparent component beneath the transparent surface,
    // It effectively describes diffuse reflection as understood within the phong model of reflectance.
    vec3 E_diffuse = I_ocean_trasmitted * NL * surface_diffuse_color_rgb_fraction; 

    // if sea is present, "E_ocean_transmitted" is the fraction 
    //   of E_diffuse that makes it out of the sea. Otheriwse, it equals E_diffuse
    vec3 E_ocean_transmitted  = E_diffuse 
        * get_rgb_fraction_of_light_transmitted_through_fluid_for_flat_world(NV, ocean_depth, ocean_beta_ray, ocean_beta_mie, ocean_beta_abs);

    return 
        E_surface_reflected
      + E_ocean_transmitted 
      + E_ocean_scattered;
}








void main() {

    bool  is_ocean         = sealevel > displacement_v;
    bool  is_visible_ocean = sealevel * ocean_visibility > displacement_v;
    float ocean_depth      = max(sealevel*ocean_visibility - displacement_v, 0.);
    float surface_height   = max(displacement_v - sealevel*ocean_visibility, 0.);
    
    // TODO: pass felsic_coverage in from attribute
    // we currently guess how much rock is felsic depending on displacement
    // Absorption coefficients are physically based.
    // Scattering coefficients have been determined aesthetically.
    float felsic_coverage   = smoothstep(sealevel - 4000., sealevel+5000., displacement_v);
    float mineral_coverage  = displacement_v > sealevel? smoothstep(sealevel + 10000., sealevel, displacement_v) : 0.;
    float organic_coverage  = smoothstep(30., -30., surface_temperature_v); 
    float snow_coverage     = snow_coverage_v;
    float plant_coverage    = plant_coverage_v * (!is_visible_ocean? 1. : 0.);

    // TODO: more sensible microfacet model
    vec3 color_of_bedrock    = mix(LAND_COLOR_MAFIC, LAND_COLOR_FELSIC, felsic_coverage);
    vec3 color_with_sediment = mix(color_of_bedrock, mix(LAND_COLOR_SAND, LAND_COLOR_PEAT, organic_coverage), mineral_coverage * sediment_visibility);
    vec3 color_with_plants   = mix(color_with_sediment, JUNGLE_COLOR, !is_ocean? plant_coverage * plant_visibility * sediment_visibility : 0.);
    vec3 color_with_snow     = mix(color_with_plants, SNOW_COLOR, snow_coverage * snow_visibility);

    // "n" is the surface normal for a perfectly smooth sphere
    vec3 n = normalize(position_v.xyz);
    vec3 surface_position = 
        n * (world_radius + surface_height);
    vec3 surface_normal = 
        normalize(n + gradient_v);
    float surface_slope_root_mean_squared = 
        is_visible_ocean? 
            WATER_ROOT_MEAN_SLOPE_SQUARED : 
            mix(LAND_ROOT_MEAN_SLOPE_SQUARED, JUNGLE_ROOT_MEAN_SLOPE_SQUARED, plant_coverage);
    vec3 surface_diffuse_color_rgb_fraction = 
        get_rgb_intensity_of_rgb_signal(color_with_snow);
    // TODO: model refractive index as a function of wavelength
    vec3 surface_specular_color_rgb_fraction = 
        shadow_visibility * specular_visibility * // turn off specular reflection if darkness is disabled
        vec3(mix(
            is_visible_ocean? 
            get_fraction_of_light_reflected_on_surface_head_on(WATER_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX) : 
            LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE, 
            get_fraction_of_light_reflected_on_surface_head_on(SNOW_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX), 
            snow_coverage*snow_visibility
        ));
    float ocean_visible_depth = mix(ocean_depth, 0., snow_coverage*snow_coverage*snow_coverage*snow_visibility);

    vec3 E_surface_reemitted = vec3(0);
    for (int i = 0; i < MAX_LIGHT_COUNT; ++i)
    {
        if (i >= light_count){ break; }
        vec3 light_direction = normalize(mix(n, light_directions[i], shadow_visibility));
        vec3 light_rgb_intensity = light_rgb_intensities[i];

        E_surface_reemitted += 
            get_rgb_intensity_of_light_from_surface_of_world(
                // light properties
                light_direction,
                light_rgb_intensity,
                
                // atmosphere properties
                world_radius,
                atmosphere_scale_height, 
                surface_air_rayleigh_scattering_coefficients,
                surface_air_mie_scattering_coefficients,
                surface_air_absorption_coefficients, 
                AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR, 

                // surface properties
                surface_position,
                surface_normal,
                surface_slope_root_mean_squared,
                surface_diffuse_color_rgb_fraction,
                surface_specular_color_rgb_fraction,

                // ocean properties
                ocean_visible_depth,
                ocean_rayleigh_scattering_coefficients, 
                ocean_mie_scattering_coefficients, 
                ocean_absorption_coefficients, 

                // view properties
                -view_direction_v
            );
    }

    vec3 E_surface_emitted = solve_rgb_intensity_of_light_emitted_by_black_body(surface_temperature_v);

    // NOTE: we do not filter E_total by atmospheric scattering
    //   that job is done by the atmospheric shader pass, in "atmosphere.glsl.c"
    vec3 E_total = 
          E_surface_emitted
        + E_surface_reemitted;

    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(E_total/insolation_max),1);
}