#pragma once
#include <valarray>

#include <glm/vec2.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "vecs.hpp"

namespace composites
{
	using namespace glm;


	template<typename T, qualifier Q>
	float cross(const vec<2,T,Q>& a, const vec<2,T,Q>& b)
	{
		return a.x*b.y - b.x*a.y;
	}





	template<length_t L, typename T, qualifier Q>
	void dot (const std::valarray<vec<L,T,Q>>& u, const vec<L,T,Q> v, std::valarray<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template<typename T, qualifier Q>
	void cross (const std::valarray<vec<3,T,Q>>& u, const vec<3,T,Q> v, std::valarray<vec<3,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template<typename T, qualifier Q>
	void cross (const std::valarray<vec<2,T,Q>>& u, const vec<2,T,Q> v, std::valarray<float>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void mult (const std::valarray<vec<L,T,Q>>& u, const vec<L,T,Q> v, std::valarray<vec<L,T,Q>>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void distance(const std::valarray<vec<L,T,Q>>& u, const vec<L,T,Q> v, std::valarray<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template<length_t L, typename T, qualifier Q>
	void dot (const std::valarray<vec<L,T,Q>>& u, const std::valarray<vec<L,T,Q>>& v, std::valarray<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template<typename T, qualifier Q>
	void cross (const std::valarray<vec<3,T,Q>>& u, const std::valarray<vec<3,T,Q>>& v, std::valarray<vec<3,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template<typename T, qualifier Q>
	void cross (const std::valarray<vec<2,T,Q>>& u, const std::valarray<vec<2,T,Q>>& v, std::valarray<float>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void mult (const std::valarray<vec<L,T,Q>>& u, const std::valarray<vec<L,T,Q>>& v, std::valarray<vec<L,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v[i];
		}
	}
	template<length_t L, typename T, qualifier Q>
	void distance(const std::valarray<vec<L,T,Q>>& u, const std::valarray<vec<L,T,Q>>& v, std::valarray<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}


	template<length_t L, typename T, qualifier Q>
	void length(const std::valarray<vec<L,T,Q>>& u, std::valarray<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = length(u[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void normalize(const std::valarray<vec<L,T,Q>>& u, std::valarray<vec<L,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = normalize(u[i]);
		}
	}


	// NOTE: Here we have convenience functions that are stand-ins for operators
	//  we do this because there are no operators that can express them succinctly

	// NOTE: all operators and convenience functions are marked inline,
	//  because they are thin wrappers of static functions

	template<length_t L, typename T, qualifier Q>
	inline std::valarray<T> dot (const std::valarray<vec<L,T,Q>>& u, const vec<L,T,Q> v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		dot(u, v, out);
		return out;
	}
	template<typename T, qualifier Q>
	inline std::valarray<vec<3,T,Q>> cross (const std::valarray<vec<3,T,Q>>& u, const vec<3,T,Q> v ) 
	{
		std::valarray<vec<3,T,Q>> out = std::valarray<vec<3,T,Q>>(u.size());
		cross(u, v, out);
		return out;
	}
	template<typename T, qualifier Q>
	inline std::valarray<float> cross (const std::valarray<vec<2,T,Q>>& u, const vec<2,T,Q> v ) 
	{
		std::valarray<float> out = std::valarray<float>(u.size());
		cross(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline std::valarray<T> distance(const std::valarray<vec<L,T,Q>>& u, const vec<L,T,Q> v ) 
	{
		std::valarray<T> out = std::valarray<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline std::valarray<T> dot (const std::valarray<vec<L,T,Q>>& u, const std::valarray<vec<L,T,Q>>& v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		dot(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline std::valarray<vec<L,T,Q>> cross (const std::valarray<vec<L,T,Q>>& u, const std::valarray<vec<L,T,Q>>& v ) 
	{
		std::valarray<vec<L,T,Q>> out = std::valarray<vec<L,T,Q>>(u.size());
		cross(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline std::valarray<T> distance(const std::valarray<vec<L,T,Q>>& u, const std::valarray<vec<L,T,Q>>& v ) 
	{
		std::valarray<T> out = std::valarray<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline std::valarray<vec<L,T,Q>> normalize(const std::valarray<vec<L,T,Q>>& u) 
	{
		std::valarray<vec<L,T,Q>> out = std::valarray<vec<L,T,Q>>(u.size());
		normalize(u, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline std::valarray<T> length(const std::valarray<vec<L,T,Q>>& u) 
	{
		std::valarray<T> out = std::valarray<T>(u.size());
		length(u, out);
		return out;
	}

}
