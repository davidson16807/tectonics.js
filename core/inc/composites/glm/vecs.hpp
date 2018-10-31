#pragma once

#include <initializer_list>	// initializer_list

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "../primitives.hpp"

namespace composites
{
	using namespace glm;

	template<typename T, qualifier Q>
	void mult(const primitives<vec<3,T,Q>>& a, const mat<4,3,T,Q>& b, primitives<vec<3,T,Q>>& out)
	{
		constexpr T one = T(1.);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = b * vec4(a[i], one);
		}
	}

	typedef primitives<vec<1, bool, glm::defaultp>>	bvec1s;
	typedef primitives<vec<2, bool, glm::defaultp>>	bvec2s;
	typedef primitives<vec<3, bool, glm::defaultp>>	bvec3s;
	typedef primitives<vec<4, bool, glm::defaultp>>	bvec4s;

	typedef primitives<vec<1, int, glm::defaultp>> ivec1s;
	typedef primitives<vec<2, int, glm::defaultp>> ivec2s;
	typedef primitives<vec<3, int, glm::defaultp>> ivec3s;
	typedef primitives<vec<4, int, glm::defaultp>> ivec4s;

	typedef primitives<vec<1, unsigned int, glm::defaultp>> uivec1s;
	typedef primitives<vec<2, unsigned int, glm::defaultp>> uivec2s;
	typedef primitives<vec<3, unsigned int, glm::defaultp>> uivec3s;
	typedef primitives<vec<4, unsigned int, glm::defaultp>> uivec4s;

	typedef primitives<vec<1, double, glm::defaultp>> dvec1s;
	typedef primitives<vec<2, double, glm::defaultp>> dvec2s;
	typedef primitives<vec<3, double, glm::defaultp>> dvec3s;
	typedef primitives<vec<4, double, glm::defaultp>> dvec4s;

	typedef primitives<vec<1, float, glm::defaultp>> vec1s;
	typedef primitives<vec<2, float, glm::defaultp>> vec2s;
	typedef primitives<vec<3, float, glm::defaultp>> vec3s;
	typedef primitives<vec<4, float, glm::defaultp>> vec4s;

}
