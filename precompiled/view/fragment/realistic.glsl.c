
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

const vec4 NONE = vec4(0.0,0.0,0.0,0.0);
const vec4 OCEAN = vec4(0.04,0.04,0.2,1.0);
const vec4 SHALLOW = vec4(0.04,0.58,0.54,1.0);

const vec4 MAFIC  = vec4(50,45,50,255)/255.			// observed on lunar maria 
                  * vec4(1,1,1,1);					// aesthetic correction 
const vec4 FELSIC = vec4(190,180,185,255)/255.		// observed on lunar highlands
				  * vec4(0.6 * vec3(1,1,.66), 1);	// aesthetic correction;
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
	float maxheight = sealevel + 15000.0; 

	float lat = (asin(abs(vPosition.y)));
	
	float felsic_coverage 	= smoothstep(abyssopelagic, maxheight, vDisplacement);
	float mineral_coverage 	= vDisplacement > sealevel? smoothstep(maxheight, sealevel, vDisplacement) : 0.;
	float organic_coverage 	= degrees(lat)/90.; // smoothstep(30., -30., temp); 
	float ice_coverage 		= vIceCoverage;
	float plant_coverage 	= vPlantCoverage;
	float ocean_coverage 	= smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement);
	float darkness_coverage = smoothstep(insolation_max, 0., vInsolation);

	vec4 ocean 		= mix(OCEAN, SHALLOW, ocean_coverage);
	vec4 bedrock	= mix(MAFIC, FELSIC, felsic_coverage);
	vec4 soil		= mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
	vec4 canopy 	= mix(soil, JUNGLE, plant_coverage);

	vec4 uncovered = @UNCOVERED;
	vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
	vec4 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);

	vec4 darkness_covered = mix(ice_covered, NONE, darkness_coverage*darkness_mod-0.01);

	gl_FragColor = darkness_covered;
}