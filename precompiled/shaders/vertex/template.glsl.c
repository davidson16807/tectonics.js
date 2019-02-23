const float PI = 3.14159265358979;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float ice_coverage;
attribute float surface_temp;
attribute float plant_coverage;
attribute float scalar;
attribute float vector_fraction_traversed;
attribute vec3 vector;

varying float vDisplacement;
varying float vIceCoverage;
varying float vSurfaceTemp;
varying float vPlantCoverage;
varying float vScalar;
varying float vVectorFractionTraversed;
varying vec4  vPosition;
varying vec3  vClipspace;
varying vec4  vNormal;

uniform float sealevel;
// radius of the world to be rendered
uniform float world_radius;
// radius of a reference world, generally the focus of the scene
uniform float reference_distance;
uniform float index;
uniform float animation_phase_angle;
