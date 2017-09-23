TectonicsModeling = {};

TectonicsModeling.get_thickness = function(sima, sial, thickness) {
	return ScalarField.add_field(sima, sial, thickness);
}

TectonicsModeling.get_density = function(sima, sial, age, density) {
	density = density || Float32Raster(sima.grid);

	// NOTE: density does double duty for performance reasons
	var fraction_of_lifetime = density;
	var sima_density = density;

	Float32RasterInterpolation.smoothstep	(0, 250, age, 						fraction_of_lifetime);
	Float32RasterInterpolation.lerp			(2890, 3300, fraction_of_lifetime, 	density);

    for (var i = 0, li = density.length; i < li; i++) {
    	density[i] = sima[i] + sial[i] > 0? (sima[i] * sima_density[i] + sial[i] * 2700) / (sima[i] + sial[i]) : 2890;
    }
    return density;
}

TectonicsModeling.get_subductability = function(density, subductability) {
	var subductability_transition_factor = 1/100;
	var exp = Math.exp;
	for (var i=0, li=subductability.length; i<li; ++i) {
		subductability[i] = 2 / (1 + exp( -(density[i] - 3000) * subductability_transition_factor )) - 1;
	}
	return subductability;
}

// gets surface pressure of the asthenosphere by smoothing a field representing subductability
TectonicsModeling.get_asthenosphere_pressure = function(subductability, pressure, scratch) {
	pressure = pressure || Float32Raster(subductability.grid);
	scratch = scratch || Float32Raster(subductability.grid);

	var diffuse = ScalarField.diffusion_by_constant;

	var smoothing_iterations =  15;
	Float32Raster.copy(subductability, pressure);
	for (var i=0; i<smoothing_iterations; ++i) {
		diffuse(pressure, 1, pressure, scratch);
	}
	return pressure;
}

// gets surface velocity of the asthenosphere as the gradient of pressure
TectonicsModeling.get_asthenosphere_velocity = function(pressure, velocity) {
	velocity = velocity || VectorRaster(subductability.grid);
	ScalarField.gradient(pressure, velocity);
	return velocity;
}

// gets angular velocity of the asthenosphere as the cross product of velocity and position
TectonicsModeling.get_angular_velocity = function(velocity, pos, angular_velocity) {
	return VectorField.cross_vector_field(velocity, pos, angular_velocity);
}
// gets displacement using an isostatic model
TectonicsModeling.get_displacement = function(thickness, density, mantleDensity, displacement) {
 	var thickness_i, rootDepth;
 	var inverse_mantle_density = 1 / mantleDensity;
 	for(var i=0, li = displacement.length; i<li; i++){
 		//Calculates elevation as a function of crust density. 
 		//This was chosen as it only requires knowledge of crust density and thickness,  
 		//which are relatively well known. 
 		thickness_i = thickness[i]; 
 		displacement[i] = thickness_i - thickness_i * density[i] * inverse_mantle_density;
 	}
 	return displacement;
}
TectonicsModeling.get_erosion = function(displacement, sealevel, timestep, erosion, scratch){
	erosion = erosion || Float32Raster(displacement.grid);
	scratch = scratch || Float32Raster(displacement.grid);

	var precipitation = 7.8e5;
	// ^^^ measured in meters of rain per million years
	// global land average from wikipedia
	var erosiveFactor = 1.8e-7; 
	// ^^^ the rate of erosion per the rate of rainfall in that place
	// measured in fraction of height difference per meters of rain per million years

	// NOTE: erosion array does double duty for performance reasons
	var height_difference = erosion;
	var water_height = scratch;
	ScalarField.max_scalar(displacement, sealevel, water_height);
	ScalarField.average_difference(water_height, height_difference);
	ScalarField.mult_scalar(height_difference, precipitation * timestep * erosiveFactor, erosion)
	// console.log(Float32Dataset.average(erosion));
	return erosion;
}