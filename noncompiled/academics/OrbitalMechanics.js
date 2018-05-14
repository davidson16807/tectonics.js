// OrbitalMechanics is a namespace isolating all business logic relating to orbital mechanics
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var OrbitalMechanics = (function() {
	var OrbitalMechanics = {};


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
			axial_tilt, 
			//rotation of planet's axis around north celestial pole, in radians
			precession_angle
	) {
		var precession_angle  = precession_angle || 0;
		var rotation_matrix   = Matrix4x4.from_rotation	(0,1,0, rotation_angle);
		var tilt_matrix 	  = Matrix4x4.from_rotation	(1,0,0, axial_tilt);
		var precession_matrix = Matrix4x4.from_rotation	(0,1,0, precession_angle);
		var conversion_matrix = Matrix4x4.mult_matrix 	(tilt_matrix, 		rotation_matrix);
		var conversion_matrix = Matrix4x4.mult_matrix 	(precession_matrix, conversion_matrix);
		return conversion_matrix;
	}

	// gets the cartesian coordinates necessary to convert geocentric ecliptic coordinates to heliocentric ecliptic coordinates
	// NOTE: for help understanding parameters to this function, go here: https://orbitalmechanics.info/
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

		var E = solve_eccentric_anomaly(M, e, 5);
		var ecliptic_coordinates = get_2d_ecliptic_coordinates(E, a, e);
		var translation_matrix = Matrix4x4.from_translation( ecliptic_coordinates.x, 0, ecliptic_coordinates.y );
		var ω_rotation_matrix = Matrix4x4.from_rotation(0,1,0, ω);
		var i_rotation_matrix = Matrix4x4.from_rotation(1,0,0, i);
		var Ω_rotation_matrix = Matrix4x4.from_rotation(0,1,0, Ω);

		var conversion_matrix;
		conversion_matrix = Matrix4x4.mult_matrix(ω_rotation_matrix, translation_matrix);
		conversion_matrix = Matrix4x4.mult_matrix(i_rotation_matrix, conversion_matrix);
		conversion_matrix = Matrix4x4.mult_matrix(Ω_rotation_matrix, conversion_matrix);

		return conversion_matrix;
	}
	// gets the parent-centric ecliptic cartesian coordinates sampled along an orbit
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
			x: a*cos(E)-e,
			y: a*sin(E)*sqrt(1-e*e)
		};
	}
	var solve_eccentric_anomaly = function(mean_anomaly, eccentricity, iterations) {
		var e, E, M, M_E, dMdE, error;
		e = eccentricity;
		E = mean_anomaly;
		M = mean_anomaly;
		for (var i = 0; i < iterations; i++) {
			M_E 	= E-e*Math.sin(E);
			dMdE 	= 1-e*Math.cos(E);
			error 	= M - M_E
			E = E + error/dMdE;
		}
		return E;
	}

	OrbitalMechanics.GRAVITATIONAL_CONSTANT = 6.67408e10-8; // m3 T-1 s-2

	OrbitalMechanics.ASTRONOMICAL_UNIT = 149597870700; // meters

	// TODO: figure out where to put above function
	// maybe another namespace: "Heliosphere"? "StellarModeling" "Optics" ?
	OrbitalMechanics.SOLAR_LUMINOSITY = 3.828e23 // kiloWatts

	// This calculates the intensity of incident radiation (in kiloWatts/m^2) that's felt by the surface of a planet.
	// This fraction is the cosine of solar zenith angle, as seen in Lambert's law.
	// The fraction is calculated as a daily average for every region on the globe
	//
	// Q: Why calculate the fraction in a separate function? Why not just calculate incident radiation?
	// A:  The fraction stays constant over time because we assume the planet's orbit is stable,
	//     but the global solar constant changes over time due to stellar aging.
	//     It takes much longer to recompute the fraction than it does the global solar constant.
	//     We calculate the fraction in a separate function so we can store the result for later.
	OrbitalMechanics.incident_radiation = function(
			// This is a vector raster of each grid cell's position in geocentric ecliptic coordinates 
			geocentric_ecliptic_pos_field,
			// This is a vector indicating the planet's center of mass in heliocentric ecliptic coordinates 
			heliocentric_ecliptic_pos, 
			// total power output of star in all directions, in kiloWatts
			stellar_luminosity,
			// Float32Raster that stores results
			result
		) {
		result = result || Float32Raster(pos.grid);

		// this is a vector of the sun's geocentric position 
		var sun_coordinates = Vector(
			-heliocentric_ecliptic_pos.x, 
			-heliocentric_ecliptic_pos.y, 
			-heliocentric_ecliptic_pos.z
		);

		// use cosine similarity to find cosine of solar zenith angle 
		VectorField.vector_similarity 	(geocentric_ecliptic_pos_field, sun_coordinates, 	result);

		// disregard solar angle at night
		Float32RasterInterpolation.clamp(result, 0, 1, 										result);

		// intensity of stellar insolation, in kiloWatts/m^2
		// this is the power generated by a 100% efficient, 1 m^2 solar panel that's directly facing the sun
		var stellar_distance = Vector.magnitude(
			heliocentric_ecliptic_pos.x,
			heliocentric_ecliptic_pos.y,
			heliocentric_ecliptic_pos.z
		);
		var global_stellar_constant = stellar_luminosity / ( 4 * Math.PI * stellar_distance * stellar_distance );

		ScalarField.mult_scalar			( result, global_stellar_constant, 					result );

		return result;
	}

	return OrbitalMechanics;
})();
