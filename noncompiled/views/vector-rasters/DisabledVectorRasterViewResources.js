'use strict';

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
function DisabledVectorRasterViewResources(initial_view_state) {
    this.needsRemoval = function(raster, view_state) { return false; }
    this.addToScene = function(gl_state) {};
    this.updateScene = function(gl_state, raster, view_state) {};
    this.removeFromScene = function(gl_state) {};
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['DisabledVectorRasterViewResources'] = DisabledVectorRasterViewResources;

