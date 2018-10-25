#pragma once

#include <glm/vec2.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2

#include "vecs.hpp"

namespace composites
{
	// TODO: vector version
	template<length_t L, typename T, qualifier Q>
	inline void rescale(const primitives<vec<L,T,Q>>& a, primitives<vec<L,T,Q>>& out, T max_new = 1.)
	{
		mult(a, max_new / max(length(a)), out);
	};
} //namespace composites
