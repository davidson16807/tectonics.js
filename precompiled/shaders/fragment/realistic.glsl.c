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

varying float vDisplacement;
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

const vec3 NONE     = vec3(0.0,0.0,0.0);
const vec3 OCEAN    = vec3(0.04,0.04,0.2);
const vec3 SHALLOW  = vec3(0.04,0.58,0.54);
const vec3 MAFIC    = vec3(50,45,50)/255.;      // observed on lunar maria 
const vec3 FELSIC   = vec3(214,181,158)/255.;       // observed color of rhyolite sample
//const vec3 SAND   = vec3(255,230,155)/255.;
const vec3 SAND     = vec3(245,215,145)/255.;
const vec3 PEAT     = vec3(100,85,60)/255.;
const vec3 SNOW     = vec3(0.9, 0.9, 0.9); 
const vec3 JUNGLE   = vec3(30,50,10)/255.;
//const vec3 JUNGLE = vec3(20,45,5)/255.;

// "SOLAR_RGB_INTENSITY" is the rgb intensity of earth's sun.
//   It is used to convert the above true color values to absorption coefficients
const vec3  SOLAR_RGB_INTENSITY = vec3(7247419., 8223259., 8121487.);

// TODO: set these material values in a manner similar to color, above: 
//   e.g. specular_reflection_coefficient of water vs forest
const float WATER_CHARACTERISTIC_FRESNEL_REFLECTANCE = 0.02;
const float LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE  = 0.04;

// NOTE: value for shininess was determined by aesthetics, 
//   not sure if a physically based value can be found
const float WATER_PHONG_SHININESS = 30.0; 
const float LAND_PHONG_SHININESS  = 3.0; 
const float AMBIENT_LIGHT_AESTHETIC_FACTOR = 0.002;

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

    vec3 ocean      = mix(OCEAN, SHALLOW, ocean_coverage);
    vec3 bedrock    = mix(MAFIC, FELSIC, felsic_coverage);
    vec3 soil       = mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
    vec3 canopy     = mix(soil, JUNGLE, plant_coverage);

    vec3 uncovered  = @UNCOVERED;
    vec3 sea_covered = is_ocean? ocean : uncovered;
    vec3 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);

    // TODO: express the above mentioned colors of sand, water, forest, etc. by absorption spectra, beer's law, etc.
    // NOTE: We correct the color by SOLAR_RGB_INTENSITY to correct for distortion from Earth's 
    vec3 fraction_reflected_rgb_intensity = get_rgb_intensity_of_rgb_signal(ice_covered) / normalize(SOLAR_RGB_INTENSITY);

    // "I0" is the rgb Intensity of Incoming Incident light, A.K.A. "Insolation"
    vec3 I0 = light_rgb_intensity;

    // "Imax" is the maximum possible intensity within the viewing frame
    // 
    // for Earth, this would be the global solar constant 
    float Imax = insolation_max;

    // "F0" is the characteristic fresnel reflectance - the fraction that is immediately reflected from the surface
    // TODO: calculate this using Fresnel reflectance equation
    //   from https://blog.selfshadow.com/publications/s2015-shading-course/hoffman/s2015_pbs_physics_math_slides.pdf
    //   see also https://computergraphics.stackexchange.com/questions/1513/how-physically-based-is-the-diffuse-and-specular-distinction?newreg=853edb961d524a0994bbab4c6c1b5aaa
    vec3 F0 = vec3(is_ocean? WATER_CHARACTERISTIC_FRESNEL_REFLECTANCE : LAND_CHARACTERISTIC_FRESNEL_REFLECTANCE);
    // "alpha" is the "shininess" of the object, as known within the Phong reflection model
    float alpha =  is_ocean? WATER_PHONG_SHININESS : LAND_PHONG_SHININESS;

    // "N" is the surface normal
    // TODO: pass this in from an attribute so we can generalize this beyond spheres
    vec3 N = vPosition.xyz;

    // "L" is the normal vector indicating the direction to the light source
    vec3 L = light_direction;

    // "V" is the normal vector indicating the direction from the view
    vec3 V = -view_direction;

    // "NL" is the dot product between N and L, with a correction (the "max()" part) to account for shadows
    float NL = max(dot(N,L), 0.);

    // "R" is the normal vector of a perfectly reflected ray of light
    //   it is calculated as the reflection of L on a surface with normal N
    //   with a correction (the "pow()" part) to account for shadows
    vec3 R = pow(NL, 0.2) * (2.*NL*N - L);

    // "RV" is the dot product between R and V, with a correction (the "max()" part) to account for shadows
    float RV = max(dot(R,V), 0.);

    // "E" is the rgb intensity of light emitted from the surface itself due to black body radiation
    vec3 E = get_rgb_intensity_of_emitted_light_from_black_body(vSurfaceTemp);

    vec3  beta_ray = atmosphere_surface_rayleigh_scattering_coefficients;
    vec3  beta_mie = atmosphere_surface_mie_scattering_coefficients;
    vec3  beta_abs = atmosphere_surface_absorption_coefficients; 

    // NOTE: see here for more info:
    //   https://en.wikipedia.org/wiki/Phong_reflection_model
    // TODO: express diffuse/specular coefficients so size of surface imperfection is compared to wavelength,
    //   with small imperfections diffusing only short wavelengths
    // TODO: incorporate learnings from this:
    //   https://blog.selfshadow.com/publications/s2015-shading-course/hoffman/s2015_pbs_physics_math_slides.pdf
    // TODO: calculate airglow for nightside using scattering equations from atmosphere.glsl.c, 
    //   also keep in mind this: https://en.wikipedia.org/wiki/Airglow

    float light_sigma  = approx_air_column_density_ratio_along_ray (
        1.01 * vPosition.xyz * reference_distance,  L, 
        // NOTE: we nudge the origin of light ray by a small amount so that collision isn't detected with the planet
        world_position, world_radius, atmosphere_scale_height
    );

    // calculate the intensity of light that reached the surface
    vec3 I1 = I0 * exp(-(beta_ray + beta_mie + beta_abs) * light_sigma);
    // vec3 I1 = I0 * exp(-beta_ray * light_sigma);

    // calculate the intensity of light that reflects or emits from the surface
    vec3 I = 
        I1 * pow(RV, alpha)   *     F0                                         + // specular fraction
        I1 *     NL           * (1.-F0)     * fraction_reflected_rgb_intensity + // diffuse  fraction
        I1 * AMBIENT_LIGHT_AESTHETIC_FACTOR * fraction_reflected_rgb_intensity + // ambient  fraction
        E;

    gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(I/Imax),1);
}