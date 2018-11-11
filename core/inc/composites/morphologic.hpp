#pragma once

#include "many.hpp"

namespace composites
{

	void unite(const many<bool>& a, const bool b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] || b;
		}
	}

	void unite(const many<bool>& a, const many<bool>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] || b[i];
		}
	}

	void intersect(const many<bool>& a, const bool b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && b;
		}
	}

	void intersect(const many<bool>& a, const many<bool>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && b[i];
		}
	}

	void differ(const many<bool>& a, const bool b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && !b;
		}
	}

	void differ(const many<bool>& a, const many<bool>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && !b[i];
		}
	}

	void negate(const many<bool>& a, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = !a[i];
		}
	}

	bool all(const many<bool>& a)
	{
		bool out = true;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out &= a[i];
		}
		return out;
	}
	bool any(const many<bool>& a)
	{
		bool out = false;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= a[i];
		}
		return out;
	}
	bool none(const many<bool>& a)
	{
		bool out = false;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= a[i];
		}
		return !out;
	}


	inline many<bool> operator~(const many<bool>& a)
	{
		many<bool> out = many<bool>(a.size());
		negate(a, out);
		return out;
	}




	inline many<bool> operator|(const many<bool>& a, const bool b)
	{
		many<bool> out = many<bool>(a.size());
		unite(a, b, out);
		return out;
	}
	inline many<bool> operator&(const many<bool>& a, const bool b)
	{
		many<bool> out = many<bool>(a.size());
		intersect(a, b, out);
		return out;
	}

	inline many<bool> operator|(const many<bool>& a, const many<bool>& b)
	{
		many<bool> out = many<bool>(a.size());
		unite(a, b, out);
		return out;
	}
	inline many<bool> operator&(const many<bool>& a, const many<bool>& b)
	{
		many<bool> out = many<bool>(a.size());
		intersect(a, b, out);
		return out;
	}




	inline many<bool>& operator|=(many<bool>& a, const bool b){
		unite(a, b, a);
		return a;
	}
	inline many<bool>& operator&=(many<bool>& a, const bool b){
		intersect(a, b, a);
		return a;
	}

	inline many<bool>& operator|=(many<bool>& a, const many<bool>& b){
		unite(a, b, a);
		return a;
	}
	inline many<bool>& operator&=(many<bool>& a, const many<bool>& b){
		intersect(a, b, a);
		return a;
	}

}