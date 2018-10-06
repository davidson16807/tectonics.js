
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity

#include "vec3_template.h"
// #include "vec3s_template.h"

#include "VoronoiCubeSphereLookup3d.h"
#include "CartesianGridLookup3d.h"

#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(rasters)
{
  class_<Rasters::vec3>("vec3")
      .constructor()
      .constructor<double, double, double>()
      .property("x", &Rasters::vec3::x)
      .property("y", &Rasters::vec3::y)
      .property("z", &Rasters::vec3::z)
  ;
  class_<Rasters::CartesianGridLookup3d>("CartesianGridLookup3d")
      .constructor()
      .constructor<std::vector<Rasters::vec3>, double>()
      .function("nearest_id", &Rasters::CartesianGridLookup3d::nearest_id)
  ;
  class_<Rasters::VoronoiCubeSphereLookup3d>("VoronoiCubeSphereLookup3d")
      .constructor()
      .constructor<std::vector<Rasters::vec3>, double>()
      .function("nearest_id", &Rasters::VoronoiCubeSphereLookup3d::nearest_id)
  ;
}
