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

const vec3 NONE 	= vec3(0.0,0.0,0.0);
const vec3 OCEAN 	= vec3(0.04,0.04,0.2);
const vec3 SHALLOW 	= vec3(0.04,0.58,0.54);
const vec3 MAFIC  	= vec3(50,45,50)/255.;		// observed on lunar maria 
const vec3 FELSIC 	= vec3(214,181,158)/255.;		// observed color of rhyolite sample
//const vec3 SAND 	= vec3(255,230,155)/255.;
const vec3 SAND 	= vec3(245,215,145)/255.;
const vec3 PEAT 	= vec3(100,85,60)/255.;
const vec3 SNOW  	= vec3(0.9, 0.9, 0.9); 
const vec3 JUNGLE 	= vec3(30,50,10)/255.;
//const vec3 JUNGLE	= vec3(20,45,5)/255.;

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

	float darkness_coverage = smoothstep(insolation_max, 0., vInsolation);

	vec3 ocean 		= mix(OCEAN, SHALLOW, ocean_coverage);
	vec3 bedrock	= mix(MAFIC, FELSIC, felsic_coverage);
	vec3 soil		= mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
	vec3 canopy 	= mix(soil, JUNGLE, plant_coverage);

	vec3 uncovered = @UNCOVERED;
	vec3 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
	vec3 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);

	vec3 surface_rgb_intensity = max(dot(vPosition.xyz, light_direction), 0.001) * get_rgb_intensity_of_rgb_signal(ice_covered);

	gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(surface_rgb_intensity),1);
}