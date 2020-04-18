'use strict';

// All global resources that are used within this file are listed below:
window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VERTEX_SHADERS = window.VERTEX_SHADERS || {};

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
function GlobeProjectionViewResources(initial_view_state) {
    function create_view_resource(resource_type, initial_view_state) {
        if (window.VIEW_RESOURCES[resource_type] === void 0) {
            throw `There is no view resource class named "${resource_type}"`;
        }
        return (new window.VIEW_RESOURCES[resource_type])(initial_view_state);
    }
    function get_options(view_state) {
        return Object.assign({
                    world_view_vertex_shader: window.VERTEX_SHADERS.orthographic, 
                    shaderpass_visibility: 0,
                    map_projection_offset: 0,
                }, view_state);
    }
    function get_ResourceClass(view_state) {
        return window.VIEW_RESOURCES[view_state.subview_type];
    }

    let subview_type = initial_view_state.subview_type;
    let subview = new get_ResourceClass(initial_view_state)(get_options(initial_view_state));

    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    In general, a ViewResource will do everything it can to accomodate for changes in model and view state,
    but some things are unavoidable and this allows the surrounding code to handle the situation
    rather than just have the ViewResource developer cross his fingers and hope that doesn't happen.
    */
    this.needsRemoval = function(model, view_state) {
        return subview.needsRemoval(model, view_state);
    }
    /*
    Modifies a given gl_state to include the ViewResource.
    This modifies the state elsewhere, so it must be kept separate from the constructor.
    */
    this.addToScene = function(gl_state) {
        subview.addToScene(gl_state);
    };
    /*
    Updates the ViewResource to reflect the most current state of the raster and view_state
    `raster` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.updateScene = function(gl_state, model, view_state) {
        if(subview_type !== view_state.subview_type || 
           subview.needsRemoval(model, view_state)) {
            subview_type = view_state.subview_type;
            this.removeFromScene(gl_state);
            subview = new get_ResourceClass(view_state)(get_options(view_state,  1));
            this.addToScene(gl_state);
        }
        subview.updateScene(gl_state, model, get_options(view_state,  1));
    };
    /*
    Modifies a given gl_state to remove references to the ViewResource and disposes resources
    */
    this.removeFromScene = function(gl_state) {
        subview.removeFromScene(gl_state);
    };
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['GlobeProjectionViewResources'] = GlobeProjectionViewResources;