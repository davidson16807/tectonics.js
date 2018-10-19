#pragma once

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2

#include "../primitives.hpp"

namespace composites
{
	using namespace glm;

	template <class T>
	void greaterThan(const primitives<tvec2<T>>& a, const T b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThan(a[i], b);
		}
	}
	template <class T>
	void greaterThanEqual(const primitives<tvec2<T>>& a, const T b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThanEqual(a[i], b);
		}
	}
	template <class T>
	void lessThan(const primitives<tvec2<T>>& a, const T b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThan(a[i], b);
		}
	}
	template <class T>
	void lessThanEqual(const primitives<tvec2<T>>& a, const T b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThanEqual(a[i], b);
		}
	}



	template <class T>
	void greaterThan(const primitives<tvec3<T>>& a, const primitives<T>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThan(a[i], b[i]);
		}
	}
	template <class T>
	void greaterThanEqual(const primitives<tvec3<T>>& a, const primitives<T>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThanEqual(a[i], b[i]);
		}
	}
	template <class T>
	void lessThan(const primitives<tvec3<T>>& a, const primitives<T>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThan(a[i], b[i]);
		}
	}
	template <class T>
	void lessThanEqual(const primitives<tvec3<T>>& a, const primitives<T>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThanEqual(a[i], b[i]);
		}
	}

}