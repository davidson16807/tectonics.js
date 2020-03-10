
/*
V: position
K: seed
*/
float get_2d_value_noise(
    in vec2 V,
    in vec2 K
){
    vec2 I = floor(V);
    vec2 F = fract(V);
    vec2 G = smoothstep(0.f, 1.f, F);
    vec2 J = vec2(0.f);
    float a = 0.f;
    for (int i = 0; i < 1; ++i)
    {
        for (int j = 0; j < 1; ++j)
        {
            J = I + vec2(i,j);
            a += noise1(dot(J,K))
                * (i==0? 1.f-G.x : G.x)
                * (j==0? 1.f-G.y : G.y);
        }
    }
    return clamp(a, 0.f, 1.f);
}
/*
V: position
K: seed
*/
float get_3d_value_noise(
    in vec3 V,
    in vec3 K 
){
    vec3 I = floor(V);
    vec3 F = fract(V);
    vec3 G = smoothstep(0.f, 1.f, F);
    float a = 0.f;
    for (int i = 0; i <= 1; ++i)
    {
        for (int j = 0; j <= 1; ++j)
        {
            for (int k = 0; k <= 1; ++k)
            {
                a += noise1(dot(I+vec3(i,j,k), K)) 
                    * (i==0? 1.f-G.x : G.x) 
                    * (j==0? 1.f-G.y : G.y) 
                    * (k==0? 1.f-G.z : G.z); 
            }
        }
    }
    return clamp(a, 0.f, 1.f);
}
