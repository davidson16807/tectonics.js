'use strict';

// All global resources that are used within this file are listed below:
window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};

/*
A "ViewResources" class seals off the resources that are needed by a graphics 
library to allow view state to be managed statelessly elsewhere. 
It practices strict encapsulation. Absolutely no state here is to be made publicly accessible.
This is offered as a guarantee to the rest of the code base,
and any attempt to circumvent this behavior will severely cripple your ability 
to reason with the rest of the code base. 
It practices resource allocation as initialization (RAII) 
to avoid painful issues involving the management of internal state.
It practices polymorphism so that a common frame of mind can be reused 
amongst similar ViewResources despite differences in internal state.
*/
function SimulationViewResources(initial_view_state) {
    function create_view_resource(resource_type, initial_view_state) {
        if (window.VIEW_RESOURCES[resource_type] === void 0) {
            throw `There is no view resource class named "${resource_type}"`;
        }
        return (new window.VIEW_RESOURCES[resource_type])(initial_view_state);
    }
    function get_ResourceClass(resource_type) {
        return window.VIEW_RESOURCES[resource_type];
    }

    const internal_view_state = Object.assign({}, initial_view_state);

    let scalar_projection_view = new get_ResourceClass(internal_view_state.projection_view_type)(
        Object.assign({ subview_type: internal_view_state.scalar_world_view_type }, internal_view_state)
    );
    let vector_projection_view = new get_ResourceClass(internal_view_state.projection_view_type)(
        Object.assign({ subview_type: internal_view_state.vector_world_view_type }, internal_view_state)
    );

    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    In general, a ViewResource will do everything it can to accomodate for changes in model and view state,
    but some things are unavoidable and this allows the surrounding code to handle the situation
    rather than just have the ViewResource developer cross his fingers and hope that doesn't happen.
    */
    this.needsRemoval = function(sim, options) {
        return false;
    }
    /*
    Modifies a given gl_state to include the ViewResource.
    This modifies the state elsewhere, so it must be kept separate from the constructor.
    */
    this.addToScene = function(gl_state) {
        scalar_projection_view.addToScene(gl_state);
        // vector_projection_view.addToScene(gl_state);
    };

    const default_view_state = ViewState();

    /*
    Updates the ViewResource to reflect the most current state of the sim and view_state
    `sim` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.updateScene = function(gl_state, sim, view_state) {
        view_state = Object.assign({}, default_view_state, view_state);

        if(internal_view_state.projection_view_type !== view_state.projection_view_type) {
            internal_view_state.projection_view_type = view_state.projection_view_type;
            vector_projection_view.removeFromScene(gl_state);
            scalar_projection_view.removeFromScene(gl_state);
            vector_projection_view = new get_ResourceClass(view_state.projection_view_type)(
                Object.assign({ subview_type: view_state.vector_world_view_type }, view_state)
            );
            scalar_projection_view = new get_ResourceClass(view_state.projection_view_type)(
                Object.assign({ subview_type: view_state.scalar_world_view_type }, view_state)
            );
            scalar_projection_view.addToScene(gl_state);
            vector_projection_view.addToScene(gl_state);
        }
        if(internal_view_state.vector_world_view_type !== view_state.vector_world_view_type ||
           vector_projection_view.needsRemoval(sim, view_state)) {
            internal_view_state.vector_world_view_type = view_state.vector_world_view_type;
            vector_projection_view.removeFromScene(gl_state);
            vector_projection_view = new get_ResourceClass(view_state.projection_view_type)(
                Object.assign({ subview_type: view_state.vector_world_view_type }, view_state)
            );
            scalar_projection_view.addToScene(gl_state);
        }
        if(internal_view_state.scalar_world_view_type !== view_state.scalar_world_view_type ||
           scalar_projection_view.needsRemoval(sim, view_state)) {
            internal_view_state.scalar_world_view_type = view_state.scalar_world_view_type;
            scalar_projection_view.removeFromScene(gl_state);
            scalar_projection_view = new get_ResourceClass(view_state.projection_view_type)(
                Object.assign({ subview_type: view_state.scalar_world_view_type }, view_state)
            );
            scalar_projection_view.addToScene(gl_state);
        }

        const universe = sim.model();
        const body = sim.focus();
        const stars = Object.values(universe.bodies).filter(body => body instanceof Star);
        const star_sample_positions_map_ = universe.star_sample_positions_map(universe.config, body, sim.speed/2, 9);

        const light_rgb_intensities = [];
        const light_directions = [];
        for (let star of stars){
            const star_memos = Star.get_memos(star);
            const star_sample_positions = star_sample_positions_map_[star.id];
            for (let star_sample_position of star_sample_positions) {
                const light_distance = Vector.magnitude(
                    star_sample_position.x,
                    star_sample_position.y,
                    star_sample_position.z
                );
                const light_direction = Vector.normalize(
                    star_sample_position.x,
                    star_sample_position.y,
                    star_sample_position.z
                );
                const light_rgb_intensity = Thermodynamics.solve_rgb_intensity_of_light_emitted_by_black_body(star_memos.surface_temperature());
                const light_attenuation = SphericalGeometry.get_surface_area(star_memos.radius()) / SphericalGeometry.get_surface_area(light_distance);
                const light_exposure = 1/star_sample_positions.length;
                light_rgb_intensity.x *= light_attenuation * light_exposure;
                light_rgb_intensity.y *= light_attenuation * light_exposure;
                light_rgb_intensity.z *= light_attenuation * light_exposure;

                light_rgb_intensities.push(light_rgb_intensity);
                light_directions.push(light_direction);
            }
        }

        scalar_projection_view.updateScene(gl_state, body, 
                Object.assign({ 
                    subview_type: internal_view_state.scalar_world_view_type, 
                    light_rgb_intensities: light_rgb_intensities,
                    light_directions:      light_directions,
                    specular_visibility:   light_directions.length == stars.length? 1.:0.
                }, view_state)
            );
        vector_projection_view.updateScene(gl_state, body, 
                Object.assign({ 
                    subview_type: internal_view_state.vector_world_view_type, 
                    light_rgb_intensities: light_rgb_intensities,
                    light_directions:      light_directions, 
                    specular_visibility:   light_directions.length == stars.length? 1.:0.
                }, view_state)
            );
    };
    /*
    Modifies a given gl_state to remove references to the ViewResource and disposes resources
    */
    this.removeFromScene = function(gl_state) {
        scalar_projection_view.removeFromScene(gl_state);
        vector_projection_view.removeFromScene(gl_state);
    };
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['SimulationViewResources'] = SimulationViewResources;