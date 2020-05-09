
/*
faster, but may be more prone to tiling
*/
float get_fast_2d_worley_noise(
    vec2 V
) {
    mat2 R = mat2(7, -5, 5, 7)*.1;
    float n = 1e10;
    n = min(n, length(fract(V *= R) - .5)/.6); 
    n = min(n, length(fract(V *= R) - .5)/.6); 
    n = min(n, length(fract(V *= R) - .5)/.6);
    return n;
}

// borrowed from https://www.shadertoy.com/view/XsKXRh
float get_worley_object(in vec3 P){
    
    // Anything that wraps the domain will work. The following looks pretty intereting.
    P = cos(P*6.2831853) + 1.;
    return dot(P, P);
    
}
// borrowed from https://www.shadertoy.com/view/XsKXRh
float get_fast_3d_worley_noise(
    in vec3 P,
    in mat3 K
){
    
    float n = 1e10;
    
    // Draw three overlapping objects (spherical, in this case) at various positions throughout the tile.
    n = min(n, get_worley_object(P - K[0]));
    P.xy = vec2(P.y-P.x, P.y + P.x)*.7071;
    n = min(n, get_worley_object(P - K[1]));
    P.yz = vec2(P.z-P.y, P.z + P.y)*.7071;
    n = min(n, get_worley_object(P - K[2]));
    
    return 1.- n*.1666; // Normalize... roughly.
    
}