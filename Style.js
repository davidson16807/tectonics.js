var _multiline = function(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

Style = function(getForeground, getBackground){
	this.getForeground = getForeground
	this.getBackground = getBackground
}

var satelliteShader = _multiline(function() {/**   

	varying float vDisplacement;
	varying vec4 vPosition;
	
	uniform  float sealevel;
	
	const vec4 NONE = vec4(0.0,0.0,0.0,0.0); //rgba
	const vec4 OCEAN = vec4(0.04,0.04,0.2,1.0);
	const vec4 SHALLOW = vec4(0.04,0.58,0.54,1.0);
	const vec4 SNOW  = vec4(0.9, 0.9, 0.9, 0.9); 
	const vec4 LAND = vec4(0.31,0.43,0.12,1.0);
	const vec4 MOUNTAIN = vec4(0.5,0.5,0.5,1.0);
	const float SNOWLINE = 0.9;

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
			gl_FragColor =  LAND; //mix(LAND, MOUNTAIN, x);
		}
		if (vDisplacement > epipelagic && (abs(vPosition.y) > SNOWLINE)){ 
			float x = smoothstep(SNOWLINE, SNOWLINE + 0.02, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, SNOW, x);
		}
	}

**/});
satelliteStyle = new Style(
	function(world){
		return new THREE.ShaderMaterial({
			attributes: {
			  displacement: { type: 'f', value: [] }
			},
			uniforms: {
			  sealevel: 	{ type: 'f', value: world.SEALEVEL },
			  dropoff: 	    { type: 'f', value: 0.99 }
			},
			vertexShader: orthographicShader,
			fragmentShader: satelliteShader
		});
	},
	function(world){
		return new THREE.MeshBasicMaterial({color:0x0a0a32});
	}
);


var debugShader = _multiline(function() {/**   

	varying float vDisplacement;
	varying vec4 vPosition;
	
	uniform  float sealevel;
	uniform  vec3 color;
	
	const vec4 BOTTOM = vec4(0.0,0.0,0.0,1.0);//rgba
	const vec4 TOP = vec4(1.0,1.0,1.0,1.0);

	void main() {
		float mountainMinHeight = sealevel + 5000.0;
		float mountainMaxHeight = sealevel + 15000.0;
		if(vDisplacement > mountainMinHeight){
			float x = smoothstep(mountainMinHeight, mountainMaxHeight, vDisplacement);
			gl_FragColor =  mix(vec4(color, 1.0), TOP, x);
		} else if (vDisplacement > sealevel){
			gl_FragColor =  vec4(color, 1.0);
		} else {
			gl_FragColor =  mix(BOTTOM, vec4(color, 1.0), 0.5);
		}
	}

**/});
debugStyle = new Style(
	function(world){
		return new THREE.ShaderMaterial({
			attributes: {
			  displacement: { type: 'f', value: [] }
			},
			uniforms: {
			  sealevel: 	{ type: 'f', value: world.SEALEVEL },
			  color: 	    { type: 'c', value: new THREE.Color(Math.random() * 0xffffff) },
			  dropoff: 	    { type: 'f', value: 0.1 }
			},
			vertexShader: orthographicShader,
			fragmentShader: debugShader
		})
	},
	function(world){
		return new THREE.MeshBasicMaterial({color:0x000000});
	}
);