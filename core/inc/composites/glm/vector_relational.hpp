#pragma once

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2

#include "../primitives.hpp"

namespace composites
{
	using namespace glm;

	template <class T, class T2>
	void greaterThan(const primitives<tvec<T>>& a, const T2 b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThan(a[i], b);
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const primitives<tvec<T>>& a, const T2 b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThanEqual(a[i], b);
		}
	}
	template <class T, class T2>
	void lessThan(const primitives<tvec<T>>& a, const T2 b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThan(a[i], b);
		}
	}
	template <class T, class T2>
	void lessThanEqual(const primitives<tvec<T>>& a, const T2 b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThanEqual(a[i], b);
		}
	}



	template <class T, class T2>
	void greaterThan(const primitives<tvec3<T>>& a, const primitives<T2>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThan(a[i], b[i]);
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const primitives<tvec3<T>>& a, const primitives<T2>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = greaterThanEqual(a[i], b[i]);
		}
	}
	template <class T, class T2>
	void lessThan(const primitives<tvec3<T>>& a, const primitives<T2>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThan(a[i], b[i]);
		}
	}
	template <class T, class T2>
	void lessThanEqual(const primitives<tvec3<T>>& a, const primitives<T2>& b, primitives<tvec3<bool>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = lessThanEqual(a[i], b[i]);
		}
	}

}