// Schlick's approximation for reflectance
// https://en.wikipedia.org/wiki/Schlick%27s_approximation
FUNC(float) get_schlick_reflectance(IN(float) cos_incident_angle, IN(float) refractivate_index1, IN(float) refractivate_index2)
{
	VAR(float) n1 = refractivate_index1;
	VAR(float) n2 = refractivate_index2;
	VAR(float) R0 = ((n1-n2)/(n1+n2)) * ((n1-n2)/(n1+n2))
	VAR(float) _1_cos_theta = 1.-cos_incident_angle;
	return R0 + (1.-R0) * _1_cos_theta*_1_cos_theta*_1_cos_theta*_1_cos_theta*_1_cos_theta;
}