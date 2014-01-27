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
	const vec4 MOUNTAIN = vec4(0.5,0.5,0.5,1.0);

	const vec4 SNOW  = vec4(0.9, 0.9, 0.9, 0.9); 
	//const vec4 TUNDRA = vec4(0.35,0.30,0.20,1.0);
	const vec4 TUNDRA = vec4(0.25,0.25,0.125,1.0);
	const vec4 TAIGA = vec4(0.15,0.20,0.05,1.0);
	const vec4 LAND = vec4(0.31,0.43,0.12,1.0);
	const vec4 DESERT = vec4(0.6,0.5,0.35,1.0);
	const vec4 JUNGLE = vec4(0.1,0.2,0.05,1.0);

	float SNOWLINE_MAX = sin(radians(77.));
	float SNOWLINE_MIN = sin(radians(73.));
	float TREELINE_MAX = sin(radians(70.));
	float TREELINE_MIN = sin(radians(60.));
	float TAIGALINE_MAX = sin(radians(60.));
	float TAIGALINE_MIN = sin(radians(50.));
	float GRASSLINE_MAX = sin(radians(40.));
	float GRASSLINE_MIN = sin(radians(30.));
	float DESERTLINE_MAX = sin(radians(30.));
	float DESERTLINE_MIN = sin(radians(15.));

	void main() {
		float epipelagic = sealevel - 1000.0;
		float maxheight = sealevel + 15000.0; 
		
		if (vDisplacement < epipelagic) {
			gl_FragColor = OCEAN;
		} else if (vDisplacement < sealevel) {
			float x = smoothstep(epipelagic, sealevel, vDisplacement);
			gl_FragColor =  mix(OCEAN, SHALLOW, x);
		} else {
			//float x = smoothstep(sealevel, maxheight, vDisplacement);
			gl_FragColor =  JUNGLE; //mix(LAND, MOUNTAIN, x);
		}
		if (vDisplacement > sealevel && abs(vPosition.y) > DESERTLINE_MIN){
			float x = smoothstep(DESERTLINE_MIN, DESERTLINE_MAX, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, DESERT, x);
		}
		if (vDisplacement > sealevel && abs(vPosition.y) > GRASSLINE_MIN){
			float x = smoothstep(GRASSLINE_MIN, GRASSLINE_MAX, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, LAND, x);
		}
		if (vDisplacement > sealevel && abs(vPosition.y) > TAIGALINE_MIN){
			float x = smoothstep(TAIGALINE_MIN, TAIGALINE_MAX, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, TAIGA, x);
		}
		if (vDisplacement > sealevel && abs(vPosition.y) > TREELINE_MIN){
			float x = smoothstep(TREELINE_MIN, TREELINE_MAX, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, TUNDRA, x);
		}
		if (vDisplacement > epipelagic && abs(vPosition.y) > SNOWLINE_MIN){ 
			float x = smoothstep(SNOWLINE_MIN, SNOWLINE_MAX, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, SNOW, x);
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
		float mountainMinHeight = sealevel ;
		float mountainMaxHeight = sealevel + 15000.0;
		float nonexistantHeight = -999999.;
		if(vDisplacement > mountainMinHeight){
			float x = smoothstep(mountainMinHeight, mountainMaxHeight, vDisplacement);
			gl_FragColor =  mix(vec4(color, 1.0), TOP, x);
		} else if (vDisplacement > sealevel){
			gl_FragColor =  vec4(color, 1.0);
		} else if (vDisplacement > 1.){
			gl_FragColor =  mix(BOTTOM, vec4(color, 1.0), 0.5);
		} else {
			gl_FragColor =  vec4(0,0,0,1);
		}
	}

**/});