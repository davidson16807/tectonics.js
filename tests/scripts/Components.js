/* eslint-env qunit */
QUnit.module('Rasters');

// "Components.js" tests behavior of components and systems 
//  within the model layer's "Entity-Component-System" ("ECS") architecture. 
// See blog/ramblings/rearchitecture-roadmap.md for documentation 
//  surrounding the thought process that went into the design of these unit tests.

var sun_body_component = new Body({ mass: Units.SOLAR_MASS });
var sun_star_component = Star.get_steady_state(sun_body_component);
var default_star_component = new Star({});
var scratch_star_component = new Star({});

test_unary_inverse(
	star   => star.getParameters(),
	'star.getParameters',
	params => new Star(params),
	'new Star',
	{ 
		sun:     sun_star_component,
		default: default_star_component
	},
);

// get_steady_state should allow an output parameter to be passed to it
// if provided, this output parameter will be returned as output
test_unary_output_reference(
	Star.get_steady_state,
	'Star.get_steady_state',
	{ 
		sun: sun_body_component,
		out: scratch_star_component,
	},
);

// get_steady_state should be idempotent
test_unary_output_idempotence(
	Star.get_steady_state,
	'Star.get_steady_state',
	{ sun: sun_body_component },
);

// get_steady_state should remain idempotent, 
// even when used for in-place operations.
// This is meant to guard against problems that arise due to the sequencing 
//   of operations within the function. 
test_unary_output_idempotence(
	body => Star.get_steady_state(body, sun_star_component),
	'Star.get_steady_state',
	{ sun: sun_body_component },
);
