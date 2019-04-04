
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
#include "rasters/Grid.hpp"

#include <emscripten/bind.h>

using namespace emscripten;
using namespace composites;
using namespace rasters;

template<typename T>
void copy_from_typed_array(many<T>& out, const val& typed_array)
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
  copy_from_typed_array(out, typed_array);
  return out;
}

// template<typename T>
// void copy_to_typed_array(many<T>& a, val& out)
// {
//   for (unsigned int i = 0; i < a.size(); ++i)
//   {
//     out.set(i, a[i]);
//   }
// }

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

  class_<uvec2>("uvec2")
      .constructor()
      .constructor<unsigned int>()
      .constructor<unsigned int, unsigned int>()
      .property("x", &uvec2::x)
      .property("y", &uvec2::y)
  ;

  class_<uvec3>("uvec3")
      .constructor()
      .constructor<unsigned int>()
      .constructor<unsigned int, unsigned int, unsigned int>()
      .property("x", &uvec3::x)
      .property("y", &uvec3::y)
      .property("z", &uvec3::z)
  ;

  class_<uvec4>("uvec4")
      .constructor()
      .constructor<unsigned int>()
      .constructor<unsigned int, unsigned int, unsigned int, unsigned int>()
      .property("x", &uvec4::x)
      .property("y", &uvec4::y)
      .property("z", &uvec4::z)
      .property("w", &uvec4::z)
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
      .constructor<unsigned int, unsigned int>()
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

  class_<uvec2s>("uvec2s")
      .constructor<unsigned int>()
      .constructor<unsigned int, uvec2>()
      .function("size", &uvec2s::size)
  ;

  class_<uvec3s>("uvec3s")
      .constructor<unsigned int>()
      .constructor<unsigned int, uvec3>()
      .function("size", &uvec3s::size)
  ;

  class_<uvec4s>("uvec4s")
      .constructor<unsigned int>()
      .constructor<unsigned int, uvec4>()
      .function("size", &uvec4s::size)
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

  class_<Grid>("Grid")
      .constructor<const vec3s&, const uvec3s&>()
      .property("buffer_array_vertex_ids",&Grid::buffer_array_vertex_ids)
      // .property("vertex_neighbor_ids",    &Grid::vertex_neighbor_ids)
      // .property("vertex_neighbor_count",  &Grid::vertex_neighbor_count)
      .property("vertex_positions",       &Grid::vertex_positions)
      .property("vertex_normals",         &Grid::vertex_normals)
      .property("vertex_areas",           &Grid::vertex_areas)
      .property("vertex_average_area",    &Grid::vertex_average_area)
      .property("face_vertex_ids",        &Grid::face_vertex_ids)
      .property("face_vertex_id_a",       &Grid::face_vertex_id_a)
      .property("face_vertex_id_b",       &Grid::face_vertex_id_b)
      .property("face_vertex_id_c",       &Grid::face_vertex_id_c)
      // .property("face_edge_id_a",         &Grid::face_edge_id_a)
      // .property("face_edge_id_b",         &Grid::face_edge_id_b)
      // .property("face_edge_id_c",         &Grid::face_edge_id_c)
      .property("face_endpoint_a",        &Grid::face_endpoint_a)
      .property("face_endpoint_b",        &Grid::face_endpoint_b)
      .property("face_endpoint_c",        &Grid::face_endpoint_c)
      .property("face_midpoints",         &Grid::face_midpoints)
      .property("face_normals",           &Grid::face_normals)
      .property("face_areas",             &Grid::face_areas)
      .property("face_average_area",      &Grid::face_average_area)
      // .property("edge_vertex_ids",        &Grid::edge_vertex_ids)
      .property("edge_vertex_ids",        &Grid::edge_vertex_ids)
      .property("edge_vertex_id_a",       &Grid::edge_vertex_id_a)
      .property("edge_vertex_id_b",       &Grid::edge_vertex_id_b)
      // .property("edge_face_id_a",         &Grid::edge_face_id_a)
      // .property("edge_face_id_b",         &Grid::edge_face_id_b)
      .property("edge_endpoint_a",        &Grid::edge_endpoint_a)
      .property("edge_endpoint_b",        &Grid::edge_endpoint_b)
      .property("edge_midpoints",         &Grid::edge_midpoints)
      .property("edge_distances",         &Grid::edge_distances)
      .property("edge_average_distance",  &Grid::edge_average_distance)
      .property("edge_normals",           &Grid::edge_normals)
      // .property("edge_areas",             &Grid::edge_areas)
      // .property("arrow_vertex_ids",       &Grid::arrow_vertex_ids)
      .property("arrow_vertex_ids",       &Grid::arrow_vertex_ids)
      .property("arrow_vertex_id_from",   &Grid::arrow_vertex_id_from)
      .property("arrow_vertex_id_to",     &Grid::arrow_vertex_id_to)
      // .property("arrow_face_id_a",        &Grid::arrow_face_id_a)
      // .property("arrow_face_id_b",        &Grid::arrow_face_id_b)
      .property("arrow_endpoint_from",    &Grid::arrow_endpoint_from)
      .property("arrow_endpoint_to",      &Grid::arrow_endpoint_to)
      .property("arrow_midpoints",        &Grid::arrow_midpoints)
      .property("arrow_offsets",          &Grid::arrow_offsets)
      .property("arrow_distances",        &Grid::arrow_distances)
      .property("arrow_average_distance", &Grid::arrow_average_distance)
      .property("arrow_normals",          &Grid::arrow_normals)
      // .property("arrow_areas",            &Grid::arrow_areas)
  ;

  function("bools_copy_from_typed_array",   (void (*)(bools& out, const val& js_list ))              copy_from_typed_array     );
  //function("bools_copy_to_typed_array",   (void (*)(bools& out, val& js_list ))                copy_to_typed_array     );
  function("bools_copy_list",   (void (*)(bools& out, const val& js_list ))                     copy_list     );
  function("bools_from_typed_array",   (bools (*)(const val& js_list ))                         from_typed_array     );
  function("bools_from_list",   (bools (*)(const val& js_list ))                                from_list     );
  function("bools_from_bools",  (bools (*)(const bools& a ))                                    copy     );
  function("bools_to_list",     (val (*)(const bools& a ))                                      to_list     );



  function("ints_copy_from_typed_array",   (void (*)(ints& out, const val& js_list ))              copy_from_typed_array     );
  //function("ints_copy_to_typed_array",   (void (*)(ints& out, val& js_list ))                copy_to_typed_array     );
  function("ints_copy_list",   (void (*)(ints& out, const val& js_list ))                     copy_list     );
  function("ints_from_typed_array",   (ints (*)(const val& js_list ))                         from_typed_array     );
  function("ints_from_list",   (ints (*)(const val& js_list ))                                from_list     );
  function("ints_from_ints",   (ints (*)(const ints& a ))                                     copy     );
  function("ints_to_list",     (val (*)(const ints& a ))                                      to_list     );



  function("uints_copy_from_typed_array",   (void (*)(uints& out, const val& js_list ))              copy_from_typed_array     );
  //function("uints_copy_to_typed_array",   (void (*)(uints& out, val& js_list ))                copy_to_typed_array     );
  function("uints_copy_list",   (void (*)(uints& out, const val& js_list ))                     copy_list     );
  function("uints_from_typed_array",   (uints (*)(const val& js_list ))                         from_typed_array     );
  function("uints_from_list",    (uints (*)(const val& js_list ))                               from_list     );
  function("uints_from_uints",   (uints (*)(const uints& a ))                                   copy     );
  function("uints_to_list",      (val (*)(const uints& a ))                                     to_list     );



  function("floats_copy_from_typed_array",   (void (*)(floats& out, const val& js_list ))              copy_from_typed_array     );
  //function("floats_copy_to_typed_array",   (void (*)(floats& out, val& js_list ))                copy_to_typed_array     );
  function("floats_copy_list",   (void (*)(floats& out, const val& js_list ))                     copy_list     );
  function("floats_from_typed_array",   (floats (*)(const val& js_list ))                         from_typed_array     );
  function("floats_from_list",   (floats (*)(const val& js_list ))                                from_list     );
  function("floats_from_floats", (floats (*)(const floats& a ))                                   copy     );
  function("floats_to_list",      (val (*)(const floats& a ))                                     to_list     );



  function("vec2s_copy_from_typed_array",   (void (*)(vec2s& out, const val& js_list ))              copy_from_typed_array     );
  function("vec2s_copy_list",   (void (*)(vec2s& out, const val& js_list ))                     copy_list     );
  function("vec2s_from_typed_array",   (vec2s (*)(const val& js_list ))                         from_typed_array     );
  function("vec2s_from_list",   (vec2s (*)(const val& js_list ))                                vecs_from_list     );
  function("vec2s_from_vec2s",   (vec2s (*)(const vec2s& a ))                                   copy     );
  function("vec2s_to_list",      (val (*)(const vec2s& a ))                                     to_list     );



  function("vec3s_copy_from_typed_array",   (void (*)(vec3s& out, const val& js_list ))              copy_from_typed_array     );
  function("vec3s_copy_list",   (void (*)(vec3s& out, const val& js_list ))                     copy_list     );
  function("vec3s_from_typed_array",   (vec3s (*)(const val& js_list ))                         from_typed_array     );
  function("vec3s_from_list",    (vec3s (*)(const val& js_list ))                               vecs_from_list     );
  function("vec3s_from_vec3s",   (vec3s (*)(const vec3s& a ))                                   copy     );
  function("vec3s_to_list",      (val (*)(const vec3s& a ))                                     to_list     );



  function("vec4s_copy_from_typed_array",   (void (*)(vec4s& out, const val& js_list ))              copy_from_typed_array     );
  function("vec4s_copy_list",   (void (*)(vec4s& out, const val& js_list ))                     copy_list     );
  function("vec4s_from_typed_array",   (vec4s (*)(const val& js_list ))                         from_typed_array     );
  function("vec4s_from_list",   (vec4s (*)(const val& js_list ))                                vecs_from_list     );
  function("vec4s_from_vec4s",   (vec4s (*)(const vec4s& a ))                                   copy     );
  function("vec4s_to_list",      (val (*)(const vec4s& a ))                                     to_list     );



  function("uvec2s_copy_from_typed_array",   (void (*)(uvec2s& out, const val& js_list ))              copy_from_typed_array     );
  function("uvec2s_copy_list",   (void (*)(uvec2s& out, const val& js_list ))                     copy_list     );
  function("uvec2s_from_typed_array",   (uvec2s (*)(const val& js_list ))                         from_typed_array     );
  function("uvec2s_from_list",   (uvec2s (*)(const val& js_list ))                                vecs_from_list     );
  function("uvec2s_from_uvec2s",   (uvec2s (*)(const uvec2s& a ))                                   copy     );
  function("uvec2s_to_list",      (val (*)(const uvec2s& a ))                           to_list     );



  function("uvec3s_copy_from_typed_array",   (void (*)(uvec3s& out, const val& js_list ))              copy_from_typed_array     );
  function("uvec3s_copy_list",   (void (*)(uvec3s& out, const val& js_list ))                     copy_list     );
  function("uvec3s_from_typed_array",   (uvec3s (*)(const val& js_list ))                         from_typed_array     );
  function("uvec3s_from_list",    (uvec3s (*)(const val& js_list ))                               vecs_from_list     );
  function("uvec3s_from_uvec3s",   (uvec3s (*)(const uvec3s& a ))                                   copy     );
  function("uvec3s_to_list",      (val (*)(const uvec3s& a ))                                     to_list     );



  function("uvec4s_copy_from_typed_array",   (void (*)(uvec4s& out, const val& js_list ))              copy_from_typed_array     );
  function("uvec4s_copy_list",   (void (*)(uvec4s& out, const val& js_list ))                     copy_list     );
  function("uvec4s_from_typed_array",   (uvec4s (*)(const val& js_list ))                         from_typed_array     );
  function("uvec4s_from_list",   (uvec4s (*)(const val& js_list ))                                vecs_from_list     );
  function("uvec4s_from_uvec4s",   (uvec4s (*)(const uvec4s& a ))                                   copy     );
  function("uvec4s_to_list",      (val (*)(const uvec4s& a ))                                     to_list     );



}
