#pragma once

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
	void dot (const primitives<vec<L,T,Q>>& u, const vec<L,T,Q> v, primitives<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template<typename T, qualifier Q>
	void cross (const primitives<vec<3,T,Q>>& u, const vec<3,T,Q> v, primitives<vec<3,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template<typename T, qualifier Q>
	void cross (const primitives<vec<2,T,Q>>& u, const vec<2,T,Q> v, primitives<float>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void mult (const primitives<vec<L,T,Q>>& u, const vec<L,T,Q> v, primitives<vec<L,T,Q>>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void distance(const primitives<vec<L,T,Q>>& u, const vec<L,T,Q> v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template<length_t L, typename T, qualifier Q>
	void dot (const primitives<vec<L,T,Q>>& u, const primitives<vec<L,T,Q>>& v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template<typename T, qualifier Q>
	void cross (const primitives<vec<3,T,Q>>& u, const primitives<vec<3,T,Q>>& v, primitives<vec<3,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template<typename T, qualifier Q>
	void cross (const primitives<vec<2,T,Q>>& u, const primitives<vec<2,T,Q>>& v, primitives<float>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void mult (const primitives<vec<L,T,Q>>& u, const primitives<vec<L,T,Q>>& v, primitives<vec<L,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v[i];
		}
	}
	template<length_t L, typename T, qualifier Q>
	void distance(const primitives<vec<L,T,Q>>& u, const primitives<vec<L,T,Q>>& v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}


	template<length_t L, typename T, qualifier Q>
	void length(const primitives<vec<L,T,Q>>& u, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = length(u[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void normalize(const primitives<vec<L,T,Q>>& u, primitives<vec<L,T,Q>>& out) 
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
	inline primitives<T> dot (const primitives<vec<L,T,Q>>& u, const vec<L,T,Q> v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		dot(u, v, out);
		return out;
	}
	template<typename T, qualifier Q>
	inline primitives<vec<3,T,Q>> cross (const primitives<vec<3,T,Q>>& u, const vec<3,T,Q> v ) 
	{
		primitives<vec<3,T,Q>> out = primitives<vec<3,T,Q>>(u.size());
		cross(u, v, out);
		return out;
	}
	template<typename T, qualifier Q>
	inline primitives<float> cross (const primitives<vec<2,T,Q>>& u, const vec<2,T,Q> v ) 
	{
		primitives<float> out = primitives<float>(u.size());
		cross(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline primitives<T> distance(const primitives<vec<L,T,Q>>& u, const vec<L,T,Q> v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		distance(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline primitives<T> dot (const primitives<vec<L,T,Q>>& u, const primitives<vec<L,T,Q>>& v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		dot(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline primitives<vec<L,T,Q>> cross (const primitives<vec<L,T,Q>>& u, const primitives<vec<L,T,Q>>& v ) 
	{
		primitives<vec<L,T,Q>> out = primitives<vec<L,T,Q>>(u.size());
		cross(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline primitives<T> distance(const primitives<vec<L,T,Q>>& u, const primitives<vec<L,T,Q>>& v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		distance(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline primitives<vec<L,T,Q>> normalize(const primitives<vec<L,T,Q>>& u) 
	{
		primitives<vec<L,T,Q>> out = primitives<vec<L,T,Q>>(u.size());
		normalize(u, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline primitives<T> length(const primitives<vec<L,T,Q>>& u) 
	{
		primitives<T> out = primitives<T>(u.size());
		length(u, out);
		return out;
	}

}
