'use strict';

// "Body" is a component that holds the inherent state of any celestial body.
// It can be any object, natural or artificial, regardless whether it has appreciable mass. 
// Mass is stored in components such as Star and World, 
//  so that they may track mass within mass pools that are relevant to them. 
// Position and velocity are stored in systems that describe motion, such as Orbit, Spin,
//  because position and velocity are typically invariant to mass in orbital mechanics
// For more information about the Entity-Component-System pattern, 
//  see https://en.wikipedia.org/wiki/Entity_component_system
function Body(parameters) {
    // "name" is the user friendly name of the celestial body
    this.name = parameters.name;
    // "age" is the age of the body, in seconds as always
    this.age = parameters['age'] || stop('missing parameter: "age"');

    this.getParameters = function() {
        return { 
            name: this.name,
            age: this.age,
        };
    };
}
