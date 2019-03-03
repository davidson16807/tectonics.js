find . -name "*.js" -exec sed -i  \
-e 's//.get_uniform_black_body_radiation/g'  \
-e 's/atmosphere_surface_rayleigh_scattering_coefficients/surface_air_rayleigh_scattering_coefficients' \
-e 's/atmosphere_surface_mie_scattering_coefficients/surface_air_mie_scattering_coefficients' \
-e 's/atmosphere_surface_absorption_coefficients/surface_air_absorption_coefficients' \
{} \;
