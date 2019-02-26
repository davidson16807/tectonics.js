find . -name "*.js" -exec sed -i  \
-e 's//.get_uniform_black_body_radiation/g'  \
-e 's/vDisplacement/v_displacement' \
-e 's/vGradient/v_gradient' \
-e 's/vIceCoverage/v_ice_coverage' \
-e 's/vSurfaceTemp/v_surface_temp' \
-e 's/vPlantCoverage/v_plant_coverage' \
-e 's/vScalar/v_scalar' \
-e 's/vVectorFractionTraversed/v_vector_fraction_traversed' \
-e 's/vPosition/v_position' \
-e 's/vClipspace/v_clipspace' \
-e 's/vNormal/v_normal' \
-e 's/atmosphere_surface_rayleigh_scattering_coefficients/surface_air_rayleigh_scattering_coefficients' \
-e 's/atmosphere_surface_mie_scattering_coefficients/surface_air_mie_scattering_coefficients' \
-e 's/atmosphere_surface_absorption_coefficients/surface_air_absorption_coefficients' \
{} \;
