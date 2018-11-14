#pragma once

#include <initializer_list>	// initializer_list

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "../many.hpp"

namespace composites
{
	using namespace glm;

	template<length_t L, typename T, qualifier Q>
	void get_x(const many<vec<L,T,Q>>& a, many<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].x;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void get_y(const many<vec<L,T,Q>>& a, many<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].y;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void get_z(const many<vec<L,T,Q>>& a, many<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].z;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void get_w(const many<vec<L,T,Q>>& a, many<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].w;
		}
	}

	template<length_t L, typename T, qualifier Q>
	many<T> get_x(const many<vec<L,T,Q>>& a)
	{
		many<T> out = many<T>(a.size());
		get_x(a, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	many<T> get_y(const many<vec<L,T,Q>>& a)
	{
		many<T> out = many<T>(a.size());
		get_y(a, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	many<T> get_z(const many<vec<L,T,Q>>& a)
	{
		many<T> out = many<T>(a.size());
		get_z(a, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	many<T> get_w(const many<vec<L,T,Q>>& a)
	{
		many<T> out = many<T>(a.size());
		get_w(a, out);
		return out;
	}

	template<typename T, qualifier Q>
	void mult(const many<vec<3,T,Q>>& a, const mat<4,3,T,Q>& b, many<vec<3,T,Q>>& out)
	{
		constexpr T one = T(1.);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = b * vec4(a[i], one);
		}
	}

	template<length_t L, typename T, qualifier Q>
	bool equal(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b)
	{
		bool out(true);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out &= distance(a[i], b) <= threshold;
		}
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	bool notEqual(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b)
	{
		bool out(false);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= distance(a[i], b) > threshold;
		}
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	bool equal(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b)
	{
		bool out(true);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out &= distance(a[i], b[i]) <= threshold;
		}
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	bool notEqual(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b)
	{
		bool out(false);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= distance(a[i], b[i]) > threshold;
		}
		return out;
	}



	template<length_t L, typename T, qualifier Q>
	void equal(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b) <= threshold;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void notEqual(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b) > threshold;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void equal(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b[i]) <= threshold;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void notEqual(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b[i]) > threshold;
		}
	}

	typedef many<vec<1, bool, glm::defaultp>>	bvec1s;
	typedef many<vec<2, bool, glm::defaultp>>	bvec2s;
	typedef many<vec<3, bool, glm::defaultp>>	bvec3s;
	typedef many<vec<4, bool, glm::defaultp>>	bvec4s;

	typedef many<vec<1, int, glm::defaultp>> ivec1s;
	typedef many<vec<2, int, glm::defaultp>> ivec2s;
	typedef many<vec<3, int, glm::defaultp>> ivec3s;
	typedef many<vec<4, int, glm::defaultp>> ivec4s;

	typedef many<vec<1, unsigned int, glm::defaultp>> uvec1s;
	typedef many<vec<2, unsigned int, glm::defaultp>> uvec2s;
	typedef many<vec<3, unsigned int, glm::defaultp>> uvec3s;
	typedef many<vec<4, unsigned int, glm::defaultp>> uvec4s;

	typedef many<vec<1, double, glm::defaultp>> dvec1s;
	typedef many<vec<2, double, glm::defaultp>> dvec2s;
	typedef many<vec<3, double, glm::defaultp>> dvec3s;
	typedef many<vec<4, double, glm::defaultp>> dvec4s;

	typedef many<vec<1, float, glm::defaultp>> vec1s;
	typedef many<vec<2, float, glm::defaultp>> vec2s;
	typedef many<vec<3, float, glm::defaultp>> vec3s;
	typedef many<vec<4, float, glm::defaultp>> vec4s;

}
