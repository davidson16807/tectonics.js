#include "precompiled/shaders/academics/units.glsl.c"

const float PI = 3.14159265358979323846264338327950288419716939937510;
const float SPEED_OF_LIGHT = 299792458. * METER / SECOND;
const float BOLTZMANN_CONSTANT = 1.3806485279e-23 * JOULE / KELVIN;
const float STEPHAN_BOLTZMANN_CONSTANT = 5.670373e-8 * WATT / (METER*METER* KELVIN*KELVIN*KELVIN*KELVIN);
const float PLANCK_CONSTANT = 6.62607004e-34 * JOULE * SECOND;

//EMISSION----------------------------------------------------------------------

float get_rayleigh_phase_factor(float mu)
{
	return
			3. * (1. + mu*mu)
	/ //------------------------
				(16. * PI);
}

// Henyey-Greenstein phase function factor [-1, 1]
// represents the average cosine of the scattered directions
// 0 is isotropic scattering
// > 1 is forward scattering, < 1 is backwards
const float g = 0.76;
float get_henyey_greenstein_phase_factor(float mu)
{
	return
						(1. - g*g)
	/ //---------------------------------------------
		((4. + PI) * pow(1. + g*g - 2.*g*mu, 1.5));
}


// Schlick Phase Function factor
// Pharr and  Humphreys [2004] equivalence to g above
const float k = 1.55*g - 0.55 * (g*g*g);
float get_schlick_phase_factor(float mu)
{
	return
					(1. - k*k)
	/ //-------------------------------------------
		(4. * PI * (1. + k*mu) * (1. + k*mu));
}

//RADIATION---------------------------------------------------------------------

// This function determines the fraction of a black body's emission that fall 
// under a certain wavelength
// see Lawson 2004, "The Blackbody Fraction, Infinite Series and Spreadsheets"
float solve_black_body_fraction_below_wavelength(float wavelength, float temperature){ 
	const float iterations = 2.;
	const float h = PLANCK_CONSTANT;
	const float k = BOLTZMANN_CONSTANT;
	const float c = SPEED_OF_LIGHT;

	float L = wavelength;
	float T = temperature;

	float C2 = h*c/k;
	float z = C2 / (L*T);
	float z2 = z*z;
	float z3 = z2*z;
	
	float sum = (z3 + 3.*z2 + 6.*z + 6.) * exp(-z);
	return 15.*sum/(PI*PI*PI*PI);
}

// This function determines the fraction of a black body's emission that fall 
// within a certain range of wavelengths
float solve_black_body_fraction_between_wavelengths(float lo, float hi, float temperature){
	return 	solve_black_body_fraction_below_wavelength(hi, temperature) - 
			solve_black_body_fraction_below_wavelength(lo, temperature);
}

// This function calculates the radiation (in watts/m^2) that's emitted by
// a single black body object using the Stephan-Boltzmann equation
float get_black_body_emissive_flux(float temperature){
    float T = temperature;
    return STEPHAN_BOLTZMANN_CONSTANT * T*T*T*T;
}

// This function returns a rgb vector that quickly approximates a spectral "bump".
// Adapted from GPU Gems and Alan Zucconi
// from https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
float bump (float x, float edge0, float edge1, float height)
{
    float center = (edge1 + edge0) / 2.;
    float width  = (edge1 - edge0) / 2.;
    float offset = (x - center) / width;
	return height * max(1. - offset * offset, 0.);
}

//HUMAN-PERCEPTION--------------------------------------------------------------

// This function returns a rgb vector that best represents color at a given wavelength
// It is from Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow/
// I've adapted the function so that coefficients are expressed in meters.
vec3 get_rgb_signal_of_wavelength (float w)
{
	return vec3(
        bump(w, 530e-9, 690e-9, 1.00)+
        bump(w, 410e-9, 460e-9, 0.15),
        bump(w, 465e-9, 635e-9, 0.75)+
        bump(w, 420e-9, 700e-9, 0.15),
        bump(w, 400e-9, 570e-9, 0.45)+
        bump(w, 570e-9, 625e-9, 0.30)
      );
}