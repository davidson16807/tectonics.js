
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity

#include "vec3_template.h"
#include "vec3s_template.h"

#include "SphereGridVoronoi3d.h"
#include "CartesianGridCellList3d.h"

#include <emscripten/bind.h>

using namespace emscripten;
using namespace rasters;

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
      .function("magnitude", &vec3::magnitude)
      .function("normalize", &vec3::normalize)
  ;
  class_<CartesianGridCellList3d>("CartesianGridCellList3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &CartesianGridCellList3d::nearest_id)
  ;
  class_<SphereGridVoronoi3d>("SphereGridVoronoi3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &SphereGridVoronoi3d::nearest_id)
  ;
}