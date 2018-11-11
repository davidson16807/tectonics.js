
#include <math.h>       // ceil, round 
#include <limits.h>   // infinity

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

template<typename T>
void copy_typed_array(many<T>& out, const val& typed_array)
{
  unsigned int typed_array_length = typed_array["length"].as<unsigned int>();
  //TODO: verify output length equals typed_array length

  val memory = val::module_property("buffer");
  val memoryView = typed_array["constructor"].new_(memory, reinterpret_cast<uintptr_t>(out.data()), typed_array_length);
  memoryView.call<void>("set", typed_array);
}

template<typename T>
many<T> from_typed_array(const val& typed_array)
{
  unsigned int typed_array_length = typed_array["length"].as<unsigned int>();
  many<T> out = many<T>(typed_array_length);
  copy_typed_array(out, typed_array);
  return out;
}

template<typename T>
void copy_list(many<T>& out, const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  //TODO: verify output length equals list length

  for (unsigned int i = 0; i < list_length; ++i)
  {
    out[i] = list[i].as<T>();
  }
}

template<typename T, qualifier Q>
void copy_list(many<vec<2,T,Q>>& out, const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  //TODO: verify output length equals list length

  for (unsigned int i = 0; i < list_length; i+=2)
  {
    out[i/2] = vec<2,T,Q>(
      list[i+0].as<T>(), 
      list[i+1].as<T>() 
    );
  }
}

template<typename T, qualifier Q>
void copy_list(many<vec<3,T,Q>>& out, const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  //TODO: verify output length equals list length

  for (unsigned int i = 0; i < list_length; i+=3)
  {
    out[i/3] = vec<3,T,Q>(
      list[i+0].as<T>(), 
      list[i+1].as<T>(), 
      list[i+2].as<T>() 
    );
  }
}

template<typename T, qualifier Q>
void copy_list(many<vec<4,T,Q>>& out, const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  //TODO: verify output length equals list length

  for (unsigned int i = 0; i < list_length; i+=4)
  {
    out[i/4] = vec<4,T,Q>(
      list[i+0].as<T>(), 
      list[i+1].as<T>(), 
      list[i+2].as<T>(), 
      list[i+3].as<T>() 
    );
  }
}

template<typename T>
many<T> from_list(const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  many<T> out = many<T>(list_length);
  copy_list(out, list);
  return out;
}
template<length_t L, typename T, qualifier Q>
many<vec<L,T,Q>> vecs_from_list(const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  many<vec<L,T,Q>> out = many<vec<L,T,Q>>(list_length/L);
  copy_list(out, list);
  return out;
}

template<typename T, qualifier Q>
val to_list(vec<2,T,Q> a){
  val out = val::array();
  out.set(0, a.x);
  out.set(1, a.y);
  return out;
}
template<typename T, qualifier Q>
val to_list(vec<3,T,Q> a){
  val out = val::array();
  out.set(0, a.x);
  out.set(1, a.y);
  out.set(2, a.z);
  return out;
}
template<typename T, qualifier Q>
val to_list(vec<4,T,Q> a){
  val out = val::array();
  out.set(0,a.x);
  out.set(1,a.y);
  out.set(2,a.z);
  out.set(3,a.w);
  return out;
}
template<typename T>
val to_list(const many<T>& a){
  val out = val::array();
  for (unsigned int i = 0; i < a.size(); ++i)
  {
    out.set(i, val(a[i]));
  }
  return out;
}
template<length_t L, typename T, qualifier Q>
val to_list(const many<vec<L,T,Q>>& a){
  val out = val::array();
  for (unsigned int i = 0; i < a.size(); ++i)
  {
    out.set(i, to_list(a[i]));
  }
  return out;
}

template class glm::vec<2,float,defaultp>;
template class glm::vec<3,float,defaultp>;
template class glm::vec<4,float,defaultp>;
template class glm::mat<3,3,float,defaultp>;
template class glm::mat<4,3,float,defaultp>;
template class glm::mat<4,4,float,defaultp>;
template class composites::many<bool>;
template class composites::many<int>;
template class composites::many<unsigned int>;
template class composites::many<float>;
template class composites::many<double>;
template class composites::many<vec<2,float,defaultp>>;
template class composites::many<vec<3,float,defaultp>>;
template class composites::many<vec<4,float,defaultp>>;

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
      .property("x", &vec3::x)
      .property("y", &vec3::y)
      .property("z", &vec3::z)
  ;

  class_<vec4>("vec4")
      .constructor()
      .constructor<float>()
      .constructor<float, float, float, float>()
      .property("x", &vec4::x)
      .property("y", &vec4::y)
      .property("z", &vec4::z)
      .property("w", &vec4::z)
  ;

  class_<mat2>("mat2")
      .constructor<float>()
      .constructor<vec2, vec2>()
      .constructor<float, float, 
                   float, float>()
  ;
  class_<mat3>("mat3")
      .constructor<float>()
      .constructor<vec3, vec3, vec3>()
      .constructor<float, float, float, 
                   float, float, float, 
                   float, float, float>()
  ;
  class_<mat4x3>("mat4x3")
      .constructor<float>()
      .constructor<vec3, vec3, vec3, vec3>()
      .constructor<float, float, float, float, 
                   float, float, float, float, 
                   float, float, float, float>()
  ;
  class_<mat4>("mat4")
      .constructor<float>()
      .constructor<vec4, vec4, vec4, vec4>()
      .constructor<float, float, float, float, 
                   float, float, float, float, 
                   float, float, float, float, 
                   float, float, float, float>()
  ;

  class_<bools>("bools")
      .constructor<unsigned int>()
      .constructor<unsigned int, bool>()
      .function("size", &bools::size)
  ;

  class_<ints>("ints")
      .constructor<unsigned int>()
      .constructor<unsigned int, int>()
      .function("size", &ints::size)
  ;

  class_<uints>("uints")
      .constructor<unsigned int>()
      .constructor<unsigned int, uint>()
      .function("size", &uints::size)
  ;

  class_<floats>("floats")
      .constructor<unsigned int>()
      .constructor<unsigned int, float>()
      .function("size", &floats::size)
  ;

  class_<vec2s>("vec2s")
      .constructor<unsigned int>()
      .constructor<unsigned int, vec2>()
      .function("size", &vec2s::size)
  ;

  class_<vec3s>("vec3s")
      .constructor<unsigned int>()
      .constructor<unsigned int, vec3>()
      .function("size", &vec3s::size)
  ;

  class_<vec4s>("vec4s")
      .constructor<unsigned int>()
      .constructor<unsigned int, vec4>()
      .function("size", &vec4s::size)
  ;

  register_vector<vec3>("vector_vec3");

  class_<CartesianGridCellList3d>("CartesianGridCellList3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &CartesianGridCellList3d::nearest_id)
  ;

  class_<SphereGridVoronoi3d>("SphereGridVoronoi3d")
      .constructor<std::vector<vec3>, double>()
      .function("nearest_id", &SphereGridVoronoi3d::nearest_id)
  ;

  function("bools_copy_typed_array",   (void (*)(bools& out, const val& js_list ))              copy_typed_array     );
  function("bools_copy_list",   (void (*)(bools& out, const val& js_list ))                     copy_list     );
  function("bools_from_typed_array",   (bools (*)(const val& js_list ))                         from_typed_array     );
  function("bools_from_list",   (bools (*)(const val& js_list ))                                from_list     );
  function("bools_from_bools",  (bools (*)(const bools& a ))                                    copy     );
  function("bools_to_list",     (val (*)(const bools& a ))                                      to_list     );

  function("bools_unite_bool",        (void (*)(const bools& a, const bool b, bools& out))      unite     );
  function("bools_unite_bools",       (void (*)(const bools& a, const bools& b, bools& out))    unite     );
  function("bools_intersect_bool",    (void (*)(const bools& a, const bool b, bools& out))      intersect );
  function("bools_intersect_bools",   (void (*)(const bools& a, const bools& b, bools& out))    intersect );
  function("bools_differ_bool",       (void (*)(const bools& a, const bool b, bools& out))      differ    );
  function("bools_differ_bools",      (void (*)(const bools& a, const bools& b, bools& out))    differ    );
  function("bools_negate",            (void (*)(const bools& a, bools& out))                    negate    );

  function("bools_all",       (bool (*)(const bools& a)) all  );
  function("bools_any",       (bool (*)(const bools& a)) any  );
  function("bools_none",      (bool (*)(const bools& a)) none );

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





  function("ints_copy_typed_array",   (void (*)(ints& out, const val& js_list ))              copy_typed_array     );
  function("ints_copy_list",   (void (*)(ints& out, const val& js_list ))                     copy_list     );
  function("ints_from_typed_array",   (ints (*)(const val& js_list ))                         from_typed_array     );
  function("ints_from_list",   (ints (*)(const val& js_list ))                                from_list     );
  function("ints_from_ints",   (ints (*)(const ints& a ))                                     copy     );
  function("ints_to_list",     (val (*)(const ints& a ))                                      to_list     );

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









  function("uints_copy_typed_array",   (void (*)(uints& out, const val& js_list ))              copy_typed_array     );
  function("uints_copy_list",   (void (*)(uints& out, const val& js_list ))                     copy_list     );
  function("uints_from_typed_array",   (uints (*)(const val& js_list ))                         from_typed_array     );
  function("uints_from_list",    (uints (*)(const val& js_list ))                               from_list     );
  function("uints_from_uints",   (uints (*)(const uints& a ))                                   copy     );
  function("uints_to_list",      (val (*)(const uints& a ))                                     to_list     );

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






  function("floats_copy_typed_array",   (void (*)(floats& out, const val& js_list ))              copy_typed_array     );
  function("floats_copy_list",   (void (*)(floats& out, const val& js_list ))                     copy_list     );
  function("floats_from_typed_array",   (floats (*)(const val& js_list ))                         from_typed_array     );
  function("floats_from_list",   (floats (*)(const val& js_list ))                                from_list     );
  function("floats_from_floats", (floats (*)(const floats& a ))                                   copy     );
  function("floats_to_list",      (val (*)(const floats& a ))                                     to_list     );

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














  function("vec2_add_vec2",   (vec2 (*)(const vec2&, const vec2&))   operator+  );
  function("vec2_add_float",  (vec2 (*)(const vec2&, const float))   operator+  );
  function("vec2_sub_vec2",   (vec2 (*)(const vec2&, const vec2&))   operator-  );
  function("vec2_sub_float",  (vec2 (*)(const vec2&, const float))   operator-  );
  function("vec2_mult_vec2",  (vec2 (*)(const vec2&, const vec2&))   operator*  );
  function("vec2_mult_float", (vec2 (*)(const vec2&, const float))   operator*  );
  function("vec2_div_vec2",   (vec2 (*)(const vec2&, const vec2&))   operator/  );
  function("vec2_div_float",  (vec2 (*)(const vec2&, const float))   operator/  );

  function("vec2_mult_mat2",   (vec2 (*)(const mat2&, const vec2&))  operator* );

  function("vec2_equal_vec2",        (bool  (*)(const vec2& a, const vec2& b)) operator== );
  function("vec2_notEqual_vec2",     (bool  (*)(const vec2& a, const vec2& b)) operator!= );
  function("vec2_compEqual_vec2",    (bvec2 (*)(const vec2& a, const vec2& b)) equal    );
  function("vec2_compNotEqual_vec2", (bvec2 (*)(const vec2& a, const vec2& b)) notEqual );

  function("vec2_greaterThan_vec2",     (bvec2 (*)(const vec2& a, const vec2& b)) greaterThan      );
  function("vec2_greaterThanEqual_vec2",(bvec2 (*)(const vec2& a, const vec2& b)) greaterThanEqual );
  function("vec2_lessThan_vec2",        (bvec2 (*)(const vec2& a, const vec2& b)) lessThan         );
  function("vec2_lessThanEqual_vec2",   (bvec2 (*)(const vec2& a, const vec2& b)) lessThanEqual    );

  function("vec2_abs",    ( vec2 (*)(const vec2& a)) abs   );
  function("vec2_sign",   ( vec2 (*)(const vec2& a)) sign  );
  function("vec2_floor",  ( vec2 (*)(const vec2& a)) floor );
  function("vec2_trunc",  ( vec2 (*)(const vec2& a)) trunc );
  function("vec2_round",  ( vec2 (*)(const vec2& a)) round );
  function("vec2_ceil",   ( vec2 (*)(const vec2& a)) ceil  );
  function("vec2_fract",  ( vec2 (*)(const vec2& a)) fract );

  // function("vec2s_mod",    ( void (*)(const vec2s& a, const vec2s& b, vec2s& out))     mod         );
  // function("vec2s_modf",   ( void (*)(const vec2s& a, ints& intout, vec2s& fractout))  modf        );
  function("vec2_min_vec2",   ( vec2 (*)(const vec2& a, const vec2& b))   min );
  function("vec2_max_vec2",   ( vec2 (*)(const vec2& a, const vec2& b))   max );

  function("vec2_clamp",      ( vec2 (*)(const vec2& a, const vec2& lo, const vec2& hi))    clamp );

  function("vec2_mix_float",  ( vec2 (*)(const vec2& x, const vec2& y, const float a))    mix         );
  function("vec2_mix_vec2",   ( vec2 (*)(const vec2& x, const vec2& y, const vec2& a))    mix         );

  function("vec2_step",       ( vec2 (*)(const vec2& edge, const vec2& x))                step        );

  function("vec2_smoothstep", ( vec2 (*)(const vec2& lo, const vec2& hi, const vec2& x))  smoothstep  );
  function("vec2_fma",        ( vec2 (*)(const vec2& a, const vec2& b, const vec2& c))    fma         );

  function("vec2_dot_vec2",       (float (*)(const vec2& u, const vec2& v)) dot       );
  function("vec2_distance_vec2",  (float (*)(const vec2& u, const vec2& v)) distance  );

  function("vec2_length",     (float (*)(const vec2& u))  length      );
  function("vec2_normalize",  (vec2 (*)(const vec2& u))  normalize   );









  function("vec3_add_vec3",   (vec3 (*)(const vec3&, const vec3&))   operator+  );
  function("vec3_add_float",  (vec3 (*)(const vec3&, const float))   operator+  );
  function("vec3_sub_vec3",   (vec3 (*)(const vec3&, const vec3&))   operator-  );
  function("vec3_sub_float",  (vec3 (*)(const vec3&, const float))   operator-  );
  function("vec3_mult_vec3",  (vec3 (*)(const vec3&, const vec3&))   operator*  );
  function("vec3_mult_float", (vec3 (*)(const vec3&, const float))   operator*  );
  function("vec3_div_vec3",   (vec3 (*)(const vec3&, const vec3&))   operator/  );
  function("vec3_div_float",  (vec3 (*)(const vec3&, const float))   operator/  );

  function("vec3_mult_mat3",   (vec3 (*)(const mat3&, const vec3&))  operator* );

  function("vec3_equal_vec3",        (bool  (*)(const vec3& a, const vec3& b)) operator== );
  function("vec3_notEqual_vec3",     (bool  (*)(const vec3& a, const vec3& b)) operator!= );
  function("vec3_compEqual_vec3",    (bvec3 (*)(const vec3& a, const vec3& b)) equal    );
  function("vec3_compNotEqual_vec3", (bvec3 (*)(const vec3& a, const vec3& b)) notEqual );

  function("vec3_greaterThan_vec3",     (bvec3 (*)(const vec3& a, const vec3& b)) greaterThan      );
  function("vec3_greaterThanEqual_vec3",(bvec3 (*)(const vec3& a, const vec3& b)) greaterThanEqual );
  function("vec3_lessThan_vec3",        (bvec3 (*)(const vec3& a, const vec3& b)) lessThan         );
  function("vec3_lessThanEqual_vec3",   (bvec3 (*)(const vec3& a, const vec3& b)) lessThanEqual    );

  function("vec3_abs",    ( vec3 (*)(const vec3& a)) abs   );
  function("vec3_sign",   ( vec3 (*)(const vec3& a)) sign  );
  function("vec3_floor",  ( vec3 (*)(const vec3& a)) floor );
  function("vec3_trunc",  ( vec3 (*)(const vec3& a)) trunc );
  function("vec3_round",  ( vec3 (*)(const vec3& a)) round );
  function("vec3_ceil",   ( vec3 (*)(const vec3& a)) ceil  );
  function("vec3_fract",  ( vec3 (*)(const vec3& a)) fract );

  // function("vec3s_mod",    ( void (*)(const vec3s& a, const vec3s& b, vec3s& out))     mod         );
  // function("vec3s_modf",   ( void (*)(const vec3s& a, ints& intout, vec3s& fractout))  modf        );
  function("vec3_min_vec3",   ( vec3 (*)(const vec3& a, const vec3& b))   min );
  function("vec3_max_vec3",   ( vec3 (*)(const vec3& a, const vec3& b))   max );

  function("vec3_clamp",      ( vec3 (*)(const vec3& a, const vec3& lo, const vec3& hi))    clamp );

  function("vec3_mix_float",  ( vec3 (*)(const vec3& x, const vec3& y, const float a))    mix         );
  function("vec3_mix_vec3",   ( vec3 (*)(const vec3& x, const vec3& y, const vec3& a))    mix         );

  function("vec3_step",       ( vec3 (*)(const vec3& edge, const vec3& x))                step        );

  function("vec3_smoothstep", ( vec3 (*)(const vec3& lo, const vec3& hi, const vec3& x))  smoothstep  );
  function("vec3_fma",        ( vec3 (*)(const vec3& a, const vec3& b, const vec3& c))    fma         );

  function("vec3_pow",         (vec3 (*)(const vec3& base, const vec3& exponent))  pow                  );
  function("vec3_exp",         (vec3 (*)(const vec3& a))                           exp                  );
  function("vec3_log",         (vec3 (*)(const vec3& a))                           log                  );
  function("vec3_exp2",        (vec3 (*)(const vec3& a))                           exp2                 );
  function("vec3_log2",        (vec3 (*)(const vec3& a))                           log2                 );
  function("vec3_sqrt",        (vec3 (*)(const vec3& a))                           sqrt                 );
  function("vec3_inversesqrt", (vec3 (*)(const vec3& a))                           inversesqrt          );

  function("vec3_dot_vec3",       (float (*)(const vec3& u, const vec3& v)) dot       );
  function("vec3_cross_vec3",     (vec3 (*)(const vec3& u, const vec3& v)) cross     );
  function("vec3_distance_vec3",  (float (*)(const vec3& u, const vec3& v)) distance  );

  function("vec3_length",     (float (*)(const vec3& u))  length      );
  function("vec3_normalize",  (vec3 (*)(const vec3& u))  normalize   );















  function("vec4_add_vec4",   (vec4 (*)(const vec4&, const vec4&))   operator+  );
  function("vec4_add_float",  (vec4 (*)(const vec4&, const float&))   operator+  );
  function("vec4_sub_vec4",   (vec4 (*)(const vec4&, const vec4&))   operator-  );
  function("vec4_sub_float",  (vec4 (*)(const vec4&, const float&))   operator-  );
  function("vec4_mult_vec4",  (vec4 (*)(const vec4&, const vec4&))   operator*  );
  function("vec4_mult_float", (vec4 (*)(const vec4&, const float&))   operator*  );
  function("vec4_div_vec4",   (vec4 (*)(const vec4&, const vec4&))   operator/  );
  function("vec4_div_float",  (vec4 (*)(const vec4&, const float&))   operator/  );

  function("vec4_mult_mat4",   (vec4 (*)(const mat4&, const vec4&))  operator* );

  function("vec4_equal_vec4",        (bool  (*)(const vec4& a, const vec4& b)) operator== );
  function("vec4_notEqual_vec4",     (bool  (*)(const vec4& a, const vec4& b)) operator!= );
  function("vec4_compEqual_vec4",    (bvec4 (*)(const vec4& a, const vec4& b)) equal    );
  function("vec4_compNotEqual_vec4", (bvec4 (*)(const vec4& a, const vec4& b)) notEqual );

  function("vec4_greaterThan_vec4",     (bvec4 (*)(const vec4& a, const vec4& b)) greaterThan      );
  function("vec4_greaterThanEqual_vec4",(bvec4 (*)(const vec4& a, const vec4& b)) greaterThanEqual );
  function("vec4_lessThan_vec4",        (bvec4 (*)(const vec4& a, const vec4& b)) lessThan         );
  function("vec4_lessThanEqual_vec4",   (bvec4 (*)(const vec4& a, const vec4& b)) lessThanEqual    );

  function("vec4_abs",    ( vec4 (*)(const vec4& a)) abs   );
  function("vec4_sign",   ( vec4 (*)(const vec4& a)) sign  );
  function("vec4_floor",  ( vec4 (*)(const vec4& a)) floor );
  function("vec4_trunc",  ( vec4 (*)(const vec4& a)) trunc );
  function("vec4_round",  ( vec4 (*)(const vec4& a)) round );
  function("vec4_ceil",   ( vec4 (*)(const vec4& a)) ceil  );
  function("vec4_fract",  ( vec4 (*)(const vec4& a)) fract );

  // function("vec4s_mod",    ( void (*)(const vec4s& a, const vec4s& b, vec4s& out))     mod         );
  // function("vec4s_modf",   ( void (*)(const vec4s& a, ints& intout, vec4s& fractout))  modf        );
  function("vec4_min_vec4",   ( vec4 (*)(const vec4& a, const vec4& b))   min );
  function("vec4_max_vec4",   ( vec4 (*)(const vec4& a, const vec4& b))   max );

  function("vec4_clamp",      ( vec4 (*)(const vec4& a, const vec4& lo, const vec4& hi))    clamp );

  function("vec4_mix_float",  ( vec4 (*)(const vec4& x, const vec4& y, const float a))    mix         );
  function("vec4_mix_vec4",   ( vec4 (*)(const vec4& x, const vec4& y, const vec4& a))    mix         );

  function("vec4_step",       ( vec4 (*)(const vec4& edge, const vec4& x))                step        );

  function("vec4_smoothstep", ( vec4 (*)(const vec4& lo, const vec4& hi, const vec4& x))  smoothstep  );
  function("vec4_fma",        ( vec4 (*)(const vec4& a, const vec4& b, const vec4& c))    fma         );

  function("vec4_pow",         (vec4 (*)(const vec4& base, const vec4& exponent))  pow                  );
  function("vec4_exp",         (vec4 (*)(const vec4& a))                           exp                  );
  function("vec4_log",         (vec4 (*)(const vec4& a))                           log                  );
  function("vec4_exp2",        (vec4 (*)(const vec4& a))                           exp2                 );
  function("vec4_log2",        (vec4 (*)(const vec4& a))                           log2                 );
  function("vec4_sqrt",        (vec4 (*)(const vec4& a))                           sqrt                 );
  function("vec4_inversesqrt", (vec4 (*)(const vec4& a))                           inversesqrt          );

  function("vec4_dot_vec4",       (float (*)(const vec4& u, const vec4& v)) dot       );
  // function("vec4_cross_vec4",     (vec4 (*)(const vec4& u, const vec4& v)) cross     );
  function("vec4_distance_vec4",  (float (*)(const vec4& u, const vec4& v)) distance  );

  function("vec4_length",     (float (*)(const vec4& u))  length      );
  function("vec4_normalize",  (vec4 (*)(const vec4& u))  normalize   );








  function("vec2s_copy_typed_array",   (void (*)(vec2s& out, const val& js_list ))              copy_typed_array     );
  function("vec2s_copy_list",   (void (*)(vec2s& out, const val& js_list ))                     copy_list     );
  function("vec2s_from_typed_array",   (vec2s (*)(const val& js_list ))                         from_typed_array     );
  function("vec2s_from_list",   (vec2s (*)(const val& js_list ))                                vecs_from_list     );
  function("vec2s_from_vec2s",   (vec2s (*)(const vec2s& a ))                                   copy     );
  function("vec2s_to_list",      (val (*)(const vec2s& a ))                                     to_list     );


  function("vec2s_add_vec2s",  (void (*)(const vec2s&, const vec2s&, vec2s&))  add  );
  function("vec2s_add_floats", (void (*)(const vec2s&, const floats&, vec2s&)) add  );
  function("vec2s_add_vec2",   (void (*)(const vec2s&, const vec2, vec2s&))    add  );
  function("vec2s_add_float",  (void (*)(const vec2s&, const float, vec2s&))   add  );
  function("vec2s_sub_vec2s",  (void (*)(const vec2s&, const vec2s&, vec2s&))  sub  );
  function("vec2s_sub_floats", (void (*)(const vec2s&, const floats&, vec2s&)) sub  );
  function("vec2s_sub_vec2",   (void (*)(const vec2s&, const vec2, vec2s&))    sub  );
  function("vec2s_sub_float",  (void (*)(const vec2s&, const float, vec2s&))   sub  );
  function("vec2s_mult_vec2s", (void (*)(const vec2s&, const vec2s&, vec2s&))  mult );
  function("vec2s_mult_floats",(void (*)(const vec2s&, const floats&, vec2s&)) mult );
  function("vec2s_mult_vec2",  (void (*)(const vec2s&, const vec2, vec2s&))    mult );
  function("vec2s_mult_float", (void (*)(const vec2s&, const float, vec2s&))   mult );
  function("vec2s_div_vec2s",  (void (*)(const vec2s&, const vec2s&, vec2s&))  div  );
  function("vec2s_div_floats", (void (*)(const vec2s&, const floats&, vec2s&)) div  );
  function("vec2s_div_vec2",   (void (*)(const vec2s&, const vec2, vec2s&))    div  );
  function("vec2s_div_float",  (void (*)(const vec2s&, const float, vec2s&))   div  );

  function("vec2s_mult_mat3",   (void (*)(const vec2s&, const mat2&, vec2s&))    mult );

  function("vec2s_get_id",      (vec2 (*)(const vec2s& a, const unsigned int id ))             get      );
  function("vec2s_get_ids",     (void (*)(const vec2s& a, const uints& ids, vec2s& out ))      get      );
  function("vec2s_get_mask",    (void (*)(const vec2s& a, const bools& mask, vec2s& out ))     get      );
  function("vec2s_fill",        (void (*)(vec2s& out, const vec2 a ))                          fill     );
  function("vec2s_fill_ids",    (void (*)(vec2s& out, const uints& ids, const vec2 a ))        fill     );
  function("vec2s_fill_mask",   (void (*)(vec2s& out, const bools& mask, const vec2 a ))       fill     );
  function("vec2s_copy",        (void (*)(vec2s& out, const vec2s& a ))                        copy     );
  function("vec2s_copy_mask",   (void (*)(vec2s& out, const bools& mask, const vec2s& a ))     copy     );
  function("vec2s_copy_id",     (void (*)(vec2s& out, const unsigned int id, const vec2s& a )) copy     );
  function("vec2s_copy_ids",    (void (*)(vec2s& out, const uints& ids, const vec2s& a ))      copy     );
  function("vec2s_set_id",      (void (*)(vec2s& out, const unsigned int id, const vec2 a ))   set      );
  function("vec2s_set_ids",     (void (*)(vec2s& out, const uints& ids, const vec2s& a ))      set      );

  function("vec2s_equal_vec2",        (bool (*)(const vec2s& a, const vec2 b))                 equal    );
  function("vec2s_notEqual_vec2",     (bool (*)(const vec2s& a, const vec2 b))                 notEqual );
  function("vec2s_equal_vec2s",       (bool (*)(const vec2s& a, const vec2s& b))               equal    );
  function("vec2s_notEqual_vec2s",    (bool (*)(const vec2s& a, const vec2s& b))               notEqual );
  function("vec2s_compEqual_vec2",    (void (*)(const vec2s& a, const vec2 b, bools& out))     equal    );
  function("vec2s_compNotEqual_vec2", (void (*)(const vec2s& a, const vec2 b, bools& out))     notEqual );
  function("vec2s_compEqual_vec2s",   (void (*)(const vec2s& a, const vec2s& b, bools& out))   equal    );
  function("vec2s_compNotEqual_vec2s",(void (*)(const vec2s& a, const vec2s& b, bools& out))   notEqual );

  // function("vec2s_greaterThan_float",      (void (*)(const vec2s& a, const float b, bvec2s& out))       greaterThan      );
  // function("vec2s_greaterThanEqual_float", (void (*)(const vec2s& a, const float b, bvec2s& out))       greaterThanEqual );
  // function("vec2s_lessThan_float",         (void (*)(const vec2s& a, const float b, bvec2s& out))       lessThan         );
  // function("vec2s_lessThanEqual_float",    (void (*)(const vec2s& a, const float b, bvec2s& out))       lessThanEqual    );
  // function("vec2s_greaterThan_floats",     (void (*)(const vec2s& a, const floats& b, bvec2s& out))     greaterThan      );
  // function("vec2s_greaterThanEqual_floats",(void (*)(const vec2s& a, const floats& b, bvec2s& out))     greaterThanEqual );
  // function("vec2s_lessThan_floats",        (void (*)(const vec2s& a, const floats& b, bvec2s& out))     lessThan         );
  // function("vec2s_lessThanEqual_floats",   (void (*)(const vec2s& a, const floats& b, bvec2s& out))     lessThanEqual    );

  function("vec2s_greaterThan_vec2",      (void (*)(const vec2s& a, const vec2 b, bvec2s& out))      greaterThan      );
  function("vec2s_greaterThanEqual_vec2", (void (*)(const vec2s& a, const vec2 b, bvec2s& out))      greaterThanEqual );
  function("vec2s_lessThan_vec2",         (void (*)(const vec2s& a, const vec2 b, bvec2s& out))      lessThan         );
  function("vec2s_lessThanEqual_vec2",    (void (*)(const vec2s& a, const vec2 b, bvec2s& out))      lessThanEqual    );
  function("vec2s_greaterThan_vec2s",     (void (*)(const vec2s& a, const vec2s& b, bvec2s& out))    greaterThan      );
  function("vec2s_greaterThanEqual_vec2s",(void (*)(const vec2s& a, const vec2s& b, bvec2s& out))    greaterThanEqual );
  function("vec2s_lessThan_vec2s",        (void (*)(const vec2s& a, const vec2s& b, bvec2s& out))    lessThan         );
  function("vec2s_lessThanEqual_vec2s",   (void (*)(const vec2s& a, const vec2s& b, bvec2s& out))    lessThanEqual    );

  function("vec2s_abs",    ( void (*)(const vec2s& a, vec2s& out))    abs                                               );
  function("vec2s_sign",   ( void (*)(const vec2s& a, vec2s& out))    sign                                              );
  function("vec2s_floor",  ( void (*)(const vec2s& a, vec2s& out))    floor                                             );
  function("vec2s_trunc",  ( void (*)(const vec2s& a, vec2s& out))    trunc                                             );
  function("vec2s_round",  ( void (*)(const vec2s& a, vec2s& out))    round                                             );
  function("vec2s_ceil",   ( void (*)(const vec2s& a, vec2s& out))    ceil                                              );
  function("vec2s_fract",  ( void (*)(const vec2s& a, vec2s& out))    fract                                             );

  // function("vec2s_mod",    ( void (*)(const vec2s& a, const vec2s& b, vec2s& out))     mod                          );
  // function("vec2s_modf",   ( void (*)(const vec2s& a, ints& intout, vec2s& fractout))  modf                         );
  function("vec2s_min_vec2s",    ( void (*)(const vec2s& a, const vec2s& b, vec2s& out))   min                       );
  function("vec2s_max_vec2s",    ( void (*)(const vec2s& a, const vec2s& b, vec2s& out))   max                       );

  function("vec2s_min_vec2",    ( void (*)(const vec2s& a, const vec2 b, vec2s& out))     min                        );
  function("vec2s_max_vec2",    ( void (*)(const vec2s& a, const vec2 b, vec2s& out))     max                        );

  function("vec2s_min",    ( vec2(*)(const vec2s& a))                                       min                        );
  function("vec2s_max",    ( vec2(*)(const vec2s& a))                                       max                        );

  function("vec2s_clamp_11",  ( void (*)(const vec2s& a, const vec2 lo, const vec2 hi, vec2s& out))          clamp     );
  function("vec2s_clamp_1m",  ( void (*)(const vec2s& a, const vec2 lo, const vec2s& hi, vec2s& out))        clamp     );
  function("vec2s_clamp_m1",  ( void (*)(const vec2s& a, const vec2s& lo, const vec2 hi, vec2s& out))        clamp     );
  function("vec2s_clamp_mm",  ( void (*)(const vec2s& a, const vec2s& lo, const vec2s& hi, vec2s& out))      clamp     );

  function("vec2s_mix_float_mmm",  ( void (*)(const vec2s& x, const vec2s& y, const floats& a, vec2s& out)) mix       );
  function("vec2s_mix_float_mm1",  ( void (*)(const vec2s& x, const vec2s& y, const float a, vec2s& out))   mix       );
  function("vec2s_mix_float_m1m",  ( void (*)(const vec2s& x, const vec2 y, const floats& a, vec2s& out))   mix       );
  function("vec2s_mix_float_m11",  ( void (*)(const vec2s& x, const vec2 y, const float a, vec2s& out))     mix       );
  function("vec2s_mix_float_1mm",  ( void (*)(const vec2 x, const vec2s& y, const floats& a, vec2s& out))   mix       );
  function("vec2s_mix_float_1m1",  ( void (*)(const vec2 x, const vec2s& y, const float a, vec2s& out))     mix       );
  function("vec2s_mix_float_11m",  ( void (*)(const vec2 x, const vec2 y, const floats& a, vec2s& out))     mix       );

  function("vec2s_mix_vec2_mmm",    ( void (*)(const vec2s& x, const vec2s& y, const vec2s& a, vec2s& out))     mix         );
  function("vec2s_mix_vec2_mm1",    ( void (*)(const vec2s& x, const vec2s& y, const vec2 a, vec2s& out))       mix         );
  function("vec2s_mix_vec2_m1m",    ( void (*)(const vec2s& x, const vec2 y, const vec2s& a, vec2s& out))       mix         );
  function("vec2s_mix_vec2_m11",    ( void (*)(const vec2s& x, const vec2 y, const vec2 a, vec2s& out))         mix         );
  function("vec2s_mix_vec2_1mm",    ( void (*)(const vec2 x, const vec2s& y, const vec2s& a, vec2s& out))       mix         );
  function("vec2s_mix_vec2_1m1",    ( void (*)(const vec2 x, const vec2s& y, const vec2 a, vec2s& out))         mix         );
  function("vec2s_mix_vec2_11m",    ( void (*)(const vec2 x, const vec2 y, const vec2s& a, vec2s& out))         mix         );

  function("vec2s_step_mm",   ( void (*)(const vec2s& edge, const vec2s& x, vec2s& out))                       step        );
  function("vec2s_step_m1",   ( void (*)(const vec2s& edge, const vec2 x, vec2s& out))                         step        );
  function("vec2s_step_1m",   ( void (*)(const vec2 edge, const vec2s& x, vec2s& out))                         step        );

  function("vec2s_smoothstep_mmm",  ( void (*)(const vec2s& lo, const vec2s& hi, const vec2s& x, vec2s& out))  smoothstep  );
  function("vec2s_smoothstep_1mm",  ( void (*)(const vec2 lo, const vec2s& hi, const vec2s& x, vec2s& out))    smoothstep  );
  function("vec2s_smoothstep_m1m",  ( void (*)(const vec2s& lo, vec2 hi, const vec2s& x, vec2s& out))          smoothstep  );
  function("vec2s_smoothstep_11m",  ( void (*)(const vec2 lo, const vec2 hi, const vec2s& x, vec2s& out))      smoothstep  );
  function("vec2s_smoothstep_mm1",  ( void (*)(const vec2s& lo, const vec2s& hi, const vec2 x, vec2s& out))    smoothstep  );
  function("vec2s_smoothstep_1m1",  ( void (*)(const vec2 lo, const vec2s& hi, const vec2 x, vec2s& out))      smoothstep  );
  function("vec2s_smoothstep_m11",  ( void (*)(const vec2s& lo, const vec2 hi, const vec2 x, vec2s& out))      smoothstep  );
  // function("vec2s_isnan",  ( void (*)(const vec2s& x, bools& out))                                          isnan       );
  // function("vec2s_isinf",  ( void (*)(const vec2s& x, bools& out))                                          isinf       );
  function("vec2s_fma_mmm",    ( void (*)(const vec2s& a, const vec2s& b, const vec2s& c, vec2s& out))         fma         );
  function("vec2s_fma_1mm",    ( void (*)(const vec2 a, const vec2s& b, const vec2s& c, vec2s& out))           fma         );
  function("vec2s_fma_m1m",    ( void (*)(const vec2s& a, vec2 b, const vec2s& c, vec2s& out))                 fma         );
  function("vec2s_fma_11m",    ( void (*)(const vec2 a, const vec2 b, const vec2s& c, vec2s& out))             fma         );
  function("vec2s_fma_mm1",    ( void (*)(const vec2s& a, const vec2s& b, const vec2 c, vec2s& out))           fma         );
  function("vec2s_fma_1m1",    ( void (*)(const vec2 a, const vec2s& b, const vec2 c, vec2s& out))             fma         );
  function("vec2s_fma_m11",    ( void (*)(const vec2s& a, const vec2 b, const vec2 c, vec2s& out))             fma         );

  // function("vec2s_pow",         (void (*)(const vec2s& base, const vec2s& exponent, vec2s& out)) pow                  );
  // function("vec2s_exp",         (void (*)(const vec2s& a, vec2s& out))                           exp                  );
  // function("vec2s_log",         (void (*)(const vec2s& a, vec2s& out))                           log                  );
  // function("vec2s_exp2",        (void (*)(const vec2s& a, vec2s& out))                           exp2                 );
  // function("vec2s_log2",        (void (*)(const vec2s& a, vec2s& out))                           log2                 );
  // function("vec2s_sqrt",        (void (*)(const vec2s& a, vec2s& out))                           sqrt                 );
  // function("vec2s_inversesqrt", (void (*)(const vec2s& a, vec2s& out))                           inversesqrt          );

  // function("vec2s_min_id",    (unsigned int (*)(const vec2s& a))                                 min_id               );
  // function("vec2s_max_id",    (unsigned int (*)(const vec2s& a))                                 max_id               );
  function("vec2s_sum",       (vec2 (*)(const vec2s& a))                                            sum                  );
  function("vec2s_mean",      (vec2 (*)(const vec2s& a))                                            mean                 );
  // function("vec2s_median",    (vec2 (*)(const vec2s& a))                                         median               );
  // function("vec2s_mode",      (vec2 (*)(const vec2s& a))                                         mode                 );
  function("vec2s_weighted_average", (vec2 (*)(const vec2s& a, const floats& weights))              weighted_average     );
  function("vec2s_rescale",   (void (*)(const vec2s& a, vec2s& out, vec2 min_new, vec2 max_new))    rescale              );

  function("vec2s_dot_vec2",        (void (*)(const vec2s& u, const vec2 v, floats& out))   dot       );
  function("vec2s_cross_vec2",      (void (*)(const vec2s& u, const vec2 v, floats& out))    cross     );
  function("vec2s_distance_vec2",   (void (*)(const vec2s& u, const vec2 v, floats& out))   distance  );
  function("vec2s_dot_vec2s",       (void (*)(const vec2s& u, const vec2s& v, floats& out)) dot       );
  function("vec2s_cross_vec2s",     (void (*)(const vec2s& u, const vec2s& v, floats& out))  cross     );
  function("vec2s_distance_vec2s",  (void (*)(const vec2s& u, const vec2s& v, floats& out)) distance  );

  function("vec2s_length",     (void (*)(const vec2s& u, floats& out))  length      );
  function("vec2s_normalize",  (void (*)(const vec2s& u, vec2s& out))   normalize   );














  function("vec3s_copy_typed_array",   (void (*)(vec3s& out, const val& js_list ))              copy_typed_array     );
  function("vec3s_copy_list",   (void (*)(vec3s& out, const val& js_list ))                     copy_list     );
  function("vec3s_from_typed_array",   (vec3s (*)(const val& js_list ))                         from_typed_array     );
  function("vec3s_from_list",    (vec3s (*)(const val& js_list ))                               vecs_from_list     );
  function("vec3s_from_vec3s",   (vec3s (*)(const vec3s& a ))                                   copy     );
  function("vec3s_to_list",      (val (*)(const vec3s& a ))                                     to_list     );


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
  function("vec3s_distance_vec3",   (void (*)(const vec3s& u, const vec3 v, floats& out))   distance  );
  function("vec3s_dot_vec3s",       (void (*)(const vec3s& u, const vec3s& v, floats& out)) dot       );
  function("vec3s_cross_vec3s",     (void (*)(const vec3s& u, const vec3s& v, vec3s& out))  cross     );
  function("vec3s_distance_vec3s",  (void (*)(const vec3s& u, const vec3s& v, floats& out)) distance  );

  function("vec3s_length",     (void (*)(const vec3s& u, floats& out))  length      );
  function("vec3s_normalize",  (void (*)(const vec3s& u, vec3s& out))   normalize   );













  function("vec4s_copy_typed_array",   (void (*)(vec4s& out, const val& js_list ))              copy_typed_array     );
  function("vec4s_copy_list",   (void (*)(vec4s& out, const val& js_list ))                     copy_list     );
  function("vec4s_from_typed_array",   (vec4s (*)(const val& js_list ))                         from_typed_array     );
  function("vec4s_from_list",   (vec4s (*)(const val& js_list ))                                vecs_from_list     );
  function("vec4s_from_vec4s",   (vec4s (*)(const vec4s& a ))                                   copy     );
  function("vec4s_to_list",      (val (*)(const vec4s& a ))                                     to_list     );


  function("vec4s_add_vec4s",  (void (*)(const vec4s&, const vec4s&, vec4s&))  add  );
  function("vec4s_add_floats", (void (*)(const vec4s&, const floats&, vec4s&)) add  );
  function("vec4s_add_vec4",   (void (*)(const vec4s&, const vec4, vec4s&))    add  );
  function("vec4s_add_float",  (void (*)(const vec4s&, const float, vec4s&))   add  );
  function("vec4s_sub_vec4s",  (void (*)(const vec4s&, const vec4s&, vec4s&))  sub  );
  function("vec4s_sub_floats", (void (*)(const vec4s&, const floats&, vec4s&)) sub  );
  function("vec4s_sub_vec4",   (void (*)(const vec4s&, const vec4, vec4s&))    sub  );
  function("vec4s_sub_float",  (void (*)(const vec4s&, const float, vec4s&))   sub  );
  function("vec4s_mult_vec4s", (void (*)(const vec4s&, const vec4s&, vec4s&))  mult );
  function("vec4s_mult_floats",(void (*)(const vec4s&, const floats&, vec4s&)) mult );
  function("vec4s_mult_vec4",  (void (*)(const vec4s&, const vec4, vec4s&))    mult );
  function("vec4s_mult_float", (void (*)(const vec4s&, const float, vec4s&))   mult );
  function("vec4s_div_vec4s",  (void (*)(const vec4s&, const vec4s&, vec4s&))  div  );
  function("vec4s_div_floats", (void (*)(const vec4s&, const floats&, vec4s&)) div  );
  function("vec4s_div_vec4",   (void (*)(const vec4s&, const vec4, vec4s&))    div  );
  function("vec4s_div_float",  (void (*)(const vec4s&, const float, vec4s&))   div  );

  function("vec4s_mult_mat3",   (void (*)(const vec4s&, const mat4&, vec4s&))    mult );

  function("vec4s_get_id",      (vec4 (*)(const vec4s& a, const unsigned int id ))             get      );
  function("vec4s_get_ids",     (void (*)(const vec4s& a, const uints& ids, vec4s& out ))      get      );
  function("vec4s_get_mask",    (void (*)(const vec4s& a, const bools& mask, vec4s& out ))     get      );
  function("vec4s_fill",        (void (*)(vec4s& out, const vec4 a ))                          fill     );
  function("vec4s_fill_ids",    (void (*)(vec4s& out, const uints& ids, const vec4 a ))        fill     );
  function("vec4s_fill_mask",   (void (*)(vec4s& out, const bools& mask, const vec4 a ))       fill     );
  function("vec4s_copy",        (void (*)(vec4s& out, const vec4s& a ))                        copy     );
  function("vec4s_copy_mask",   (void (*)(vec4s& out, const bools& mask, const vec4s& a ))     copy     );
  function("vec4s_copy_id",     (void (*)(vec4s& out, const unsigned int id, const vec4s& a )) copy     );
  function("vec4s_copy_ids",    (void (*)(vec4s& out, const uints& ids, const vec4s& a ))      copy     );
  function("vec4s_set_id",      (void (*)(vec4s& out, const unsigned int id, const vec4 a ))   set      );
  function("vec4s_set_ids",     (void (*)(vec4s& out, const uints& ids, const vec4s& a ))      set      );

  function("vec4s_equal_vec4",        (bool (*)(const vec4s& a, const vec4 b))                 equal    );
  function("vec4s_notEqual_vec4",     (bool (*)(const vec4s& a, const vec4 b))                 notEqual );
  function("vec4s_equal_vec4s",       (bool (*)(const vec4s& a, const vec4s& b))               equal    );
  function("vec4s_notEqual_vec4s",    (bool (*)(const vec4s& a, const vec4s& b))               notEqual );
  function("vec4s_compEqual_vec4",    (void (*)(const vec4s& a, const vec4 b, bools& out))     equal    );
  function("vec4s_compNotEqual_vec4", (void (*)(const vec4s& a, const vec4 b, bools& out))     notEqual );
  function("vec4s_compEqual_vec4s",   (void (*)(const vec4s& a, const vec4s& b, bools& out))   equal    );
  function("vec4s_compNotEqual_vec4s",(void (*)(const vec4s& a, const vec4s& b, bools& out))   notEqual );

  // function("vec4s_greaterThan_float",      (void (*)(const vec4s& a, const float b, bvec4s& out))       greaterThan      );
  // function("vec4s_greaterThanEqual_float", (void (*)(const vec4s& a, const float b, bvec4s& out))       greaterThanEqual );
  // function("vec4s_lessThan_float",         (void (*)(const vec4s& a, const float b, bvec4s& out))       lessThan         );
  // function("vec4s_lessThanEqual_float",    (void (*)(const vec4s& a, const float b, bvec4s& out))       lessThanEqual    );
  // function("vec4s_greaterThan_floats",     (void (*)(const vec4s& a, const floats& b, bvec4s& out))     greaterThan      );
  // function("vec4s_greaterThanEqual_floats",(void (*)(const vec4s& a, const floats& b, bvec4s& out))     greaterThanEqual );
  // function("vec4s_lessThan_floats",        (void (*)(const vec4s& a, const floats& b, bvec4s& out))     lessThan         );
  // function("vec4s_lessThanEqual_floats",   (void (*)(const vec4s& a, const floats& b, bvec4s& out))     lessThanEqual    );

  function("vec4s_greaterThan_vec4",      (void (*)(const vec4s& a, const vec4 b, bvec4s& out))      greaterThan      );
  function("vec4s_greaterThanEqual_vec4", (void (*)(const vec4s& a, const vec4 b, bvec4s& out))      greaterThanEqual );
  function("vec4s_lessThan_vec4",         (void (*)(const vec4s& a, const vec4 b, bvec4s& out))      lessThan         );
  function("vec4s_lessThanEqual_vec4",    (void (*)(const vec4s& a, const vec4 b, bvec4s& out))      lessThanEqual    );
  function("vec4s_greaterThan_vec4s",     (void (*)(const vec4s& a, const vec4s& b, bvec4s& out))    greaterThan      );
  function("vec4s_greaterThanEqual_vec4s",(void (*)(const vec4s& a, const vec4s& b, bvec4s& out))    greaterThanEqual );
  function("vec4s_lessThan_vec4s",        (void (*)(const vec4s& a, const vec4s& b, bvec4s& out))    lessThan         );
  function("vec4s_lessThanEqual_vec4s",   (void (*)(const vec4s& a, const vec4s& b, bvec4s& out))    lessThanEqual    );

  function("vec4s_abs",    ( void (*)(const vec4s& a, vec4s& out))    abs                                               );
  function("vec4s_sign",   ( void (*)(const vec4s& a, vec4s& out))    sign                                              );
  function("vec4s_floor",  ( void (*)(const vec4s& a, vec4s& out))    floor                                             );
  function("vec4s_trunc",  ( void (*)(const vec4s& a, vec4s& out))    trunc                                             );
  function("vec4s_round",  ( void (*)(const vec4s& a, vec4s& out))    round                                             );
  function("vec4s_ceil",   ( void (*)(const vec4s& a, vec4s& out))    ceil                                              );
  function("vec4s_fract",  ( void (*)(const vec4s& a, vec4s& out))    fract                                             );

  // function("vec4s_mod",    ( void (*)(const vec4s& a, const vec4s& b, vec4s& out))     mod                          );
  // function("vec4s_modf",   ( void (*)(const vec4s& a, ints& intout, vec4s& fractout))  modf                         );
  function("vec4s_min_vec4s",    ( void (*)(const vec4s& a, const vec4s& b, vec4s& out))   min                       );
  function("vec4s_max_vec4s",    ( void (*)(const vec4s& a, const vec4s& b, vec4s& out))   max                       );

  function("vec4s_min_vec4",    ( void (*)(const vec4s& a, const vec4 b, vec4s& out))     min                        );
  function("vec4s_max_vec4",    ( void (*)(const vec4s& a, const vec4 b, vec4s& out))     max                        );

  function("vec4s_min",    ( vec4(*)(const vec4s& a))                                       min                        );
  function("vec4s_max",    ( vec4(*)(const vec4s& a))                                       max                        );

  function("vec4s_clamp_11",  ( void (*)(const vec4s& a, const vec4 lo, const vec4 hi, vec4s& out))          clamp     );
  function("vec4s_clamp_1m",  ( void (*)(const vec4s& a, const vec4 lo, const vec4s& hi, vec4s& out))        clamp     );
  function("vec4s_clamp_m1",  ( void (*)(const vec4s& a, const vec4s& lo, const vec4 hi, vec4s& out))        clamp     );
  function("vec4s_clamp_mm",  ( void (*)(const vec4s& a, const vec4s& lo, const vec4s& hi, vec4s& out))      clamp     );

  function("vec4s_mix_float_mmm",  ( void (*)(const vec4s& x, const vec4s& y, const floats& a, vec4s& out)) mix       );
  function("vec4s_mix_float_mm1",  ( void (*)(const vec4s& x, const vec4s& y, const float a, vec4s& out))   mix       );
  function("vec4s_mix_float_m1m",  ( void (*)(const vec4s& x, const vec4 y, const floats& a, vec4s& out))   mix       );
  function("vec4s_mix_float_m11",  ( void (*)(const vec4s& x, const vec4 y, const float a, vec4s& out))     mix       );
  function("vec4s_mix_float_1mm",  ( void (*)(const vec4 x, const vec4s& y, const floats& a, vec4s& out))   mix       );
  function("vec4s_mix_float_1m1",  ( void (*)(const vec4 x, const vec4s& y, const float a, vec4s& out))     mix       );
  function("vec4s_mix_float_11m",  ( void (*)(const vec4 x, const vec4 y, const floats& a, vec4s& out))     mix       );

  function("vec4s_mix_vec4_mmm",    ( void (*)(const vec4s& x, const vec4s& y, const vec4s& a, vec4s& out))     mix         );
  function("vec4s_mix_vec4_mm1",    ( void (*)(const vec4s& x, const vec4s& y, const vec4 a, vec4s& out))       mix         );
  function("vec4s_mix_vec4_m1m",    ( void (*)(const vec4s& x, const vec4 y, const vec4s& a, vec4s& out))       mix         );
  function("vec4s_mix_vec4_m11",    ( void (*)(const vec4s& x, const vec4 y, const vec4 a, vec4s& out))         mix         );
  function("vec4s_mix_vec4_1mm",    ( void (*)(const vec4 x, const vec4s& y, const vec4s& a, vec4s& out))       mix         );
  function("vec4s_mix_vec4_1m1",    ( void (*)(const vec4 x, const vec4s& y, const vec4 a, vec4s& out))         mix         );
  function("vec4s_mix_vec4_11m",    ( void (*)(const vec4 x, const vec4 y, const vec4s& a, vec4s& out))         mix         );

  function("vec4s_step_mm",   ( void (*)(const vec4s& edge, const vec4s& x, vec4s& out))                       step        );
  function("vec4s_step_m1",   ( void (*)(const vec4s& edge, const vec4 x, vec4s& out))                         step        );
  function("vec4s_step_1m",   ( void (*)(const vec4 edge, const vec4s& x, vec4s& out))                         step        );

  function("vec4s_smoothstep_mmm",  ( void (*)(const vec4s& lo, const vec4s& hi, const vec4s& x, vec4s& out))  smoothstep  );
  function("vec4s_smoothstep_1mm",  ( void (*)(const vec4 lo, const vec4s& hi, const vec4s& x, vec4s& out))    smoothstep  );
  function("vec4s_smoothstep_m1m",  ( void (*)(const vec4s& lo, vec4 hi, const vec4s& x, vec4s& out))          smoothstep  );
  function("vec4s_smoothstep_11m",  ( void (*)(const vec4 lo, const vec4 hi, const vec4s& x, vec4s& out))      smoothstep  );
  function("vec4s_smoothstep_mm1",  ( void (*)(const vec4s& lo, const vec4s& hi, const vec4 x, vec4s& out))    smoothstep  );
  function("vec4s_smoothstep_1m1",  ( void (*)(const vec4 lo, const vec4s& hi, const vec4 x, vec4s& out))      smoothstep  );
  function("vec4s_smoothstep_m11",  ( void (*)(const vec4s& lo, const vec4 hi, const vec4 x, vec4s& out))      smoothstep  );
  // function("vec4s_isnan",  ( void (*)(const vec4s& x, bools& out))                                          isnan       );
  // function("vec4s_isinf",  ( void (*)(const vec4s& x, bools& out))                                          isinf       );
  function("vec4s_fma_mmm",    ( void (*)(const vec4s& a, const vec4s& b, const vec4s& c, vec4s& out))         fma         );
  function("vec4s_fma_1mm",    ( void (*)(const vec4 a, const vec4s& b, const vec4s& c, vec4s& out))           fma         );
  function("vec4s_fma_m1m",    ( void (*)(const vec4s& a, vec4 b, const vec4s& c, vec4s& out))                 fma         );
  function("vec4s_fma_11m",    ( void (*)(const vec4 a, const vec4 b, const vec4s& c, vec4s& out))             fma         );
  function("vec4s_fma_mm1",    ( void (*)(const vec4s& a, const vec4s& b, const vec4 c, vec4s& out))           fma         );
  function("vec4s_fma_1m1",    ( void (*)(const vec4 a, const vec4s& b, const vec4 c, vec4s& out))             fma         );
  function("vec4s_fma_m11",    ( void (*)(const vec4s& a, const vec4 b, const vec4 c, vec4s& out))             fma         );

  // function("vec4s_pow",         (void (*)(const vec4s& base, const vec4s& exponent, vec4s& out)) pow                  );
  // function("vec4s_exp",         (void (*)(const vec4s& a, vec4s& out))                           exp                  );
  // function("vec4s_log",         (void (*)(const vec4s& a, vec4s& out))                           log                  );
  // function("vec4s_exp2",        (void (*)(const vec4s& a, vec4s& out))                           exp2                 );
  // function("vec4s_log2",        (void (*)(const vec4s& a, vec4s& out))                           log2                 );
  // function("vec4s_sqrt",        (void (*)(const vec4s& a, vec4s& out))                           sqrt                 );
  // function("vec4s_inversesqrt", (void (*)(const vec4s& a, vec4s& out))                           inversesqrt          );

  // function("vec4s_min_id",    (unsigned int (*)(const vec4s& a))                                 min_id               );
  // function("vec4s_max_id",    (unsigned int (*)(const vec4s& a))                                 max_id               );
  function("vec4s_sum",       (vec4 (*)(const vec4s& a))                                            sum                  );
  function("vec4s_mean",      (vec4 (*)(const vec4s& a))                                            mean                 );
  // function("vec4s_median",    (vec4 (*)(const vec4s& a))                                         median               );
  // function("vec4s_mode",      (vec4 (*)(const vec4s& a))                                         mode                 );
  function("vec4s_weighted_average", (vec4 (*)(const vec4s& a, const floats& weights))              weighted_average     );
  function("vec4s_rescale",   (void (*)(const vec4s& a, vec4s& out, vec4 min_new, vec4 max_new))    rescale              );

  function("vec4s_dot_vec4",        (void (*)(const vec4s& u, const vec4 v, floats& out))   dot       );
  function("vec4s_distance_vec4",   (void (*)(const vec4s& u, const vec4 v, floats& out))   distance  );
  function("vec4s_dot_vec4s",       (void (*)(const vec4s& u, const vec4s& v, floats& out)) dot       );
  function("vec4s_distance_vec4s",  (void (*)(const vec4s& u, const vec4s& v, floats& out)) distance  );

  function("vec4s_length",     (void (*)(const vec4s& u, floats& out))  length      );
  function("vec4s_normalize",  (void (*)(const vec4s& u, vec4s& out))   normalize   );






















}
