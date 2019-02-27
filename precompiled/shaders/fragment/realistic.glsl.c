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
varying vec4  vPosition;
varying vec3  vClipspace;

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

// SEA PROPERTIES -------------------------------------------------------
uniform vec3  sea_rayleigh_scattering_coefficients; 
uniform vec3  sea_mie_scattering_coefficients; 
uniform vec3  sea_absorption_coefficients; 

// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3  world_position;
// radius of the world being rendered, in meters
uniform float world_radius;


// "SOLAR_RGB_LUMINOSITY" is the rgb luminosity of earth's sun, in Watts.
//   It is used to convert the above true color values to absorption coefficients.
//   You can also generate these numbers by calling get_rgb_intensity_of_light_emitted_by_black_body(SOLAR_TEMPERATURE)
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

    bool  is_ocean   = vDisplacement < sealevel * sealevel_mod;
    float ocean_depth    = max(sealevel*sealevel_mod - vDisplacement, 0.);
    float surface_height = max(vDisplacement - sealevel*sealevel_mod, 0.);
    
    // TODO: pass felsic_coverage in from attribute
    // we currently guess how much rock is felsic depending on displacement
    // Absorption coefficients are physically based.
    // Scattering coefficients have been determined aesthetically.
    float felsic_coverage   = smoothstep(sealevel - 4000., sealevel+5000., vDisplacement);
    float mineral_coverage  = vDisplacement > sealevel? smoothstep(sealevel + 10000., sealevel, vDisplacement) : 0.;
    float organic_coverage  = smoothstep(30., -30., vSurfaceTemp); 
    float ice_coverage      = vIceCoverage;
    float plant_coverage    = vPlantCoverage * (vDisplacement > sealevel? 1. : 0.);

    // "beta_sea_*" variables are the scattering coefficients for seawater
    vec3  beta_sea_ray = sea_rayleigh_scattering_coefficients;
    vec3  beta_sea_mie = sea_mie_scattering_coefficients;
    vec3  beta_sea_abs = sea_absorption_coefficients; 

    // "beta_air_*" variables are the scattering coefficients for the atmosphere at sea level
    vec3  beta_air_ray = atmosphere_surface_rayleigh_scattering_coefficients;
    vec3  beta_air_mie = atmosphere_surface_mie_scattering_coefficients;
    vec3  beta_air_abs = atmosphere_surface_absorption_coefficients; 

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

    // "N" is the surface normal
    float NORMAL_MAP_AESTHETIC_EXAGGERATION_FACTOR = 1.0;
    vec3 N = normalize(normalize(vPosition.xyz) + NORMAL_MAP_AESTHETIC_EXAGGERATION_FACTOR*vGradient);

    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;

    // "V" is the normal vector indicating the direction from the view
    vec3 V = -view_direction;

    // "H" is the halfway vector between normal and view.
    // It represents the surface normal that's needed to cause reflection.
    // It can also be thought of as the surface normal of a microfacet that's 
    //   producing the reflections seen by the camera.
    vec3 H = normalize(V+L);

    // Here we setup  several useful dot products of unit vectors
    //   we can think of them as the cosines of the angles formed between them,
    //   or their "cosine similarity": https://en.wikipedia.org/wiki/Cosine_similarity
    float LV =    (dot(L,V));
    float NV = max(dot(N,V), 0.);
    float NL = max(dot(N,L), 0.);
    float NH =    (dot(N,H));
    float HV = max(dot(V,H), 0.);

    // "gamma_*" variables indicate the fraction of scattered sunlight that scatters to a given angle (indicated by its cosine).
    // it is also known as the "phase factor"
    // It varies
    // see mention of "gamma" by Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    float gamma_ray = get_fraction_of_rayleigh_scattered_light_scattered_by_angle(LV);
    float gamma_mie = get_fraction_of_mie_scattered_light_scattered_by_angle(LV);

    // "sigma_air_in" is the column density of air, relative to the surface of the world, that's along the light's path of travel,
    //   we use it to estimate the amount of light that's filtered by the atmosphere before reaching the surface
    //   see https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/ for an awesome introduction
    float sigma_air_in  = approx_air_column_density_ratio_along_line_segment (
        // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the planet
        1.0003 * vPosition.xyz * reference_distance, L, 3.*world_radius,
        world_position, world_radius, atmosphere_scale_height
    );

    // "sigma_sea_in"  is the column density, relative to the surface, that's along the light's incoming path of travel.
    // "sigma_sea_out" is the column density, relative to the surface, that's along the light's outgoing path of travel.
    // "sigma_sea_ratio" is the column density ratio of the full path of light relative to the distance along the incoming path
    // Since water is treated as incompressible, the density remains constant, 
    //   so they are effectively the distances traveled along their respective paths.
    // TODO: model vector of refracted light within water
    float sigma_sea_in  = ocean_depth / NV;
    float sigma_sea_out = ocean_depth / NL;
    float sigma_sea_ratio = 1. + NV/NL;

    // "F" is the fraction of light that's immediately reflected 
    //   upon striking a microfacet that's best aligned for reflection.
    // It is also known as the "fresnel reflectance".
    // See Hoffmann 2015 for a gentle introduction to the concept.
    // TODO: characteristic reflectance should change dependant on microfacet surface normal,
    //   e.g. to simulate a snowy boulder field, or mangrove swamp, where water partially covers rocks and vegetation
    vec3  F  = get_rgb_fraction_of_light_reflected_on_surface(HV, F0);

    // "G" is the fraction of reflected light that is lost due to masking and shadowing
    //   see Hoffmann 2015 for a gentle introduction to the concept
    float G = get_fraction_of_reflected_light_masked_or_shaded(NV, m);

    // "D" is the fraction of microfacet surface normals that are aligned to reflect light to the view
    //   see Hoffmann 2015 for a gentle introduction to the concept
    float D = get_fraction_of_microfacets_with_angle(NH, m); 

    // "d" is the fraction of light that is not immediately reflected, 
    //   but refracts into the material, either to be absorbed, scattered away, 
    //   or scattered back to the view as diffuse reflection.
    // Unlike "F", it does not strike the ideal microfacet for reflection ("H"), 
    //   but strikes the most common one ("N").
    vec3  d  = 1. - get_rgb_fraction_of_light_reflected_on_surface(NV, F0);

    // "I_max" is the maximum possible intensity within the viewing frame.
    // For Earth, this would be the global solar constant.
    float I_max = insolation_max;

    // "I_sun" is the rgb Intensity of Incoming Incident light, A.K.A. "Insolation"
    vec3 I_sun = light_rgb_intensity;

    // "I_sea" is the intensity of light that reaches the surface after being filtered by atmosphere
    vec3 I_surface = I_sun 
        * exp(-sigma_air_in * (beta_air_ray + beta_air_mie + beta_air_abs));

    vec3 E_surface_reflected = I_surface * F * G * D / (4.*PI);

    vec3 I_surface_refracted = 
        I_surface * d + 
        I_sun     * AMBIENT_LIGHT_AESTHETIC_BRIGHTNESS_FACTOR;

    vec3 E_surface_emitted = get_rgb_intensity_of_light_emitted_by_black_body(vSurfaceTemp);

    // If sea is present, "E_sea_scattered" is the rgb intensity of light 
    //   scattered by the sea towards the camera. Otherwise, it equals 0.
    vec3 E_sea_scattered = I_surface_refracted 
        // incoming fraction: the fraction of light that scatters towards camera
        *     (beta_sea_ray * gamma_ray + beta_sea_mie * gamma_mie) 
        // outgoing fraction: the fraction of light that scatters away from camera
        * (exp(-sigma_sea_in * sigma_sea_ratio * (beta_sea_ray + beta_sea_mie + beta_sea_abs)) - 1.)
        /                    (-sigma_sea_ratio * (beta_sea_ray + beta_sea_mie + beta_sea_abs));

    // if sea is present, "I_sea_trasmitted" is the rgb intensity of light 
    //   that reaches the ground after being filtered by air and sea. Otherwise, it equals I_surface_refracted.
    vec3 I_sea_trasmitted= I_surface_refracted
        * exp(-sigma_sea_in * (beta_sea_ray + beta_sea_mie + beta_sea_abs));

    vec3 bedrock_color   = mix(LAND_COLOR_MAFIC, LAND_COLOR_FELSIC, felsic_coverage);
    vec3 soil_color      = mix(bedrock_color, mix(LAND_COLOR_SAND, LAND_COLOR_PEAT, organic_coverage), mineral_coverage);
    vec3 canopy_color    = mix(soil_color, JUNGLE_COLOR, plant_coverage);
    vec3 bottom_color  = get_rgb_intensity_of_rgb_signal(@UNCOVERED);

    // "E_bottom_diffused" is diffuse reflection of any nontrasparent component beneath the transparent surface,
    // It effectively describes diffuse reflection as understood within the phong model of reflectance.
    vec3 E_bottom_diffused = I_sea_trasmitted * NL * bottom_color; 

    // if sea is present, "E_sea_transmitted" is the fraction 
    //   of E_bottom_diffused that makes it out of the sea. Otheriwse, it equals E_bottom_diffused
    vec3 E_sea_transmitted  = E_bottom_diffused 
        * exp(-sigma_sea_out * (beta_sea_ray + beta_sea_mie + beta_sea_abs));

    vec3 E_surface_diffused = 
        mix(E_sea_transmitted + E_sea_scattered, 
            I_surface_refracted * NL * SNOW_COLOR, 
            ice_coverage*ice_coverage*ice_coverage*ice_mod);

    // NOTE: we do not filter E_total by atmospheric scattering
    //   that job is done by the atmospheric shader pass, in "atmosphere.glsl.c"
    vec3 E_total = 
          E_surface_reflected
        + E_surface_emitted
        + E_surface_diffused;

    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(E_total/I_max),1);

    // // CODE to generate a tangent-space normal map:
    // vec3 n = normalize(vPosition.xyz);
    // vec3 y = vec3(0,1,0);
    // vec3 u = normalize(cross(n, y));
    // vec3 v = normalize(cross(n, u));
    // vec3 w = n;
    // vec3 g = normalize(vGradient);
    // gl_FragColor = vec4((2.*vec3(dot(N, u), dot(N, v), dot(N, w))-1.), 1);
}