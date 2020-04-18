'use strict';

// All global resources that are used within this file are listed below:
window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};

/*
The job of a "View" is to prevent invalid state from occuring 
in a system composed of a WebGl context, a model state, and a view state. 

As a general rule, we would like it to be easy to reason with code and to
make changes quickly and with confidence. 
Most important is our ability to state with confidence whether the changes 
we make will not cause an application to produce invalid state.
This is especially challenging when interacting with stateful APIs 
whose definition is beyond our control. Graphics libraries such as OpenGL
and WebGL are notorious for this kind of of state management problem. 

"View" gets around that problem by sealing off the graphics library state.
It practices strict encapsulation. Absolutely none of the 
graphics library state here is to be made publicly accessible.
This is offered as a guarantee to the rest of the code base,
and any attempt to circumvent this behavior will severely cripple your ability 
to reason with the rest of the code base. 
All code outside View expresses view state using a "ViewState" object. 
The ViewState object is a simple data structure lacking methods,
effectively a JSON object containing a view matrix and attributes 
that express how to depict scalar/vector fields and what projection to use. 
*/
function View(initial_view_state) {
    function create_view_resource(resource_type, initial_view_state) {
        if (window.VIEW_RESOURCES[resource_type] === void 0) {
            throw `There is no view resource class named "${resource_type}"`;
        }
        console.log(initial_view_state)
        return new (window.VIEW_RESOURCES[resource_type])(initial_view_state);
    }
    
    // private state
    const gl_state = new ThreeJsState();

    const internal_view_state = Object.assign({}, initial_view_state);
    let model_view = create_view_resource(internal_view_state.model_view_type, internal_view_state);

    this.render = function() {
        gl_state.composer.render();
    };

    this.update = function(sim, view_state) {
        if(internal_view_state.model_view_type !== view_state.model_view_type ||
           model_view.needsRemoval(sim, view_state)) {
            internal_view_state.model_view_type = view_state.model_view_type;
            model_view.removeFromScene(gl_state);
            model_view = create_view_resource(
                view_state.model_view_type, 
                Object.assign({}, view_state) 
            );
            model_view.addToScene(gl_state);
        }

        // gl_state.camera.updateMatrixWorld( false );
        // gl_state.camera.matrixWorld.elements.set(view_state.view_matrix);
        // gl_state.camera.matrixWorldInverse.getInverse( gl_state.camera.matrixWorld );
    }

    this.addToDomElement = function(domElement) {
        domElement.appendChild(gl_state.renderer.domElement);
    };

    this.removeFromDomElement = function(domElement) {
        domElement.appendChild(gl_state.renderer.domElement);
    };

    this.getScreenshotDataURL = function() {
        return gl_state.renderer.domElement.toDataURL("image/png");
    };

    this.uniform = function(key, value){
        options[key] = value;
    }
}
