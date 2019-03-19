
// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
FUNC(float) bump (
    IN(float) x, 
    IN(float) edge0, 
    IN(float) edge1, 
    IN(float) height
){
    VAR(float) center = (edge1 + edge0) / 2.;
    VAR(float) width  = (edge1 - edge0) / 2.;
    VAR(float) offset = (x - center) / width;
    return height * max(1. - offset * offset, 0.);
}
// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
FUNC(vec3) get_rgb_signal_of_wavelength (
    IN(float) w
){
    return vec3(
        bump(w, 530e-9, 690e-9, 1.00)+
        bump(w, 410e-9, 460e-9, 0.15),
        bump(w, 465e-9, 635e-9, 0.75)+
        bump(w, 420e-9, 700e-9, 0.15),
        bump(w, 400e-9, 570e-9, 0.45)+
        bump(w, 570e-9, 625e-9, 0.30)
      );
}