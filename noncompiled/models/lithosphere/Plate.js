'use strict';

function Plate(grid, parameters)
{
    parameters = parameters || stop('missing parameter object')
    var grid = grid || stop('missing parameter: "grid"');

    this.crust = new Crust({grid: grid, buffer: parameters['crust']});
    this.mask = Uint8Raster.FromBuffer(parameters['mask'], grid);
    this.local_to_global_matrix = Matrix3x3.Identity();
    if (parameters['local_to_global_matrix'] !== void 0) {
        this.local_to_global_matrix.set(parameters['local_to_global_matrix'])
    }
    this.global_to_local_matrix = Matrix3x3.invert(this.local_to_global_matrix);

    this.getParameters = function() {
        return { 
            //grid:         grid. // TODO: add grid
            crust:             this.crust.buffer.slice(0),
            mask:             this.mask.buffer.slice(0),
            local_to_global_matrix: Array.from(this.local_to_global_matrix)
        };
    }

    var self = this; 
    // The following are fields that are derived from other fields:
    // "displacement is the height of the crust relative to an arbitrary datum level
    // It is not called "elevation" because we want to emphasize that it is not relative to sea level
    this.displacement = new Memo(
        Float32Raster(grid),  
        result => FluidMechanics.get_isostatic_displacements(self.thickness.value(), self.density.value(), material_density, result) 
    ); 
    // the thickness of the crust in km
    this.thickness = new Memo(  
        Float32Raster(grid),  
        result => Crust.get_thickness(self.crust, material_density, result)
    ); 
    // total mass of the crust in tons
    this.total_mass = new Memo(  
        Float32Raster(grid),  
        result => Crust.get_total_mass(self.crust, result)
    ); 
    // the average density of the crust, in kg/m^3
    this.density = new Memo(  
        Float32Raster(grid),  
        result => Crust.get_density(self.total_mass.value(), self.thickness.value(),    material_density.mafic_volcanic_min, result)
    ); 
    this.buoyancy = new Memo(  
        Float32Raster(grid),  
        result => Crust.get_buoyancy(self.density.value(), material_density, surface_gravity, result)
    ); 
    this.boundary_normal = new Memo(  
        VectorRaster(grid), 
        result => {
            Uint8Field .gradient  (self.mask, result);
            VectorField.normalize (result,          result);
            return result;
        }
    ); 
    this.velocity = new Memo(  
        VectorRaster(grid), 
        result => Tectonophysics.guess_plate_velocity(self.boundary_normal.value(), self.buoyancy.value(), material_viscosity, result)
    ); 
    this.center_of_mass = new Memo(  
        { x:0, y:0, z:0 },
        result => Tectonophysics.get_plate_center_of_mass    (self.total_mass.value(), self.mask)
    ); 



    this.global_ids_of_local_cells = Uint16Raster(grid);
    this.local_ids_of_global_cells = Uint16Raster(grid);

    this.global_pos_of_local_cells = VectorRaster(grid);
    this.local_pos_of_global_cells = VectorRaster(grid);

    var material_density = undefined;
    var material_viscosity = undefined;
    var surface_gravity = undefined;

    function assert_dependencies() {
        if (material_density === void 0)    { throw '"material_density" not provided'; }
        if (material_viscosity === void 0)    { throw '"material_viscosity" not provided'; }
        if (surface_gravity === void 0)    { throw '"surface_gravity" not provided'; }
    }

    this.setDependencies = function(dependencies) {
        material_density     = dependencies['material_density']     !== void 0?     dependencies['material_density']         : material_density;
        material_viscosity     = dependencies['material_viscosity']!== void 0?     dependencies['material_viscosity']         : material_viscosity;
        surface_gravity     = dependencies['surface_gravity']     !== void 0?     dependencies['surface_gravity']         : surface_gravity;
    };

    this.invalidate = function(){
        this.displacement.invalidate();
        this.thickness.invalidate();
        this.total_mass.invalidate();
        this.density.invalidate();
        this.boundary_normal.invalidate();
        this.buoyancy.invalidate();
        this.velocity.invalidate();
        this.center_of_mass.invalidate();
    }
    
    this.move = function(megayears){
        assert_dependencies();

        var world = this.world;

        var rotation_matrix = Tectonophysics.get_plate_rotation_matrix3x3(this.velocity.value(), this.center_of_mass.value(), megayears);

        Matrix3x3.mult_matrix(this.local_to_global_matrix, rotation_matrix, this.local_to_global_matrix);
        Matrix3x3.invert(this.local_to_global_matrix, this.global_to_local_matrix);

        // for each cell in the master's grid, this raster indicates the id of the corresponding cell in the plate's grid
        // this is used to convert between global and local coordinate systems
        VectorField.mult_matrix(grid.pos, this.global_to_local_matrix, this.local_pos_of_global_cells); 
        grid.getNearestIds(this.local_pos_of_global_cells, this.local_ids_of_global_cells);

        // for each cell in the plate's grid, this raster indicates the id of the corresponding cell in the world's grid
        // this is used to convert between global and local coordinate systems
        VectorField.mult_matrix(grid.pos, this.local_to_global_matrix, this.global_pos_of_local_cells);
        grid.getNearestIds(this.global_pos_of_local_cells, this.global_ids_of_local_cells);
    }
}
