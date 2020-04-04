'use strict';

// An orbit is a low level mathematical data structure, similar in nature to the "Raster" classes.
// It can be thought of as any conic path drawn across space, regardless of the force that causes it.
// Along with the standard gravitational parameter, "GM" it can be treated as a function mapping time to a tuple of position and velocity
// For a non-binary system, GM is equal to the gravitational constant multiplied by the mass of the parent object
//  * An orbit does not require a planet - it could, for instance, describe a motion between barycenters.
//    It is no more dependant on a celestial body than a velocity vector is dependant on a physical object
//    As such, the "Orbit" class does not track celestial bodies within its attributes.
//  * An orbit could be affected by celestial bodies over time. 
//    Since this requires knowledge of all celestial objects in the universe, 
//    We only handle this logic in the "Universe" class. 
function Orbit(parameters) {
    const self = this;

    // the average between apoapsis and periapsis
    const semi_major_axis                 = parameters['semi_major_axis']                 || stop('missing parameter: "semi_major_axis"');
    // the shape of the orbit, where 0 is a circular orbit and >1 is a hyperbolic orbit
    const eccentricity                    = parameters['eccentricity']                    || 0.;
    // the angle (in radians) between the orbital plane and the reference plane (the intersection being known as the "ascending node")
    const inclination                     = parameters['inclination']                     || 0.;
    // the angle (in radians) between the ascending node and the periapsis
    const argument_of_periapsis           = parameters['argument_of_periapsis']           || 0.;
    // the angle (in radians) between the prime meridian of the parent and the "ascending node" - the intersection between the orbital plane and the reference plane
    const longitude_of_ascending_node     = parameters['longitude_of_ascending_node']     || 0.;
    // effective mass of the parent and child bodies
    // We say it is "effective" because sometimes no parent body exists (i.e. galaxies)
    // It is not typically included in textbooks amongst orbital parameters,
    // but it allows us to make statements that concern timing: velocity, period, etc.
    const effective_combined_mass         = parameters['effective_combined_mass']         || 0.;

    this.getParameters = function() {
        return {
            type: 'orbit',
            semi_major_axis:                 semi_major_axis,
            eccentricity:                     eccentricity,
            inclination:                     inclination,
            argument_of_periapsis:             argument_of_periapsis,
            longitude_of_ascending_node:     longitude_of_ascending_node,
            effective_combined_mass:         effective_combined_mass,
        };
    }

    this.period = function() {
        return OrbitalMechanics.get_period(semi_major_axis, effective_combined_mass);
    }

    // "position" returns the position vector that is represented by an orbit 
    this.get_child_to_parent_matrix = function(mean_anomaly) {
        return OrbitalMechanics.get_orbit_matrix4x4(
                mean_anomaly,
                semi_major_axis, 
                eccentricity, 
                inclination,
                argument_of_periapsis,
                longitude_of_ascending_node
            );
    }
    this.get_parent_to_child_matrix = function(mean_anomaly) {
        return Matrix4x4.invert(this.get_child_to_parent_matrix(mean_anomaly));
    }
}
