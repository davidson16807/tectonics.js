
/*
"bump" is the Alan Zucconi bump function.
It's a fast and easy way to approximate any kind of wavelet or gaussian function
Adapted from GPU Gems and Alan Zucconi
from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
*/
float bump (
    in float x, 
    in float edge0, 
    in float edge1, 
    in float height
){
    float center = (edge1 + edge0) / 2.;
    float width  = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
    return height * max(1. - offset * offset, 0.);
}

/*
"oplus" is the o-plus operator,
  or the reciprocal of the sum of reciprocals.
It's a handy function that comes up a lot in some physics problems.
It's pretty useful for preventing division by zero.
*/
float oplus(in float a, in float b){
    return 1. / (1./a + 1./b);
}

/*
smooth min and smooth max
*/
float smin(float a, float b, float k)
{
    return -log(exp(-a*k)+exp(-b*k))/k;
}
float smax(float a, float b, float k)
{
    return log(exp(a*k)+exp(b*k))/k;;
}
