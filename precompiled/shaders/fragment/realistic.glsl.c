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
varying float vScalar;
varying float vSurfaceTemp;
varying vec4 vPosition;
varying vec3 vClipspace;

uniform float sealevel;
uniform float sealevel_mod;
uniform float darkness_mod;
uniform float ice_mod;

uniform float insolation_max;
uniform vec3  light_rgb_intensity;
uniform vec3  light_direction;

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

// TODO: set these material values in a manner similar to color, above: 
//   e.g. specular_reflection_coefficient of water vs forest
const float WATER_CHARACTERISTIC_FRESNEL_REFLECTANCE = 0.5;
// TODO: set back to this number, since it's physically accurate:
// const float WATER_CHARACTERISTIC_FRESNEL_REFLECTANCE = 0.1;
// NOTE: value for shininess was determined by aesthetics, 
//   not sure if a physically based value can be found
const float WATER_PHONG_SHININESS = 500.0; 
const float EPSILON = 0.001;

void main() {
    vec2  clipspace     = vClipspace.xy;
    // vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    // vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;
    
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

	vec3 ocean 		= mix(OCEAN, SHALLOW, ocean_coverage);
	vec3 bedrock	= mix(MAFIC, FELSIC, felsic_coverage);
	vec3 soil		= mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
	vec3 canopy 	= mix(soil, JUNGLE, plant_coverage);

	vec3 uncovered = @UNCOVERED;
	vec3 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
	vec3 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);

	// TODO: express the above mentioned colors of sand, water, forest, etc. by absorption spectra, beer's law, etc.
	// TODO: correct the above mentioned colors by values for sunlight to get absorption approximations where nothing else is available
	// TODO: take component-wise product of reflected_rgb_intensity and light_rgb_intensity
	vec3 fraction_reflected_rgb_intensity = get_rgb_intensity_of_rgb_signal(ice_covered);

	// "F0" is the characteristic fresnel reflectance
	// TODO: calculate this using Fresnel reflectance equation
	//   from https://blog.selfshadow.com/publications/s2015-shading-course/hoffman/s2015_pbs_physics_math_slides.pdf
	//   see also https://computergraphics.stackexchange.com/questions/1513/how-physically-based-is-the-diffuse-and-specular-distinction?newreg=853edb961d524a0994bbab4c6c1b5aaa
	vec3 F0 = vec3(WATER_CHARACTERISTIC_FRESNEL_REFLECTANCE);
	// "alpha" is the "shininess" of the object, as known within the Phong reflection model
	float alpha = WATER_PHONG_SHININESS;

	// "N" is the surface normal
	// TODO: pass this in from an attribute so we can generalize this beyond spheres
	vec3 N = vPosition.xyz;

	// "L" is the normal vector indicating the direction to the light source
	vec3 L = light_direction.xyz;

	// "V" is the normal vector indicating the direction from the view
	vec3 V = light_direction.xyz;

	// "R" is the normal vector of a perfectly reflected ray of light
	//   it is calculated as the reflection of L on a surface with normal N
	vec3 R = 2.*dot(L,N)*N - L;
	// NOTE: see here for more info:
	//   https://en.wikipedia.org/wiki/Phong_reflection_model
	// and here for some intuition:
	//   http://olympus.magnet.fsu.edu/primer/java/reflection/specular/index.html
	// TODO: express diffuse/specular coefficients 
	//   so size of surface imperfection is compared to wavelength,
	//   with small imperfections diffusing only short wavelengths
	// TODO: incorporate learnings from this:
	//   https://blog.selfshadow.com/publications/s2015-shading-course/hoffman/s2015_pbs_physics_math_slides.pdf
	vec3 surface_rgb_intensity = 
		max(dot(N,L), EPSILON) * (1.-F0) * fraction_reflected_rgb_intensity +
		pow(dot(R,V), alpha)   *     F0  * fraction_reflected_rgb_intensity +
		get_rgb_intensity_of_emitted_light_from_black_body(vSurfaceTemp);

	gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(surface_rgb_intensity),1);
}