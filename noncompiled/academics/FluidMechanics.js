// FluidMechanics is a namespace isolating all business logic relating to the behavior of fluids (gases, liquids, and solids exhibiting viscous deformation)
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

const FluidMechanics = (function() {

const FluidMechanics = {};

const coarse_grid = new Grid( 
    new THREE.IcosahedronGeometry(1, 4)
);
// gets surface pressure of the asthenosphere by smoothing a field representing buoyancy
FluidMechanics.get_fluid_pressures = function(buoyancy, pressure, scratch) {
    const fine_grid = buoyancy.grid;
    const fine_buoyancy = buoyancy;
    const fine_pressure = pressure  || Float32Raster(fine_grid);
    
    scratch = scratch || Float32Raster(fine_grid);

    ScalarField.mult_scalar(fine_buoyancy, -1, fine_pressure);

    // NOTE: smoothing the field is done by iteratively subtracting the laplacian
    // This is a very costly operation, and it's output is dependant on grid resolution,
    // so we resample buoyancy onto to a constantly defined, coarse grid 
    // This way, we guarantee performant behavior that's invariant to resolution.
    const diffuse = ScalarField.diffusion_by_constant;

    // smooth at fine resolution a few times so that coarse resolution does not capture random details
    for (let i=0; i<3; ++i) {
        diffuse(fine_pressure, 1, fine_pressure, scratch);
    }

    // convert to coarse resolution
    const coarse_ids = fine_grid.getNearestIds(coarse_grid.pos);
    const coarse_pressure = Float32Raster.get_ids(fine_pressure, coarse_ids);

    // smooth at coarse resolution
    for (let i=0; i<30; ++i) {
        diffuse(coarse_pressure, 1, coarse_pressure, scratch);
    }

    // convert back to fine resolution
    const fine_ids = coarse_grid.getNearestIds(fine_grid.pos);
    Float32Raster.get_ids (coarse_pressure, fine_ids, fine_pressure);

    // NOTE: rescaling back to fine_grid resolution causes "stair step" looking results
    // It's important that the field be smooth because we eventually want its laplacian,
    // so we smooth it a second time, this time using the fine_grid resolution

    // smooth at fine resolution
    for (let i=0; i<3; ++i) {
        diffuse(fine_pressure, 1, fine_pressure, scratch);
    }
    return fine_pressure;
}

// gets surface velocity of the asthenosphere as the gradient of pressure
FluidMechanics.get_fluid_velocities = function(pressure, velocity) {
    velocity = velocity || VectorRaster(pressure.grid);
    ScalarField.gradient(pressure, velocity);
    return velocity;
}
// gets displacement using an isostatic model
FluidMechanics.get_isostatic_displacements = function(thickness, density, material_density, displacement) {
     const inverse_mantle_density = 1 / material_density.mantle;
     let thickness_i;
     for(let i=0, li = displacement.length; i<li; i++){
         //Calculates elevation as a function of crust density. 
         //This was chosen as it only requires knowledge of crust density and thickness,  
         //which are relatively well known. 
         thickness_i = thickness[i]; 
         displacement[i] = thickness_i - thickness_i * density[i] * inverse_mantle_density;
     }
     return displacement;
}
FluidMechanics.get_advected_ids = function (velocity, timestep, result, scratch) {
    result   = result  || Uint16Raster(velocity.grid);
    const past_pos = scratch || VectorRaster(velocity.grid);
    VectorField.add_scalar_term (velocity.grid.pos, velocity, -timestep,    past_pos);
    VectorField.normalize(past_pos, past_pos);
    velocity.grid.getNearestIds    (past_pos,                                  result);
    return result;
}

return FluidMechanics;
})();
