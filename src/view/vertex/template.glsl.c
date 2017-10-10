const float PI = 3.14;
const float OCEAN = 0.0;
const float LAND = 0.01;
const float NONE = -0.01;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float scalar;
attribute vec3 vector;
varying float vDisplacement;
varying float vScalar;
varying vec4 vPosition;
uniform float sealevel;
uniform float index;
