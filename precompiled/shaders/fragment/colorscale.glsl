
varying float displacement_v;
varying float plant_coverage_v;
varying float snow_coverage_v;
varying float scalar_v;
varying vec4 position_v;

uniform float sealevel;
uniform float ocean_visibility;
uniform vec3 min_color;
uniform vec3 max_color;
uniform int builtin_colorscale;

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

//converts a float ranging from [-1,1] to a topographic map visualization
vec4 topographic(float value) {
    //deep ocean
    vec3 color = vec3(0,0,0.8);
    //shallow ocean
    color = mix(
        color,
        vec3(0.5,0.5,1),
        smoothstep(-1., -0.01, value)
    );
    //lowland
    color = mix(
        color,
        vec3(0,0.55,0),
        smoothstep(-0.01, 0.01, value)
    );
    //highland
    color = mix(
        color,
        vec3(0.95,0.95,0),
        smoothstep(0., 0.45, value)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0),
        smoothstep(0.2, 0.7, value)
    );
    //mountain
    color = mix(
        color,
        vec3(0.5,0.5,0.5),
        smoothstep(0.4, 0.8, value)
    );
    //snow cap
    color = mix(
        color,
        vec3(0.95),
        smoothstep(0.75, 1., value)
    );
    return vec4(color, 1.);
}

void main() {
	if (builtin_colorscale == 0) // two color interpolation
	{ 
		vec4 color_without_ocean = mix( 
	        vec4(min_color,1.), 
	        vec4(max_color,1.), 
	        scalar_v
	    );
		vec4 color_with_ocean = displacement_v < sealevel * ocean_visibility? mix(vec4(0.), color_without_ocean, 0.5) : color_without_ocean;
		gl_FragColor = color_with_ocean;
	}
	else if (builtin_colorscale == 1) // heatmap
	{ 
	    vec4 color_without_ocean = heat( scalar_v );
    	vec4 color_with_ocean = displacement_v < sealevel * ocean_visibility? mix(vec4(0.), color_without_ocean, 0.5) : color_without_ocean;
    	gl_FragColor = color_with_ocean;
	} 
	else if (builtin_colorscale == 2) // topographic
	{ 
    	gl_FragColor = topographic( scalar_v );
	} 
    gl_FragColor = vec4(0,0,1,1);
}