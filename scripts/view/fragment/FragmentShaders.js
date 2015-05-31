
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.template = _multiline(function() {/**   
//TEMPLATE.GLSL.C GOES HERE

varying float vDisplacement;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_mod;

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

float cosh (float x){
	return exp(x)+exp(-x)/2.;
}

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

	float alt = vDisplacement - sealevel;
	float lat = (asin(abs(vPosition.y)));
	float lapse_rate = 6.4 / 1000.; // °C per m
	
	//Mean annual temperature, °C
	float temp = mix(-25., 30., cos(lat));// - lapse_rate * alt;
	
	//Mean annual precipitation over land, mm yr-1
	//credits for original model go to /u/astrographer, 
	//some modifications made to improve goodness of fit and conceptual integrity 
	//parameters fit to data from 

	float precip_intercept 	= 2000.; 	 	
	float precip_min 		= 60.0;		 	
	float cell_effect		= 1.0;			

	float precip = 	precip_intercept * 
					(1. - lat / radians(90.)) * 							//latitude effect
					//amplitude of circulation cell decreases with latitude, and precip inherently must be positive
					//for these reasons, we multiply the lat effect with the circulation effect
					(cell_effect * cos(6.*lat + radians(30.)) + 1.) +		//circulation cell effect
					precip_min;

	//Mean annual evaporation over land, mm yr-1
	float evap_intercept	= 1166.;
	float evap 	 = evap_intercept / cosh(3.*lat);

	//Net Primary Productivity (NPP), expressed as the fraction of an modeled maximum (3 kg m-2 yr-1)
	//Derived using the Miami model (Lieth et al. 1972). A summary is provided by Grieser et al. 2006
	float npp_temp 		= 1./(1. + exp(1.315 - (0.5/4.) * temp)); 				//temperature limited npp
	float npp_precip 	= (1. - exp(-(precip)/800.)); 							//drought limited npp
	float npp = vDisplacement > sealevel? min(npp_temp, npp_precip) : 0.; 		//realized npp, the most conservative of the two estimates

	//Atmospheric pressure, kPa
	//Equation from the engineering toolbox
	float pressure		= 101.325 * pow(1.- 2.25e-5 * alt, 5.25);
	
	float felsic_fraction = smoothstep(abyssopelagic, maxheight, vDisplacement);
	float mineral_fraction = vDisplacement > sealevel? smoothstep(maxheight, sealevel, vDisplacement) : 0.;
	float organic_fraction 	= degrees(lat)/90.; // smoothstep(30., -30., temp); 
	float ice_fraction = vDisplacement > mix(epipelagic, mesopelagic, smoothstep(0., -10., temp))? 
	smoothstep(0., -10., temp) : 0.;

	@OUTPUT
}
//this line left intentionally empty
**/});

fragmentShaders.debug = _multiline(function() {/**   
//DEBUG.GLSL.C GOES HERE
varying float vDisplacement;
varying vec4 vPosition;

uniform  float sealevel;
uniform  vec3 color;

const vec4 BOTTOM = vec4(0.0,0.0,0.0,1.0);//rgba
const vec4 TOP = vec4(1.0,1.0,1.0,1.0);

void main() {
	float mountainMinHeight = sealevel + 5000.;
	float mountainMaxHeight = sealevel + 15000.0;
	if(vDisplacement > sealevel){
		float x = smoothstep(mountainMinHeight, mountainMaxHeight, vDisplacement);
		gl_FragColor =  mix(vec4(color, 1.0), TOP, x);
	} else if (vDisplacement > 1.){
		float x = smoothstep(-sealevel, sealevel, vDisplacement);
		gl_FragColor =  mix(BOTTOM, vec4(color*.75, 1.0), x);
	} else {
		gl_FragColor =  vec4(0,0,0,1);
	}
}
//this line left intentionally empty

**/});


var realistic = fragmentShaders.template
	.replace('@OUTPUT',
		_multiline(function() {/**   
		vec4 ocean 				= mix(OCEAN, SHALLOW, smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement));
		vec4 bedrock			= mix(MAFIC, FELSIC, felsic_fraction);
		vec4 soil				= mix(bedrock, mix(SAND, PEAT, organic_fraction), mineral_fraction);
		vec4 canopy 			= mix(soil, JUNGLE, npp);
		
		vec4 uncovered = @UNCOVERED;
		vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
		vec4 ice_covered = mix(sea_covered, SNOW, ice_fraction);
		gl_FragColor = ice_covered;
		**/}));

var representative = fragmentShaders.template
	.replace('@OUTPUT',
		_multiline(function() {/**   
		vec4 uncovered 		= @UNCOVERED;
		vec4 ocean 			= mix(OCEAN, uncovered, 0.5);
		vec4 sea_covered 	= vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
		gl_FragColor = sea_covered;
		**/}));


fragmentShaders.satellite = realistic.replace('@UNCOVERED', 'canopy');
fragmentShaders.soil 	= realistic.replace('@UNCOVERED', 'soil');
fragmentShaders.bedrock	= realistic.replace('@UNCOVERED', 'bedrock');
fragmentShaders.npp 	= representative.replace('@UNCOVERED', 'mix(vec4(1), vec4(0,1,0,1), npp)');
fragmentShaders.temp 	= representative.replace('@UNCOVERED', 'heat(smoothstep(-25., 30., temp))');
fragmentShaders.precip 	= representative.replace('@UNCOVERED', 'heat(smoothstep(2000., 0., precip))');
fragmentShaders.alt 	= representative.replace('@UNCOVERED', 'mix(vec4(1), vec4(0,0,0,1), smoothstep(sealevel, maxheight, alt))');
