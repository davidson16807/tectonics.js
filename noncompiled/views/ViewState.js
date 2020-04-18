'use strict';
/*
Returns a view state object with default attributes if neither the user nor the 
ViewResources objects specify anything otherwise
*/
function ViewState(options) {
    return Object.assign({
        // view_matrix: Matrix4x4.identity(),
        model_view_type: 'SimulationViewResources',
        projection_view_type: 'GlobeProjectionViewResources',
        scalar_world_view_type: 'RealisticWorldViewResources',
        vector_world_view_type: 'VectorWorldViewResources',
        scalar_raster_view_type: 'ColorscaleViewResources',
        vector_raster_view_type: 'DisabledVectorRasterViewResources',
        
        scalar_world_view_substate_id: 'elevation',
        vector_world_view_substate_id: 'disabled',

        world_view_vertex_shader: 'orthographic',
        map_projection_offset: 0,
        
        builtin_colorscale: 1, // heatmap
        max_color: 0x000000,
        min_color: 0xFFFFFF,

        // NOTE: defaults are provided 
        // insolation_max: 0,
        // light_directions: [],
        // light_rgb_intensities: [],
        // reference_distance: ,
        // reference_radius: ,
        // sealevel: ,
        // world_radius: ,
        // grid: ,

        ocean_visibility: 1.0,
        sediment_visibility: 1.0,
        plant_visibility: 1.0,
        snow_visibility: 1.0,
        shadow_visibility: 1.0,
        specular_visibility: 1.0,

    }, options);
}