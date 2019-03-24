#define GL_ES
#include "precompiled/cross_platform_macros.glsl.c"
#include "precompiled/academics/math/constants.glsl.c"

// VIEW PROPERTIES -----------------------------------------------------------
uniform   mat4  projection_matrix_inverse;
uniform   mat4  view_matrix_inverse;
uniform   float reference_distance;

varying   vec3  view_direction_v;
varying   vec3  view_origin_v;
varying   vec4  position_v;

// WORLD PROPERTIES
uniform   float sealevel;
uniform   float world_radius;

attribute float displacement;
attribute vec3  gradient;
attribute float surface_temperature;
attribute float snow_coverage;
attribute float plant_coverage;
attribute float scalar;
attribute vec3  vector;

varying   float displacement_v;
varying   vec3  gradient_v;
varying   float surface_temperature_v;
varying   float snow_coverage_v;
varying   float plant_coverage_v;
varying   float scalar_v;

// MISCELLANEOUS PROPERTIES
uniform   float map_projection_offset;
uniform   float animation_phase_angle;
attribute float vector_fraction_traversed;
varying   float vector_fraction_traversed_v;
