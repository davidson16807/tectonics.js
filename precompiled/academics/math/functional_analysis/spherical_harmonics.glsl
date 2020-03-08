const int MAX_SPHERICAL_HARMONICS_COUNT = 24;

float get_spherical_harmonics_decomposition(
    in vec3 V,
    in float[MAX_SPHERICAL_HARMONICS_COUNT] f
){

    float x = V.x;
    float y = V.y;
    float z = V.z;

    float x2 = x*x;
    float y2 = y*y;
    float z2 = z*z;

    float xy = x*y;
    float yz = y*z;
    float zx = z*x;

    float xyz = x*y*z;

    float r = length(V);
    float r2 = r*r;
    float r3 = r*r*r;

    return
          f[0]  * 0.5f*sqrt(1.f/PI)  

        + f[1]  * sqrt(0.75f/PI) * y/r  
        + f[2]  * sqrt(0.75f/PI) * z/r  
        + f[3]  * sqrt(0.75f/PI) * x/r 

        + f[3]  * 0.50f * sqrt(15.f/PI) *  xy/r2 
        + f[4]  * 0.50f * sqrt(15.f/PI) *  yz/r2 
        + f[5]  * 0.25f * sqrt(5.0f/PI) * (-x2-y2+2.f*z2)/r2 
        + f[6]  * 0.50f * sqrt(15.f/PI) *  zx/r2 
        + f[7]  * 0.25f * sqrt(15.f/PI) * (x2-y2)/r2  

        + f[8]  * 0.25f * sqrt(35.0f/(2.f*PI)) * (3.f*x2-y2)*y/r3
        + f[9]  * 0.50f * sqrt(105.f/     PI)  * (xyz)/r3
        + f[10] * 0.25f * sqrt(21.0f/(2.f*PI)) * (y*(4.f*z2-x2-y2))/r3
        + f[11] * 0.25f * sqrt(7.00f/     PI)  * (z*(2.f*z2-3.f*x2-3.f*y2))/r3
        + f[12] * 0.25f * sqrt(21.0f/(2.f*PI)) * (x*(4.f*z2-x2-y2))/r3
        + f[13] * 0.25f * sqrt(105.f/     PI)  * (z*(x2-y2))/r3
        + f[14] * 0.25f * sqrt(35.0f/(2.f*PI)) * (x*(x2-3.f*y2))/r3

        + f[15] * 0.75  * sqrt(35.f/(    PI)) * (xy*(x2-y2))/r4 
        + f[16] * 0.75  * sqrt(35.f/(2.f*PI)) * ((3.f*x2-y2)*yz)/r4
        + f[17] * 0.75  * sqrt(5.f /(    PI)) * (xy*(7.f*z2-r2))/r4
        + f[18] * 0.75  * sqrt(5.f /(2.f*PI)) * (yz*(7.f*z2-3.f*r2))/r4
        + f[19] * 0.1875* (35.f*z2*z2-30.f*z2*r2+3.f*r4)/r4
        + f[20] * 0.75  * sqrt(5.f /(2.f*PI)) * (zx*(7.f*z2-3.f*r2))/r4
        + f[21] * 0.375 * sqrt(5.f /(    PI)) * ((x2-y2)*(7.f*z2-r2))/r4
        + f[22] * 0.75  * sqrt(35.f/(2.f*PI)) * ((x2-3.f*y2)*zx)/r4
        + f[23] * 0.1875* sqrt(35.f/(    PI)) * (x2*(x2-3.f*y2) - y2*(3.f*x2-y2))/r4 
      ;
}
/*
"get_distance_from_point_to_spherical_harmonics_blob" returns the 
signed distance of a point to the surface of a spheroid whose surface is 
offset using a linear combination of spherical harmonics. 

A0 point position
B0 blob origin
r  blob reference radius
  the radius of a sphere where f00==1 and f1n1..f[7] == 0
f00..f[7] blob expansion coefficients
  the expansion coefficients to the spherical harmonics series
  that describe the radius of a blob at a given set of lat long coordinates
*/
float get_distance_of_3d_point_to_spherical_harmonics_blob(
    in vec3 A0,
    in vec3 B0,
    in float r0,
    in float[MAX_SPHERICAL_HARMONICS_COUNT] 
){
    vec3 D = A0-B0; // offset
    vec3 Dhat = normalize(D);
    fijYij = get_spherical_harmonics( Dhat, f );

    return length(D) - r0*fijYij; 
}

