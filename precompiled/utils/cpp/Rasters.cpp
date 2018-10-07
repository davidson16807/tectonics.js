
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity

#include "vec3_template.h"
#include "vec3s_template.h"

#include "VoronoiCubeSphereLookup3d.h"
#include "CartesianGridLookup3d.h"

#include <emscripten/bind.h>

using namespace emscripten;
using namespace Rasters;

EMSCRIPTEN_BINDINGS(rasters)
{
  register_vector<vec3>("vector_vec3");

  class_<vec3>("vec3")
      .constructor()
      .constructor<double>()
      .constructor<double, double, double>()
      .property("x", &vec3::x)
      .property("y", &vec3::y)
      .property("z", &vec3::z)
  ;
  class_<CartesianGridLookup3d>("CartesianGridLookup3d")
      .constructor<vec3, vec3, double>()
      .constructor<std::vector<vec3>, double>()
      .function("add", &CartesianGridLookup3d::add)
      .function("nearest_id", &CartesianGridLookup3d::nearest_id)
  ;
  class_<VoronoiCubeSphereLookup3d>("VoronoiCubeSphereLookup3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &VoronoiCubeSphereLookup3d::nearest_id)
  ;
}