'use strict';

// All global resources that are used within this file are listed below:
window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VectorWorldViewOptions = window.VectorWorldViewOptions || {};

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
function VectorWorldViewResources(initial_view_state) {
    function create_view_resource(resource_type, initial_view_state) {
        if (window.VIEW_RESOURCES[resource_type] === void 0) {
            throw `There is no view resource class named "${resource_type}"`;
        }
        return (new window.VIEW_RESOURCES[resource_type])(initial_view_state);
    }
    function get_ResourceClass(view_state) {
        return window.VIEW_RESOURCES[view_state.vector_raster_view_type];
    }

    const grid = initial_view_state.grid;
    const preallocated = preallocated || Float32Raster(grid);
    const scratch = scratch || Float32Raster(grid);
    const vector_raster_view_type = initial_view_state.vector_raster_view_type;
    const vector_raster_view = new get_ResourceClass(initial_view_state)(initial_view_state);

    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    */
    this.needsRemoval = function(world, view_state) {
        return world === void 0 ||
               world.grid !== grid;
    }
    /*
    Modifies a given gl_state to include the ViewResource.
    This modifies the state elsewhere, so it must be kept separate from the constructor.
    */
    this.addToScene = function(gl_state) {
        vector_raster_view.addToScene(gl_state);
    };
    /*
    Updates the ViewResource to reflect the most current state of the raster and view_state
    `raster` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.updateScene = function(gl_state, world, view_state) {
        if(vector_raster_view_type !== view_state.vector_raster_view_type ||
           vector_raster_view.needsRemoval()) {
            vector_raster_view.removeFromScene(gl_state);
            vector_raster_view = new get_ResourceClass(view_state)(view_state);
            vector_raster_view.addToScene(gl_state);
        }

        if (view_state.vector_field_getter === void 0) {
            log_once("vector_field_getter is undefined.");
            return;
        }

        const raster = view_state.vector_field_getter(world);

        if (raster === void 0) {
            log_once("vector_field_getter() returned undefined.");
            return;
        }
        if (!(raster.x !== void 0) && !(raster.x instanceof Float32Array)) { 
            log_once("vector_field_getter() did not return a VectorRaster.");
            return;
        }

        vector_raster_view.updateScene(gl_state, raster, view_state); 
    };
    /*
    Modifies a given gl_state to remove references to the ViewResource and disposes resources
    */
    this.removeFromScene = function(gl_state) {
        vector_raster_view.removeFromScene(gl_state);
    };
}

window.VIEW_RESOURCES['VectorWorldViewResources'] = VectorWorldViewResources;
