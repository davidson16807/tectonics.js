
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity

#include <glm/vec2.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec2.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/glm/vecs.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/glm/glm.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/composites.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2

#include "rasters/SphereGridVoronoi3d.hpp"
#include "rasters/CartesianGridCellList3d.hpp"

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