
/*
"get_3d_crater_noise" generates a varient of worley noise 
where each neighboring point has a variable max radius
*/
float get_3d_crater_noise(in vec3 position, in float max_radius, in mat3 position_seed, in vec3 radius_seed)
{
    vec3 index = floor(position);
        
    float nearest_distance = 1e20;
    float radius = 0.0;
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
                
                radius = max_radius * noise(dot(radius_seed, neighbor_index));
                
                nearest_distance = min(nearest_distance, distance(position, neighbor_position) / radius);
            }
        }
    }
    
    return clamp(nearest_distance, 0.0, 1.0);
}