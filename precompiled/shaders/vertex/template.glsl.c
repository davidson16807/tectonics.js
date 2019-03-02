const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;

attribute float displacement;
attribute vec3  gradient;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute vec3  vector;
attribute float vector_fraction_traversed;

varying float vDisplacement;
varying vec3  vGradient;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec3  vViewDirection;
varying vec3  vViewOrigin;
varying vec4  vPosition;

uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
