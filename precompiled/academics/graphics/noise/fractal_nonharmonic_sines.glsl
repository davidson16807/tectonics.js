
/*
position: physical position at which noise is sampled
hurst_exponent: relation between frequency and amplitude, defaults to 1.
see https://blog.bruce-hill.com/hill-noise for additional function description
see http://iquilezles.org/www/articles/fbm/fbm.htm for hurst_exponent
*/
float get_2d_fractal_nonharmonic_sines(vec2 position, float hurst_exponent)
{
    float x = position.x;
    float y = position.y;
    float u, v, theta;
    float amplitude;
    // sanity test
    //const float[1] frequencies = float[1](0.1f);
    // exponents of phi
    //const float[17] frequencies = float[17](0.0031, 0.0081, 0.021, 0.0557, 0.145, 0.382, 1.0f, 1.618, 2.618, 4.23, 6.854, 11.09, 17.944, 29.03, 46.98, 76.01, 123.);
    const float[9] frequencies = float[9](0.0031, 0.0081, 0.021, 0.0557, 0.145, 0.382, 1.0f, 1.618, 2.618);
    // primes
    //const float[17] frequencies = float[17](1.f, 2.f, 3.f, 5.f, 7.f, 11.f, 17.f, 29.f, 31.f, 43.f, 47.f, 73.f, 79.f, 113.f, 127.f, 197.f, 199.f);
    // random numbers, not very good
    //const float[9] frequencies = float[9](0.07,0.79,0.55,0.42,0.82,0.06,0.27,0.48,0.34);
    float result;
    float sum_of_frequencies = 0.0f;
    for (int i = 0; i < frequencies.length(); i++)
    {
        theta += 2.0f * PI / (PHI*PHI);
        u = x*cos(theta) - y*sin(theta);
        v =-x*sin(theta) - y*cos(theta);
        amplitude = pow(frequencies[i], hurst_exponent);
        result += amplitude * sin(u / frequencies[i]);
        //result += amplitude * sin(v / frequencies[i]);
        sum_of_frequencies += frequencies[i];
    }
    const float a_fix = 0.88;
    return 0.5 + a_fix/sum_of_frequencies * result -0.1; 
}