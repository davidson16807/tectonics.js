#pragma once

#include <glm/vec2.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "vec2s.hpp"
#include "vec3s.hpp"

namespace composites
{
	using namespace glm;

	template <class T>
	void dot (const primitives<tvec3<T>>& u, const tvec3<T> v, primitives<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template <class T>
	void cross (const primitives<tvec3<T>>& u, const tvec3<T> v, primitives<tvec3<T>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template <class T>
	void mult (const primitives<tvec3<T>>& u, const tvec3<T> v, primitives<tvec3<T>>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v;
		}
	}
	template <class T>
	void distance(const primitives<tvec3<T>>& u, const tvec3<T> v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template <class T>
	void dot (const primitives<tvec3<T>>& u, const primitives<tvec3<T>>& v, primitives<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template <class T>
	void cross (const primitives<tvec3<T>>& u, const primitives<tvec3<T>>& v, primitives<tvec3<T>>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template <class T>
	void mult (const primitives<tvec3<T>>& u, const primitives<tvec3<T>>& v, primitives<tvec3<T>>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i] * v[i];
		}
	}
	template <class T>
	void distance(const primitives<tvec3<T>>& u, const primitives<tvec3<T>>& v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}


	template <class T>
	void length(const primitives<tvec3<T>>& u, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = length(u[i]);
		}
	}
	template <class T>
	void normalize(const primitives<tvec3<T>>& u, primitives<tvec3<T>>& out) 
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

	template <class T>
	inline primitives<T> dot (const numerics<tvec3<T>>& u, const tvec3<T> v ) {
		tvec3s<T> out = tvec3s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec3s<T> cross (const primitives<tvec3<T>>& u, const tvec3<T> v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline primitives<T> distance(const numerics<tvec3<T>>& u, const tvec3<T> v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline primitives<T> dot (const numerics<tvec3<T>>& u, const primitives<tvec3<T>>& v ) {
		tvec3s<T> out = tvec3s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec3s<T> cross (const primitives<tvec3<T>>& u, const primitives<tvec3<T>>& v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline primitives<T> distance(const numerics<tvec3<T>>& u, const primitives<tvec3<T>>& v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline tvec3s<T> normalize(const primitives<tvec3<T>>& u) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		normalize(u, out);
		return out;
	}
	template <class T>
	inline floats length(const primitives<tvec3<T>>& u) 
	{
		primitives<T> out = primitives<T>(u.size());
		length(u, out);
		return out;
	}



	template <class T>
	void dot (const tvec2s<T>& u, const tvec2<T> v, primitives<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template <class T>
	void cross (const tvec2s<T>& u, const tvec2<T> v, tvec2s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template <class T>
	void hadamard (const tvec2s<T>& u, const tvec2<T> v, tvec2s<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = hadamard(u[i], v);
		}
	}
	template <class T>
	void distance(const tvec2s<T>& u, const tvec2<T> v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template <class T>
	void dot (const tvec2s<T>& u, const tvec2s<T>& v, primitives<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template <class T>
	void cross (const tvec2s<T>& u, const tvec2s<T>& v, tvec2s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template <class T>
	void hadamard (const tvec2s<T>& u, const tvec2s<T>& v, tvec2s<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = hadamard(u[i], v[i]);
		}
	}
	template <class T>
	void distance(const tvec2s<T>& u, const tvec2s<T>& v, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}



	template <class T>
	void length(const tvec2s<T>& u, primitives<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i].length();
		}
	}
	template <class T>
	void normalize(const tvec2s<T>& u, tvec2s<T>& out) 
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

	template <class T>
	inline primitives<T> dot (const numerics<tvec2<T>>& u, const tvec2<T> v ) {
		tvec2s<T> out = tvec2s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec2s<T> cross (const tvec2s<T>& u, const tvec2<T> v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline primitives<T> distance(const numerics<tvec2<T>>& u, const tvec2<T> v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline primitives<T> dot (const numerics<tvec2<T>>& u, const tvec2s<T>& v ) {
		tvec2s<T> out = tvec2s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec2s<T> cross (const tvec2s<T>& u, const tvec2s<T>& v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline primitives<T> distance(const numerics<tvec2<T>>& u, const tvec2s<T>& v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline tvec2s<T> normalize(const tvec2s<T>& u) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		normalize(u, out);
		return out;
	}
	template <class T>
	inline floats length(const tvec2s<T>& u) 
	{
		primitives<T> out = primitives<T>(u.size());
		length(u, out);
		return out;
	}
}
