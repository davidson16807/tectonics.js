

#include <vector>
#include "xtensor/xarray.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
// using namespace composites;
// using namespace rasters;

template <class T>
using emarray = xt::xarray_container<std::vector<T>, xt::layout_type::row_major, std::vector<int>>;

template class xt::xarray_container<std::vector<bool>, xt::layout_type::row_major, std::vector<int>>;
template class xt::xarray_container<std::vector<int>, xt::layout_type::row_major, std::vector<int>>;
template class xt::xarray_container<std::vector<unsigned int>, xt::layout_type::row_major, std::vector<int>>;
template class xt::xarray_container<std::vector<float>, xt::layout_type::row_major, std::vector<int>>;

template<typename T>
void copy_typed_array(emarray<T>& out, const val& typed_array)
{
  unsigned int typed_array_length = typed_array["length"].as<unsigned int>();
  //TODO: verify output length equals typed_array length

  val memory = val::module_property("buffer");
  val memoryView = typed_array["constructor"].new_(memory, reinterpret_cast<uintptr_t>(out.data()), typed_array_length);
  memoryView.call<void>("set", typed_array);
}

template<typename T>
emarray<T> from_typed_array(const val& typed_array)
{
  unsigned int typed_array_length = typed_array["length"].as<unsigned int>();
  emarray<T> out = emarray<T>(typed_array_length);
  copy_typed_array(out, typed_array);
  return out;
}

template<typename T>
void copy_list(emarray<T>& out, const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  //TODO: verify output length equals list length

  for (unsigned int i = 0; i < list_length; ++i)
  {
    out[i] = list[i].as<T>();
  }
}

template<typename T>
emarray<T> from_list(const val& list)
{
  unsigned int list_length = list["length"].as<unsigned int>();
  emarray<T> out = emarray<T>(list_length);
  copy_list(out, list);
  return out;
}

EMSCRIPTEN_BINDINGS(rasters)
{
  register_vector<int>("shape");

  class_<emarray<float>>("emarray")
      .constructor<std::vector<int>>()
  ;

  function("floats_copy_typed_array",   (void (*)(emarray<float>& out, const val& js_list ))              copy_typed_array     );
  function("floats_copy_list",   (void (*)(emarray<float>& out, const val& js_list ))                     copy_list     );
  function("floats_from_typed_array",   (emarray<float> (*)(const val& js_list ))                         from_typed_array     );
  function("floats_from_list",   (emarray<float> (*)(const val& js_list ))                                from_list     );
}
