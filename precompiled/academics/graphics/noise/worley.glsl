
float get_2d_worley_noise(
    in vec2 V,
    in vec2 K
){
    vec2 I = floor(V);
    vec2 F = fract(V);
    vec2 G = smoothstep(0.f, 1.f, F);
    vec2 Kr = vec2(5.9, 2.6);
    
    float d = 1e20;
    float r = 0.;
    vec2  J = vec2(0.f);
    vec2  U = vec2(0.f);
    for (int i = -1; i <= 1; ++i)
    {
        for (int j = -1; j <= 1; ++j)
        {
            J = I + vec2(i,j);
            U = J + noise2(K*J);
            r = 0.7f*noise1(dot(Kr,J));
            d = min(d, distance(vec2(V),vec2(U))*r);
        }
    }
    return clamp(d, 0.f,1.f);
}
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

/*
V: position
K: seed
*/
float get_3d_worley_noise(
    in vec3 V,
    in mat3 K
){
    vec3 I = floor(V);
    vec3 F = fract(V);
    vec3 G = smoothstep(0.f, 1.f, F);
    vec3 R = round(V);
    vec3 Kr = vec3(5.9, 2.6, 5.3);
    
    float d = 1e20;
    float r = 0.;
    vec3  J = vec3(0.f);
    vec3  U = vec3(0.f);
    for (int i = -1; i <= 0; ++i)
    {
        for (int j = -1; j <= 0; ++j)
        {
            for (int k = -1; k <= 0; ++k)
            {
                J = R + vec3(i,j,k);
                U = J + noise3(K*J);
                d = min(d, distance(V,U));
            }
        }
    }
    return clamp(d, 0.f,1.f);
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