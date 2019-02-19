// "get_characteristic_reflectance" finds the fraction of light that's reflected by the boundary between materials
//   order of refractive indices does not matter
FUNC(float) get_characteristic_reflectance(IN(float) refractivate_index1, IN(float) refractivate_index2)
{
	VAR(float) n1 = refractivate_index1;
	VAR(float) n2 = refractivate_index2;
	VAR(float) sqrtR0 = ((n1-n2)/(n1+n2));
	VAR(float) R0 = sqrtR0 * sqrtR0;
	return R0;
}
// "get_schlick_reflectance" Schlick's approximation for reflectance
// https://en.wikipedia.org/wiki/Schlick%27s_approximation
FUNC(float) get_schlick_reflectance(IN(float) cos_incident_angle, IN(float) characteristic_reflectance)
{
	VAR(float) R0 = characteristic_reflectance;
	VAR(float) _1_cos_theta = 1.-cos_incident_angle;
	return R0 + (1.-R0) * _1_cos_theta*_1_cos_theta*_1_cos_theta*_1_cos_theta*_1_cos_theta;
}
// "get_schlick_reflectance" Schlick's approximation for reflectance
// https://en.wikipedia.org/wiki/Schlick%27s_approximation
FUNC(vec3) get_schlick_reflectance(IN(float) cos_incident_angle, IN(vec3) characteristic_reflectance)
{
	VAR(vec3) R0 = characteristic_reflectance;
	VAR(float) _1_cos_theta = 1.-cos_incident_angle;
	return R0 + (1.-R0) * _1_cos_theta*_1_cos_theta*_1_cos_theta*_1_cos_theta*_1_cos_theta;
}