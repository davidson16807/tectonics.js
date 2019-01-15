const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float plant_coverage;
attribute float ice_coverage;
attribute float insolation;
attribute float scalar;
attribute float vector_fraction_traversed;
attribute vec3 vector;

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vInsolation;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4 vPosition;

uniform float sealevel;
uniform float world_radius;
uniform float index;
uniform float animation_phase_angle;
