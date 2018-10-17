#pragma once

#include <initializer_list>	// initializer_list

#include "primitives.hpp"

namespace composites
{
	using bools = primitives<float>;

	void unite(const primitives<bool>& a, const bool b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] || b;
		}
	}

	void unite(const primitives<bool>& a, const primitives<bool>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] || b[i];
		}
	}

	void intersect(const primitives<bool>& a, const bool b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && b;
		}
	}

	void intersect(const primitives<bool>& a, const primitives<bool>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && b[i];
		}
	}

	void differ(const primitives<bool>& a, const bool b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && !b;
		}
	}

	void differ(const primitives<bool>& a, const primitives<bool>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && !b[i];
		}
	}

	void negate(const primitives<bool>& a, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = !a[i];
		}
	}


	inline primitives<bool> operator~(const primitives<bool>& a)
	{
		primitives<bool> out = primitives<bool>(a.size());
		negate(a, out);
		return out;
	}




	inline primitives<bool> operator|(const primitives<bool>& a, const bool b)
	{
		primitives<bool> out = primitives<bool>(a.size());
		unite(a, b, out);
		return out;
	}
	inline primitives<bool> operator&(const primitives<bool>& a, const bool b)
	{
		primitives<bool> out = primitives<bool>(a.size());
		intersect(a, b, out);
		return out;
	}

	inline primitives<bool> operator|(const primitives<bool>& a, const primitives<bool>& b)
	{
		primitives<bool> out = primitives<bool>(a.size());
		unite(a, b, out);
		return out;
	}
	inline primitives<bool> operator&(const primitives<bool>& a, const primitives<bool>& b)
	{
		primitives<bool> out = primitives<bool>(a.size());
		intersect(a, b, out);
		return out;
	}




	inline primitives<bool>& operator|=(primitives<bool>& a, const bool b){
		unite(a, b, a);
		return a;
	}
	inline primitives<bool>& operator&=(primitives<bool>& a, const bool b){
		intersect(a, b, a);
		return a;
	}

	inline primitives<bool>& operator|=(primitives<bool>& a, const primitives<bool>& b){
		unite(a, b, a);
		return a;
	}
	inline primitives<bool>& operator&=(primitives<bool>& a, const primitives<bool>& b){
		intersect(a, b, a);
		return a;
	}

}