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

varying float vDisplacement;
varying vec3  vGradient;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying float vSurfaceTemp;
varying vec4 vPosition;
varying vec3 vClipspace;

// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;

// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;

// VIEW SETTINGS ---------------------------------------------------------------
uniform float sealevel;
uniform float sealevel_mod;
uniform float darkness_mod;
uniform float ice_mod;

// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3  light_rgb_intensity;
uniform vec3  light_direction;
uniform float insolation_max;

// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3  atmosphere_surface_rayleigh_scattering_coefficients; 
uniform vec3  atmosphere_surface_mie_scattering_coefficients; 
uniform vec3  atmosphere_surface_absorption_coefficients; 

// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3  world_position;
// radius of the world being rendered, in meters
uniform float world_radius;


// "SOLAR_RGB_LUMINOSITY" is the rgb luminosity of earth's sun, in Watts
//   It is used to convert the above true color values to absorption coefficients
const vec3  SOLAR_RGB_LUMINOSITY    = vec3(7247419., 8223259., 8121487.);

const float AIR_REFRACTIVE_INDEX   = 1.000277;

const vec3  WATER_COLOR_DEEP       = vec3(0.04,0.04,0.2);
const vec3  WATER_COLOR_SHALLOW    = vec3(0.04,0.58,0.54);
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

void main() {
    vec2  clipspace      = vClipspace.xy;
    vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    // vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;

    float epipelagic = sealevel - 200.0;
    float mesopelagic = sealevel - 1000.0;
    float abyssopelagic = sealevel - 4000.0;
    float maxheight = sealevel + 10000.0; 

    float lat = (asin(abs(vPosition.y)));
    
    float felsic_coverage   = smoothstep(abyssopelagic, sealevel+5000., vDisplacement);
    float mineral_coverage  = vDisplacement > sealevel? smoothstep(maxheight, sealevel, vDisplacement) : 0.;
    float organic_coverage  = degrees(lat)/90.; // smoothstep(30., -30., temp); 
    float ice_coverage      = vIceCoverage;
    float plant_coverage    = vPlantCoverage * (vDisplacement > sealevel? 1. : 0.);
    float ocean_coverage    = smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement);

    bool is_ocean   = vDisplacement < sealevel * sealevel_mod;

    vec3 ocean_color      = mix(WATER_COLOR_DEEP, WATER_COLOR_SHALLOW, ocean_coverage);
    vec3 bedrock_color    = mix(LAND_COLOR_MAFIC, LAND_COLOR_FELSIC, felsic_coverage);
    vec3 soil_color       = mix(bedrock_color, mix(LAND_COLOR_SAND, LAND_COLOR_PEAT, organic_coverage), mineral_coverage);
    vec3 canopy_color     = mix(soil_color, JUNGLE_COLOR, plant_coverage);

    vec3 color_when_uncovered  = @UNCOVERED;
    vec3 color_with_sea = is_ocean? ocean_color : color_when_uncovered;
    vec3 color_with_ice = mix(color_with_sea, SNOW_COLOR, ice_coverage*ice_mod);

    // "beta_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3  beta_ray = atmosphere_surface_rayleigh_scattering_coefficients;
    vec3  beta_mie = atmosphere_surface_mie_scattering_coefficients;
    vec3  beta_abs = atmosphere_surface_absorption_coefficients; 

    // "m" is the "ROOT_MEAN_SLOPE_SQUARED", the root mean square of the slope of all microfacets 
    // see https://www.desmos.com/calculator/0tqwgsjcje for a way to estimate it using a function to describe the surface
    float m = is_ocean? WATER_ROOT_MEAN_SLOPE_SQUARED : mix(LAND_ROOT_MEAN_SLOPE_SQUARED, JUNGLE_ROOT_MEAN_SLOPE_SQUARED, plant_coverage);

    // "F0" is the characteristic fresnel reflectance.
    //   it is the fraction of light that's immediately reflected when striking the surface head on.
    // TODO: model refractive index as a function of wavelength
    vec3 F0 = vec3(mix(
        is_ocean? get_characteristic_reflectance(WATER_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX) : LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE, 
        get_characteristic_reflectance(SNOW_REFRACTIVE_INDEX, AIR_REFRACTIVE_INDEX), 
        ice_coverage*ice_mod
    ));

    // TODO: express the above mentioned colors of sand, water, forest, etc. by absorption spectra, beer's law, etc.
    // NOTE: We correct the color by SOLAR_RGB_LUMINOSITY to correct for distortion from Earth's 
    vec3 fraction_reflected_rgb_intensity = get_rgb_intensity_of_rgb_signal(color_with_ice) / normalize(SOLAR_RGB_LUMINOSITY);

    // "I_sun" is the rgb Intensity of Incoming Incident light, A.K.A. "Insolation"
    vec3 I_sun = light_rgb_intensity;

    // "I_max" is the maximum possible intensity within the viewing frame
    //   for Earth, this would be the global solar constant 
    float I_max = insolation_max;

    // "N" is the surface normal
    float NORMAL_MAP_AESTHETIC_EXAGGERATION_FACTOR = 1.0;
    vec3 N = normalize(normalize(vPosition.xyz) + NORMAL_MAP_AESTHETIC_EXAGGERATION_FACTOR*vGradient);

    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;

    // "V" is the normal vector indicating the direction from the view
    vec3 V = -view_direction;

    // "H" is the halfway vector between normal and view
    //   it represents the surface normal that's needed to cause reflection
    vec3 H = normalize(V+L);

    // Here we setup  several useful dot products of unit vectors
    //   we can think of them as the cosines of the angles formed between them,
    //   or their "cosine similarity": https://en.wikipedia.org/wiki/Cosine_similarity
    float NV = max(dot(N,V), 0.);
    float NL = max(dot(N,L), 0.);
    float NH =    (dot(N,H));
    float HV = max(dot(V,H), 0.);

    // "sigma" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma  = approx_air_column_density_ratio_along_line_segment (
        // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the planet
        1.0003 * vPosition.xyz * reference_distance, L, 3.*world_radius,
        world_position, world_radius, atmosphere_scale_height
    );

    // "F" is the fresnel reflectance, the fraction of light that's immediately reflected upon striking the surface
    //   see Hoffmann 2015 for a gentle introduction to the concept
    vec3 F  = get_rgb_fraction_of_light_reflected_on_surface(HV, F0);

    // "G" is the fraction of reflected light that is lost due to masking and shadowing
    //   see Hoffmann 2015 for a gentle introduction to the concept
    float G = get_fraction_of_reflected_light_masked_or_shaded(NV, m);

    // "D" is the fraction of microfacet surface normals that are aligned to reflect light to the view
    //   see Hoffmann 2015 for a gentle introduction to the concept
    float D = get_fraction_of_microfacets_with_angle(NH, m); 

    // "I_surface" is the intensity of light that reaches the surface after being filtered by atmosphere
    vec3 I_surface = I_sun * exp(-(beta_ray + beta_mie + beta_abs) * sigma);

    // "E_surface" is the rgb intensity of light emitted from the surface itself due to black body radiation
    vec3 E_surface = get_rgb_intensity_of_light_emitted_by_black_body(vSurfaceTemp);

    // calculate the intensity of light that reflects or emits from the surface
    vec3 I = 
        I_surface *  F     * G * D / (4.*PI)                                          + // specular fraction
        I_surface * (1.-F) * NL                    * fraction_reflected_rgb_intensity + // diffuse  fraction
        I_sun     * AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR * fraction_reflected_rgb_intensity + // ambient  fraction
        E_surface;

    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(I/I_max),1);

    // // CODE to generate a tangent-space normal map:
    // vec3 n = normalize(vPosition.xyz);
    // vec3 y = vec3(0,1,0);
    // vec3 u = normalize(cross(n, y));
    // vec3 v = normalize(cross(n, u));
    // vec3 w = n;
    // vec3 g = normalize(vGradient);
    // gl_FragColor = vec4((2.*vec3(dot(N, u), dot(N, v), dot(N, w))-1.), 1);
}