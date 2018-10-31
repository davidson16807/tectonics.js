
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity

#define GLM_FORCE_PURE      // disable SIMD support for glm so we can work with webassembly
#include <glm/vec2.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>     // vec3, bvec3, dvec3, ivec3 and uvec3
#include <glm/vec4.hpp>     // vec4, bvec4, dvec4, ivec4 and uvec4
#include <glm/matrix.hpp>     // vec4, bvec4, dvec4, ivec4 and uvec4
#include <composites/composites.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/glm/glm.hpp>     // vec*, bvec*, dvec*, ivec* and uvec*

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

  function("bools_unite_bool",        (void (*)(const bools& a, const bool b, bools& out))      unite     );
  function("bools_unite_bools",       (void (*)(const bools& a, const bools& b, bools& out))    unite     );
  function("bools_intersect_bool",    (void (*)(const bools& a, const bool b, bools& out))      intersect );
  function("bools_intersect_bools",   (void (*)(const bools& a, const bools& b, bools& out))    intersect );
  function("bools_differ_bool",       (void (*)(const bools& a, const bool b, bools& out))      differ    );
  function("bools_differ_bools",      (void (*)(const bools& a, const bools& b, bools& out))    differ    );
  function("bools_negate",           (void (*)(const bools& a, bools& out))                    negate    );

  function("bools_all",       (bool (*)(const primitives<bool>& a)) all  );
  function("bools_any",       (bool (*)(const primitives<bool>& a)) any  );
  function("bools_none",      (bool (*)(const primitives<bool>& a)) none );

  function("bools_get_id",      (bool (*)(const bools& a, const unsigned int id ))             get      );
  function("bools_get_ids",     (void (*)(const bools& a, const uints& ids, bools& out ))      get      );
  function("bools_get_mask",    (void (*)(const bools& a, const bools& mask, bools& out ))     get      );
  function("bools_fill",        (void (*)(bools& out, const bool  a ))                         fill     );
  function("bools_fill_ids",    (void (*)(bools& out, const uints& ids, const bool  a ))       fill     );
  function("bools_fill_mask",   (void (*)(bools& out, const bools& mask, const bool  a ))      fill     );
  function("bools_copy",        (void (*)(bools& out, const bools& a ))                        copy     );
  function("bools_copy_mask",   (void (*)(bools& out, const bools& mask, const bools& a ))     copy     );
  function("bools_copy_id",     (void (*)(bools& out, const unsigned int id, const bools& a )) copy     );
  function("bools_copy_ids",    (void (*)(bools& out, const uints& ids, const bools& a ))      copy     );
  function("bools_set_id",      (void (*)(bools& out, const unsigned int id, const bool  a ))  set      );
  function("bools_set_ids",     (void (*)(bools& out, const uints& ids, const bools& a ))      set      );

  function("bools_equal_bool",         (bool (*)(const bools& a, const bool  b))                equal    );
  function("bools_notEqual_bool",      (bool (*)(const bools& a, const bool  b))                notEqual );
  function("bools_equal_bools",        (bool (*)(const bools& a, const bools& b))               equal    );
  function("bools_notEqual_bools",     (bool (*)(const bools& a, const bools& b))               notEqual );
  function("bools_compEqual_bools",    (void (*)(const bools& a, const bool  b, bools& out))    equal    );
  function("bools_compNotEqual_bools", (void (*)(const bools& a, const bool  b, bools& out))    notEqual );
  function("bools_compEqual_bools",    (void (*)(const bools& a, const bools& b, bools& out))   equal    );
  function("bools_compNotEqual_bools", (void (*)(const bools& a, const bools& b, bools& out))   notEqual );

  function("bools_sum",              (bool  (*)(const bools& a))                               sum              );
  function("bools_mean",             (bool  (*)(const bools& a))                               mean             );
  // function("bools_median",        (bool  (*)(const bools& a))                               median           );
  // function("bools_mode",          (bool  (*)(const bools& a))                               mode             );
  function("bools_weighted_average", (bool  (*)(const bools& a, const bools& weights))         weighted_average );






  function("ints_add_ints",    (void (*)(const ints&, const ints&, ints&)) add  );
  function("ints_add_int",     (void (*)(const ints&, const int, ints&))   add  );
  function("ints_sub_ints",    (void (*)(const ints&, const ints&, ints&)) sub  );
  function("ints_sub_int",     (void (*)(const ints&, const int, ints&))   sub  );
  function("ints_mult_ints",   (void (*)(const ints&, const ints&, ints&)) mult );
  function("ints_mult_int",    (void (*)(const ints&, const int, ints&))   mult );
  function("ints_div_ints",    (void (*)(const ints&, const ints&, ints&)) div  );
  function("ints_div_int",     (void (*)(const ints&, const int, ints&))   div  );

  function("ints_get_id",      (int(*)(const ints& a, const unsigned int id ))              get      );
  function("ints_get_ids",     (void (*)(const ints& a, const uints& ids, ints& out ))      get      );
  function("ints_get_mask",    (void (*)(const ints& a, const bools& mask, ints& out ))     get      );
  function("ints_fill",        (void (*)(ints& out, const int a ))                          fill     );
  function("ints_fill_ids",    (void (*)(ints& out, const uints& ids, const int a ))        fill     );
  function("ints_fill_mask",   (void (*)(ints& out, const bools& mask, const int a ))       fill     );
  function("ints_copy",        (void (*)(ints& out, const ints& a ))                        copy     );
  function("ints_copy_mask",   (void (*)(ints& out, const bools& mask, const ints& a ))     copy     );
  function("ints_copy_id",     (void (*)(ints& out, const unsigned int id, const ints& a )) copy     );
  function("ints_copy_ids",    (void (*)(ints& out, const uints& ids, const ints& a ))      copy     );
  function("ints_set_id",      (void (*)(ints& out, const unsigned int id, const int a ))   set      );
  function("ints_set_ids",     (void (*)(ints& out, const uints& ids, const ints& a ))      set      );

  function("ints_equal_int",         (bool (*)(const ints& a, const int b))                 equal    );
  function("ints_notEqual_int",      (bool (*)(const ints& a, const int b))                 notEqual );
  function("ints_equal_ints",        (bool (*)(const ints& a, const ints& b))               equal    );
  function("ints_notEqual_ints",     (bool (*)(const ints& a, const ints& b))               notEqual );
  function("ints_compEqual_ints",    (void (*)(const ints& a, const int b, bools& out))     equal    );
  function("ints_compNotEqual_ints", (void (*)(const ints& a, const int b, bools& out))     notEqual );
  function("ints_compEqual_ints",    (void (*)(const ints& a, const ints& b, bools& out))   equal    );
  function("ints_compNotEqual_ints", (void (*)(const ints& a, const ints& b, bools& out))   notEqual );

  function("ints_greaterThan_int",         (void (*)(const ints& a, const int b, bools& out))      greaterThan      );
  function("ints_greaterThanEqual_int",    (void (*)(const ints& a, const int b, bools& out))      greaterThanEqual );
  function("ints_lessThan_int",            (void (*)(const ints& a, const int b, bools& out))      lessThan         );
  function("ints_lessThanEqual_int",       (void (*)(const ints& a, const int b, bools& out))      lessThanEqual    );
  function("ints_greaterThan_ints",      (void (*)(const ints& a, const ints& b, bools& out))      greaterThan      );
  function("ints_greaterThanEqual_ints", (void (*)(const ints& a, const ints& b, bools& out))      greaterThanEqual );
  function("ints_lessThan_ints",         (void (*)(const ints& a, const ints& b, bools& out))      lessThan         );
  function("ints_lessThanEqual_ints",    (void (*)(const ints& a, const ints& b, bools& out))      lessThanEqual    );

  function("ints_abs",    ( void (*)(const ints& a, ints& out)) abs                                                 );
  function("ints_sign",   ( void (*)(const ints& a, ints& out)) sign                                                );
  function("ints_floor",  ( void (*)(const ints& a, ints& out)) floor                                               );
  function("ints_trunc",  ( void (*)(const ints& a, ints& out)) trunc                                               );
  function("ints_round",  ( void (*)(const ints& a, ints& out)) round                                               );
  function("ints_ceil",   ( void (*)(const ints& a, ints& out)) ceil                                                );
  function("ints_fract",  ( void (*)(const ints& a, ints& out)) fract                                               );

  function("ints_mod",        ( void (*)(const ints& a, const ints& b, ints& out))       mod                        );
  function("ints_modf",       ( void (*)(const ints& a, ints& intout, ints& fractout))   modf                       );
  function("ints_min_ints",    ( void (*)(const ints& a, const ints& b, ints& out))      min                        );
  function("ints_max_ints",    ( void (*)(const ints& a, const ints& b, ints& out))      max                        );
  function("ints_min_int",       ( void (*)(const ints& a, const int b, ints& out))      min                        );
  function("ints_max_int",       ( void (*)(const ints& a, const int b, ints& out))      max                        );
  function("ints_min",    ( int(*)(const ints& a))                                 min                              );
  function("ints_max",    ( int(*)(const ints& a))                                 max                              );
  function("ints_clamp_m11",  ( void (*)(const ints& a, const int lo, const int hi, ints& out))         clamp       );
  function("ints_clamp_m1m",  ( void (*)(const ints& a, const int lo, const ints& hi, ints& out))       clamp       );
  function("ints_clamp_mm1",  ( void (*)(const ints& a, const ints& lo, const int hi, ints& out))       clamp       );
  function("ints_clamp_mmm",  ( void (*)(const ints& a, const ints& lo, const ints& hi, ints& out))     clamp       );
  function("ints_mix_mmm",    ( void (*)(const ints& x, const ints& y, const ints& a, ints& out))       mix         );
  function("ints_mix_mm1",    ( void (*)(const ints& x, const ints& y, const int a, ints& out))         mix         );
  function("ints_mix_m1m",    ( void (*)(const ints& x, const int y, const ints& a, ints& out))         mix         );
  function("ints_mix_m11",    ( void (*)(const ints& x, const int y, const int a, ints& out))           mix         );
  function("ints_mix_1mm",    ( void (*)(const int x, const ints& y, const ints& a, ints& out))         mix         );
  function("ints_mix_1m1",    ( void (*)(const int x, const ints& y, const int a, ints& out))           mix         );
  function("ints_mix_11m",    ( void (*)(const int x, const int y, const ints& a, ints& out))           mix         );
  function("ints_step_mm",       ( void (*)(const ints& edge, const ints& x, ints& out))                step        );
  function("ints_step_m1",       ( void (*)(const ints& edge, const int x, ints& out))                  step        );
  function("ints_step_1m",       ( void (*)(const int edge, const ints& x, ints& out))                  step        );
  function("ints_smoothstep_mmm",( void (*)(const ints& lo, const ints& hi, const ints& x, ints& out))  smoothstep  );
  function("ints_smoothstep_1mm",( void (*)(const int lo, const ints& hi, const ints& x, ints& out))    smoothstep  );
  function("ints_smoothstep_m1m",( void (*)(const ints& lo, int hi, const ints& x, ints& out))          smoothstep  );
  function("ints_smoothstep_11m",( void (*)(const int lo, const int hi, const ints& x, ints& out))      smoothstep  );
  function("ints_smoothstep_mm1",( void (*)(const ints& lo, const ints& hi, const int x, ints& out))    smoothstep  );
  function("ints_smoothstep_1m1",( void (*)(const int lo, const ints& hi, const int x, ints& out))      smoothstep  );
  function("ints_smoothstep_m11",( void (*)(const ints& lo, const int hi, const int x, ints& out))      smoothstep  );
  function("ints_isnan",  ( void (*)(const ints& x, bools& out))                                        isnan       );
  function("ints_isinf",  ( void (*)(const ints& x, bools& out))                                        isinf       );
  function("ints_fma_mmm",    ( void (*)(const ints& a, const ints& b, const ints& c, ints& out))       fma         );
  function("ints_fma_1mm",    ( void (*)(const int a, const ints& b, const ints& c, ints& out))         fma         );
  function("ints_fma_m1m",    ( void (*)(const ints& a, int b, const ints& c, ints& out))               fma         );
  function("ints_fma_11m",    ( void (*)(const int a, const int b, const ints& c, ints& out))           fma         );
  function("ints_fma_mm1",    ( void (*)(const ints& a, const ints& b, const int c, ints& out))         fma         );
  function("ints_fma_1m1",    ( void (*)(const int a, const ints& b, const int c, ints& out))           fma         );
  function("ints_fma_m11",    ( void (*)(const ints& a, const int b, const int c, ints& out))           fma         );

  function("ints_pow",         (void (*)(const ints& base, const ints& exponent, ints& out))   pow                  );
  function("ints_exp",         (void (*)(const ints& a, ints& out))                            exp                  );
  function("ints_log",         (void (*)(const ints& a, ints& out))                            log                  );
  function("ints_exp2",        (void (*)(const ints& a, ints& out))                            exp2                 );
  function("ints_log2",        (void (*)(const ints& a, ints& out))                            log2                 );
  function("ints_sqrt",        (void (*)(const ints& a, ints& out))                            sqrt                 );
  function("ints_inversesqrt", (void (*)(const ints& a, ints& out))                            inversesqrt          );

  function("ints_min_id",    (unsigned int (*)(const ints& a))                                 min_id               );
  function("ints_max_id",    (unsigned int (*)(const ints& a))                                 max_id               );
  function("ints_sum",       (int (*)(const ints& a))                                          sum                  );
  function("ints_mean",      (int (*)(const ints& a))                                          mean                 );
  // function("ints_median",    (int (*)(const ints& a))                                       median               );
  // function("ints_mode",      (int (*)(const ints& a))                                       mode                 );
  function("ints_standard_deviation", (int (*)(const ints& a))                                 standard_deviation   );
  function("ints_weighted_average", (int (*)(const ints& a, const ints& weights))              weighted_average     );
  function("ints_rescale",   (void (*)(const ints& a, ints& out, int min_new, int max_new))    rescale );

  function("ints_radians",   (void (*)(const ints& degrees, ints& out))              radians );
  function("ints_degrees",   (void (*)(const ints& radians, ints& out))              degrees );
  function("ints_sin",       (void (*)(const ints& radians, ints& out))                  sin );
  function("ints_cos",       (void (*)(const ints& radians, ints& out))                  cos );
  function("ints_tan",       (void (*)(const ints& radians, ints& out))                  tan );
  function("ints_asin",      (void (*)(const ints& x, ints& out))                       asin );
  function("ints_acos",      (void (*)(const ints& x, ints& out))                       acos );
  function("ints_atan",      (void (*)(const ints& y_over_x, ints& out))                atan );
  function("ints_atan",      (void (*)(const ints& x, const ints& y, ints& out))        atan );
  function("ints_sinh",      (void (*)(const ints& radians, ints& out))                 sinh );
  function("ints_cosh",      (void (*)(const ints& radians, ints& out))                 cosh );
  function("ints_tanh",      (void (*)(const ints& radians, ints& out))                 tanh );
  function("ints_asinh",     (void (*)(const ints& x, ints& out))                      asinh );
  function("ints_acosh",     (void (*)(const ints& x, ints& out))                      acosh );
  function("ints_atanh",     (void (*)(const ints& x, ints& out))                      atanh );










  function("uints_add_uints",    (void (*)(const uints&, const uints&, uints&)) add  );
  function("uints_add_uint",     (void (*)(const uints&, const uint, uints&))   add  );
  function("uints_sub_uints",    (void (*)(const uints&, const uints&, uints&)) sub  );
  function("uints_sub_uint",     (void (*)(const uints&, const uint, uints&))   sub  );
  function("uints_mult_uints",   (void (*)(const uints&, const uints&, uints&)) mult );
  function("uints_mult_uint",    (void (*)(const uints&, const uint, uints&))   mult );
  function("uints_div_uints",    (void (*)(const uints&, const uints&, uints&)) div  );
  function("uints_div_uint",     (void (*)(const uints&, const uint, uints&))   div  );

  function("uints_get_id",      (uint(*)(const uints& a, const unsigned int id ))              get      );
  function("uints_get_ids",     (void (*)(const uints& a, const uints& ids, uints& out ))      get      );
  function("uints_get_mask",    (void (*)(const uints& a, const bools& mask, uints& out ))     get      );
  function("uints_fill",        (void (*)(uints& out, const uint a ))                          fill     );
  function("uints_fill_ids",    (void (*)(uints& out, const uints& ids, const uint a ))        fill     );
  function("uints_fill_mask",   (void (*)(uints& out, const bools& mask, const uint a ))       fill     );
  function("uints_copy",        (void (*)(uints& out, const uints& a ))                        copy     );
  function("uints_copy_mask",   (void (*)(uints& out, const bools& mask, const uints& a ))     copy     );
  function("uints_copy_id",     (void (*)(uints& out, const unsigned int id, const uints& a )) copy     );
  function("uints_copy_ids",    (void (*)(uints& out, const uints& ids, const uints& a ))      copy     );
  function("uints_set_id",      (void (*)(uints& out, const unsigned int id, const uint a ))   set      );
  function("uints_set_ids",     (void (*)(uints& out, const uints& ids, const uints& a ))      set      );

  function("uints_equal_uint",         (bool (*)(const uints& a, const uint b))                 equal    );
  function("uints_notEqual_uint",      (bool (*)(const uints& a, const uint b))                 notEqual );
  function("uints_equal_uints",        (bool (*)(const uints& a, const uints& b))               equal    );
  function("uints_notEqual_uints",     (bool (*)(const uints& a, const uints& b))               notEqual );
  function("uints_compEqual_uints",    (void (*)(const uints& a, const uint b, bools& out))     equal    );
  function("uints_compNotEqual_uints", (void (*)(const uints& a, const uint b, bools& out))     notEqual );
  function("uints_compEqual_uints",    (void (*)(const uints& a, const uints& b, bools& out))   equal    );
  function("uints_compNotEqual_uints", (void (*)(const uints& a, const uints& b, bools& out))   notEqual );

  function("uints_greaterThan_uint",         (void (*)(const uints& a, const uint b, bools& out))    greaterThan      );
  function("uints_greaterThanEqual_uint",    (void (*)(const uints& a, const uint b, bools& out))    greaterThanEqual );
  function("uints_lessThan_uint",            (void (*)(const uints& a, const uint b, bools& out))    lessThan         );
  function("uints_lessThanEqual_uint",       (void (*)(const uints& a, const uint b, bools& out))    lessThanEqual    );
  function("uints_greaterThan_uints",      (void (*)(const uints& a, const uints& b, bools& out))    greaterThan      );
  function("uints_greaterThanEqual_uints", (void (*)(const uints& a, const uints& b, bools& out))    greaterThanEqual );
  function("uints_lessThan_uints",         (void (*)(const uints& a, const uints& b, bools& out))    lessThan         );
  function("uints_lessThanEqual_uints",    (void (*)(const uints& a, const uints& b, bools& out))    lessThanEqual    );

  function("uints_abs",    ( void (*)(const uints& a, uints& out))     abs     );
  function("uints_sign",   ( void (*)(const uints& a, uints& out))     sign    );
  function("uints_floor",  ( void (*)(const uints& a, uints& out))     floor   );
  function("uints_trunc",  ( void (*)(const uints& a, uints& out))     trunc   );
  function("uints_round",  ( void (*)(const uints& a, uints& out))     round   );
  function("uints_ceil",   ( void (*)(const uints& a, uints& out))     ceil    );
  function("uints_fract",  ( void (*)(const uints& a, uints& out))     fract   );

  function("uints_mod",        ( void (*)(const uints& a, const uints& b, uints& out))                       mod         );
  function("uints_modf",       ( void (*)(const uints& a, ints& intout, uints& fractout))                    modf        );
  function("uints_min_uints",    ( void (*)(const uints& a, const uints& b, uints& out))                      min         );
  function("uints_max_uints",    ( void (*)(const uints& a, const uints& b, uints& out))                      max         );
  function("uints_min_uint",       ( void (*)(const uints& a, const uint b, uints& out))                      min         );
  function("uints_max_uint",       ( void (*)(const uints& a, const uint b, uints& out))                      max         );
  function("uints_min",    ( uint(*)(const uints& a))                                                        min         );
  function("uints_max",    ( uint(*)(const uints& a))                                                        max         );
  function("uints_clamp_m11",  ( void (*)(const uints& a, const uint lo, const uint hi, uints& out))         clamp       );
  function("uints_clamp_m1m",  ( void (*)(const uints& a, const uint lo, const uints& hi, uints& out))       clamp       );
  function("uints_clamp_mm1",  ( void (*)(const uints& a, const uints& lo, const uint hi, uints& out))       clamp       );
  function("uints_clamp_mmm",  ( void (*)(const uints& a, const uints& lo, const uints& hi, uints& out))     clamp       );
  function("uints_mix_mmm",    ( void (*)(const uints& x, const uints& y, const uints& a, uints& out))       mix         );
  function("uints_mix_mm1",    ( void (*)(const uints& x, const uints& y, const uint a, uints& out))         mix         );
  function("uints_mix_m1m",    ( void (*)(const uints& x, const uint y, const uints& a, uints& out))         mix         );
  function("uints_mix_m11",    ( void (*)(const uints& x, const uint y, const uint a, uints& out))           mix         );
  function("uints_mix_1mm",    ( void (*)(const uint x, const uints& y, const uints& a, uints& out))         mix         );
  function("uints_mix_1m1",    ( void (*)(const uint x, const uints& y, const uint a, uints& out))           mix         );
  function("uints_mix_11m",    ( void (*)(const uint x, const uint y, const uints& a, uints& out))           mix         );
  function("uints_step_mm",       ( void (*)(const uints& edge, const uints& x, uints& out))                 step        );
  function("uints_step_m1",       ( void (*)(const uints& edge, const uint x, uints& out))                   step        );
  function("uints_step_1m",       ( void (*)(const uint edge, const uints& x, uints& out))                   step        );
  function("uints_smoothstep_mmm",( void (*)(const uints& lo, const uints& hi, const uints& x, uints& out))  smoothstep  );
  function("uints_smoothstep_1mm",( void (*)(const uint lo, const uints& hi, const uints& x, uints& out))    smoothstep  );
  function("uints_smoothstep_m1m",( void (*)(const uints& lo, uint hi, const uints& x, uints& out))          smoothstep  );
  function("uints_smoothstep_11m",( void (*)(const uint lo, const uint hi, const uints& x, uints& out))      smoothstep  );
  function("uints_smoothstep_mm1",( void (*)(const uints& lo, const uints& hi, const uint x, uints& out))    smoothstep  );
  function("uints_smoothstep_1m1",( void (*)(const uint lo, const uints& hi, const uint x, uints& out))      smoothstep  );
  function("uints_smoothstep_m11",( void (*)(const uints& lo, const uint hi, const uint x, uints& out))      smoothstep  );
  function("uints_isnan",  ( void (*)(const uints& x, bools& out))                                           isnan       );
  function("uints_isinf",  ( void (*)(const uints& x, bools& out))                                           isinf       );
  function("uints_fma_mmm",    ( void (*)(const uints& a, const uints& b, const uints& c, uints& out))       fma         );
  function("uints_fma_1mm",    ( void (*)(const uint a, const uints& b, const uints& c, uints& out))         fma         );
  function("uints_fma_m1m",    ( void (*)(const uints& a, uint b, const uints& c, uints& out))               fma         );
  function("uints_fma_11m",    ( void (*)(const uint a, const uint b, const uints& c, uints& out))           fma         );
  function("uints_fma_mm1",    ( void (*)(const uints& a, const uints& b, const uint c, uints& out))         fma         );
  function("uints_fma_1m1",    ( void (*)(const uint a, const uints& b, const uint c, uints& out))           fma         );
  function("uints_fma_m11",    ( void (*)(const uints& a, const uint b, const uint c, uints& out))           fma         );

  function("uints_pow",         (void (*)(const uints& base, const uints& exponent, uints& out))  pow                  );
  function("uints_exp",         (void (*)(const uints& a, uints& out))                            exp                  );
  function("uints_log",         (void (*)(const uints& a, uints& out))                            log                  );
  function("uints_exp2",        (void (*)(const uints& a, uints& out))                            exp2                 );
  function("uints_log2",        (void (*)(const uints& a, uints& out))                            log2                 );
  function("uints_sqrt",        (void (*)(const uints& a, uints& out))                            sqrt                 );
  function("uints_inversesqrt", (void (*)(const uints& a, uints& out))                            inversesqrt          );

  function("uints_min_id",    (unsigned int (*)(const uints& a))                                  min_id               );
  function("uints_max_id",    (unsigned int (*)(const uints& a))                                  max_id               );
  function("uints_sum",       (uint (*)(const uints& a))                                          sum                  );
  function("uints_mean",      (uint (*)(const uints& a))                                          mean                 );
  // function("uints_median",    (uint (*)(const uints& a))                                       median               );
  // function("uints_mode",      (uint (*)(const uints& a))                                       mode                 );
  function("uints_standard_deviation", (uint (*)(const uints& a))                                 standard_deviation   );
  function("uints_weighted_average", (uint (*)(const uints& a, const uints& weights))             weighted_average     );
  function("uints_rescale",   (void (*)(const uints& a, uints& out, uint min_new, uint max_new))  rescale              );

  function("uints_radians",   (void (*)(const uints& degrees, uints& out))            radians  );
  function("uints_degrees",   (void (*)(const uints& radians, uints& out))            degrees  );
  function("uints_sin",       (void (*)(const uints& radians, uints& out))            sin      );
  function("uints_cos",       (void (*)(const uints& radians, uints& out))            cos      );
  function("uints_tan",       (void (*)(const uints& radians, uints& out))            tan      );
  function("uints_asin",      (void (*)(const uints& x, uints& out))                  asin     );
  function("uints_acos",      (void (*)(const uints& x, uints& out))                  acos     );
  function("uints_atan",      (void (*)(const uints& y_over_x, uints& out))           atan     );
  function("uints_atan",      (void (*)(const uints& x, const uints& y, uints& out))  atan     );
  function("uints_sinh",      (void (*)(const uints& radians, uints& out))            sinh     );
  function("uints_cosh",      (void (*)(const uints& radians, uints& out))            cosh     );
  function("uints_tanh",      (void (*)(const uints& radians, uints& out))            tanh     );
  function("uints_asinh",     (void (*)(const uints& x, uints& out))                  asinh    );
  function("uints_acosh",     (void (*)(const uints& x, uints& out))                  acosh    );
  function("uints_atanh",     (void (*)(const uints& x, uints& out))                  atanh    );







  function("floats_add_floats",    (void (*)(const floats&, const floats&, floats&))     add  );
  function("floats_add_float",     (void (*)(const floats&, const float, floats&))       add  );
  function("floats_sub_floats",    (void (*)(const floats&, const floats&, floats&))     sub  );
  function("floats_sub_float",     (void (*)(const floats&, const float, floats&))       sub  );
  function("floats_mult_floats",   (void (*)(const floats&, const floats&, floats&))     mult );
  function("floats_mult_float",    (void (*)(const floats&, const float, floats&))       mult );
  function("floats_div_floats",    (void (*)(const floats&, const floats&, floats&))     div  );
  function("floats_div_float",     (void (*)(const floats&, const float, floats&))       div  );

  function("floats_get_id",      (float(*)(const floats& a, const unsigned int id ))              get      );
  function("floats_get_ids",     (void (*)(const floats& a, const uints& ids, floats& out ))      get      );
  function("floats_get_mask",    (void (*)(const floats& a, const bools& mask, floats& out ))     get      );
  function("floats_fill",        (void (*)(floats& out, const float a ))                          fill     );
  function("floats_fill_ids",    (void (*)(floats& out, const uints& ids, const float a ))        fill     );
  function("floats_fill_mask",   (void (*)(floats& out, const bools& mask, const float a ))       fill     );
  function("floats_copy",        (void (*)(floats& out, const floats& a ))                        copy     );
  function("floats_copy_mask",   (void (*)(floats& out, const bools& mask, const floats& a ))     copy     );
  function("floats_copy_id",     (void (*)(floats& out, const unsigned int id, const floats& a )) copy     );
  function("floats_copy_ids",    (void (*)(floats& out, const uints& ids, const floats& a ))      copy     );
  function("floats_set_id",      (void (*)(floats& out, const unsigned int id, const float a ))   set      );
  function("floats_set_ids",     (void (*)(floats& out, const uints& ids, const floats& a ))      set      );

  function("floats_equal_float",         (bool (*)(const floats& a, const float b))                 equal    );
  function("floats_notEqual_float",      (bool (*)(const floats& a, const float b))                 notEqual );
  function("floats_equal_floats",        (bool (*)(const floats& a, const floats& b))               equal    );
  function("floats_notEqual_floats",     (bool (*)(const floats& a, const floats& b))               notEqual );
  function("floats_compEqual_floats",    (void (*)(const floats& a, const float b, bools& out))     equal    );
  function("floats_compNotEqual_floats", (void (*)(const floats& a, const float b, bools& out))     notEqual );
  function("floats_compEqual_floats",    (void (*)(const floats& a, const floats& b, bools& out))   equal    );
  function("floats_compNotEqual_floats", (void (*)(const floats& a, const floats& b, bools& out))   notEqual );

  function("floats_greaterThan_float",         (void (*)(const floats& a, const float b, bools& out))  greaterThan      );
  function("floats_greaterThanEqual_float",    (void (*)(const floats& a, const float b, bools& out))  greaterThanEqual );
  function("floats_lessThan_float",            (void (*)(const floats& a, const float b, bools& out))  lessThan         );
  function("floats_lessThanEqual_float",       (void (*)(const floats& a, const float b, bools& out))  lessThanEqual    );
  function("floats_greaterThan_floats",      (void (*)(const floats& a, const floats& b, bools& out))  greaterThan      );
  function("floats_greaterThanEqual_floats", (void (*)(const floats& a, const floats& b, bools& out))  greaterThanEqual );
  function("floats_lessThan_floats",         (void (*)(const floats& a, const floats& b, bools& out))  lessThan         );
  function("floats_lessThanEqual_floats",    (void (*)(const floats& a, const floats& b, bools& out))  lessThanEqual    );

  function("floats_abs",    ( void (*)(const floats& a, floats& out))                                             abs     );
  function("floats_sign",   ( void (*)(const floats& a, floats& out))                                             sign    );
  function("floats_floor",  ( void (*)(const floats& a, floats& out))                                             floor   );
  function("floats_trunc",  ( void (*)(const floats& a, floats& out))                                             trunc   );
  function("floats_round",  ( void (*)(const floats& a, floats& out))                                             round   );
  function("floats_ceil",   ( void (*)(const floats& a, floats& out))                                             ceil    );
  function("floats_fract",  ( void (*)(const floats& a, floats& out))                                             fract   );

  function("floats_mod",        ( void (*)(const floats& a, const floats& b, floats& out))                        mod     );
  function("floats_modf",       ( void (*)(const floats& a, ints& intout, floats& fractout))                      modf    );
  function("floats_min_floats",   ( void (*)(const floats& a, const floats& b, floats& out))                        min     );
  function("floats_max_floats",   ( void (*)(const floats& a, const floats& b, floats& out))                        max     );
  function("floats_min_float",    ( void (*)(const floats& a, const float b, floats& out))                          min     );
  function("floats_max_float",    ( void (*)(const floats& a, const float b, floats& out))                          max     );
  function("floats_min",    ( float(*)(const floats& a))                                                          min     );
  function("floats_max",    ( float(*)(const floats& a))                                                          max     );
  function("floats_clamp_m11",  ( void (*)(const floats& a, const float lo, const float hi, floats& out))         clamp       );
  function("floats_clamp_m1m",  ( void (*)(const floats& a, const float lo, const floats& hi, floats& out))       clamp       );
  function("floats_clamp_mm1",  ( void (*)(const floats& a, const floats& lo, const float hi, floats& out))       clamp       );
  function("floats_clamp_mmm",  ( void (*)(const floats& a, const floats& lo, const floats& hi, floats& out))     clamp       );
  function("floats_mix_mmm",    ( void (*)(const floats& x, const floats& y, const floats& a, floats& out))       mix         );
  function("floats_mix_mm1",    ( void (*)(const floats& x, const floats& y, const float a, floats& out))         mix         );
  function("floats_mix_m1m",    ( void (*)(const floats& x, const float y, const floats& a, floats& out))         mix         );
  function("floats_mix_m11",    ( void (*)(const floats& x, const float y, const float a, floats& out))           mix         );
  function("floats_mix_1mm",    ( void (*)(const float x, const floats& y, const floats& a, floats& out))         mix         );
  function("floats_mix_1m1",    ( void (*)(const float x, const floats& y, const float a, floats& out))           mix         );
  function("floats_mix_11m",    ( void (*)(const float x, const float y, const floats& a, floats& out))           mix         );
  function("floats_step_mm",       ( void (*)(const floats& edge, const floats& x, floats& out))                  step        );
  function("floats_step_m1",       ( void (*)(const floats& edge, const float x, floats& out))                    step        );
  function("floats_step_1m",       ( void (*)(const float edge, const floats& x, floats& out))                    step        );
  function("floats_smoothstep_mmm",( void (*)(const floats& lo, const floats& hi, const floats& x, floats& out))  smoothstep  );
  function("floats_smoothstep_1mm",( void (*)(const float lo, const floats& hi, const floats& x, floats& out))    smoothstep  );
  function("floats_smoothstep_m1m",( void (*)(const floats& lo, float hi, const floats& x, floats& out))          smoothstep  );
  function("floats_smoothstep_11m",( void (*)(const float lo, const float hi, const floats& x, floats& out))      smoothstep  );
  function("floats_smoothstep_mm1",( void (*)(const floats& lo, const floats& hi, const float x, floats& out))    smoothstep  );
  function("floats_smoothstep_1m1",( void (*)(const float lo, const floats& hi, const float x, floats& out))      smoothstep  );
  function("floats_smoothstep_m11",( void (*)(const floats& lo, const float hi, const float x, floats& out))      smoothstep  );
  function("floats_isnan",  ( void (*)(const floats& x, bools& out))                                              isnan       );
  function("floats_isinf",  ( void (*)(const floats& x, bools& out))                                              isinf       );
  function("floats_fma_mmm",    ( void (*)(const floats& a, const floats& b, const floats& c, floats& out))       fma         );
  function("floats_fma_1mm",    ( void (*)(const float a, const floats& b, const floats& c, floats& out))         fma         );
  function("floats_fma_m1m",    ( void (*)(const floats& a, float b, const floats& c, floats& out))               fma         );
  function("floats_fma_11m",    ( void (*)(const float a, const float b, const floats& c, floats& out))           fma         );
  function("floats_fma_mm1",    ( void (*)(const floats& a, const floats& b, const float c, floats& out))         fma         );
  function("floats_fma_1m1",    ( void (*)(const float a, const floats& b, const float c, floats& out))           fma         );
  function("floats_fma_m11",    ( void (*)(const floats& a, const float b, const float c, floats& out))           fma         );

  function("floats_pow",         (void (*)(const floats& base, const floats& exponent, floats& out))     pow                  );
  function("floats_exp",         (void (*)(const floats& a, floats& out))                                exp                  );
  function("floats_log",         (void (*)(const floats& a, floats& out))                                log                  );
  function("floats_exp2",        (void (*)(const floats& a, floats& out))                                exp2                 );
  function("floats_log2",        (void (*)(const floats& a, floats& out))                                log2                 );
  function("floats_sqrt",        (void (*)(const floats& a, floats& out))                                sqrt                 );
  function("floats_inversesqrt", (void (*)(const floats& a, floats& out))                                inversesqrt          );

  function("floats_min_id",    (unsigned int (*)(const floats& a))                                       min_id               );
  function("floats_max_id",    (unsigned int (*)(const floats& a))                                       max_id               );
  function("floats_sum",       (float (*)(const floats& a))                                              sum                  );
  function("floats_mean",      (float (*)(const floats& a))                                              mean                 );
  // function("floats_median",    (float (*)(const floats& a))                                           median               );
  // function("floats_mode",      (float (*)(const floats& a))                                           mode                 );
  function("floats_standard_deviation", (float (*)(const floats& a))                                     standard_deviation   );
  function("floats_weighted_average", (float (*)(const floats& a, const floats& weights))                weighted_average     );
  function("floats_rescale",   (void (*)(const floats& a, floats& out, float min_new, float max_new))    rescale              );

  function("floats_radians",   (void (*)(const floats& degrees, floats& out))             radians  );
  function("floats_degrees",   (void (*)(const floats& radians, floats& out))             degrees  );
  function("floats_sin",       (void (*)(const floats& radians, floats& out))             sin      );
  function("floats_cos",       (void (*)(const floats& radians, floats& out))             cos      );
  function("floats_tan",       (void (*)(const floats& radians, floats& out))             tan      );
  function("floats_asin",      (void (*)(const floats& x, floats& out))                   asin     );
  function("floats_acos",      (void (*)(const floats& x, floats& out))                   acos     );
  function("floats_atan",      (void (*)(const floats& y_over_x, floats& out))            atan     );
  function("floats_atan",      (void (*)(const floats& x, const floats& y, floats& out))  atan     );
  function("floats_sinh",      (void (*)(const floats& radians, floats& out))             sinh     );
  function("floats_cosh",      (void (*)(const floats& radians, floats& out))             cosh     );
  function("floats_tanh",      (void (*)(const floats& radians, floats& out))             tanh     );
  function("floats_asinh",     (void (*)(const floats& x, floats& out))                   asinh    );
  function("floats_acosh",     (void (*)(const floats& x, floats& out))                   acosh    );
  function("floats_atanh",     (void (*)(const floats& x, floats& out))                   atanh    );


















  function("vec3s_add_vec3s",  (void (*)(const vec3s&, const vec3s&, vec3s&))  add  );
  function("vec3s_add_floats", (void (*)(const vec3s&, const floats&, vec3s&)) add  );
  function("vec3s_add_vec3",   (void (*)(const vec3s&, const vec3, vec3s&))    add  );
  function("vec3s_add_float",  (void (*)(const vec3s&, const float, vec3s&))   add  );
  function("vec3s_sub_vec3s",  (void (*)(const vec3s&, const vec3s&, vec3s&))  sub  );
  function("vec3s_sub_floats", (void (*)(const vec3s&, const floats&, vec3s&)) sub  );
  function("vec3s_sub_vec3",   (void (*)(const vec3s&, const vec3, vec3s&))    sub  );
  function("vec3s_sub_float",  (void (*)(const vec3s&, const float, vec3s&))   sub  );
  function("vec3s_mult_vec3s", (void (*)(const vec3s&, const vec3s&, vec3s&))  mult );
  function("vec3s_mult_floats",(void (*)(const vec3s&, const floats&, vec3s&)) mult );
  function("vec3s_mult_vec3",  (void (*)(const vec3s&, const vec3, vec3s&))    mult );
  function("vec3s_mult_float", (void (*)(const vec3s&, const float, vec3s&))   mult );
  function("vec3s_div_vec3s",  (void (*)(const vec3s&, const vec3s&, vec3s&))  div  );
  function("vec3s_div_floats", (void (*)(const vec3s&, const floats&, vec3s&)) div  );
  function("vec3s_div_vec3",   (void (*)(const vec3s&, const vec3, vec3s&))    div  );
  function("vec3s_div_float",  (void (*)(const vec3s&, const float, vec3s&))   div  );

  function("vec3s_mult_mat3",   (void (*)(const vec3s&, const mat3&, vec3s&))    mult );
  function("vec3s_mult_mat4x3", (void (*)(const vec3s&, const mat4x3&, vec3s&))    mult );

  function("vec3s_get_id",      (vec3 (*)(const vec3s& a, const unsigned int id ))             get      );
  function("vec3s_get_ids",     (void (*)(const vec3s& a, const uints& ids, vec3s& out ))      get      );
  function("vec3s_get_mask",    (void (*)(const vec3s& a, const bools& mask, vec3s& out ))     get      );
  function("vec3s_fill",        (void (*)(vec3s& out, const vec3 a ))                          fill     );
  function("vec3s_fill_ids",    (void (*)(vec3s& out, const uints& ids, const vec3 a ))        fill     );
  function("vec3s_fill_mask",   (void (*)(vec3s& out, const bools& mask, const vec3 a ))       fill     );
  function("vec3s_copy",        (void (*)(vec3s& out, const vec3s& a ))                        copy     );
  function("vec3s_copy_mask",   (void (*)(vec3s& out, const bools& mask, const vec3s& a ))     copy     );
  function("vec3s_copy_id",     (void (*)(vec3s& out, const unsigned int id, const vec3s& a )) copy     );
  function("vec3s_copy_ids",    (void (*)(vec3s& out, const uints& ids, const vec3s& a ))      copy     );
  function("vec3s_set_id",      (void (*)(vec3s& out, const unsigned int id, const vec3 a ))   set      );
  function("vec3s_set_ids",     (void (*)(vec3s& out, const uints& ids, const vec3s& a ))      set      );

  function("vec3s_equal_vec3",        (bool (*)(const vec3s& a, const vec3 b))                 equal    );
  function("vec3s_notEqual_vec3",     (bool (*)(const vec3s& a, const vec3 b))                 notEqual );
  function("vec3s_equal_vec3s",       (bool (*)(const vec3s& a, const vec3s& b))               equal    );
  function("vec3s_notEqual_vec3s",    (bool (*)(const vec3s& a, const vec3s& b))               notEqual );
  function("vec3s_compEqual_vec3",    (void (*)(const vec3s& a, const vec3 b, bools& out))     equal    );
  function("vec3s_compNotEqual_vec3", (void (*)(const vec3s& a, const vec3 b, bools& out))     notEqual );
  function("vec3s_compEqual_vec3s",   (void (*)(const vec3s& a, const vec3s& b, bools& out))   equal    );
  function("vec3s_compNotEqual_vec3s",(void (*)(const vec3s& a, const vec3s& b, bools& out))   notEqual );

  // function("vec3s_greaterThan_float",      (void (*)(const vec3s& a, const float b, bvec3s& out))       greaterThan      );
  // function("vec3s_greaterThanEqual_float", (void (*)(const vec3s& a, const float b, bvec3s& out))       greaterThanEqual );
  // function("vec3s_lessThan_float",         (void (*)(const vec3s& a, const float b, bvec3s& out))       lessThan         );
  // function("vec3s_lessThanEqual_float",    (void (*)(const vec3s& a, const float b, bvec3s& out))       lessThanEqual    );
  // function("vec3s_greaterThan_floats",     (void (*)(const vec3s& a, const floats& b, bvec3s& out))     greaterThan      );
  // function("vec3s_greaterThanEqual_floats",(void (*)(const vec3s& a, const floats& b, bvec3s& out))     greaterThanEqual );
  // function("vec3s_lessThan_floats",        (void (*)(const vec3s& a, const floats& b, bvec3s& out))     lessThan         );
  // function("vec3s_lessThanEqual_floats",   (void (*)(const vec3s& a, const floats& b, bvec3s& out))     lessThanEqual    );

  function("vec3s_greaterThan_vec3",      (void (*)(const vec3s& a, const vec3 b, bvec3s& out))      greaterThan      );
  function("vec3s_greaterThanEqual_vec3", (void (*)(const vec3s& a, const vec3 b, bvec3s& out))      greaterThanEqual );
  function("vec3s_lessThan_vec3",         (void (*)(const vec3s& a, const vec3 b, bvec3s& out))      lessThan         );
  function("vec3s_lessThanEqual_vec3",    (void (*)(const vec3s& a, const vec3 b, bvec3s& out))      lessThanEqual    );
  function("vec3s_greaterThan_vec3s",     (void (*)(const vec3s& a, const vec3s& b, bvec3s& out))    greaterThan      );
  function("vec3s_greaterThanEqual_vec3s",(void (*)(const vec3s& a, const vec3s& b, bvec3s& out))    greaterThanEqual );
  function("vec3s_lessThan_vec3s",        (void (*)(const vec3s& a, const vec3s& b, bvec3s& out))    lessThan         );
  function("vec3s_lessThanEqual_vec3s",   (void (*)(const vec3s& a, const vec3s& b, bvec3s& out))    lessThanEqual    );

  function("vec3s_abs",    ( void (*)(const vec3s& a, vec3s& out))    abs                                               );
  function("vec3s_sign",   ( void (*)(const vec3s& a, vec3s& out))    sign                                              );
  function("vec3s_floor",  ( void (*)(const vec3s& a, vec3s& out))    floor                                             );
  function("vec3s_trunc",  ( void (*)(const vec3s& a, vec3s& out))    trunc                                             );
  function("vec3s_round",  ( void (*)(const vec3s& a, vec3s& out))    round                                             );
  function("vec3s_ceil",   ( void (*)(const vec3s& a, vec3s& out))    ceil                                              );
  function("vec3s_fract",  ( void (*)(const vec3s& a, vec3s& out))    fract                                             );

  // function("vec3s_mod",    ( void (*)(const vec3s& a, const vec3s& b, vec3s& out))     mod                          );
  // function("vec3s_modf",   ( void (*)(const vec3s& a, ints& intout, vec3s& fractout))  modf                         );
  function("vec3s_min_vec3s",    ( void (*)(const vec3s& a, const vec3s& b, vec3s& out))   min                       );
  function("vec3s_max_vec3s",    ( void (*)(const vec3s& a, const vec3s& b, vec3s& out))   max                       );

  function("vec3s_min_vec3",    ( void (*)(const vec3s& a, const vec3 b, vec3s& out))     min                        );
  function("vec3s_max_vec3",    ( void (*)(const vec3s& a, const vec3 b, vec3s& out))     max                        );

  function("vec3s_min",    ( vec3(*)(const vec3s& a))                                       min                        );
  function("vec3s_max",    ( vec3(*)(const vec3s& a))                                       max                        );

  function("vec3s_clamp_11",  ( void (*)(const vec3s& a, const vec3 lo, const vec3 hi, vec3s& out))          clamp     );
  function("vec3s_clamp_1m",  ( void (*)(const vec3s& a, const vec3 lo, const vec3s& hi, vec3s& out))        clamp     );
  function("vec3s_clamp_m1",  ( void (*)(const vec3s& a, const vec3s& lo, const vec3 hi, vec3s& out))        clamp     );
  function("vec3s_clamp_mm",  ( void (*)(const vec3s& a, const vec3s& lo, const vec3s& hi, vec3s& out))      clamp     );

  function("vec3s_mix_float_mmm",  ( void (*)(const vec3s& x, const vec3s& y, const floats& a, vec3s& out)) mix       );
  function("vec3s_mix_float_mm1",  ( void (*)(const vec3s& x, const vec3s& y, const float a, vec3s& out))   mix       );
  function("vec3s_mix_float_m1m",  ( void (*)(const vec3s& x, const vec3 y, const floats& a, vec3s& out))   mix       );
  function("vec3s_mix_float_m11",  ( void (*)(const vec3s& x, const vec3 y, const float a, vec3s& out))     mix       );
  function("vec3s_mix_float_1mm",  ( void (*)(const vec3 x, const vec3s& y, const floats& a, vec3s& out))   mix       );
  function("vec3s_mix_float_1m1",  ( void (*)(const vec3 x, const vec3s& y, const float a, vec3s& out))     mix       );
  function("vec3s_mix_float_11m",  ( void (*)(const vec3 x, const vec3 y, const floats& a, vec3s& out))     mix       );

  function("vec3s_mix_vec3_mmm",    ( void (*)(const vec3s& x, const vec3s& y, const vec3s& a, vec3s& out))     mix         );
  function("vec3s_mix_vec3_mm1",    ( void (*)(const vec3s& x, const vec3s& y, const vec3 a, vec3s& out))       mix         );
  function("vec3s_mix_vec3_m1m",    ( void (*)(const vec3s& x, const vec3 y, const vec3s& a, vec3s& out))       mix         );
  function("vec3s_mix_vec3_m11",    ( void (*)(const vec3s& x, const vec3 y, const vec3 a, vec3s& out))         mix         );
  function("vec3s_mix_vec3_1mm",    ( void (*)(const vec3 x, const vec3s& y, const vec3s& a, vec3s& out))       mix         );
  function("vec3s_mix_vec3_1m1",    ( void (*)(const vec3 x, const vec3s& y, const vec3 a, vec3s& out))         mix         );
  function("vec3s_mix_vec3_11m",    ( void (*)(const vec3 x, const vec3 y, const vec3s& a, vec3s& out))         mix         );

  function("vec3s_step_mm",   ( void (*)(const vec3s& edge, const vec3s& x, vec3s& out))                       step        );
  function("vec3s_step_m1",   ( void (*)(const vec3s& edge, const vec3 x, vec3s& out))                         step        );
  function("vec3s_step_1m",   ( void (*)(const vec3 edge, const vec3s& x, vec3s& out))                         step        );

  function("vec3s_smoothstep_mmm",  ( void (*)(const vec3s& lo, const vec3s& hi, const vec3s& x, vec3s& out))  smoothstep  );
  function("vec3s_smoothstep_1mm",  ( void (*)(const vec3 lo, const vec3s& hi, const vec3s& x, vec3s& out))    smoothstep  );
  function("vec3s_smoothstep_m1m",  ( void (*)(const vec3s& lo, vec3 hi, const vec3s& x, vec3s& out))          smoothstep  );
  function("vec3s_smoothstep_11m",  ( void (*)(const vec3 lo, const vec3 hi, const vec3s& x, vec3s& out))      smoothstep  );
  function("vec3s_smoothstep_mm1",  ( void (*)(const vec3s& lo, const vec3s& hi, const vec3 x, vec3s& out))    smoothstep  );
  function("vec3s_smoothstep_1m1",  ( void (*)(const vec3 lo, const vec3s& hi, const vec3 x, vec3s& out))      smoothstep  );
  function("vec3s_smoothstep_m11",  ( void (*)(const vec3s& lo, const vec3 hi, const vec3 x, vec3s& out))      smoothstep  );
  // function("vec3s_isnan",  ( void (*)(const vec3s& x, bools& out))                                          isnan       );
  // function("vec3s_isinf",  ( void (*)(const vec3s& x, bools& out))                                          isinf       );
  function("vec3s_fma_mmm",    ( void (*)(const vec3s& a, const vec3s& b, const vec3s& c, vec3s& out))         fma         );
  function("vec3s_fma_1mm",    ( void (*)(const vec3 a, const vec3s& b, const vec3s& c, vec3s& out))           fma         );
  function("vec3s_fma_m1m",    ( void (*)(const vec3s& a, vec3 b, const vec3s& c, vec3s& out))                 fma         );
  function("vec3s_fma_11m",    ( void (*)(const vec3 a, const vec3 b, const vec3s& c, vec3s& out))             fma         );
  function("vec3s_fma_mm1",    ( void (*)(const vec3s& a, const vec3s& b, const vec3 c, vec3s& out))           fma         );
  function("vec3s_fma_1m1",    ( void (*)(const vec3 a, const vec3s& b, const vec3 c, vec3s& out))             fma         );
  function("vec3s_fma_m11",    ( void (*)(const vec3s& a, const vec3 b, const vec3 c, vec3s& out))             fma         );

  // function("vec3s_pow",         (void (*)(const vec3s& base, const vec3s& exponent, vec3s& out)) pow                  );
  // function("vec3s_exp",         (void (*)(const vec3s& a, vec3s& out))                           exp                  );
  // function("vec3s_log",         (void (*)(const vec3s& a, vec3s& out))                           log                  );
  // function("vec3s_exp2",        (void (*)(const vec3s& a, vec3s& out))                           exp2                 );
  // function("vec3s_log2",        (void (*)(const vec3s& a, vec3s& out))                           log2                 );
  // function("vec3s_sqrt",        (void (*)(const vec3s& a, vec3s& out))                           sqrt                 );
  // function("vec3s_inversesqrt", (void (*)(const vec3s& a, vec3s& out))                           inversesqrt          );

  // function("vec3s_min_id",    (unsigned int (*)(const vec3s& a))                                 min_id               );
  // function("vec3s_max_id",    (unsigned int (*)(const vec3s& a))                                 max_id               );
  function("vec3s_sum",       (vec3 (*)(const vec3s& a))                                            sum                  );
  function("vec3s_mean",      (vec3 (*)(const vec3s& a))                                            mean                 );
  // function("vec3s_median",    (vec3 (*)(const vec3s& a))                                         median               );
  // function("vec3s_mode",      (vec3 (*)(const vec3s& a))                                         mode                 );
  function("vec3s_weighted_average", (vec3 (*)(const vec3s& a, const floats& weights))              weighted_average     );
  function("vec3s_rescale",   (void (*)(const vec3s& a, vec3s& out, vec3 min_new, vec3 max_new))    rescale              );

  function("vec3s_dot_vec3",        (void (*)(const vec3s& u, const vec3 v, floats& out))   dot       );
  function("vec3s_cross_vec3",      (void (*)(const vec3s& u, const vec3 v, vec3s& out))    cross     );
  function("vec3s_mult_vec3",       (void (*)(const vec3s& u, const vec3 v, vec3s& out))    mult      );
  function("vec3s_distance_vec3",   (void (*)(const vec3s& u, const vec3 v, floats& out))   distance  );
  function("vec3s_dot_vec3s",       (void (*)(const vec3s& u, const vec3s& v, floats& out)) dot       );
  function("vec3s_cross_vec3s",     (void (*)(const vec3s& u, const vec3s& v, vec3s& out))  cross     );
  function("vec3s_mult_vec3s",      (void (*)(const vec3s& u, const vec3s& v, vec3s& out))  mult      );
  function("vec3s_distance_vec3s",  (void (*)(const vec3s& u, const vec3s& v, floats& out)) distance  );

  function("vec3s_length",     (void (*)(const vec3s& u, floats& out))  length      );
  function("vec3s_normalize",  (void (*)(const vec3s& u, vec3s& out))   normalize   );
























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
