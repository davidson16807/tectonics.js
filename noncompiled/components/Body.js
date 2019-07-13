'use strict';

// "Body" is a component that holds the inherent state of any celestial body.
// It can be any object, natural or artificial, so long as it has mass. 
// Position and velocity are stored and calculated in other components and systems,
//  such as Orbit, Spin, and Universe.
// For more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
function Body(parameters) {
    // "name" is the user friendly name of the celestial body
    this.name = parameters.name;
    // "mass" is the mass of the body, in kilograms as always
    this.mass = parameters['mass'] || stop('missing parameter: "mass"');

    this.getParameters = function() {
        return { 
            name: this.name,
            mass: this.mass,
        };
    };
}
