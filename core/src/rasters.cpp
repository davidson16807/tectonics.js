
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity

#define GLM_FORCE_PURE      // disable SIMD support for glm so we can work with webassembly
#include <glm/vec2.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>     // vec3, bvec3, dvec3, ivec3 and uvec3
#include <glm/vec4.hpp>     // vec4, bvec4, dvec4, ivec4 and uvec4
#include <composites/composites.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/glm/vecs.hpp>     // vec*, bvec*, dvec*, ivec* and uvec*

#include "rasters/SphereGridVoronoi3d.hpp"
#include "rasters/CartesianGridCellList3d.hpp"

#include <emscripten/bind.h>

using namespace emscripten;
using namespace composites;
using namespace rasters;

template<typename T1, typename T2, typename T3>
void lerp(const primitives<T1>& a, const primitives<T2>& b, primitives<T3>& out) {
   // return (1 - t) * a + t * b;
}
// template<typename T1, typename T2, typename T3>
// void lerp(const primitives<T1>& a, const T2& b, primitives<T3>& out) {
//    // return (1 - t) * a + t * b;
// }
EMSCRIPTEN_BINDINGS(rasters)
{

  class_<vec2>("vec2")
      .constructor()
      .constructor<float>()
      .constructor<float, float>()
      .property("x", &vec2::x)
      .property("y", &vec2::y)
  ;

  class_<vec3>("vec3")
      .constructor()
      .constructor<float>()
      .constructor<float, float, float>()
      .constructor<vec2, float>()
      .constructor<float, vec2>()
      .property("x", &vec3::x)
      .property("y", &vec3::y)
      .property("z", &vec3::z)
  ;

  class_<vec4>("vec4")
      .constructor()
      .constructor<float>()
      .constructor<float, float, float, float>()
      .constructor<vec3, float>()
      .constructor<float, vec3>()
      .constructor<vec2, vec2>()
      .property("x", &vec4::x)
      .property("y", &vec4::y)
      .property("z", &vec4::z)
      .property("w", &vec4::z)
  ;

  class_<floats>("floats")
      .constructor<unsigned int>()
  ;

  class_<vec3>("vec3s")
      .constructor<unsigned int>()
  ;

  function("lerp", &lerp<float, float, float>);
  // function("mult", select_overload<void(floats, float, floats)>(&mult<float, float, float>));

  register_vector<vec3>("vector_vec3");

  class_<CartesianGridCellList3d>("CartesianGridCellList3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &CartesianGridCellList3d::nearest_id)
  ;

  class_<SphereGridVoronoi3d>("SphereGridVoronoi3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &SphereGridVoronoi3d::nearest_id)
  ;
}
