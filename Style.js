var _multiline = function(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

fragmentShaders = {}

fragmentShaders.satellite = _multiline(function() {/**   

	varying float vDisplacement;
	varying vec4 vPosition;
	
	uniform  float sealevel;

	const vec4 NONE = vec4(0.0,0.0,0.0,0.0);
	const vec4 OCEAN = vec4(0.04,0.04,0.2,1.0);
	const vec4 SHALLOW = vec4(0.04,0.58,0.54,1.0);
	const vec4 MOUNTAIN = vec4(100,85,60,255)/255.;

	const vec4 SNOW  = vec4(0.9, 0.9, 0.9, 0.9); 
	const vec4 TUNDRA = vec4(100,85,60,255)/255.;
	//const vec4 TUNDRA = vec4(0.35,0.30,0.20,1.0);
	//const vec4 TUNDRA = vec4(0.25,0.25,0.125,1.0);
	const vec4 TAIGA = vec4(0.15,0.20,0.05,1.0);
	const vec4 LAND = vec4(0.31,0.43,0.12,1.0);
	const vec4 DESERT = vec4(255,230,155,255)/255.;
	//const vec4 DESERT = vec4(245,215,145,255)/255.;
	const vec4 JUNGLE = vec4(30,50,10,255)/255.;
	//const vec4 JUNGLE = vec4(20,45,5,255)/255.;

	void main() {
		float epipelagic = sealevel - 200.0;
		float maxheight = sealevel + 15000.0; 

		if (vDisplacement < epipelagic) {
			gl_FragColor = OCEAN;
		} else if (vDisplacement < sealevel) {
			float x = smoothstep(epipelagic, sealevel, vDisplacement);
			gl_FragColor =  mix(OCEAN, SHALLOW, x);
		} else {
			float mineral_horizon = smoothstep(maxheight, sealevel, vDisplacement);

			float lat = degrees(asin(abs(vPosition.y)));
			float lapse_rate = 6.4 / 1000.; // oC per m
			
			//Mean annual temperature, oC
			float temp = mix(30., -25., abs(vPosition.y)) - lapse_rate * (vDisplacement - sealevel);
			
			//Mean annual precipitation, mm yr-1
			float precip = 4500.;
			precip = mix(precip, 	0., 	smoothstep(0.,  30., 	lat)); 		//hadley cell
			precip = mix(precip, 	2250.,	smoothstep(30., 60., 	lat)); 	//ferrel cell
			precip = mix(precip, 	0., 	smoothstep(60., 90., 	lat)); 	//polar cell

			//Net Primary Productivity (NPP), expressed as the fraction of an modeled maximum (3 kg m-2 yr-1)
			//Derived using the Miami model (Lieth et al. 1972). A summary is provided by Grieser et al. 2006
			float npp_temp 		= (1. + exp(1.315 - 0.119 * temp)); //temperature limited npp
			float npp_precip 	= (1. - exp(-0.000664 * precip)); 	//drought limited npp
			float npp = min(npp_temp, npp_precip); 					//realized npp, the most conservative of the two estimates
			
			float organic_horizon 	= lat/90.; // smoothstep(30., -30., temp); // 

			vec4 ground				= mix(MOUNTAIN, mix(DESERT, TUNDRA, organic_horizon), mineral_horizon);
			vec4 canopy 			= mix(ground, JUNGLE, npp);
			vec4 snow 				= mix(canopy, SNOW, smoothstep(80., 85., lat));
			
			gl_FragColor = snow;
		}
	}

**/});

fragmentShaders.debug = _multiline(function() {/**   

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

**/});
