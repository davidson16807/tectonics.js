
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

  function("bit_unite",     (void (*)(const bools& a, const bool b, bools& out))        unite );
  function("bit_unite",     (void (*)(const bools& a, const bools& b, bools& out))      unite );
  function("bit_intersect", (void (*)(const bools& a, const bool b, bools& out))    intersect );
  function("bit_intersect", (void (*)(const bools& a, const bools& b, bools& out))  intersect );
  function("bit_differ",    (void (*)(const bools& a, const bool b, bools& out))       differ );
  function("bit_differ",    (void (*)(const bools& a, const bools& b, bools& out))     differ );
  function("bit_negate",    (void (*)(const bools& a, bools& out))                     negate );

  function("bit_all",       (bool (*)(const primitives<bool>& a)) all  );
  function("bit_any",       (bool (*)(const primitives<bool>& a)) any  );
  function("bit_none",      (bool (*)(const primitives<bool>& a)) none );

  function("bit_get_id",      (bool (*)(const bools& a, const unsigned int id ))             get      );
  function("bit_get_ids",     (void (*)(const bools& a, const uints& ids, bools& out ))      get      );
  function("bit_get_mask",    (void (*)(const bools& a, const bools& mask, bools& out ))     get      );
  function("bit_fill",        (void (*)(bools& out, const bool  a ))                         fill     );
  function("bit_fill_ids",    (void (*)(bools& out, const uints& ids, const bool  a ))       fill     );
  function("bit_fill_mask",   (void (*)(bools& out, const bools& mask, const bool  a ))      fill     );
  function("bit_copy",        (void (*)(bools& out, const bools& a ))                        copy     );
  function("bit_copy_mask",   (void (*)(bools& out, const bools& mask, const bools& a ))     copy     );
  function("bit_copy_id",     (void (*)(bools& out, const unsigned int id, const bools& a )) copy     );
  function("bit_copy_ids",    (void (*)(bools& out, const uints& ids, const bools& a ))      copy     );
  function("bit_set_id",      (void (*)(bools& out, const unsigned int id, const bool  a ))   set      );
  function("bit_set_ids",     (void (*)(bools& out, const uints& ids, const bools& a ))      set      );

  function("bit_equal_single",      (bool (*)(const bools& a, const bool  b))                equal    );
  function("bit_notEqual_single",   (bool (*)(const bools& a, const bool  b))                notEqual );
  function("bit_equal_many",        (bool (*)(const bools& a, const bools& b))               equal    );
  function("bit_notEqual_many",     (bool (*)(const bools& a, const bools& b))               notEqual );
  function("bit_compEqual_many",    (void (*)(const bools& a, const bool  b, bools& out))    equal    );
  function("bit_compNotEqual_many", (void (*)(const bools& a, const bool  b, bools& out))    notEqual );
  function("bit_compEqual_many",    (void (*)(const bools& a, const bools& b, bools& out))   equal    );
  function("bit_compNotEqual_many", (void (*)(const bools& a, const bools& b, bools& out))   notEqual );

  function("bit_sum",       (bool  (*)(const bools& a))                                      sum );
  function("bit_mean",      (bool  (*)(const bools& a))                                      mean );
  // function("bit_median",    (bool  (*)(const bools& a))                                   median );
  // function("bit_mode",      (bool  (*)(const bools& a))                                   mode );
  function("bit_weighted_average", (bool  (*)(const bools& a, const bools& weights))   weighted_average );





  function("i32_add_many",    (void (*)(const ints&, const ints&, ints&)) add  );
  function("i32_add_single",  (void (*)(const ints&, const int, ints&))   add  );
  function("i32_sub_many",    (void (*)(const ints&, const ints&, ints&)) sub  );
  function("i32_sub_single",  (void (*)(const ints&, const int, ints&))   sub  );
  function("i32_mult_many",   (void (*)(const ints&, const ints&, ints&)) mult );
  function("i32_mult_single", (void (*)(const ints&, const int, ints&))   mult );
  function("i32_div_many",    (void (*)(const ints&, const ints&, ints&)) div  );
  function("i32_div_single",  (void (*)(const ints&, const int, ints&))   div  );

  function("i32_get_id",      (int(*)(const ints& a, const unsigned int id ))            get      );
  function("i32_get_ids",     (void (*)(const ints& a, const uints& ids, ints& out ))    get      );
  function("i32_get_mask",    (void (*)(const ints& a, const bools& mask, ints& out ))   get      );
  function("i32_fill",        (void (*)(ints& out, const int a ))                        fill     );
  function("i32_fill_ids",    (void (*)(ints& out, const uints& ids, const int a ))      fill     );
  function("i32_fill_mask",   (void (*)(ints& out, const bools& mask, const int a ))     fill     );
  function("i32_copy",        (void (*)(ints& out, const ints& a ))                      copy     );
  function("i32_copy_mask",   (void (*)(ints& out, const bools& mask, const ints& a ))   copy     );
  function("i32_copy_id",     (void (*)(ints& out, const unsigned int id, const ints& a )) copy     );
  function("i32_copy_ids",    (void (*)(ints& out, const uints& ids, const ints& a ))    copy     );
  function("i32_set_id",      (void (*)(ints& out, const unsigned int id, const int a )) set      );
  function("i32_set_ids",     (void (*)(ints& out, const uints& ids, const ints& a ))    set      );

  function("i32_equal_single",      (bool (*)(const ints& a, const int b))               equal    );
  function("i32_notEqual_single",   (bool (*)(const ints& a, const int b))               notEqual );
  function("i32_equal_many",        (bool (*)(const ints& a, const ints& b))             equal    );
  function("i32_notEqual_many",     (bool (*)(const ints& a, const ints& b))             notEqual );
  function("i32_compEqual_many",    (void (*)(const ints& a, const int b, bools& out))   equal    );
  function("i32_compNotEqual_many", (void (*)(const ints& a, const int b, bools& out))   notEqual );
  function("i32_compEqual_many",    (void (*)(const ints& a, const ints& b, bools& out)) equal    );
  function("i32_compNotEqual_many", (void (*)(const ints& a, const ints& b, bools& out)) notEqual );

  function("i32_greaterThan",      (void (*)(const ints& a, const int b, bools& out))    greaterThan      );
  function("i32_greaterThanEqual", (void (*)(const ints& a, const int b, bools& out))    greaterThanEqual );
  function("i32_lessThan",         (void (*)(const ints& a, const int b, bools& out))    lessThan         );
  function("i32_lessThanEqual",    (void (*)(const ints& a, const int b, bools& out))    lessThanEqual    );
  function("i32_greaterThan",      (void (*)(const ints& a, const ints& b, bools& out))  greaterThan      );
  function("i32_greaterThanEqual", (void (*)(const ints& a, const ints& b, bools& out))  greaterThanEqual );
  function("i32_lessThan",         (void (*)(const ints& a, const ints& b, bools& out))  lessThan         );
  function("i32_lessThanEqual",    (void (*)(const ints& a, const ints& b, bools& out))  lessThanEqual    );

  // function("i32_abs",    ( void (*)(const ints& a, ints& out)) abs   );
  function("i32_sign",   ( void (*)(const ints& a, ints& out)) sign  );
  function("i32_floor",  ( void (*)(const ints& a, ints& out)) floor );
  function("i32_trunc",  ( void (*)(const ints& a, ints& out)) trunc );
  function("i32_round",  ( void (*)(const ints& a, ints& out)) round );
  function("i32_ceil",   ( void (*)(const ints& a, ints& out)) ceil  );
  function("i32_fract",  ( void (*)(const ints& a, ints& out)) fract );

  function("i32_mod",    ( void (*)(const ints& a, const ints& b, ints& out))   mod       );
  function("i32_modf",   ( void (*)(const ints& a, ints& intout, ints& fractout))modf     );
  function("i32_min",    ( void (*)(const ints& a, const ints& b, ints& out))   min       );
  function("i32_max",    ( void (*)(const ints& a, const ints& b, ints& out))   max       );
  function("i32_min",    ( void (*)(const ints& a, const int b, ints& out))     min       );
  function("i32_max",    ( void (*)(const ints& a, const int b, ints& out))     max       );
  function("i32_min",    ( int(*)(const ints& a))                               min       );
  function("i32_max",    ( int(*)(const ints& a))                               max       );
  function("i32_clamp",  ( void (*)(const ints& a, const int lo, const int hi, ints& out))         clamp       );
  function("i32_clamp",  ( void (*)(const ints& a, const int lo, const ints& hi, ints& out))       clamp       );
  function("i32_clamp",  ( void (*)(const ints& a, const ints& lo, const int hi, ints& out))       clamp       );
  function("i32_clamp",  ( void (*)(const ints& a, const ints& lo, const ints& hi, ints& out))     clamp       );
  function("i32_mix",    ( void (*)(const ints& x, const ints& y, const ints& a, ints& out))       mix         );
  function("i32_mix",    ( void (*)(const ints& x, const ints& y, const int a, ints& out))         mix         );
  function("i32_mix",    ( void (*)(const ints& x, const int y, const ints& a, ints& out))         mix         );
  function("i32_mix",    ( void (*)(const ints& x, const int y, const int a, ints& out))           mix         );
  function("i32_mix",    ( void (*)(const int x, const ints& y, const ints& a, ints& out))         mix         );
  function("i32_mix",    ( void (*)(const int x, const ints& y, const int a, ints& out))           mix         );
  function("i32_mix",    ( void (*)(const int x, const int y, const ints& a, ints& out))           mix         );
  function("i32_step",   ( void (*)(const ints& edge, const ints& x, ints& out))                   step        );
  function("i32_step",   ( void (*)(const ints& edge, const int x, ints& out))                     step        );
  function("i32_step",   ( void (*)(const int edge, const ints& x, ints& out))                     step        );
  function("i32_smoothstep",( void (*)(const ints& lo, const ints& hi, const ints& x, ints& out))  smoothstep  );
  function("i32_smoothstep",( void (*)(const int lo, const ints& hi, const ints& x, ints& out))    smoothstep  );
  function("i32_smoothstep",( void (*)(const ints& lo, int hi, const ints& x, ints& out))          smoothstep  );
  function("i32_smoothstep",( void (*)(const int lo, const int hi, const ints& x, ints& out))      smoothstep  );
  function("i32_smoothstep",( void (*)(const ints& lo, const ints& hi, const int x, ints& out))    smoothstep  );
  function("i32_smoothstep",( void (*)(const int lo, const ints& hi, const int x, ints& out))      smoothstep  );
  function("i32_smoothstep",( void (*)(const ints& lo, const int hi, const int x, ints& out))      smoothstep  );
  function("i32_isnan",  ( void (*)(const ints& x, bools& out))                                    isnan       );
  function("i32_isinf",  ( void (*)(const ints& x, bools& out))                                    isinf       );
  function("i32_fma",    ( void (*)(const ints& a, const ints& b, const ints& c, ints& out))       fma         );
  function("i32_fma",    ( void (*)(const int a, const ints& b, const ints& c, ints& out))         fma         );
  function("i32_fma",    ( void (*)(const ints& a, int b, const ints& c, ints& out))               fma         );
  function("i32_fma",    ( void (*)(const int a, const int b, const ints& c, ints& out))           fma         );
  function("i32_fma",    ( void (*)(const ints& a, const ints& b, const int c, ints& out))         fma         );
  function("i32_fma",    ( void (*)(const int a, const ints& b, const int c, ints& out))           fma         );
  function("i32_fma",    ( void (*)(const ints& a, const int b, const int c, ints& out))           fma         );

  function("i32_pow",         (void (*)(const ints& base, const ints& exponent, ints& out))   pow              );
  function("i32_exp",         (void (*)(const ints& a, ints& out))                            exp              );
  function("i32_log",         (void (*)(const ints& a, ints& out))                            log              );
  function("i32_exp2",        (void (*)(const ints& a, ints& out))                            exp2             );
  function("i32_log2",        (void (*)(const ints& a, ints& out))                            log2             );
  function("i32_sqrt",        (void (*)(const ints& a, ints& out))                            sqrt             );
  function("i32_inversesqrt", (void (*)(const ints& a, ints& out))                            inversesqrt      );

  function("i32_min_id",    (unsigned int (*)(const ints& a))                                 min_id          );
  function("i32_max_id",    (unsigned int (*)(const ints& a))                                 max_id          );
  function("i32_sum",       (int (*)(const ints& a))                                          sum             );
  function("i32_mean",      (int (*)(const ints& a))                                          mean            );
  // function("i32_median",    (int (*)(const ints& a))                                       median          );
  // function("i32_mode",      (int (*)(const ints& a))                                       mode            );
  function("i32_standard_deviation", (int (*)(const ints& a))                          standard_deviation );
  function("i32_weighted_average", (int (*)(const ints& a, const ints& weights))       weighted_average );
  function("i32_rescale",   (void (*)(const ints& a, ints& out, int min_new, int max_new))    rescale );

  function("i32_radians",   (void (*)(const ints& degrees, ints& out))              radians );
  function("i32_degrees",   (void (*)(const ints& radians, ints& out))              degrees );
  function("i32_sin",       (void (*)(const ints& radians, ints& out))                  sin );
  function("i32_cos",       (void (*)(const ints& radians, ints& out))                  cos );
  function("i32_tan",       (void (*)(const ints& radians, ints& out))                  tan );
  function("i32_asin",      (void (*)(const ints& x, ints& out))                       asin );
  function("i32_acos",      (void (*)(const ints& x, ints& out))                       acos );
  function("i32_atan",      (void (*)(const ints& y_over_x, ints& out))                atan );
  function("i32_atan",      (void (*)(const ints& x, const ints& y, ints& out))        atan );
  function("i32_sinh",      (void (*)(const ints& radians, ints& out))                 sinh );
  function("i32_cosh",      (void (*)(const ints& radians, ints& out))                 cosh );
  function("i32_tanh",      (void (*)(const ints& radians, ints& out))                 tanh );
  function("i32_asinh",     (void (*)(const ints& x, ints& out))                      asinh );
  function("i32_acosh",     (void (*)(const ints& x, ints& out))                      acosh );
  function("i32_atanh",     (void (*)(const ints& x, ints& out))                      atanh );









  function("u32_add_many",    (void (*)(const uints& , const uints& , uints& )) add  );
  function("u32_add_single",  (void (*)(const uints& , const unsigned int, uints& ))   add  );
  function("u32_sub_many",    (void (*)(const uints& , const uints& , uints& )) sub  );
  function("u32_sub_single",  (void (*)(const uints& , const unsigned int, uints& ))   sub  );
  function("u32_mult_many",   (void (*)(const uints& , const uints& , uints& )) mult );
  function("u32_mult_single", (void (*)(const uints& , const unsigned int, uints& ))   mult );
  function("u32_div_many",    (void (*)(const uints& , const uints& , uints& )) div  );
  function("u32_div_single",  (void (*)(const uints& , const unsigned int, uints& ))   div  );

  function("u32_get_id",      (unsigned int(*)(const uints&  a, const unsigned int id ))              get      );
  function("u32_get_ids",     (void (*)(const uints&  a, const uints& ids, uints&  out ))      get      );
  function("u32_get_mask",    (void (*)(const uints&  a, const bools& mask, uints&  out ))     get      );
  function("u32_fill",        (void (*)(uints&  out, const unsigned int a ))                          fill     );
  function("u32_fill_ids",    (void (*)(uints&  out, const uints& ids, const unsigned int a ))        fill     );
  function("u32_fill_mask",   (void (*)(uints&  out, const bools& mask, const unsigned int a ))       fill     );
  function("u32_copy",        (void (*)(uints&  out, const uints&  a ))                        copy     );
  function("u32_copy_mask",   (void (*)(uints&  out, const bools& mask, const uints&  a ))     copy     );
  function("u32_copy_id",     (void (*)(uints&  out, const unsigned int id, const uints&  a )) copy     );
  function("u32_copy_ids",    (void (*)(uints&  out, const uints& ids, const uints&  a ))      copy     );
  function("u32_set_id",      (void (*)(uints&  out, const unsigned int id, const unsigned int a ))   set      );
  function("u32_set_ids",     (void (*)(uints&  out, const uints& ids, const uints&  a ))      set      );

  function("u32_equal_single",      (bool (*)(const uints&  a, const unsigned int b))                 equal    );
  function("u32_notEqual_single",   (bool (*)(const uints&  a, const unsigned int b))                 notEqual );
  function("u32_equal_many",        (bool (*)(const uints&  a, const uints&  b))               equal    );
  function("u32_notEqual_many",     (bool (*)(const uints&  a, const uints&  b))               notEqual );
  function("u32_compEqual_many",    (void (*)(const uints&  a, const unsigned int b, bools& out))     equal    );
  function("u32_compNotEqual_many", (void (*)(const uints&  a, const unsigned int b, bools& out))     notEqual );
  function("u32_compEqual_many",    (void (*)(const uints&  a, const uints&  b, bools& out))   equal    );
  function("u32_compNotEqual_many", (void (*)(const uints&  a, const uints&  b, bools& out))   notEqual );

  function("u32_greaterThan",      (void (*)(const uints&  a, const unsigned int b, bools& out))      greaterThan      );
  function("u32_greaterThanEqual", (void (*)(const uints&  a, const unsigned int b, bools& out))      greaterThanEqual );
  function("u32_lessThan",         (void (*)(const uints&  a, const unsigned int b, bools& out))      lessThan         );
  function("u32_lessThanEqual",    (void (*)(const uints&  a, const unsigned int b, bools& out))      lessThanEqual    );
  function("u32_greaterThan",      (void (*)(const uints&  a, const uints&  b, bools& out))    greaterThan      );
  function("u32_greaterThanEqual", (void (*)(const uints&  a, const uints&  b, bools& out))    greaterThanEqual );
  function("u32_lessThan",         (void (*)(const uints&  a, const uints&  b, bools& out))    lessThan         );
  function("u32_lessThanEqual",    (void (*)(const uints&  a, const uints&  b, bools& out))    lessThanEqual    );

  // function("u32_abs",    ( void (*)(const uints&  a, uints&  out)) abs                                                 );
  function("u32_sign",   ( void (*)(const uints&  a, uints&  out)) sign                                                );
  function("u32_floor",  ( void (*)(const uints&  a, uints&  out)) floor                                               );
  function("u32_trunc",  ( void (*)(const uints&  a, uints&  out)) trunc                                               );
  function("u32_round",  ( void (*)(const uints&  a, uints&  out)) round                                               );
  function("u32_ceil",   ( void (*)(const uints&  a, uints&  out)) ceil                                                );
  function("u32_fract",  ( void (*)(const uints&  a, uints&  out)) fract                                               );

  function("u32_mod",    ( void (*)(const uints&  a, const uints&  b, uints&  out))   mod                              );
  function("u32_modf",   ( void (*)(const uints&  a, ints& intout, uints&  fractout)) modf                             );
  function("u32_min",    ( void (*)(const uints&  a, const uints&  b, uints&  out))   min                              );
  function("u32_max",    ( void (*)(const uints&  a, const uints&  b, uints&  out))   max                              );
  function("u32_min",    ( void (*)(const uints&  a, const unsigned int b, uints&  out))     min                              );
  function("u32_max",    ( void (*)(const uints&  a, const unsigned int b, uints&  out))     max                              );
  function("u32_min",    ( unsigned int(*)(const uints&  a))                                 min                              );
  function("u32_max",    ( unsigned int(*)(const uints&  a))                                 max                              );
  function("u32_clamp",  ( void (*)(const uints&  a, const unsigned int lo, const unsigned int hi, uints&  out))         clamp       );
  function("u32_clamp",  ( void (*)(const uints&  a, const unsigned int lo, const uints&  hi, uints&  out))       clamp       );
  function("u32_clamp",  ( void (*)(const uints&  a, const uints&  lo, const unsigned int hi, uints&  out))       clamp       );
  function("u32_clamp",  ( void (*)(const uints&  a, const uints&  lo, const uints&  hi, uints&  out))     clamp       );
  function("u32_mix",    ( void (*)(const uints&  x, const uints&  y, const uints&  a, uints&  out))       mix         );
  function("u32_mix",    ( void (*)(const uints&  x, const uints&  y, const unsigned int a, uints&  out))         mix         );
  function("u32_mix",    ( void (*)(const uints&  x, const unsigned int y, const uints&  a, uints&  out))         mix         );
  function("u32_mix",    ( void (*)(const uints&  x, const unsigned int y, const unsigned int a, uints&  out))           mix         );
  function("u32_mix",    ( void (*)(const unsigned int x, const uints&  y, const uints&  a, uints&  out))         mix         );
  function("u32_mix",    ( void (*)(const unsigned int x, const uints&  y, const unsigned int a, uints&  out))           mix         );
  function("u32_mix",    ( void (*)(const unsigned int x, const unsigned int y, const uints&  a, uints&  out))           mix         );
  function("u32_step",   ( void (*)(const uints&  edge, const uints&  x, uints&  out))                     step        );
  function("u32_step",   ( void (*)(const uints&  edge, const unsigned int x, uints&  out))                       step        );
  function("u32_step",   ( void (*)(const unsigned int edge, const uints&  x, uints&  out))                       step        );
  function("u32_smoothstep",( void (*)(const uints&  lo, const uints&  hi, const uints&  x, uints&  out))  smoothstep  );
  function("u32_smoothstep",( void (*)(const unsigned int lo, const uints&  hi, const uints&  x, uints&  out))    smoothstep  );
  function("u32_smoothstep",( void (*)(const uints&  lo, unsigned int hi, const uints&  x, uints&  out))          smoothstep  );
  function("u32_smoothstep",( void (*)(const unsigned int lo, const unsigned int hi, const uints&  x, uints&  out))      smoothstep  );
  function("u32_smoothstep",( void (*)(const uints&  lo, const uints&  hi, const unsigned int x, uints&  out))    smoothstep  );
  function("u32_smoothstep",( void (*)(const unsigned int lo, const uints&  hi, const unsigned int x, uints&  out))      smoothstep  );
  function("u32_smoothstep",( void (*)(const uints&  lo, const unsigned int hi, const unsigned int x, uints&  out))      smoothstep  );
  function("u32_isnan",  ( void (*)(const uints&  x, bools& out))                                          isnan       );
  function("u32_isinf",  ( void (*)(const uints&  x, bools& out))                                          isinf       );
  function("u32_fma",    ( void (*)(const uints&  a, const uints&  b, const uints&  c, uints&  out))       fma         );
  function("u32_fma",    ( void (*)(const unsigned int a, const uints&  b, const uints&  c, uints&  out))         fma         );
  function("u32_fma",    ( void (*)(const uints&  a, unsigned int b, const uints&  c, uints&  out))               fma         );
  function("u32_fma",    ( void (*)(const unsigned int a, const unsigned int b, const uints&  c, uints&  out))           fma         );
  function("u32_fma",    ( void (*)(const uints&  a, const uints&  b, const unsigned int c, uints&  out))         fma         );
  function("u32_fma",    ( void (*)(const unsigned int a, const uints&  b, const unsigned int c, uints&  out))           fma         );
  function("u32_fma",    ( void (*)(const uints&  a, const unsigned int b, const unsigned int c, uints&  out))           fma         );

  function("u32_pow",         (void (*)(const uints&  base, const uints&  exponent, uints&  out)) pow                  );
  function("u32_exp",         (void (*)(const uints&  a, uints&  out))                            exp                  );
  function("u32_log",         (void (*)(const uints&  a, uints&  out))                            log                  );
  function("u32_exp2",        (void (*)(const uints&  a, uints&  out))                            exp2                 );
  function("u32_log2",        (void (*)(const uints&  a, uints&  out))                            log2                 );
  function("u32_sqrt",        (void (*)(const uints&  a, uints&  out))                            sqrt                 );
  function("u32_inversesqrt", (void (*)(const uints&  a, uints&  out))                            inversesqrt          );

  function("u32_min_id",    (unsigned int (*)(const uints&  a))                                        min_id );
  function("u32_max_id",    (unsigned int (*)(const uints&  a))                                        max_id );
  function("u32_sum",       (unsigned int (*)(const uints&  a))                                                  sum );
  function("u32_mean",      (unsigned int (*)(const uints&  a))                                                 mean );
  // function("u32_median",    (unsigned int (*)(const uints&  a))                                               median );
  // function("u32_mode",      (unsigned int (*)(const uints&  a))                                                 mode );
  function("u32_standard_deviation", (unsigned int (*)(const uints&  a))                          standard_deviation );
  function("u32_weighted_average", (unsigned int (*)(const uints&  a, const uints&  weights))       weighted_average );
  function("u32_rescale",   (void (*)(const uints&  a, uints&  out, unsigned int min_new, unsigned int max_new))    rescale );

  function("u32_radians",   (void (*)(const uints&  degrees, uints&  out))              radians );
  function("u32_degrees",   (void (*)(const uints&  radians, uints&  out))              degrees );
  function("u32_sin",       (void (*)(const uints&  radians, uints&  out))                  sin );
  function("u32_cos",       (void (*)(const uints&  radians, uints&  out))                  cos );
  function("u32_tan",       (void (*)(const uints&  radians, uints&  out))                  tan );
  function("u32_asin",      (void (*)(const uints&  x, uints&  out))                       asin );
  function("u32_acos",      (void (*)(const uints&  x, uints&  out))                       acos );
  function("u32_atan",      (void (*)(const uints&  y_over_x, uints&  out))                atan );
  function("u32_atan",      (void (*)(const uints&  x, const uints&  y, uints&  out))      atan );
  function("u32_sinh",      (void (*)(const uints&  radians, uints&  out))                 sinh );
  function("u32_cosh",      (void (*)(const uints&  radians, uints&  out))                 cosh );
  function("u32_tanh",      (void (*)(const uints&  radians, uints&  out))                 tanh );
  function("u32_asinh",     (void (*)(const uints&  x, uints&  out))                      asinh );
  function("u32_acosh",     (void (*)(const uints&  x, uints&  out))                      acosh );
  function("u32_atanh",     (void (*)(const uints&  x, uints&  out))                      atanh );








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

  function("f32_abs",    ( void (*)(const floats& a, floats& out)) abs                                                 );
  function("f32_sign",   ( void (*)(const floats& a, floats& out)) sign                                                );
  function("f32_floor",  ( void (*)(const floats& a, floats& out)) floor                                               );
  function("f32_trunc",  ( void (*)(const floats& a, floats& out)) trunc                                               );
  function("f32_round",  ( void (*)(const floats& a, floats& out)) round                                               );
  function("f32_ceil",   ( void (*)(const floats& a, floats& out)) ceil                                                );
  function("f32_fract",  ( void (*)(const floats& a, floats& out)) fract                                               );

  function("f32_mod",    ( void (*)(const floats& a, const floats& b, floats& out))   mod                              );
  function("f32_modf",   ( void (*)(const floats& a, ints& intout, floats& fractout)) modf                             );
  function("f32_min",    ( void (*)(const floats& a, const floats& b, floats& out))   min                              );
  function("f32_max",    ( void (*)(const floats& a, const floats& b, floats& out))   max                              );
  function("f32_min",    ( void (*)(const floats& a, const float b, floats& out))     min                              );
  function("f32_max",    ( void (*)(const floats& a, const float b, floats& out))     max                              );
  function("f32_min",    ( float(*)(const floats& a))                                 min                              );
  function("f32_max",    ( float(*)(const floats& a))                                 max                              );
  function("f32_clamp",  ( void (*)(const floats& a, const float lo, const float hi, floats& out))         clamp       );
  function("f32_clamp",  ( void (*)(const floats& a, const float lo, const floats& hi, floats& out))       clamp       );
  function("f32_clamp",  ( void (*)(const floats& a, const floats& lo, const float hi, floats& out))       clamp       );
  function("f32_clamp",  ( void (*)(const floats& a, const floats& lo, const floats& hi, floats& out))     clamp       );
  function("f32_mix",    ( void (*)(const floats& x, const floats& y, const floats& a, floats& out))       mix         );
  function("f32_mix",    ( void (*)(const floats& x, const floats& y, const float a, floats& out))         mix         );
  function("f32_mix",    ( void (*)(const floats& x, const float y, const floats& a, floats& out))         mix         );
  function("f32_mix",    ( void (*)(const floats& x, const float y, const float a, floats& out))           mix         );
  function("f32_mix",    ( void (*)(const float x, const floats& y, const floats& a, floats& out))         mix         );
  function("f32_mix",    ( void (*)(const float x, const floats& y, const float a, floats& out))           mix         );
  function("f32_mix",    ( void (*)(const float x, const float y, const floats& a, floats& out))           mix         );
  function("f32_step",   ( void (*)(const floats& edge, const floats& x, floats& out))                     step        );
  function("f32_step",   ( void (*)(const floats& edge, const float x, floats& out))                       step        );
  function("f32_step",   ( void (*)(const float edge, const floats& x, floats& out))                       step        );
  function("f32_smoothstep",( void (*)(const floats& lo, const floats& hi, const floats& x, floats& out))  smoothstep  );
  function("f32_smoothstep",( void (*)(const float lo, const floats& hi, const floats& x, floats& out))    smoothstep  );
  function("f32_smoothstep",( void (*)(const floats& lo, float hi, const floats& x, floats& out))          smoothstep  );
  function("f32_smoothstep",( void (*)(const float lo, const float hi, const floats& x, floats& out))      smoothstep  );
  function("f32_smoothstep",( void (*)(const floats& lo, const floats& hi, const float x, floats& out))    smoothstep  );
  function("f32_smoothstep",( void (*)(const float lo, const floats& hi, const float x, floats& out))      smoothstep  );
  function("f32_smoothstep",( void (*)(const floats& lo, const float hi, const float x, floats& out))      smoothstep  );
  function("f32_isnan",  ( void (*)(const floats& x, bools& out))                                          isnan       );
  function("f32_isinf",  ( void (*)(const floats& x, bools& out))                                          isinf       );
  function("f32_fma",    ( void (*)(const floats& a, const floats& b, const floats& c, floats& out))       fma         );
  function("f32_fma",    ( void (*)(const float a, const floats& b, const floats& c, floats& out))         fma         );
  function("f32_fma",    ( void (*)(const floats& a, float b, const floats& c, floats& out))               fma         );
  function("f32_fma",    ( void (*)(const float a, const float b, const floats& c, floats& out))           fma         );
  function("f32_fma",    ( void (*)(const floats& a, const floats& b, const float c, floats& out))         fma         );
  function("f32_fma",    ( void (*)(const float a, const floats& b, const float c, floats& out))           fma         );
  function("f32_fma",    ( void (*)(const floats& a, const float b, const float c, floats& out))           fma         );

  function("f32_pow",         (void (*)(const floats& base, const floats& exponent, floats& out)) pow                  );
  function("f32_exp",         (void (*)(const floats& a, floats& out))                            exp                  );
  function("f32_log",         (void (*)(const floats& a, floats& out))                            log                  );
  function("f32_exp2",        (void (*)(const floats& a, floats& out))                            exp2                 );
  function("f32_log2",        (void (*)(const floats& a, floats& out))                            log2                 );
  function("f32_sqrt",        (void (*)(const floats& a, floats& out))                            sqrt                 );
  function("f32_inversesqrt", (void (*)(const floats& a, floats& out))                            inversesqrt          );

  function("f32_min_id",    (unsigned int (*)(const floats& a))                                        min_id );
  function("f32_max_id",    (unsigned int (*)(const floats& a))                                        max_id );
  function("f32_sum",       (float (*)(const floats& a))                                                  sum );
  function("f32_mean",      (float (*)(const floats& a))                                                 mean );
  // function("f32_median",    (float (*)(const floats& a))                                               median );
  // function("f32_mode",      (float (*)(const floats& a))                                                 mode );
  function("f32_standard_deviation", (float (*)(const floats& a))                          standard_deviation );
  function("f32_weighted_average", (float (*)(const floats& a, const floats& weights))       weighted_average );
  function("f32_rescale",   (void (*)(const floats& a, floats& out, float min_new, float max_new))    rescale );

  function("f32_radians",   (void (*)(const floats& degrees, floats& out))              radians );
  function("f32_degrees",   (void (*)(const floats& radians, floats& out))              degrees );
  function("f32_sin",       (void (*)(const floats& radians, floats& out))                  sin );
  function("f32_cos",       (void (*)(const floats& radians, floats& out))                  cos );
  function("f32_tan",       (void (*)(const floats& radians, floats& out))                  tan );
  function("f32_asin",      (void (*)(const floats& x, floats& out))                       asin );
  function("f32_acos",      (void (*)(const floats& x, floats& out))                       acos );
  function("f32_atan",      (void (*)(const floats& y_over_x, floats& out))                atan );
  function("f32_atan",      (void (*)(const floats& x, const floats& y, floats& out))      atan );
  function("f32_sinh",      (void (*)(const floats& radians, floats& out))                 sinh );
  function("f32_cosh",      (void (*)(const floats& radians, floats& out))                 cosh );
  function("f32_tanh",      (void (*)(const floats& radians, floats& out))                 tanh );
  function("f32_asinh",     (void (*)(const floats& x, floats& out))                      asinh );
  function("f32_acosh",     (void (*)(const floats& x, floats& out))                      acosh );
  function("f32_atanh",     (void (*)(const floats& x, floats& out))                      atanh );








  function("vec3_add_vectors",  (void (*)(const primitives<vec3>&, const primitives<vec3>&, primitives<vec3>&))  add  );
  function("vec3_add_scalars",  (void (*)(const primitives<vec3>&, const floats&, primitives<vec3>&)) add  );
  function("vec3_add_vector",   (void (*)(const primitives<vec3>&, const vec3, primitives<vec3>&))    add  );
  function("vec3_add_scalar",   (void (*)(const primitives<vec3>&, const float, primitives<vec3>&))   add  );
  function("vec3_sub_vectors",  (void (*)(const primitives<vec3>&, const primitives<vec3>&, primitives<vec3>&))  sub  );
  function("vec3_sub_scalars",  (void (*)(const primitives<vec3>&, const floats&, primitives<vec3>&)) sub  );
  function("vec3_sub_vector",   (void (*)(const primitives<vec3>&, const vec3, primitives<vec3>&))    sub  );
  function("vec3_sub_scalar",   (void (*)(const primitives<vec3>&, const float, primitives<vec3>&))   sub  );
  function("vec3_mult_vectors", (void (*)(const primitives<vec3>&, const primitives<vec3>&, primitives<vec3>&))  mult );
  function("vec3_mult_scalars", (void (*)(const primitives<vec3>&, const floats&, primitives<vec3>&)) mult );
  function("vec3_mult_vector",  (void (*)(const primitives<vec3>&, const vec3, primitives<vec3>&))    mult );
  function("vec3_mult_scalar",  (void (*)(const primitives<vec3>&, const float, primitives<vec3>&))   mult );
  function("vec3_div_vectors",  (void (*)(const primitives<vec3>&, const primitives<vec3>&, primitives<vec3>&))  div  );
  function("vec3_div_scalars",  (void (*)(const primitives<vec3>&, const floats&, primitives<vec3>&)) div  );
  function("vec3_div_vector",   (void (*)(const primitives<vec3>&, const vec3, primitives<vec3>&))    div  );
  function("vec3_div_scalar",   (void (*)(const primitives<vec3>&, const float, primitives<vec3>&))   div  );



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
