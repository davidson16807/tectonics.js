
VAR(float) get_rayleigh_phase_factor(IN(float) mu)
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
VAR(float) get_henyey_greenstein_phase_factor(IN(float) mu)
{
	CONST(float) g = 0.76;
	return
						(1. - g*g)
	/ //---------------------------------------------
		((4. + PI) * pow(1. + g*g - 2.*g*mu, 1.5));
}


// Schlick Phase Function factor
// Pharr and  Humphreys [2004] equivalence to g above
VAR(float) get_schlick_phase_factor(IN(float) mu)
{
	CONST(float) g = 0.76;
	CONST(float) k = 1.55*g - 0.55 * (g*g*g);
	return
					(1. - k*k)
	/ //-------------------------------------------
		(4. * PI * (1. + k*mu) * (1. + k*mu));
}
