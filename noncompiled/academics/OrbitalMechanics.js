// OrbitalMechanics is a namespace isolating all business logic relating to orbital mechanics
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var OrbitalMechanics = (function() {
	var OrbitalMechanics = {};

	// gets the rotation matrix necessary to convert geocentric equatorial coordinates to geocentric ecliptic coordinates
	OrbitalMechanics.get_parent_centric_rotation_matrix = function(
			//rotation about axis, in radians
			rotation_angle, 
			//tilt of the planet's axis, in radians
			axial_tilt, 
			//rotation of planet's axis around north celestial pole, in radians
			precession_angle
		) {
		var precession_angle  = precession_angle || 0;
		var rotation_matrix   = Matrix.RotationAboutAxis(0,1,0, rotation_angle);
		var tilt_matrix 	  = Matrix.RotationAboutAxis(1,0,0, axial_tilt);
		var precession_matrix = Matrix.RotationAboutAxis(0,1,0, precession_angle);
		var conversion_matrix = Matrix.mult_matrix (tilt_matrix, 		rotation_matrix);
		var conversion_matrix = Matrix.mult_matrix (conversion_matrix, 	precession_matrix);
		return conversion_matrix;
	}

	// gets the cartesian coordinates necessary to convert geocentric ecliptic coordinates to heliocentric equatorial coordinates
	// applying get_parent_centric_rotation_matrix followed by get_parent_centric_offset yields parent centric coordinates
	// NOTE: for help understanding parameters to this function, go here: https://orbitalmechanics.info/
	OrbitalMechanics.get_parent_centric_offset = function(
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

		var ω_rotation_matrix = Matrix.RotationAboutAxis(0,1,0, ω);
		var i_rotation_matrix = Matrix.RotationAboutAxis(1,0,0, i);
		var Ω_rotation_matrix = Matrix.RotationAboutAxis(0,1,0, Ω);

		var conversion_matrix;
		conversion_matrix = Matrix.mult_matrix(i_rotation_matrix, ω_rotation_matrix);
		conversion_matrix = Matrix.mult_matrix(conversion_matrix, Ω_rotation_matrix);

		var E = solve_eccentric_anomaly(M, e, 5);
		var ecliptic_coordinates = get_ecliptic_coordinate_sample(E, a, e);
		return Vector.mult_matrix(
			ecliptic_coordinates.x,
			ecliptic_coordinates.y,
			ecliptic_coordinates.z,
			conversion_matrix
		);
	}
	// gets the parent-centric ecliptic cartesian coordinates sampled along an orbit
	var get_ecliptic_coordinate_sample = function(
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
			y: 0,
			z: a*sin(E)*sqrt(1-e*e)
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





	// This calculates the fraction of the global solar constant that's felt by the surface of a planet.
	// This fraction is the cosine of solar zenith angle, as seen in Lambert's law.
	// The fraction is calculated as a daily average for every region on the globe
	//
	// Q: Why calculate the fraction in a separate function? Why not just calculate incident radiation?
	// A:  The fraction stays constant over time because we assume the planet's orbit is stable,
	//     but the global solar constant changes over time due to stellar aging.
	//     It takes much longer to recompute the fraction than it does the global solar constant.
	//     We calculate the fraction in a separate function so we can store the result for later.
	OrbitalMechanics.incident_radiation_fraction = function(
			// This is a vector raster of each grid cell's position in geocentric equatorial coordinates (just like "pos" in other functions) 
			pos, 
			// this is a single vector of the planet's position in heliocentric ecliptic coordinates (not to be confused with "pos")
			orbital_pos, 
			// tilt of the planet's axis, in radians
			axial_tilt, 
			// number of samples used to calculate average, default is 12
			sample_num,
			// Float32Raster that stores results
			result
		) {
		result = result || Float32Raster(pos.grid);
		sample_num = sample_num || 12;

		// this is a vector of the sun's geocentric position 
		var sun_coordinates = Vector(-orbital_pos.x, -orbital_pos.y, -orbital_pos.z);

		var grid = pos.grid;

		// TODO: need scratch for these
		var surface_normal = VectorRaster(grid);
		var cos_solar_zenith_angle = Float32Raster(grid);

		var similarity = VectorField.vector_similarity;
		var add = ScalarField.add_field;
		var clamp = Float32RasterInterpolation.clamp;

		var PI = Math.PI;
		var rotation_angle = i * 2*PI/sample_num;

		// find surface normal, i.e. vector that points straight up from the ground
		OrbitalMechanics.get_ecliptic_coordinates_raster_from_equatorial_coordinates_raster(
			pos,
			rotation_angle, 
			axial_tilt, 
			surface_normal);

		// use cosine similarity to find cosine of solar zenith angle 
		VectorField.vector_similarity (
					surface_normal, sun_coordinates, 		cos_solar_zenith_angle
		);

		// disregard solar angle at night
		clamp		(cos_solar_zenith_angle, 0, 1, 			cos_solar_zenith_angle);

		add  		(result, cos_solar_zenith_angle, 		result);
		return result;
	}


	return OrbitalMechanics;
})();
