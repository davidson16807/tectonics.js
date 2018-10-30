
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

  function("f32_add_many",    (void (*)(const floats&, const floats&, floats&)) add  );
  function("f32_add_single",  (void (*)(const floats&, const float, floats&))   add  );
  function("f32_sub_many",    (void (*)(const floats&, const floats&, floats&)) sub  );
  function("f32_sub_single",  (void (*)(const floats&, const float, floats&))   sub  );
  function("f32_mult_many",   (void (*)(const floats&, const floats&, floats&)) mult );
  function("f32_mult_single", (void (*)(const floats&, const float, floats&))   mult );
  function("f32_div_many",    (void (*)(const floats&, const floats&, floats&)) div  );
  function("f32_div_single",  (void (*)(const floats&, const float, floats&))   div  );

  function("f32_get_id",      (float(*)(const floats& a, const unsigned int id ))              get      );
  function("f32_get_ids",     (void (*)(const floats& a, const uints& ids, floats& out ))      get      );
  function("f32_get_mask",    (void (*)(const floats& a, const bools& mask, floats& out ))     get      );
  function("f32_fill",        (void (*)(floats& out, const float a ))                          fill     );
  function("f32_fill_ids",    (void (*)(floats& out, const uints& ids, const float a ))        fill     );
  function("f32_fill_mask",   (void (*)(floats& out, const bools& mask, const float a ))       fill     );
  function("f32_copy",        (void (*)(floats& out, const floats& a ))                        copy     );
  function("f32_copy_mask",   (void (*)(floats& out, const bools& mask, const floats& a ))     copy     );
  function("f32_copy_id",     (void (*)(floats& out, const unsigned int id, const floats& a )) copy     );
  function("f32_copy_ids",    (void (*)(floats& out, const uints& ids, const floats& a ))      copy     );
  function("f32_set_id",      (void (*)(floats& out, const unsigned int id, const float a ))   set      );
  function("f32_set_ids",     (void (*)(floats& out, const uints& ids, const floats& a ))      set      );

  function("f32_equal_single",      (bool (*)(const floats& a, const float b))                 equal    );
  function("f32_notEqual_single",   (bool (*)(const floats& a, const float b))                 notEqual );
  function("f32_equal_many",        (bool (*)(const floats& a, const floats& b))               equal    );
  function("f32_notEqual_many",     (bool (*)(const floats& a, const floats& b))               notEqual );
  function("f32_compEqual_many",    (void (*)(const floats& a, const float b, bools& out))     equal    );
  function("f32_compNotEqual_many", (void (*)(const floats& a, const float b, bools& out))     notEqual );
  function("f32_compEqual_many",    (void (*)(const floats& a, const floats& b, bools& out))   equal    );
  function("f32_compNotEqual_many", (void (*)(const floats& a, const floats& b, bools& out))   notEqual );

  function("f32_greaterThan",      (void (*)(const floats& a, const float b, bools& out))      greaterThan      );
  function("f32_greaterThanEqual", (void (*)(const floats& a, const float b, bools& out))      greaterThanEqual );
  function("f32_lessThan",         (void (*)(const floats& a, const float b, bools& out))      lessThan         );
  function("f32_lessThanEqual",    (void (*)(const floats& a, const float b, bools& out))      lessThanEqual    );
  function("f32_greaterThan",      (void (*)(const floats& a, const floats& b, bools& out))    greaterThan      );
  function("f32_greaterThanEqual", (void (*)(const floats& a, const floats& b, bools& out))    greaterThanEqual );
  function("f32_lessThan",         (void (*)(const floats& a, const floats& b, bools& out))    lessThan         );
  function("f32_lessThanEqual",    (void (*)(const floats& a, const floats& b, bools& out))    lessThanEqual    );

  function("f32_abs",    ( void (*)(const floats& a, floats& out)) abs);
  function("f32_sign",   ( void (*)(const floats& a, floats& out)) sign);
  function("f32_floor",  ( void (*)(const floats& a, floats& out)) floor);
  function("f32_trunc",  ( void (*)(const floats& a, floats& out)) trunc);
  function("f32_round",  ( void (*)(const floats& a, floats& out)) round);
  function("f32_ceil",   ( void (*)(const floats& a, floats& out)) ceil);
  function("f32_fract",  ( void (*)(const floats& a, floats& out)) fract);

  function("f32_mod",    ( void (*)(const floats& a, const floats& b, floats& out))   mod);
  function("f32_modf",   ( void (*)(const floats& a, ints& intout, floats& fractout)) modf);
  function("f32_min",    ( void (*)(const floats& a, const floats& b, floats& out))   min);
  function("f32_max",    ( void (*)(const floats& a, const floats& b, floats& out))   max);
  function("f32_min",    ( void (*)(const floats& a, const float b, floats& out))     min);
  function("f32_max",    ( void (*)(const floats& a, const float b, floats& out))     max);
  function("f32_min",    ( float(*)(const floats& a))                                 min);
  function("f32_max",    ( float(*)(const floats& a))                                 max);
  function("f32_clamp",  ( void (*)(const floats& a, const float lo, const float hi, floats& out))         clamp);
  function("f32_clamp",  ( void (*)(const floats& a, const float lo, const floats& hi, floats& out))       clamp);
  function("f32_clamp",  ( void (*)(const floats& a, const floats& lo, const float hi, floats& out))       clamp);
  function("f32_clamp",  ( void (*)(const floats& a, const floats& lo, const floats& hi, floats& out))     clamp);
  function("f32_mix",    ( void (*)(const floats& x, const floats& y, const floats& a, floats& out))       mix);
  function("f32_mix",    ( void (*)(const floats& x, const floats& y, const float a, floats& out))         mix);
  function("f32_mix",    ( void (*)(const floats& x, const float y, const floats& a, floats& out))         mix);
  function("f32_mix",    ( void (*)(const floats& x, const float y, const float a, floats& out))           mix);
  function("f32_mix",    ( void (*)(const float x, const floats& y, const floats& a, floats& out))         mix);
  function("f32_mix",    ( void (*)(const float x, const floats& y, const float a, floats& out))           mix);
  function("f32_mix",    ( void (*)(const float x, const float y, const floats& a, floats& out))           mix);
  function("f32_step",   ( void (*)(const floats& edge, const floats& x, floats& out))                     step);
  function("f32_step",   ( void (*)(const floats& edge, const float x, floats& out))                       step);
  function("f32_step",   ( void (*)(const float edge, const floats& x, floats& out))                       step);
  function("f32_smoothstep",( void (*)(const floats& lo, const floats& hi, const floats& x, floats& out))  smoothstep);
  function("f32_smoothstep",( void (*)(const float lo, const floats& hi, const floats& x, floats& out))    smoothstep);
  function("f32_smoothstep",( void (*)(const floats& lo, float hi, const floats& x, floats& out))          smoothstep);
  function("f32_smoothstep",( void (*)(const float lo, const float hi, const floats& x, floats& out))      smoothstep);
  function("f32_smoothstep",( void (*)(const floats& lo, const floats& hi, const float x, floats& out))    smoothstep);
  function("f32_smoothstep",( void (*)(const float lo, const floats& hi, const float x, floats& out))      smoothstep);
  function("f32_smoothstep",( void (*)(const floats& lo, const float hi, const float x, floats& out))      smoothstep);
  function("f32_isnan",  ( void (*)(const floats& x, bools& out))                                          isnan);
  function("f32_isinf",  ( void (*)(const floats& x, bools& out))                                          isinf);
  function("f32_fma",    ( void (*)(const floats& a, const floats& b, const floats& c, floats& out))       fma);
  function("f32_fma",    ( void (*)(const float a, const floats& b, const floats& c, floats& out))         fma);
  function("f32_fma",    ( void (*)(const floats& a, float b, const floats& c, floats& out))               fma);
  function("f32_fma",    ( void (*)(const float a, const float b, const floats& c, floats& out))           fma);
  function("f32_fma",    ( void (*)(const floats& a, const floats& b, const float c, floats& out))         fma);
  function("f32_fma",    ( void (*)(const float a, const floats& b, const float c, floats& out))           fma);
  function("f32_fma",    ( void (*)(const floats& a, const float b, const float c, floats& out))           fma);





  // function("mult", 
    // (void (*)(const composites::primitives<float>&, const composites::primitives<float>&, composites::primitives<float>&)) 
    // mult<float, float, float>);

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
