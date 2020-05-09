
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

float get_3d_worley_noise(vec3 position, mat3 position_seed)
{
    vec3 index = floor(position);
        
    float nearest_distance = 1e20;
    vec3  neighbor_index = vec3(0);
    vec3  neighbor_position = vec3(0);
    
    for (int x = -1; x <= 1; x++)
    {
        for (int y = -1; y <= 1; y++)
        {
            for (int z = -1; z <= 1; z++)
            {   
                neighbor_index = index + vec3(x, y, z);
                neighbor_position = neighbor_index + noise3(position_seed * neighbor_index);
                
                nearest_distance = min(nearest_distance, distance(position, neighbor_position));
            }
        }
    }
    
    return clamp(nearest_distance, 0.0, 1.0);
}

float get_4d_worley_noise(vec4 position, mat4 position_seed)
{
    vec4 index = floor(position);
        
    float nearest_distance = 1e20;
    vec4  neighbor_index = vec4(0);
    vec4  neighbor_position = vec4(0);
    
    for (int x = -1; x <= 1; x++)
    {
        for (int y = -1; y <= 1; y++)
        {
            for (int z = -1; z <= 1; z++)
            {   
                for (int w = -1; w <= 1; w++)
                {   
                    neighbor_index = index + vec4(x, y, z, w);
                    neighbor_position = neighbor_index + noise4(position_seed * neighbor_index);

                    nearest_distance = min(nearest_distance, distance(position, neighbor_position));
                }
            }
        }
    }
    
    return clamp(nearest_distance, 0.0, 1.0);
}
