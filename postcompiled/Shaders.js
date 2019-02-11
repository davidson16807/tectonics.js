var vertexShaders = {};
vertexShaders.equirectangular = `
const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
attribute float displacement;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute float vector_fraction_traversed;
attribute vec3 vector;
varying float vDisplacement;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;
uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
float lon(vec3 pos) {
 return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
 return asin(pos.y / length(pos));
}
void main() {
 vDisplacement = displacement;
 vPlantCoverage = plant_coverage;
 vSurfaceTemp = surface_temp;
 vIceCoverage = ice_coverage;
 vScalar = scalar;
 vPosition = modelMatrix * vec4( position, 1.0 );
 vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
 float height = displacement > sealevel? 0.005 : 0.0;
 float index_offset = INDEX_SPACING * index;
 float focus = lon(cameraPosition) + index_offset;
 float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI;
 float lat_focused = lat(modelPos.xyz); //+ (index*PI);
 bool is_on_edge = lon_focused > PI*0.9 || lon_focused < -PI*0.9;
 vec4 displaced = vec4(
  lon_focused + index_offset,
  lat(modelPos.xyz), //+ (index*PI), 
  is_on_edge? 0. : length(position),
  1);
 mat4 scaleMatrix = mat4(1);
 scaleMatrix[3] = viewMatrix[3] * reference_distance / world_radius;
 gl_Position = projectionMatrix * scaleMatrix * displaced;
}
`;
vertexShaders.texture = `
const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
attribute float displacement;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute float vector_fraction_traversed;
attribute vec3 vector;
varying float vDisplacement;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;
uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
float lon(vec3 pos) {
 return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
 return asin(pos.y / length(pos));
}
void main() {
 vDisplacement = displacement;
 vPlantCoverage = plant_coverage;
 vIceCoverage = ice_coverage;
 vSurfaceTemp = surface_temp;
 vScalar = scalar;
 vPosition = modelMatrix * vec4( position, 1.0 );
 vec4 modelPos = modelMatrix * vec4( ( position ), 1.0 );
 float index_offset = INDEX_SPACING * index;
 float focus = lon(cameraPosition) + index_offset;
 float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
 float lat_focused = lat(modelPos.xyz); //+ (index*PI);
 float height = displacement > sealevel? 0.005 : 0.0;
 gl_Position = vec4(
        lon_focused / PI,
  lat_focused / (PI/2.),
  -height,
  1);
}
`;
vertexShaders.orthographic = `
const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
attribute float displacement;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute float vector_fraction_traversed;
attribute vec3 vector;
varying float vDisplacement;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;
uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
void main() {
 vDisplacement = displacement;
 vPlantCoverage = plant_coverage;
 vIceCoverage = ice_coverage;
 vSurfaceTemp = surface_temp;
 vScalar = scalar;
 vVectorFractionTraversed = vector_fraction_traversed;
 vPosition = modelMatrix * vec4( position, 1.0 );
 float surface_height = max(displacement - sealevel, 0.);
 vec4 displacement = vec4( position * (world_radius + surface_height) / reference_distance, 1.0 );
 gl_Position = projectionMatrix * modelViewMatrix * displacement;
}
`;
vertexShaders.passthrough = `
varying vec2 vUv;
void main() {
 vUv = uv;
 gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
var fragmentShaders = {};
fragmentShaders.realistic = `
// NOTE: these macros are here to allow porting the code between several languages
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.;
const float KELVIN = 1.;
const float MICROGRAM = 1e-9; // kilograms
const float MILLIGRAM = 1e-6; // kilograms
const float GRAM = 1e-3; // kilograms
const float KILOGRAM = 1.; // kilograms
const float TON = 1000.; // kilograms
const float NANOMETER = 1e-9; // meter
const float MICROMETER = 1e-6; // meter
const float MILLIMETER = 1e-3; // meter
const float METER = 1.; // meter
const float KILOMETER = 1000.; // meter
const float MOLE = 6.02214076e23;
const float MILLIMOLE = MOLE / 1e3;
const float MICROMOLE = MOLE / 1e6;
const float NANOMOLE = MOLE / 1e9;
const float FEMTOMOLE = MOLE / 1e12;
const float SECOND = 1.; // seconds
const float MINUTE = 60.; // seconds
const float HOUR = MINUTE*60.; // seconds
const float DAY = HOUR*24.; // seconds
const float WEEK = DAY*7.; // seconds
const float MONTH = DAY*29.53059; // seconds
const float YEAR = DAY*365.256363004; // seconds
const float MEGAYEAR = YEAR*1e6; // seconds
const float NEWTON = KILOGRAM * METER / (SECOND * SECOND);
const float JOULE = NEWTON * METER;
const float WATT = JOULE / SECOND;
const float EARTH_MASS = 5.972e24; // kilograms
const float EARTH_RADIUS = 6.367e6; // meters
const float STANDARD_GRAVITY = 9.80665; // meters/second^2
const float STANDARD_TEMPERATURE = 273.15; // kelvin
const float STANDARD_PRESSURE = 101325.; // pascals
const float ASTRONOMICAL_UNIT = 149597870700.; // meters
const float GLOBAL_SOLAR_CONSTANT = 1361.; // watts/meter^2
const float JUPITER_MASS = 1.898e27; // kilograms
const float JUPITER_RADIUS = 71e6; // meters
const float SOLAR_MASS = 2e30; // kilograms
const float SOLAR_RADIUS = 695.7e6; // meters
const float SOLAR_LUMINOSITY = 3.828e26; // watts
const float SOLAR_TEMPERATURE = 5772.; // kelvin
const float PI = 3.14159265358979323846264338327950288419716939937510;
float get_surface_area_of_sphere(
 in float radius
) {
 return 4.*PI*radius*radius;
}
// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
void get_relation_between_ray_and_point(
 in vec3 point_position,
 in vec3 ray_origin,
 in vec3 ray_direction,
 out float distance_at_closest_approach2,
 out float distance_to_closest_approach
){
 vec3 ray_to_point = point_position - ray_origin;
 distance_to_closest_approach = dot(ray_to_point, ray_direction);
 distance_at_closest_approach2 =
  dot(ray_to_point, ray_to_point) -
  distance_to_closest_approach * distance_to_closest_approach;
}
bool try_get_relation_between_ray_and_sphere(
 in float sphere_radius,
 in float distance_at_closest_approach2,
 in float distance_to_closest_approach,
 out float distance_to_entrance,
 out float distance_to_exit
){
 float sphere_radius2 = sphere_radius * sphere_radius;
 float distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - distance_at_closest_approach2, 1e-10));
 distance_to_entrance = distance_to_closest_approach - distance_from_closest_approach_to_exit;
 distance_to_exit = distance_to_closest_approach + distance_from_closest_approach_to_exit;
 return (distance_to_exit > 0. && distance_at_closest_approach2 < sphere_radius*sphere_radius);
}
const float SPEED_OF_LIGHT = 299792458. * METER / SECOND;
const float BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const float STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER*METER* KELVIN*KELVIN*KELVIN*KELVIN);
const float PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
float solve_black_body_fraction_below_wavelength(
 in float wavelength,
 in float temperature
){
 const float iterations = 2.;
 const float h = PLANCK_CONSTANT;
 const float k = BOLTZMANN_CONSTANT;
 const float c = SPEED_OF_LIGHT;
 float L = wavelength;
 float T = temperature;
 float C2 = h*c/k;
 float z = C2 / (L*T);
 float z2 = z*z;
 float z3 = z2*z;
 float sum = 0.;
 float n2=0.;
 float n3=0.;
 for (float n=1.; n <= iterations; n++) {
  n2 = n*n;
  n3 = n2*n;
  sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
 }
 return 15.*sum/(PI*PI*PI*PI);
}
float solve_black_body_fraction_between_wavelengths(
 in float lo,
 in float hi,
 in float temperature
){
 return solve_black_body_fraction_below_wavelength(hi, temperature) -
   solve_black_body_fraction_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
float get_black_body_emissive_flux(
 in float temperature
){
    float T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
vec3 get_rgb_intensity_of_emitted_light_from_black_body(
 in float temperature
){
 return get_black_body_emissive_flux(temperature)
   * vec3(
    solve_black_body_fraction_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
    solve_black_body_fraction_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
    solve_black_body_fraction_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
     );
}
float get_rayleigh_phase_factor(in float cos_scatter_angle)
{
 return
   3. * (1. + cos_scatter_angle*cos_scatter_angle)
 / //------------------------
    (16. * PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
float get_henyey_greenstein_phase_factor(in float cos_scatter_angle)
{
 const float g = 0.76;
 return
      (1. - g*g)
 / //---------------------------------------------
  ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick Phase Function factor
// Pharr and  Humphreys [2004] equivalence to g above
float get_schlick_phase_factor(in float cos_scatter_angle)
{
 const float g = 0.76;
 const float k = 1.55*g - 0.55 * (g*g*g);
 return
     (1. - k*k)
 / //-------------------------------------------
  (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (in float x, in float edge0, in float edge1, in float height)
{
    float center = (edge1 + edge0) / 2.;
    float width = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
 return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (in float w)
{
 return vec3(
        bump(w, 530e-9, 690e-9, 1.00)+
        bump(w, 410e-9, 460e-9, 0.15),
        bump(w, 465e-9, 635e-9, 0.75)+
        bump(w, 420e-9, 700e-9, 0.15),
        bump(w, 400e-9, 570e-9, 0.45)+
        bump(w, 570e-9, 625e-9, 0.30)
      );
}
// "GAMMA" is the constant that's used to map between 
//   rgb signals sent to a monitor and their actual intensity
const float GAMMA = 2.2;
vec3 get_rgb_intensity_of_rgb_signal(in vec3 signal)
{
 return vec3(
  pow(signal.x, GAMMA),
  pow(signal.y, GAMMA),
  pow(signal.z, GAMMA)
 );
}
vec3 get_rgb_signal_of_rgb_intensity(in vec3 intensity)
{
 return vec3(
  pow(intensity.x, 1./GAMMA),
  pow(intensity.y, 1./GAMMA),
  pow(intensity.z, 1./GAMMA)
 );
}
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying float vSurfaceTemp;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
uniform float darkness_mod;
uniform float ice_mod;
uniform float insolation_max;
const vec3 light_position = vec3(ASTRONOMICAL_UNIT,0,0);
const vec3 NONE = vec3(0.0,0.0,0.0);
const vec3 OCEAN = vec3(0.04,0.04,0.2);
const vec3 SHALLOW = vec3(0.04,0.58,0.54);
const vec3 MAFIC = vec3(50,45,50)/255.; // observed on lunar maria 
const vec3 FELSIC = vec3(214,181,158)/255.; // observed color of rhyolite sample
//const vec3 SAND 	= vec3(255,230,155)/255.;
const vec3 SAND = vec3(245,215,145)/255.;
const vec3 PEAT = vec3(100,85,60)/255.;
const vec3 SNOW = vec3(0.9, 0.9, 0.9);
const vec3 JUNGLE = vec3(30,50,10)/255.;
//const vec3 JUNGLE	= vec3(20,45,5)/255.;
bool isnan(float val)
{
  return (val <= 0.0 || 0.0 <= val) ? false : true;
}
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
 vec3 light_offset = light_position; // - world_position;
 vec3 light_direction = normalize(light_offset);
 float light_distance = length(light_offset);
 vec3 ocean = mix(OCEAN, SHALLOW, ocean_coverage);
 vec3 bedrock = mix(MAFIC, FELSIC, felsic_coverage);
 vec3 soil = mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
 vec3 canopy = mix(soil, JUNGLE, plant_coverage);
 vec3 uncovered = @UNCOVERED;
 vec3 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 vec3 ice_covered = mix(sea_covered, SNOW, ice_coverage*ice_mod);
 vec3 surface_rgb_intensity =
  max(dot(vPosition.xyz, light_direction), 0.001) * get_rgb_intensity_of_rgb_signal(ice_covered) +
  get_rgb_intensity_of_emitted_light_from_black_body(vSurfaceTemp);
  // get_rgb_intensity_of_emitted_light_from_black_body(vSurfaceTemp);
 gl_FragColor = vec4(get_rgb_signal_of_rgb_intensity(surface_rgb_intensity),1);
}
`;
fragmentShaders.monochromatic = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
void main() {
 vec4 uncovered = mix(
  vec4(@MINCOLOR,1.),
  vec4(@MAXCOLOR,1.),
  vScalar
 );
 vec4 ocean = mix(vec4(0.), uncovered, 0.5);
 vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 gl_FragColor = sea_covered;
}
`;
fragmentShaders.heatmap = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
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
 vec4 uncovered = heat( vScalar );
 vec4 ocean = mix(vec4(0.), uncovered, 0.5);
 vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
 gl_FragColor = sea_covered;
}
`;
fragmentShaders.topographic = `
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float sealevel_mod;
//converts a float ranging from [-1,1] to a topographic map visualization
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
void main() {
    //deep ocean
    vec3 color = vec3(0,0,0.8);
    //shallow ocean
    color = mix(
        color,
        vec3(0.5,0.5,1),
        smoothstep(-1., -0.01, vScalar)
    );
    //lowland
    color = mix(
        color,
        vec3(0,0.55,0),
        smoothstep(-0.01, 0.01, vScalar)
    );
    //highland
    color = mix(
        color,
        vec3(0.95,0.95,0),
        smoothstep(0., 0.45, vScalar)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0),
        smoothstep(0.2, 0.7, vScalar)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0.5),
        smoothstep(0.4, 0.8, vScalar)
    );
    //snow cap
    color = mix(
        color,
        vec3(0.95),
        smoothstep(0.75, 1., vScalar)
    );
 gl_FragColor = vec4(color, 1.);
}
`;
fragmentShaders.vectorField = `
const float PI = 3.14159265358979;
uniform float animation_phase_angle;
varying float vVectorFractionTraversed;
void main() {
 float state = (cos(2.*PI*vVectorFractionTraversed - animation_phase_angle) + 1.) / 2.;
 gl_FragColor = vec4(state) * vec4(vec3(0.8),0.) + vec4(vec3(0.2),0.);
}
`;
fragmentShaders.atmosphere = `
// NOTE: these macros are here to allow porting the code between several languages
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.;
const float KELVIN = 1.;
const float MICROGRAM = 1e-9; // kilograms
const float MILLIGRAM = 1e-6; // kilograms
const float GRAM = 1e-3; // kilograms
const float KILOGRAM = 1.; // kilograms
const float TON = 1000.; // kilograms
const float NANOMETER = 1e-9; // meter
const float MICROMETER = 1e-6; // meter
const float MILLIMETER = 1e-3; // meter
const float METER = 1.; // meter
const float KILOMETER = 1000.; // meter
const float MOLE = 6.02214076e23;
const float MILLIMOLE = MOLE / 1e3;
const float MICROMOLE = MOLE / 1e6;
const float NANOMOLE = MOLE / 1e9;
const float FEMTOMOLE = MOLE / 1e12;
const float SECOND = 1.; // seconds
const float MINUTE = 60.; // seconds
const float HOUR = MINUTE*60.; // seconds
const float DAY = HOUR*24.; // seconds
const float WEEK = DAY*7.; // seconds
const float MONTH = DAY*29.53059; // seconds
const float YEAR = DAY*365.256363004; // seconds
const float MEGAYEAR = YEAR*1e6; // seconds
const float NEWTON = KILOGRAM * METER / (SECOND * SECOND);
const float JOULE = NEWTON * METER;
const float WATT = JOULE / SECOND;
const float EARTH_MASS = 5.972e24; // kilograms
const float EARTH_RADIUS = 6.367e6; // meters
const float STANDARD_GRAVITY = 9.80665; // meters/second^2
const float STANDARD_TEMPERATURE = 273.15; // kelvin
const float STANDARD_PRESSURE = 101325.; // pascals
const float ASTRONOMICAL_UNIT = 149597870700.; // meters
const float GLOBAL_SOLAR_CONSTANT = 1361.; // watts/meter^2
const float JUPITER_MASS = 1.898e27; // kilograms
const float JUPITER_RADIUS = 71e6; // meters
const float SOLAR_MASS = 2e30; // kilograms
const float SOLAR_RADIUS = 695.7e6; // meters
const float SOLAR_LUMINOSITY = 3.828e26; // watts
const float SOLAR_TEMPERATURE = 5772.; // kelvin
const float PI = 3.14159265358979323846264338327950288419716939937510;
float get_surface_area_of_sphere(
 in float radius
) {
 return 4.*PI*radius*radius;
}
// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
void get_relation_between_ray_and_point(
 in vec3 point_position,
 in vec3 ray_origin,
 in vec3 ray_direction,
 out float distance_at_closest_approach2,
 out float distance_to_closest_approach
){
 vec3 ray_to_point = point_position - ray_origin;
 distance_to_closest_approach = dot(ray_to_point, ray_direction);
 distance_at_closest_approach2 =
  dot(ray_to_point, ray_to_point) -
  distance_to_closest_approach * distance_to_closest_approach;
}
bool try_get_relation_between_ray_and_sphere(
 in float sphere_radius,
 in float distance_at_closest_approach2,
 in float distance_to_closest_approach,
 out float distance_to_entrance,
 out float distance_to_exit
){
 float sphere_radius2 = sphere_radius * sphere_radius;
 float distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - distance_at_closest_approach2, 1e-10));
 distance_to_entrance = distance_to_closest_approach - distance_from_closest_approach_to_exit;
 distance_to_exit = distance_to_closest_approach + distance_from_closest_approach_to_exit;
 return (distance_to_exit > 0. && distance_at_closest_approach2 < sphere_radius*sphere_radius);
}
const float SPEED_OF_LIGHT = 299792458. * METER / SECOND;
const float BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const float STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER*METER* KELVIN*KELVIN*KELVIN*KELVIN);
const float PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
// we only do a single iteration with n=1, because it doesn't have a noticeable effect on output
float solve_black_body_fraction_below_wavelength(
 in float wavelength,
 in float temperature
){
 const float iterations = 2.;
 const float h = PLANCK_CONSTANT;
 const float k = BOLTZMANN_CONSTANT;
 const float c = SPEED_OF_LIGHT;
 float L = wavelength;
 float T = temperature;
 float C2 = h*c/k;
 float z = C2 / (L*T);
 float z2 = z*z;
 float z3 = z2*z;
 float sum = 0.;
 float n2=0.;
 float n3=0.;
 for (float n=1.; n <= iterations; n++) {
  n2 = n*n;
  n3 = n2*n;
  sum += (z3 + 3.*z2/n + 6.*z/n2 + 6./n3) * exp(-n*z) / n;
 }
 return 15.*sum/(PI*PI*PI*PI);
}
float solve_black_body_fraction_between_wavelengths(
 in float lo,
 in float hi,
 in float temperature
){
 return solve_black_body_fraction_below_wavelength(hi, temperature) -
   solve_black_body_fraction_below_wavelength(lo, temperature);
}
// This calculates the radiation (in watts/m^2) that's emitted 
// by a single object using the Stephan-Boltzmann equation
float get_black_body_emissive_flux(
 in float temperature
){
    float T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}
vec3 get_rgb_intensity_of_emitted_light_from_black_body(
 in float temperature
){
 return get_black_body_emissive_flux(temperature)
   * vec3(
    solve_black_body_fraction_between_wavelengths(600e-9*METER, 700e-9*METER, temperature),
    solve_black_body_fraction_between_wavelengths(500e-9*METER, 600e-9*METER, temperature),
    solve_black_body_fraction_between_wavelengths(400e-9*METER, 500e-9*METER, temperature)
     );
}
float get_rayleigh_phase_factor(in float cos_scatter_angle)
{
 return
   3. * (1. + cos_scatter_angle*cos_scatter_angle)
 / //------------------------
    (16. * PI);
}
// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
float get_henyey_greenstein_phase_factor(in float cos_scatter_angle)
{
 const float g = 0.76;
 return
      (1. - g*g)
 / //---------------------------------------------
  ((4. + PI) * pow(1. + g*g - 2.*g*cos_scatter_angle, 1.5));
}
// Schlick Phase Function factor
// Pharr and  Humphreys [2004] equivalence to g above
float get_schlick_phase_factor(in float cos_scatter_angle)
{
 const float g = 0.76;
 const float k = 1.55*g - 0.55 * (g*g*g);
 return
     (1. - k*k)
 / //-------------------------------------------
  (4. * PI * (1. + k*cos_scatter_angle) * (1. + k*cos_scatter_angle));
}
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (in float x, in float edge0, in float edge1, in float height)
{
    float center = (edge1 + edge0) / 2.;
    float width = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
 return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (in float w)
{
 return vec3(
        bump(w, 530e-9, 690e-9, 1.00)+
        bump(w, 410e-9, 460e-9, 0.15),
        bump(w, 465e-9, 635e-9, 0.75)+
        bump(w, 420e-9, 700e-9, 0.15),
        bump(w, 400e-9, 570e-9, 0.45)+
        bump(w, 570e-9, 625e-9, 0.30)
      );
}
// "GAMMA" is the constant that's used to map between 
//   rgb signals sent to a monitor and their actual intensity
const float GAMMA = 2.2;
vec3 get_rgb_intensity_of_rgb_signal(in vec3 signal)
{
 return vec3(
  pow(signal.x, GAMMA),
  pow(signal.y, GAMMA),
  pow(signal.z, GAMMA)
 );
}
vec3 get_rgb_signal_of_rgb_intensity(in vec3 intensity)
{
 return vec3(
  pow(intensity.x, 1./GAMMA),
  pow(intensity.y, 1./GAMMA),
  pow(intensity.z, 1./GAMMA)
 );
}
varying vec2 vUv;
uniform sampler2D surface_light;
// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;
// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4 projection_matrix_inverse;
uniform mat4 view_matrix_inverse;
// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3 world_position;
// radius of the world being rendered, in meters
uniform float world_radius;
// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3 light_rgb_intensity;
uniform vec3 light_direction;
// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform float atmosphere_scale_height;
uniform vec3 atmosphere_surface_rayleigh_scattering_coefficients;
uniform vec3 atmosphere_surface_mie_scattering_coefficients;
uniform vec3 atmosphere_surface_absorption_coefficients;
const float BIG = 1e50;
bool isnan(float x)
{
 return !(0. <= x || x <= 0.);
}
bool isbig(float x)
{
 return abs(x)>BIG;
}
// "get_h" gets the altitude at a point along the path
//   for a ray traveling through the atmosphere.
float get_h(float x, float z2, float R){
    return sqrt(max(x*x + z2, 0.)) - R;
}
// "get_dhdx" gets the rate at which altitude changes for a distance traveled along the path
//   for a ray traveling through the atmosphere.
float get_dhdx(float x, float z2){
    return x / sqrt(max(x*x + z2, 0.));
}
// "get_rho" gets the density ratio of an altitude within the atmosphere
// the "density ratio" is density expressed as a fraction of a surface value
float get_rho(
    float h,
    float H
){
    return exp(-h/H);
}
// "approx_sigma_from_samples" returns an approximation 
//   for the columnar density ratio encountered by a ray traveling through the atmosphere.
// It is the integral of get_rho() along the path of the ray, 
//   taking into account the altitude at every point along the path.
// We can't solve the integral in the usual fashion due to singularities
//   (see https://www.wolframalpha.com/input/?i=integrate+exp(-sqrt(x%5E2%2Bz%5E2)%2FH)+dx)
//   so we use a linear approximation for the altitude.
// Our linear approximation gets its slope and intercept from sampling
//   at points along the path (xm and xb respectively)
float approx_sigma_from_samples(float x, float xm, float xb, float z2, float R, float H){
 float m = get_dhdx(xm,z2);
 float b = get_h(xb,z2,R);
 float h = m*(x-xb) + b;
    return -H/m * exp(-h/H);
}
// "approx_sigma_for_segment" is a convenience wrapper for approx_sigma_from_samples(), 
//   which calculates sensible values of xm and xb for the user 
//   given a specified range around which the approximation is valid.
// The range is indicated by its lower bounds (xmin) and width (dx).
float approx_sigma_for_segment(float x, float xmin, float dx, float z2, float R, float H){
    const float fm = 0.5;
    const float fb = 0.2;
    float xm = xmin + fm*dx;
    float xb = xmin + fb*dx;
    float xmax = xmin + dx;
    return approx_sigma_from_samples(clamp(x, xmin, xmax), xm, xb, z2,R,H);
}
// "approx_sigma_for_absx" is a convenience wrapper for approx_sigma_for_segment().
// It returns a approximation of columnar density ratio that should be appropriate for any positive value of x.
// It does this by making two linear approximations for height:
//   one for the lower atmosphere, one for the upper atmosphere.
// These are represented by the two call outs to approx_sigma_for_segment().
// There is an additional parameter introduced, "sigma0",
//   which is the columnar density ratio generated by this equation at x=0.
// sigma0 is used to express values for columnar density ratio relative to the surface of the world
// NOTE: unlike approx_sigma_from_samples() and approx_sigma_for_segment(), 
//   all input distances are relative to the surface, not the world's center!
float approx_sigma_for_absx(float x, float sigma0, float z2, float R, float H){
 // "nH" is the number of scale heights at which we encounter the "top" of the atmosphere.
    const float nH = 12.0;
    // "xR" is the distance from closest approach at which we encounter the surface of the world
    float xR = sqrt(max(R*R - z2, 0.));
    // "atmosphere_radius" is the distance from the center of the world to the top of the atmosphere
    float rtop = nH*H+R;
    // "xtop" is the distance from closest approach at which we encounter the top of the atmosphere
    float xtop = sqrt(max(rtop*rtop - z2, 0.)) - xR;
    // "dx" is the width of the bounds covered by our linear approximations
    float dx = xtop/3.;
    // "absx" is the absolute value of x
    float absx = abs(x);
    return
        approx_sigma_for_segment(xR+absx, xR, dx, z2,R,H) +
        approx_sigma_for_segment(xR+absx, xR+dx, dx, z2,R,H) -
        sigma0;
}
// "approx_sigma0" is a convenience wrapper for approx_sigma_for_absx().
// It returns a value for sigma0 that can be passed to approx_sigma().
float approx_sigma0(float z2, float R, float H){
    return approx_sigma_for_absx(0., 0., z2, R, H);
}
// "approx_sigma" is a convenience wrapper for approx_sigma_for_absx().
// It returns a approximation of columnar density ratio that should be appropriate for any value of x.
float approx_sigma(float x, float sigma0, float z2, float R, float H){
    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return sign(x) * min(approx_sigma_for_absx(x, sigma0, z2, R, H), BIG);
}
vec3 get_rgb_intensity_of_light_rays_through_atmosphere(
    vec3 view_origin, vec3 view_direction,
    vec3 world_position, float world_radius,
    vec3 light_direction, vec3 light_rgb_intensity,
    vec3 background_rgb_intensity,
    float atmosphere_scale_height,
    vec3 beta_ray,
    vec3 beta_mie,
    vec3 beta_abs
){
    float unused1, unused2, unused3, unused4;
    bool view_is_scattered; // whether view ray will enter the atmosphere
    bool view_is_obstructed; // whether view ray will enter the surface of a world
    float view_z2; // distance ("radius") from the view ray to the center of the world at closest approach, squared
    float view_x_z; // distance along the view ray at which closest approach occurs
    float view_x_enter_atmo; // distance along the view ray at which the ray enters the atmosphere
    float view_x_exit_atmo; // distance along the view ray at which the ray exits the atmosphere
    float view_x_enter_world; // distance along the view ray at which the ray enters the surface of the world
    const float VIEW_STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    float view_dx; // distance between steps while marching along the view ray
    float view_x; // distance traversed while marching along the view ray
    float view_h; // distance ("height") from the surface of the world while marching along the view ray
    float view_sigma; // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface
    vec3 view_pos; // absolute position while marching along the view ray
    bool light_is_scattered; // whether light ray will enter the atmosphere
    bool light_is_obstructed;// whether light ray will enter the surface of a world
    float light_z2; // distance ("radius") from the light ray to the center of the world at closest approach, squared
    float light_x_z; // distance along the light ray at which closest approach occurs
    float light_x_enter_atmo; // distance along the light ray at which the ray enters the atmosphere
    float light_x_enter_world;// distance along the light ray at which the ray enters the surface of the world
    float light_x_exit_atmo; // distance along the light ray at which the ray exits the atmosphere
    float light_x_exit_world; // distance along the light ray at which the ray would exit the world, if it could pass through
    float light_sigma; // columnar density ratio encountered along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface
    float light_sigma0; // reference columnar density ratio for the light ray. This is used to calculate an approximation for the true column density ratio.
    // NOTE: "12." is the number of scale heights needed to reach the official edge of space on Earth.
    float atmosphere_height = 12. * atmosphere_scale_height;
    // "atmosphere_radius" is the distance from the center of the world to the top of the atmosphere
    float atmosphere_radius = world_radius + atmosphere_height;
    // cosine of angle between view and light directions
    float cos_scatter_angle = dot(view_direction, light_direction);
    // fraction of outgoing light transmitted across a given path
    vec3 fraction_outgoing = vec3(0);
    // fraction of incoming light transmitted across a given path
    vec3 fraction_incoming = vec3(0);
    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    vec3 total_rgb_intensity = vec3(0);
    // Rayleigh and Mie phase factors,
    // A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // This factor indicates the fraction of sunlight scattered to a given angle (indicated by its cosine, A.K.A. "cos_scatter_angle").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    // The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
    // and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    float gamma_ray = get_rayleigh_phase_factor(cos_scatter_angle);
    float gamma_mie = get_henyey_greenstein_phase_factor(cos_scatter_angle);
    float gamma_abs = 0.; // NOT USED YET
    get_relation_between_ray_and_point(
  world_position,
     view_origin, view_direction,
  view_z2, view_x_z
 );
    view_is_scattered = try_get_relation_between_ray_and_sphere(
        atmosphere_radius,
        view_z2, view_x_z,
        view_x_enter_atmo, view_x_exit_atmo
    );
    view_is_obstructed = try_get_relation_between_ray_and_sphere(
        world_radius,
        view_z2, view_x_z,
        view_x_enter_world, unused3
    );
    // if view does not interact with the atmosphere, 
    // do not bother running the raymarch algorithm
    if (!view_is_scattered)
    {
     return background_rgb_intensity;
    }
    if (view_is_obstructed)
    {
        view_x_exit_atmo = view_x_enter_world;
    }
    view_dx = (view_x_exit_atmo - view_x_enter_atmo) / VIEW_STEP_COUNT;
    view_x = view_x_enter_atmo + 0.5 * view_dx;
    view_sigma = 0.;
    for (float i = 0.; i < VIEW_STEP_COUNT; ++i)
    {
        view_pos = view_origin + view_direction * view_x;
        view_h = length(view_pos - world_position) - world_radius;
        // If sample point lies inside the planet, 
        //   then no light past this point will ever reach the camera.
        // NOTE: please consider this line if checking for multiple light sources 
        //   within the same viewray raymarching loop, since it could cause insidious problems
        if (view_h < 0.)
        {
            break;
        }
        view_sigma += view_dx * exp(-view_h/atmosphere_scale_height);
     get_relation_between_ray_and_point(
   world_position,
      view_pos, light_direction,
   light_z2, light_x_z
  );
        light_is_scattered = try_get_relation_between_ray_and_sphere(
            world_radius + atmosphere_height,
   light_z2, light_x_z,
            unused1, light_x_exit_atmo
        );
        light_is_obstructed = try_get_relation_between_ray_and_sphere(
            world_radius,
   light_z2, light_x_z,
            unused3, light_x_exit_world
        );
        if (light_is_obstructed)
        {
            continue;
        }
        light_sigma0 = approx_sigma0(light_z2, world_radius, atmosphere_scale_height);
        // REMEMBER: all values for x passed to approx_sigma() are 
        //   distances relative to the *surface*
        light_sigma =
         approx_sigma( light_x_exit_atmo -light_x_exit_world, light_sigma0, light_z2, world_radius, atmosphere_scale_height)-
            approx_sigma( -light_x_exit_world, light_sigma0, light_z2, world_radius, atmosphere_scale_height);
        fraction_outgoing = exp(-beta_ray * (view_sigma + light_sigma) - beta_abs * view_sigma);
        fraction_incoming = beta_ray * gamma_ray * view_dx * exp(-view_h/atmosphere_scale_height);
        total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;
        fraction_outgoing = exp(-beta_mie * (view_sigma + light_sigma) - beta_abs * view_sigma);
        fraction_incoming = beta_mie * gamma_mie * view_dx* exp(-view_h/atmosphere_scale_height);
        total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;
        view_x += view_dx;
    }
    //// now calculate intensity of light that traveled straight in from the background, and add it to the total
    fraction_outgoing = exp(-beta_abs * view_sigma);
    total_rgb_intensity += background_rgb_intensity * fraction_outgoing;
    return total_rgb_intensity;
}
vec2 get_chartspace(vec2 bottomleft, vec2 topright, vec2 screenspace){
    return screenspace * abs(topright - bottomleft) + bottomleft;
}
vec3 line(float y, vec2 chartspace, float line_width, vec3 line_color){
    return abs(y-chartspace.y) < line_width? line_color : vec3(1.);
}
vec3 chart_scratch(vec2 screenspace){
    vec2 bottomleft = vec2(-500e3, -100e3);
    vec2 topright = vec2( 500e3, 100e3);
    vec2 chartspace = get_chartspace(bottomleft, topright, screenspace);
    float line_width = 0.01 * abs(topright - bottomleft).y;
    float z = 6.35e6;
    float z2 = z*z;
    float light_x_enter_world = sqrt(max(world_radius*world_radius - z2, 0.));
    float sigma0 = approx_sigma0(z2, world_radius, atmosphere_scale_height);
    float closed_form_approximation = approx_sigma(chartspace.x, sigma0, z2, world_radius, atmosphere_scale_height);
    const float LIGHT_STEP_COUNT = 8.;
    float light_dx = (chartspace.x) / LIGHT_STEP_COUNT;
    float light_x = 0.5 * light_dx;
    float light_h = 0.;
    float iterative_approximation = 0.;
    for (float j = 0.; j < LIGHT_STEP_COUNT; ++j)
    {
        light_h = sqrt((light_x+light_x_enter_world)*(light_x+light_x_enter_world) + z2) - world_radius;
        iterative_approximation += light_dx * exp(-light_h/atmosphere_scale_height);
        light_x += light_dx;
    }
    return
        line(iterative_approximation, chartspace, line_width, vec3(1,0,0)) *
        line(closed_form_approximation, chartspace, line_width, vec3(0,1,0));
}
void main() {
    vec2 screenspace = vUv;
    gl_FragColor = vec4(chart_scratch(screenspace), 1);
    // return;
    vec2 clipspace = 2.0 * screenspace - 1.0;
    vec3 view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    vec3 view_origin = view_matrix_inverse[3].xyz * reference_distance;
    float AESTHETIC_FACTOR1 = 0.5;
    vec4 background_rgb_signal = texture2D( surface_light, vUv );
    vec3 background_rgb_intensity = AESTHETIC_FACTOR1 * light_rgb_intensity * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
    vec3 rgb_intensity = get_rgb_intensity_of_light_rays_through_atmosphere(
        view_origin, view_direction,
        world_position, world_radius,
        light_direction, light_rgb_intensity, // light direction and rgb intensity
        background_rgb_intensity,
        atmosphere_scale_height,
        atmosphere_surface_rayleigh_scattering_coefficients,
        atmosphere_surface_mie_scattering_coefficients,
        vec3(0.)// atmosphere_surface_absorption_coefficients 
    );
    // rgb_intensity = 1.0 - exp2( rgb_intensity * -1.0 ); // simple tonemap
    // gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_direction),1), 0.5);
    // return;
    // if (!is_interaction) {
    //  gl_FragColor = vec4(0);
    //  return;
    // } 
    // gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_origin),1), 0.5);
    // gl_FragColor = mix(background_rgb_signal, vec4(vec3(distance_to_exit/reference_distance/5.),1), 0.5);
    // gl_FragColor = mix(background_rgb_signal, vec4(10.0*get_rgb_signal_of_rgb_intensity(rgb_intensity),1), 0.5);
    float AESTHETIC_FACTOR2 = 0.1;
    gl_FragColor = vec4(AESTHETIC_FACTOR2*get_rgb_signal_of_rgb_intensity(rgb_intensity),1);
    // gl_FragColor = background_rgb_signal;
    // NOTES:
    // solids are modeled as a gas where attenuation coefficient is super high
    // space is   modeled as a gas where attenuation coefficient is super low
}
`;
fragmentShaders.passthrough = `
uniform sampler2D input_texture;
varying vec2 vUv;
void main() {
 gl_FragColor = texture2D( input_texture, vUv );
}
`;
