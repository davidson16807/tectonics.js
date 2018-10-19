#pragma once

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2

#include "../primitives.hpp"

namespace composites
{
	using namespace glm;

	template<length_t L, typename T, qualifier Q>
	void greaterThan(const primitives<vec<L,T,Q>>& a, const T b, primitives<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::greaterThan(a[i], b);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void greaterThanEqual(const primitives<vec<L,T,Q>>& a, const T b, primitives<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::greaterThanEqual(a[i], b);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void lessThan(const primitives<vec<L,T,Q>>& a, const T b, primitives<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::lessThan(a[i], b);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void lessThanEqual(const primitives<vec<L,T,Q>>& a, const T b, primitives<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::lessThanEqual(a[i], b);
		}
	}




}