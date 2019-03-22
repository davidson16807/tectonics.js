
// "GAMMA" is the constant that's used to map between 
//   rgb signals sent to a monitor and their actual intensity
CONST(float) GAMMA = 2.2;

FUNC(vec3) get_rgb_intensity_of_rgb_signal(IN(vec3) signal
){
    return vec3(
        pow(signal.x, GAMMA),
        pow(signal.y, GAMMA),
        pow(signal.z, GAMMA)
    );
}
FUNC(vec3) get_rgb_signal_of_rgb_intensity(IN(vec3) intensity
){
    return vec3(
        pow(intensity.x, 1./GAMMA),
        pow(intensity.y, 1./GAMMA),
        pow(intensity.z, 1./GAMMA)
    );
}
