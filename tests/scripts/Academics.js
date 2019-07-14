/* eslint-env qunit */
QUnit.module('Rasters');


// from https://www.reddit.com/r/askscience/comments/2gerkk/how_much_of_the_heat_from_the_sun_comes_from/

test_value_is_above(
    Thermodynamics.solve_fraction_of_light_emitted_by_black_body_below_wavelength(
        760*Units.NANOMETER, 
        Units.SOLAR_TEMPERATURE
    ),
    0.5,
    'Thermodynamics.solve_fraction_of_light_emitted_by_black_body_below_wavelength',
    'must predict that the sun will return mostly visible light'
);

test_value_is_above(
    Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths(
         380*Units.NANOMETER, 
         760*Units.NANOMETER, 
         Units.SOLAR_TEMPERATURE
     ),
    0.4,
    'Thermodynamics.solve_fraction_of_light_emitted_by_black_body_between_wavelengths',
    'must predict that the sun will return mostly visible light'
);

test_value_is_between(
    Thermodynamics.get_intensity_of_light_emitted_by_black_body(Units.SOLAR_TEMPERATURE) * 
        SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
        SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT),
    0.99*Units.GLOBAL_SOLAR_CONSTANT,
    1.01*Units.GLOBAL_SOLAR_CONSTANT,
    'Thermodynamics.get_intensity_of_light_emitted_by_black_body',
    'must predict the global solar constant to within 10%'
);

// estimates from Pashiardis 2017
test_value_is_between(
    Units.GLOBAL_SOLAR_CONSTANT * Thermodynamics.get_photons_per_watt_emitted_by_black_body_between_wavelengths(
         400*Units.NANOMETER, 
         700*Units.NANOMETER, 
         Units.SOLAR_TEMPERATURE,
    ),
    0.9 * 2443.3 * Units.MICROMOLE / (Units.METER*Units.METER*Units.SECOND),
    1.1 * 2443.3 * Units.MICROMOLE / (Units.METER*Units.METER*Units.SECOND),
    'Thermodynamics.get_photons_per_watt_emitted_by_black_body_between_wavelengths',
    'must predict the global solar constant for photosynthetically active radiation to within 10%'
);

var EARTH_DAILY_AVERAGE_INSOLATION = Units.GLOBAL_SOLAR_CONSTANT/4;
test_value_is_between(
    Thermodynamics.get_equilibrium_temperature(EARTH_DAILY_AVERAGE_INSOLATION),
    0.9*Units.STANDARD_TEMPERATURE,
    1.1*Units.STANDARD_TEMPERATURE,
    'Thermodynamics.get_equilibrium_temperature',
    'must predict absolute average earth temperature to within 10%'
);

var emission_coefficient = 0.66;
var earth_heat_flow_estimate = Thermodynamics.solve_entropic_heat_flow(EARTH_DAILY_AVERAGE_INSOLATION, 0, emission_coefficient);
// estimates from Lorenz 2001
test_value_is_between( 
    Thermodynamics.solve_entropic_heat_flow(
            Thermodynamics.get_intensity_of_light_emitted_by_black_body(Units.SOLAR_TEMPERATURE) * 
                SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
                SphericalGeometry.get_surface_area(9.6*Units.ASTRONOMICAL_UNIT)/4, 
            0, 1.
        ), 
    0.3/1.8, 
    0.3*1.8,
    'Thermodynamics.solve_entropic_heat_flow',
    "must predict latitudinal heat flow of titan's atmosphere to within a half order of magnitude"
);
test_value_is_between( 
    Thermodynamics.solve_entropic_heat_flow(
            Thermodynamics.get_intensity_of_light_emitted_by_black_body(Units.SOLAR_TEMPERATURE) * 
                SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
                SphericalGeometry.get_surface_area(1.5*Units.ASTRONOMICAL_UNIT)/4, 
            0, 1.
        ), 
    25/1.8, 
    25*1.8,
    'Thermodynamics.solve_entropic_heat_flow',
    "must predict latitudinal heat flow of mars's atmosphere to within a half order of magnitude"
);
test_value_is_between( 
    earth_heat_flow_estimate, 30/1.8, 30*1.8,
    'Thermodynamics.solve_entropic_heat_flow',
    "must predict latitudinal heat flow of earth's atmosphere to within a half order of magnitude"
);
test_value_is_between(
    Thermodynamics.get_equilibrium_temperature(
        (EARTH_DAILY_AVERAGE_INSOLATION-earth_heat_flow_estimate) / emission_coefficient
    ),
    Units.STANDARD_TEMPERATURE+18,
    Units.STANDARD_TEMPERATURE+55,
    'Thermodynamics.solve_entropic_heat_flow',
    "must predict temperatures at earth's equator to within a half order of magnitude"
);
test_value_is_between(
    Thermodynamics.get_equilibrium_temperature(
        (0+earth_heat_flow_estimate) / emission_coefficient
    ),
    Units.STANDARD_TEMPERATURE-100,
    Units.STANDARD_TEMPERATURE-10,
    'Thermodynamics.solve_entropic_heat_flow',
    "must predict temperatures at earth's poles to within a half order of magnitude"
);


// Now test behavior over fields
var random = new Random();
var grid = new Grid(new THREE.IcosahedronGeometry(1, 3), {});

test_values_are_between(
    ScalarField.mult_scalar(
        Thermodynamics.get_intensity_of_light_emitted_by_black_bodies(
            Float32Raster(grid, 5800*Units.KELVIN)
        ),
        SphericalGeometry.get_surface_area(Units.SOLAR_RADIUS) / 
        SphericalGeometry.get_surface_area(Units.ASTRONOMICAL_UNIT)
    ),
    0.9*Units.GLOBAL_SOLAR_CONSTANT,
    1.1*Units.GLOBAL_SOLAR_CONSTANT,
    'Thermodynamics.get_intensity_of_light_emitted_by_black_bodies',
    "must predict the global solar constant to within 10%"
);

var insolation = SphericalGeometry.get_random_surface_field(grid, random);
Float32Dataset.rescale(insolation, insolation, 0, EARTH_DAILY_AVERAGE_INSOLATION);
var heat_flow = Thermodynamics.guess_entropic_heat_flows(insolation, earth_heat_flow_estimate)

test_transport_is_conserved(
    heat_flow,
    'Thermodynamics.guess_entropic_heat_flows'
);

test_values_are_between(
    Thermodynamics.get_equilibrium_temperatures(
        ScalarField.div_scalar(
            ScalarField.sub_field(insolation, heat_flow),
            emission_coefficient
        )
    ),
    Units.STANDARD_TEMPERATURE-100,
    Units.STANDARD_TEMPERATURE+55,
    'Thermodynamics.get_equilibrium_temperatures',
    "must predict the high and low temperatures on earth to within half an order of magnitude"
);

















// ORBITAL MECHANICS
test_value_is_to_within(
    OrbitalMechanics.get_gravity(Units.EARTH_MASS, Units.EARTH_RADIUS),
    Units.STANDARD_GRAVITY,
    0.01,
    'OrbitalMechanics.get_gravity',
    "must predict Earth's surface gravity to within 1%"
);

test_value_is_to_within(
    OrbitalMechanics.get_period(Units.ASTRONOMICAL_UNIT, Units.SOLAR_MASS),
    Units.YEAR,
    0.01,
    'OrbitalMechanics.get_period',
    "must predict the length of earth's year to within 1%"
);

var earth_periapsis_estimate = Vector.mult_matrix4x4(0,0,0, 
    OrbitalMechanics.get_orbit_matrix4x4(
        0.0, Units.ASTRONOMICAL_UNIT, 0.0167, 0, 114.207*180/Math.PI, -11*180/Math.PI 
    )
);
test_value_is_to_within(
    Vector.magnitude(earth_periapsis_estimate.x, earth_periapsis_estimate.y, earth_periapsis_estimate.z),
    0.98*Units.ASTRONOMICAL_UNIT,
    0.01,
    'OrbitalMechanics.get_orbit_matrix4x4',
    "must predict the distance from the earth to the sun, at perihelion, to within 1%"
);
var earth_apoapsis_estimate = Vector.mult_matrix4x4(0,0,0, 
    OrbitalMechanics.get_orbit_matrix4x4(
        Math.PI, Units.ASTRONOMICAL_UNIT, 0.0167, 0, 114.207*180/Math.PI, -11*180/Math.PI 
    )
);
test_value_is_to_within(
    Vector.magnitude(earth_apoapsis_estimate.x, earth_apoapsis_estimate.y, earth_apoapsis_estimate.z),
    1.017*Units.ASTRONOMICAL_UNIT,
    0.01,
    'OrbitalMechanics.get_orbit_matrix4x4',
    "must predict the distance from the earth to the sun, at aphelion, to within 1%"
);
var earth_pos_estimate1 = Vector.mult_matrix4x4(0,0,0, 
    OrbitalMechanics.get_orbit_matrix4x4(
        1.5*Math.PI, 
        Units.ASTRONOMICAL_UNIT, 0.0167, 0, 114.207*180/Math.PI, -11*180/Math.PI 
    )
);
var earth_pos_estimate2 = Vector.mult_matrix4x4(0,0,0, 
    OrbitalMechanics.get_orbit_matrix4x4(
        1.5*Math.PI+2*Math.PI/Units.YEAR, 
        Units.ASTRONOMICAL_UNIT, 0.0167, 0, 114.207*180/Math.PI, -11*180/Math.PI 
    )
);
var earth_velocity_estimate = Vector.sub_vector(
    earth_pos_estimate2.x, earth_pos_estimate2.y, earth_pos_estimate2.z,
    earth_pos_estimate1.x, earth_pos_estimate1.y, earth_pos_estimate1.z, 
);
test_value_is_to_within(
    Vector.magnitude(earth_velocity_estimate.x, earth_velocity_estimate.y, earth_velocity_estimate.z),
    29.8*Units.KILOMETER/Units.SECOND,
    0.01,
    'OrbitalMechanics.get_orbit_matrix4x4',
    "must predict the earth's average velocity to within 1%"
);
// NOTE: we now repeat our previous calculation with simpler orbital elements to better understand what 
//  the acceptance criteria is for this test
var earth_pos_estimate3 = Vector.mult_matrix4x4(0,0,0, 
    OrbitalMechanics.get_orbit_matrix4x4(
        0.*Math.PI, 
        Units.ASTRONOMICAL_UNIT, 0, 0, 0, 0 
    )
);
var earth_pos_estimate4 = Vector.mult_matrix4x4(0,0,0, 
    OrbitalMechanics.get_orbit_matrix4x4(
        0.*Math.PI+2*Math.PI/Units.YEAR, 
        Units.ASTRONOMICAL_UNIT, 0, 0, 0, 0 
    )
);
var earth_velocity_estimate2 = Vector.sub_vector(
    earth_pos_estimate4.x, earth_pos_estimate4.y, earth_pos_estimate4.z,
    earth_pos_estimate3.x, earth_pos_estimate3.y, earth_pos_estimate3.z, 
);
test_value_is_below(
    earth_velocity_estimate2.z, 
    0, 
    'OrbitalMechanics.get_orbit_matrix4x4',
    "must predict the earth moves in the right direction"
)
var earth_spin_pos_estimate1 = Vector.mult_matrix4x4(Units.EARTH_RADIUS,0,0, 
    OrbitalMechanics.get_spin_matrix4x4(0, 0)
);
var earth_spin_pos_estimate2 = Vector.mult_matrix4x4(Units.EARTH_RADIUS,0,0, 
    OrbitalMechanics.get_spin_matrix4x4(2*Math.PI/Units.DAY, 0)
);
var earth_spin_velocity_estimate = Vector.sub_vector(
    earth_spin_pos_estimate2.x, earth_spin_pos_estimate2.y, earth_spin_pos_estimate2.z, 
    earth_spin_pos_estimate1.x, earth_spin_pos_estimate1.y, earth_spin_pos_estimate1.z,
);
test_value_is_to_within(
    Vector.magnitude(earth_spin_velocity_estimate.x, earth_spin_velocity_estimate.y, earth_spin_velocity_estimate.z),
    460*Units.METER/Units.SECOND, 
    0.01,
    'OrbitalMechanics.get_spin_matrix4x4',
    "must predict the earth spins the right way"
)
test_value_is_above(
    earth_spin_velocity_estimate.z, 
    0, 
    'OrbitalMechanics.get_spin_matrix4x4',
    "must predict the earth spins the right way"
)