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

	void main() {
		vec4 ocean = vec4(0.04,0.04,0.2,1.0);//rgba
		vec4 shallow = vec4(0.04,0.58,0.54,1.0);
		vec4 ice  = vec4(0.9, 0.9, 0.9, 0.9); 
		vec4 land = vec4(0.31,0.43,0.12,1.0);
		vec4 mountain = vec4(0.5,0.5,0.5,1.0);
		float epipelagic = sealevel - 1000.0;
		
		if (vDisplacement < epipelagic) {
			gl_FragColor = ocean;
		} else if (vDisplacement < sealevel) {
			float x = smoothstep(epipelagic, sealevel, vDisplacement);
			gl_FragColor =  mix(ocean, shallow, x);
		} else {
			//float x = smoothstep(sealevel, sealevel + 15000.0, vDisplacement);
			gl_FragColor =  land; //mix(land, mountain, x);
		}
		if (vDisplacement > epipelagic && (abs(vPosition.y) > 0.9)){ 
			float x = smoothstep(0.9, 0.92, abs(vPosition.y));
			gl_FragColor = mix(gl_FragColor, ice, x);
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
			  sealevel: 	{ type: 'f', value: world.SEALEVEL }
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

	void main() {
		vec4 bottom = vec4(0.0,0.0,0.0,1.0);//rgba
		float x = smoothstep(-sealevel, sealevel, vDisplacement);
		gl_FragColor =  mix(bottom, vec4(color, 1.0), x);
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
			},
			vertexShader: orthographicShader,
			fragmentShader: debugShader
		})
	},
	function(world){
		return new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2});
	}
);