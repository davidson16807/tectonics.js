// OrbitalMechanics is a namespace isolating all business logic relating to orbital mechanics
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

var OrbitalMechanics = {};

// Converts a raster of geocentric equatorial cartesian coordinates to geocentric ecliptic cartesian coordinates
OrbitalMechanics.get_eliptic_coordinates_raster_from_equatorial_coordinates_raster = function(
    equatorial_coordinates,
    rotation_angle, //rotation around axis
    axial_tilt, //tilt of the planet's axis, in radians
    result) {
  var rotation_matrix   = Matrix.RotationAboutAxis(0,1,0, rotation_angle);
  var tilt_matrix       = Matrix.RotationAboutAxis(1,0,0, axial_tilt);
  var conversion_matrix = Matrix.mult_matrix(tilt_matrix, rotation_matrix);
  return VectorField.mult_matrix(equatorial_coordinates, conversion_matrix, result);
}
// gets a list of 2d positions that are sampled evenly over one revolution of an orbit
OrbitalMechanics.get_eliptic_coordinate_samples = function(
    semi_major_axis, 
    eccentricity, 
    sample_num) {
  var samples = []  
  var sample;
  var mean_anomaly = 0.;
  var get_eliptic_coordinate_sample = OrbitalMechanics.get_eliptic_coordinate_sample;
  for (var i=0; i<sample_num; ++i) {
    mean_anomaly = i*2*Math.PI/sample_num;
    sample = get_eliptic_coordinate_sample(
      semi_major_axis, 
      eccentricity, 
      mean_anomaly);
      samples.push(sample);
  }
  return samples;
}
OrbitalMechanics.get_eliptic_coordinate_sample = function(
    semi_major_axis, 
    eccentricity, 
    mean_anomaly) {
  var a = semi_major_axis;
  var e = eccentricity;
  var E = OrbitalMechanics.solve_eccentric_anomaly(mean_anomaly, eccentricity, 5);
  var sin = Math.sin;
  var cos = Math.cos;
  var sqrt = Math.sqrt;
  var eccentric_anomaly = OrbitalMechanics.solve_eccentric_anomaly(mean_anomaly, eccentricity, 5);
  return {
    x: a*cos(E)-e,
    y: 0,
    z: a*sin(E)*sqrt(1-e*e)
  };
}