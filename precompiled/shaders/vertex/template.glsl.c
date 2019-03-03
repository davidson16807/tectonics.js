const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;

attribute float displacement;
attribute vec3  gradient;
attribute float surface_temperature;
attribute float ice_coverage;
attribute float plant_coverage;
attribute float scalar;
attribute vec3  vector;
attribute float vector_fraction_traversed;

varying float displacement_v;
varying vec3  gradient_v;
varying float surface_temperature_v;
varying float ice_coverage_v;
varying float plant_coverage_v;
varying float scalar_v;
varying float vector_fraction_traversed_v;
varying vec3  view_direction_v;
varying vec3  view_origin_v;
varying vec4  position_v;

uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
