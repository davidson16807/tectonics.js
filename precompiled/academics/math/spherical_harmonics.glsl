
float get_spherical_harmonics(
    in vec3 V,
                                                                in float f00,
                                                 in float f1n1, in float f10, in float f11, 
                                  in float f2n2, in float f2n1, in float f20, in float f21, in float f22, 
                   in float f3n3, in float f3n2, in float f3n1, in float f30, in float f31, in float f32, in float f33,
    in float f4n4, in float f4n3, in float f4n2, in float f4n1, in float f40, in float f41, in float f42, in float f43, in float f44
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
          f00  * 0.5f*sqrt(1.f/PI)  

        + f1n1 * sqrt(0.75f/PI) * y/r  
        + f10  * sqrt(0.75f/PI) * z/r  
        + f11  * sqrt(0.75f/PI) * x/r 

        + f2n2 * 0.50f*sqrt(15.f/PI) *  xy/r2 
        + f2n1 * 0.50f*sqrt(15.f/PI) *  yz/r2 
        + f20  * 0.25f*sqrt(5.0f/PI) * (-x2-y2+2.f*z2)/r2 
        + f21  * 0.50f*sqrt(15.f/PI) *  zx/r2 
        + f22  * 0.25f*sqrt(15.f/PI) * (x2-y2)/r2  

        + f3n3 * 0.25f*sqrt(35.0f/(2.f*PI)) * (3.f*x2-y2)*y/r3
        + f3n2 * 0.50f*sqrt(105.f/     PI)  * (xyz)/r3
        + f3n1 * 0.25f*sqrt(21.0f/(2.f*PI)) * (y*(4.f*z2-x2-y2))/r3
        + f30  * 0.25f*sqrt(7.00f/     PI)  * (z*(2.f*z2-3.f*x2-3.f*y2))/r3
        + f31  * 0.25f*sqrt(21.0f/(2.f*PI)) * (x*(4.f*z2-x2-y2))/r3
        + f32  * 0.25f*sqrt(105.f/     PI)  * (z*(x2-y2))/r3
        + f33  * 0.25f*sqrt(35.0f/(2.f*PI)) * (x*(x2-3.f*y2))/r3

        + f4n4 * 0.75  * sqrt(35.f/(    PI)) * (xy*(x2-y2))/r4 
        + f4n3 * 0.75  * sqrt(35.f/(2.f*PI)) * ((3.f*x2-y2)*yz)/r4
        + f4n2 * 0.75  * sqrt(5.f /(    PI)) * (xy*(7.f*z2-r2))/r4
        + f4n1 * 0.75  * sqrt(5.f /(2.f*PI)) * (yz*(7.f*z2-3.f*r2))/r4
        + f40  * 0.1875* (35.f*z2*z2-30.f*z2*r2+3.f*r4)/r4
        + f41  * 0.75  * sqrt(5.f /(2.f*PI)) * (zx*(7.f*z2-3.f*r2))/r4
        + f42  * 0.375 * sqrt(5.f /(    PI)) * ((x2-y2)*(7.f*z2-r2))/r4
        + f43  * 0.75  * sqrt(35.f/(2.f*PI)) * ((x2-3.f*y2)*zx)/r4
        + f44  * 0.1875* sqrt(35.f/(    PI)) * (x2*(x2-3.f*y2) - y2*(3.f*x2-y2))/r4 
      ;
}
/*
"get_distance_from_point_to_spherical_harmonics_blob" returns the 
signed distance of a point to the surface of a spheroid whose surface is 
offset using a linear combination of spherical harmonics. 

A0 point position
B0 blob origin
r  blob reference radius
  the radius of a sphere where f00==1 and f1n1..f22 == 0
f00..f22 blob expansion coefficients
  the expansion coefficients to the spherical harmonics series
  that describe the radius of a blob at a given set of lat long coordinates
*/
float get_distance_of_3d_point_to_spherical_harmonics_blob(
    in vec3 A0,
    in vec3 B0,
    in float r0,
                                                                in float f00,
                                                 in float f1n1, in float f10, in float f11, 
                                  in float f2n2, in float f2n1, in float f20, in float f21, in float f22, 
                   in float f3n3, in float f3n2, in float f3n1, in float f30, in float f31, in float f32, in float f33,
    in float f4n4, in float f4n3, in float f4n2, in float f4n1, in float f40, in float f41, in float f42, in float f43, in float f44
){
    vec3 D = A0-B0; // offset
    vec3 Dhat = normalize(D);
    fijYij = get_spherical_harmonics(
        Dhat, 
                                f00,
                          f1n1, f10, f11, 
                    f2n2, f2n1, f20, f21, f22, 
              f3n3, f3n2, f3n1, f30, f31, f32, f33, 
        f4n4, f4n3, f4n2, f4n1, f40, f41, f42, f43, f44
    );

    return length(D) - r0*fijYij; 
}

