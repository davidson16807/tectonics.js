 
float noise1(
    in float seed
){
    return fract(sin(seed*10.0)*10000.0);
}
vec2 noise2(
    in vec2 seeds
){
    // Time varying pixel color
    return vec2(noise1(seeds.x), noise1(seeds.y) );    
}
vec3 noise3(
    in vec3 seeds
){
    // Time varying pixel color
    return vec3(noise1(seeds.x), noise1(seeds.y), noise1(seeds.z) );    
}