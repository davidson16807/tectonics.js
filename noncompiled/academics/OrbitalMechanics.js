// OrbitalMechanics is a namespace isolating all business logic relating to orbital mechanics
// It assumes no knowledge beyond classical physics
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var OrbitalMechanics = (function() {
    var OrbitalMechanics = {};

    OrbitalMechanics.GRAVITATIONAL_CONSTANT = 6.6740831e-11; // m3 kg-1 s-2

    OrbitalMechanics.get_gravity = function(effective_parent_mass, distance) {
        return OrbitalMechanics.GRAVITATIONAL_CONSTANT * effective_parent_mass / (distance * distance);
    }

    OrbitalMechanics.get_period = function(semi_major_axis, effective_parent_mass) {
        // TODO: move this logic to OrbitalMechanics
        var a = semi_major_axis;
        var GM = effective_parent_mass * OrbitalMechanics.GRAVITATIONAL_CONSTANT;
        var π = Math.PI;
        return 2*π * Math.sqrt( a*a*a / GM );
    }
    // gets the rotation matrix necessary to convert geocentric equatorial coordinates to geocentric ecliptic coordinates
    OrbitalMechanics.get_spin_matrix4x4 = function(
            //rotation about axis, in radians
            rotation_angle, 
            //tilt of the planet's axis, in radians
            axial_tilt
    ) {
        var precession_angle  = precession_angle || 0;
        var rotation_matrix   = Matrix4x4.from_rotation    (0,1,0, -rotation_angle);
        var tilt_matrix       = Matrix4x4.from_rotation    (1,0,0, -axial_tilt);
        var conversion_matrix = Matrix4x4.mult_matrix     (tilt_matrix,         rotation_matrix);
        return conversion_matrix;
    }

    // gets the cartesian coordinates necessary to convert geocentric ecliptic coordinates to heliocentric ecliptic coordinates
    // NOTE: for help understanding parameters to this function, go here: https://orbitalmechanics.info/
    // NOTE: x is periapsis distance where inclination, argument of_periapsis, and longitude_of_ascending_node are 0
    OrbitalMechanics.get_orbit_matrix4x4 = function(
            // the phase angle (in radians) that indicates the point in time within an object's revolution. It varies linearly with time.
            mean_anomaly,
            // the average between apoapsis and periapsis
            semi_major_axis, 
            // the shape of the orbit, where 0 is a circular orbit and >1 is a hyperbolic orbit
            eccentricity, 
            // the angle (in radians) between the orbital plane and the reference plane (the intersection being known as the "ascending node")
            inclination,
            // the angle (in radians) between the ascending node and the periapsis
            argument_of_periapsis,
            // the angle (in radians) between the prime meridian of the parent and the "ascending node" - the intersection between the orbital plane and the reference plane
            longitude_of_ascending_node
    ) {
        var Ω = longitude_of_ascending_node || 0.; 
        var i = inclination || 0.;
        var ω = argument_of_periapsis || 0.;
        var e = eccentricity || 0.;
        var a = semi_major_axis;
        var M = mean_anomaly;

        var E = solve_eccentric_anomaly(M, e, 10);
        var ecliptic_coordinates = get_2d_ecliptic_coordinates(E, a, e);
        var translation_matrix = Matrix4x4.from_translation( ecliptic_coordinates.p, 0, ecliptic_coordinates.q );
        var ω_rotation_matrix = Matrix4x4.from_rotation(0,1,0, -ω);
        var i_rotation_matrix = Matrix4x4.from_rotation(0,0,1, -i);
        var Ω_rotation_matrix = Matrix4x4.from_rotation(0,1,0, -Ω);

        var conversion_matrix;
        conversion_matrix = Matrix4x4.mult_matrix(ω_rotation_matrix, translation_matrix);
        conversion_matrix = Matrix4x4.mult_matrix(i_rotation_matrix, conversion_matrix);
        conversion_matrix = Matrix4x4.mult_matrix(Ω_rotation_matrix, conversion_matrix);

        return conversion_matrix;
    }
    // gets the parent-centric ecliptic cartesian coordinates (p,q) sampled along an orbit
    //  where +p is towards periapsis and -p is apoapsis
    //  when eccentric_anomaly = 0, the orbiting object is at periapsis
    // 
    // See here for more info:
    //  https://space.stackexchange.com/questions/8911/determining-orbital-position-at-a-future-point-in-time
    // Or here, in book form:
    //  Fundamentals of Astrodynamics, by Bate, Mueller, and White
    var get_2d_ecliptic_coordinates = function(
            eccentric_anomaly,
            semi_major_axis, 
            eccentricity 
        ) {
        // the shape of the orbit, where 0 is a circular orbit and >1 is a hyperbolic orbit
        var e = eccentricity || 0.;
        // the average between apoapsis and periapsis
        var a = semi_major_axis;
        var E = eccentric_anomaly;

        var sin = Math.sin;
        var cos = Math.cos;
        var sqrt = Math.sqrt;
        return {
            p: a*(cos(E)-e),
            q: -a*sin(E)*sqrt(1-e*e)
        };
    }
    var solve_eccentric_anomaly = function(mean_anomaly, eccentricity, iterations) {
        var e, E, M, M_E, dMdE, error;
        e = eccentricity;
        E = mean_anomaly;
        M = mean_anomaly;
        for (var i = 0; i < iterations; i++) {
            M_E     = E-e*Math.sin(E);
            dMdE     = 1-e*Math.cos(E);
            error     = M - M_E
            E = E + error/dMdE;
        }
        return E;
    }




    return OrbitalMechanics;
})();
