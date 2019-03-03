varying float displacement_v;
varying vec4 position_v;

uniform  float sealevel;
uniform  vec3 color;

const vec4 BOTTOM = vec4(0.0,0.0,0.0,1.0);//rgba
const vec4 TOP = vec4(1.0,1.0,1.0,1.0);

void main() {
	float mountainMinHeight = sealevel + 5000.;
	float mountainMaxHeight = sealevel + 15000.0;
	if(displacement_v > sealevel){
		float x = smoothstep(mountainMinHeight, mountainMaxHeight, displacement_v);
		gl_FragColor =  mix(vec4(color, 1.0), TOP, x);
	} else if (displacement_v > 1.){
		float x = smoothstep(-sealevel, sealevel, displacement_v);
		gl_FragColor =  mix(BOTTOM, vec4(color*.75, 1.0), x);
	} else {
		gl_FragColor =  vec4(0,0,0,1);
	}
}