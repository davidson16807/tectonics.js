
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.template = _multiline(function() {/**   
//TEMPLATE.GLSL.C GOES HERE

**/});

fragmentShaders.debug = _multiline(function() {/**   
//DEBUG.GLSL.C GOES HERE

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
fragmentShaders.age 	= representative.replace('@UNCOVERED', 'heat(smoothstep(250., 0., vAge))');
fragmentShaders.precip 	= representative.replace('@UNCOVERED', 'heat(smoothstep(2000., 0., precip))');
fragmentShaders.alt 	= representative.replace('@UNCOVERED', 'mix(vec4(1), vec4(0,0,0,1), smoothstep(sealevel, maxheight, alt))');
