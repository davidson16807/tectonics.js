#pragma once

#include <cmath>    	    // isnan

#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "../many.hpp"

namespace composites
{
	using namespace glm;


	template<typename T, qualifier Q>
	float cross(const vec<2,T,Q>& a, const vec<2,T,Q>& b)
	{
		return a.x*b.y - b.x*a.y;
	}





	template<length_t L, typename T, qualifier Q>
	void dot (const many<vec<L,T,Q>>& u, const vec<L,T,Q> v, many<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template<typename T, qualifier Q>
	void cross (const many<vec<3,T,Q>>& u, const vec<3,T,Q> v, many<vec<3,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template<typename T, qualifier Q>
	void cross (const many<vec<2,T,Q>>& u, const vec<2,T,Q> v, many<float>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void mult (const many<vec<L,T,Q>>& u, const vec<L,T,Q> v, many<vec<L,T,Q>>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v;
		}
	}
	template<length_t L, typename T, qualifier Q>
	void distance(const many<vec<L,T,Q>>& u, const vec<L,T,Q> v, many<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template<length_t L, typename T, qualifier Q>
	void dot (const many<vec<L,T,Q>>& u, const many<vec<L,T,Q>>& v, many<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template<typename T, qualifier Q>
	void cross (const many<vec<3,T,Q>>& u, const many<vec<3,T,Q>>& v, many<vec<3,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template<typename T, qualifier Q>
	void cross (const many<vec<2,T,Q>>& u, const many<vec<2,T,Q>>& v, many<float>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void mult (const many<vec<L,T,Q>>& u, const many<vec<L,T,Q>>& v, many<vec<L,T,Q>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v[i];
		}
	}
	template<length_t L, typename T, qualifier Q>
	void distance(const many<vec<L,T,Q>>& u, const many<vec<L,T,Q>>& v, many<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}


	template<length_t L, typename T, qualifier Q>
	void length(const many<vec<L,T,Q>>& u, many<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = length(u[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void normalize(const many<vec<L,T,Q>>& u, many<vec<L,T,Q>>& out) 
	{
		float u_length(0);
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			u_length = length(u[i]);
			out[i] = u[i] / (u_length < 1e-5? 1.f : u_length);
		}
	}


	// NOTE: Here we have convenience functions that are stand-ins for operators
	//  we do this because there are no operators that can express them succinctly

	// NOTE: all operators and convenience functions are marked inline,
	//  because they are thin wrappers of static functions

	template<length_t L, typename T, qualifier Q>
	inline many<T> dot (const many<vec<L,T,Q>>& u, const vec<L,T,Q> v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		dot(u, v, out);
		return out;
	}
	template<typename T, qualifier Q>
	inline many<vec<3,T,Q>> cross (const many<vec<3,T,Q>>& u, const vec<3,T,Q> v ) 
	{
		many<vec<3,T,Q>> out = many<vec<3,T,Q>>(u.size());
		cross(u, v, out);
		return out;
	}
	template<typename T, qualifier Q>
	inline many<float> cross (const many<vec<2,T,Q>>& u, const vec<2,T,Q> v ) 
	{
		many<float> out = many<float>(u.size());
		cross(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline many<T> distance(const many<vec<L,T,Q>>& u, const vec<L,T,Q> v ) 
	{
		many<T> out = many<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline many<T> dot (const many<vec<L,T,Q>>& u, const many<vec<L,T,Q>>& v ) 
	{
		vec<L,T,Q> out = vec<L,T,Q>(u.size());
		dot(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline many<vec<L,T,Q>> cross (const many<vec<L,T,Q>>& u, const many<vec<L,T,Q>>& v ) 
	{
		many<vec<L,T,Q>> out = many<vec<L,T,Q>>(u.size());
		cross(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline many<T> distance(const many<vec<L,T,Q>>& u, const many<vec<L,T,Q>>& v ) 
	{
		many<T> out = many<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline many<vec<L,T,Q>> normalize(const many<vec<L,T,Q>>& u) 
	{
		many<vec<L,T,Q>> out = many<vec<L,T,Q>>(u.size());
		normalize(u, out);
		return out;
	}
	template<length_t L, typename T, qualifier Q>
	inline many<T> length(const many<vec<L,T,Q>>& u) 
	{
		many<T> out = many<T>(u.size());
		length(u, out);
		return out;
	}

}
