/* eslint-env qunit */
QUnit.module('Rasters');

// "Components.js" tests behavior of components and systems 
//  within the model layer's "Entity-Component-System" ("ECS") architecture. 
// See blog/ramblings/rearchitecture-roadmap.md for documentation 
//  surrounding the thought process that went into the design of these unit tests.

var betelgeuse_body_json = { name: 'Betelgeuse', age:    8*Units.MEGAYEAR };
var sun_body_json        = { name: 'Sol',        age: 4500*Units.MEGAYEAR };

var betelgeuse_body_component = new Body(betelgeuse_body_json );
var sun_body_component        = new Body(sun_body_json        );

var betelgeuse_star_json = { 
	mass_H:  0.70 * 11.6 * Units.SOLAR_MASS, 
	mass_He: 0.28 * 11.6 * Units.SOLAR_MASS 
};
var sun_star_json        = { 
	mass_H:  0.75 *        Units.SOLAR_MASS, 
	mass_He: 0.25 *        Units.SOLAR_MASS 
};

var betelgeuse_star_component = new Star(betelgeuse_star_json);
var sun_star_component        = new Star(sun_star_json       );
var default_star_component    = new Star({});
var scratch_star_component    = new Star({});

test_unary_inverse(
	star   => star.getParameters(),
	'star.getParameters',
	params => new Star(params),
	'new Star',
	{ 
		sun:        sun_star_component,
		betelgeuse: betelgeuse_star_component,
		default:    default_star_component,
	},
);
test_unary_inverse(
	params => new Star(params),
	'new Star',
	star   => star.getParameters(),
	'star.getParameters',
	{ 
		sun:        sun_star_json,
		betelgeuse: betelgeuse_star_json,
	},
);

test_value_is_to_within(
    sun_star_component.total_mass(),
    Units.SOLAR_MASS,
    0.01,
    'star.total_mass()',
    "must predict mass of the Sun to within 1%"
);
test_value_is_to_within(
    sun_star_component.radius(),
    Units.SOLAR_RADIUS,
    0.01,
    'star.radius()',
    "must predict radius of the Sun to within 1%"
);
test_value_is_to_within(
    sun_star_component.luminosity(),
    Units.SOLAR_LUMINOSITY,
    0.01,
    'star.luminosity()',
    "must predict luminosity of the Sun to within 1%"
);
test_value_is_to_within(
    sun_star_component.surface_temperature(),
    Units.SOLAR_TEMPERATURE,
    0.01,
    'star.surface_temperature()',
    "must predict temperature of the Sun to within 1%"
);

var earth_body_json      = { name: 'Earth',      age: 4500*Units.MEGAYEAR };
var jupiter_body_json    = { name: 'Jupiter',    age: 4500*Units.MEGAYEAR };

var earth_body_component      = new Body(earth_body_json      );
var jupiter_body_component    = new Body(jupiter_body_json    );

var earth_world_json = { 
	mass_FeNi: 2.3e24,
	mass_SiX : 3.6e24,
	mass_H2O : 1.4e21,
	mass_HHe : 0,
};
var jupiter_world_json = { 
	mass_FeNi: 0,
	mass_SiX : 0,
	mass_H2O : 0.05 * Units.JUPITER_MASS,
	mass_HHe : 0.95 * Units.JUPITER_MASS,
};

var earth_world_component   = new World({ 
	mass_FeNi: 2.29e24,
	mass_SiX : 3.66e24,
	mass_H2O : 1.4e21,
	mass_HHe : 0,
});
var jupiter_world_component   = new World({ 
	mass_FeNi: 0,
	mass_SiX : 0,
	mass_H2O : 0.05 * Units.JUPITER_MASS,
	mass_HHe : 0.95 * Units.JUPITER_MASS,
});
var default_world_component = new World({});
var scratch_world_component = new World({});

test_unary_inverse(
	world   => world.getParameters(),
	'world.getParameters',
	params => new World(params),
	'new World',
	{ 
		earth:   earth_world_component,
		jupiter: jupiter_world_component,
		default: default_world_component,
	},
);
test_unary_inverse(
	params => new World(params),
	'new World',
	world   => world.getParameters(),
	'world.getParameters',
	{ 
		earth:   earth_world_json,
		jupiter: jupiter_world_json,
	},
);

test_value_is_to_within(
    earth_world_component.total_mass(),
    Units.EARTH_MASS,
    0.01,
    'world.total_mass()',
    "must predict mass of the Earth to within 1%"
);
test_value_is_to_within(
    earth_world_component.radius(),
    Units.EARTH_RADIUS,
    0.01,
    'world.radius()',
    "must predict radius of the Earth to within 1%"
);
test_value_is_to_within(
    earth_world_component.surface_gravity(),
    Units.STANDARD_GRAVITY,
    0.01,
    'world.surface_gravity()',
    "must predict surface gravity of the Earth to within 1%"
);

test_value_is_to_within(
    jupiter_world_component.total_mass(),
    Units.JUPITER_MASS,
    0.01,
    'world.total_mass()',
    "must predict mass of Jupiter to within 1%"
);
test_value_is_to_within(
    jupiter_world_component.radius(),
    Units.JUPITER_RADIUS,
    0.01,
    'world.radius()',
    "must predict radius of Jupiter to within 1%"
);
// // get_steady_state should allow an output parameter to be passed to it
// // if provided, this output parameter will be returned as output
// test_unary_output_reference(
// 	Star.get_steady_state,
// 	'Star.get_steady_state',
// 	{ 
// 		sun: sun_body_component,
// 		out: scratch_star_component,
// 	},
// );

// // get_steady_state should be idempotent
// test_unary_output_idempotence(
// 	Star.get_steady_state,
// 	'Star.get_steady_state',
// 	{ sun: sun_body_component },
// );

// // get_steady_state should remain idempotent, 
// // even when used for in-place operations.
// // This is meant to guard against problems that arise due to the sequencing 
// //   of operations within the function. 
// test_unary_output_idempotence(
// 	body => Star.get_steady_state(body, sun_star_component),
// 	'Star.get_steady_state',
// 	{ sun: sun_body_component },
// );
