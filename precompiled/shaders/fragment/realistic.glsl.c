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


varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_mod;
uniform float darkness_mod;
uniform float ice_mod;

uniform float insolation_max;

const vec3  light_position = vec3(ASTRONOMICAL_UNIT,0,0);

const vec4 NONE = vec4(0.0,0.0,0.0,0.0);
const vec4 OCEAN = vec4(0.04,0.04,0.2,1.0);
const vec4 SHALLOW = vec4(0.04,0.58,0.54,1.0);

const vec4 MAFIC  = vec4(50,45,50,255)/255.			// observed on lunar maria 
                  * vec4(1,1,1,1);					// aesthetic correction 
const vec4 FELSIC = vec4(214,181,158,255)/255.		// observed color of rhyolite sample
                  * vec4(1,1,1,1);					// aesthetic correction 
//const vec4 SAND = vec4(255,230,155,255)/255.;
const vec4 SAND = vec4(245,215,145,255)/255.;
const vec4 PEAT = vec4(100,85,60,255)/255.;
const vec4 SNOW  = vec4(0.9, 0.9, 0.9, 0.9); 
const vec4 JUNGLE = vec4(30,50,10,255)/255.;
//const vec4 JUNGLE = vec4(20,45,5,255)/255.;

void main() {
	float epipelagic = sealevel - 200.0;
	float mesopelagic = sealevel - 1000.0;
	float abyssopelagic = sealevel - 4000.0;
	float maxheight = sealevel + 10000.0; 

	float lat = (asin(abs(vPosition.y)));
	
	float felsic_coverage 	= smoothstep(abyssopelagic, sealevel+5000., vDisplacement);
	float mineral_coverage 	= vDisplacement > sealevel? smoothstep(maxheight, sealevel, vDisplacement) : 0.;
	float organic_coverage 	= degrees(lat)/90.; // smoothstep(30., -30., temp); 
	float ice_coverage 		= vIceCoverage;
	float plant_coverage 	= vPlantCoverage * (vDisplacement > sealevel? 1. : 0.);
	float ocean_coverage 	= smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement);

	vec3  light_offset    = light_position; // - world_position;
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

	float darkness_coverage = smoothstep(insolation_max, 0., vInsolation);

	vec4 ocean 		= mix(OCEAN, SHALLOW, ocean_coverage);
	vec4 bedrock	= mix(MAFIC, FELSIC, felsic_coverage);
	vec4 soil		= mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
	vec4 canopy 	= mix(soil, JUNGLE, plant_coverage);

	vec4 uncovered = @UNCOVERED;
	vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
	vec4 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);

	vec3 surface_rgb_intensity = max(dot(vPosition.xyz, light_direction), 0.001) * ice_covered.xyz * light_rgb_intensity / 400.;

	gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(surface_rgb_intensity),1);
}