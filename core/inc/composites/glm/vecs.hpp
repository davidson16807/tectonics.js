#pragma once

#include <initializer_list>	// initializer_list
#include <valarray>

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "../many.hpp"

namespace composites
{
	using namespace glm;

	template <length_t L, class T, qualifier Q>
	void get_x(const std::valarray<vec<L,T,Q>>& a, std::valarray<T>& out )
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].x;
		}
	}

	template <length_t L, class T, qualifier Q>
	void get_y(const std::valarray<vec<L,T,Q>>& a, std::valarray<T>& out )
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].y;
		}
	}

	template <length_t L, class T, qualifier Q>
	void get_z(const std::valarray<vec<L,T,Q>>& a, std::valarray<T>& out )
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i].z;
		}
	}

	template <length_t L, class T, qualifier Q>
	std::valarray<T> get_x(const std::valarray<vec<L,T,Q>>& a)
	{
		std::valarray<T> out(a.size());
		get_x(a, out);
		return out;
	}

	template <length_t L, class T, qualifier Q>
	std::valarray<T> get_y(const std::valarray<vec<L,T,Q>>& a)
	{
		std::valarray<T> out(a.size());
		get_y(a, out);
		return out;
	}

	template <length_t L, class T, qualifier Q>
	std::valarray<T> get_z(const std::valarray<vec<L,T,Q>>& a)
	{
		std::valarray<T> out(a.size());
		get_z(a, out);
		return out;
	}

	template<typename T, qualifier Q>
	void mult(const std::valarray<vec<3,T,Q>>& a, const mat<4,3,T,Q>& b, std::valarray<vec<3,T,Q>>& out)
	{
		constexpr T one = T(1.);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = b * vec4(a[i], one);
		}
	}

	template<length_t L, typename T, qualifier Q>
	bool equal(const std::valarray<vec<L,T,Q>>& a, const vec<L,T,Q> b)
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
	bool notEqual(const std::valarray<vec<L,T,Q>>& a, const vec<L,T,Q> b)
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
	bool equal(const std::valarray<vec<L,T,Q>>& a, const std::valarray<vec<L,T,Q>>& b)
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
	bool notEqual(const std::valarray<vec<L,T,Q>>& a, const std::valarray<vec<L,T,Q>>& b)
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
	void equal(const std::valarray<vec<L,T,Q>>& a, const vec<L,T,Q> b, std::valarray<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b) <= threshold;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void notEqual(const std::valarray<vec<L,T,Q>>& a, const vec<L,T,Q> b, std::valarray<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b) > threshold;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void equal(const std::valarray<vec<L,T,Q>>& a, const std::valarray<vec<L,T,Q>>& b, std::valarray<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b[i]) <= threshold;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void notEqual(const std::valarray<vec<L,T,Q>>& a, const std::valarray<vec<L,T,Q>>& b, std::valarray<bool>& out)
	{
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = distance(a[i], b[i]) > threshold;
		}
	}

	typedef std::valarray<vec<1, bool, defaultp>>	bvec1s;
	typedef std::valarray<vec<2, bool, defaultp>>	bvec2s;
	typedef std::valarray<vec<3, bool, defaultp>>	bvec3s;
	typedef std::valarray<vec<4, bool, defaultp>>	bvec4s;

	typedef std::valarray<vec<1, int, defaultp>> ivec1s;
	typedef std::valarray<vec<2, int, defaultp>> ivec2s;
	typedef std::valarray<vec<3, int, defaultp>> ivec3s;
	typedef std::valarray<vec<4, int, defaultp>> ivec4s;

	typedef std::valarray<vec<1, unsigned int, defaultp>> uvec1s;
	typedef std::valarray<vec<2, unsigned int, defaultp>> uvec2s;
	typedef std::valarray<vec<3, unsigned int, defaultp>> uvec3s;
	typedef std::valarray<vec<4, unsigned int, defaultp>> uvec4s;

	typedef std::valarray<vec<1, double, defaultp>> dvec1s;
	typedef std::valarray<vec<2, double, defaultp>> dvec2s;
	typedef std::valarray<vec<3, double, defaultp>> dvec3s;
	typedef std::valarray<vec<4, double, defaultp>> dvec4s;

	typedef std::valarray<vec<1, float, defaultp>> vec1s;
	typedef std::valarray<vec<2, float, defaultp>> vec2s;
	typedef std::valarray<vec<3, float, defaultp>> vec3s;
	typedef std::valarray<vec<4, float, defaultp>> vec4s;

}
