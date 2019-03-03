
varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_visibility;

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