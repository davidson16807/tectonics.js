function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}
var fragmentShaders = {};
fragmentShaders.realistic = `
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
const vec4 MAFIC = vec4(50,45,50,255)/255. // observed on lunar maria 
                  * vec4(1,1,1,1); // aesthetic correction 
const vec4 FELSIC = vec4(214,181,158,255)/255. // observed color of rhyolite sample
                  * vec4(1,1,1,1); // aesthetic correction 
//const vec4 SAND = vec4(255,230,155,255)/255.;
const vec4 SAND = vec4(245,215,145,255)/255.;
const vec4 PEAT = vec4(100,85,60,255)/255.;
const vec4 SNOW = vec4(0.9, 0.9, 0.9, 0.9);
const vec4 JUNGLE = vec4(30,50,10,255)/255.;
//const vec4 JUNGLE = vec4(20,45,5,255)/255.;
void main() {
 float epipelagic = sealevel - 200.0;
 float mesopelagic = sealevel - 1000.0;
 float abyssopelagic = sealevel - 4000.0;
 float maxheight = sealevel + 10000.0;
 float lat = (asin(abs(vPosition.y)));
 float felsic_coverage = smoothstep(abyssopelagic, sealevel+5000., vDisplacement);
 float mineral_coverage = vDisplacement > sealevel? smoothstep(maxheight, sealevel, vDisplacement) : 0.;
 float organic_coverage = degrees(lat)/90.; // smoothstep(30., -30., temp); 
 float ice_coverage = vIceCoverage;
 float plant_coverage = vPlantCoverage * (vDisplacement > sealevel? 1. : 0.);
 float ocean_coverage = smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement);
 float darkness_coverage = smoothstep(insolation_max, 0., vInsolation);
 vec4 ocean = mix(OCEAN, SHALLOW, ocean_coverage);
 vec4 bedrock = mix(MAFIC, FELSIC, felsic_coverage);
 vec4 soil = mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
 vec4 canopy = mix(soil, JUNGLE, plant_coverage);
 vec4 uncovered = @UNCOVERED;
 vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 vec4 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);
 vec4 darkness_covered = mix(ice_covered, NONE, darkness_coverage*darkness_mod-0.01);
 gl_FragColor = darkness_covered;
}
`;
fragmentShaders.generic = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
//converts float from 0-1 to a heat map visualtion
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
vec4 heat (float v) {
 float value = 1.-v;
 return (0.5+0.5*smoothstep(0.0, 0.1, value))*vec4(
  smoothstep(0.5, 0.3, value),
  value < 0.3 ? smoothstep(0.0, 0.3, value) : smoothstep(1.0, 0.6, value),
  smoothstep(0.4, 0.6, value),
  1
 );
}
void main() {
 float epipelagic = sealevel - 200.0;
 float mesopelagic = sealevel - 1000.0;
 float abyssopelagic = sealevel - 4000.0;
 float maxheight = sealevel + 15000.0;
 @OUTPUT
}
`;
fragmentShaders.heatmap = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
//converts float from 0-1 to a heat map visualtion
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
vec4 heat (float v) {
 float value = 1.-v;
 return (0.5+0.5*smoothstep(0.0, 0.1, value))*vec4(
  smoothstep(0.5, 0.3, value),
  value < 0.3 ? smoothstep(0.0, 0.3, value) : smoothstep(1.0, 0.6, value),
  smoothstep(0.4, 0.6, value),
  1
 );
}
void main() {
 float epipelagic = sealevel - 200.0;
 float mesopelagic = sealevel - 1000.0;
 float abyssopelagic = sealevel - 4000.0;
 float maxheight = sealevel + 15000.0;
 vec4 uncovered = heat( smoothstep(@MIN, @MAX, vScalar) );
 vec4 ocean = mix(vec4(0.), uncovered, 0.5);
 vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 gl_FragColor = sea_covered;
}
`;
fragmentShaders.vectorField = `
void main() {
 gl_FragColor = vec4(1);
}
`;
