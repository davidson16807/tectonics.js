
/*
"GAMMA" is the constant that's used to map between 
rgb signals sent to a monitor and their actual intensity
*/
const float GAMMA = 2.2;

/* 
This function returns a rgb vector that quickly approximates a spectral "bump".
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
vec3 get_rgb_intensity_of_rgb_signal(
    in vec3 signal
){
    return vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
/*
This function returns a rgb vector that best represents color at a given wavelength
It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
I've adapted the function so that coefficients are expressed in meters.
*/
vec3 get_rgb_signal_of_rgb_intensity(
    in vec3 intensity
){
    return vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
