#pragma once

#include "many.hpp"

namespace composites
{

	void unite(const std::valarray<bool>& a, const bool b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] || b;
		}
	}

	void unite(const std::valarray<bool>& a, const std::valarray<bool>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] || b[i];
		}
	}

	void intersect(const std::valarray<bool>& a, const bool b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && b;
		}
	}

	void intersect(const std::valarray<bool>& a, const std::valarray<bool>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && b[i];
		}
	}

	void differ(const std::valarray<bool>& a, const bool b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && !b;
		}
	}

	void differ(const std::valarray<bool>& a, const std::valarray<bool>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] && !b[i];
		}
	}

	void negate(const std::valarray<bool>& a, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = !a[i];
		}
	}

	bool all(const std::valarray<bool>& a)
	{
		bool out = true;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out &= a[i];
		}
		return out;
	}
	bool any(const std::valarray<bool>& a)
	{
		bool out = false;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= a[i];
		}
		return out;
	}
	bool none(const std::valarray<bool>& a)
	{
		bool out = false;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= a[i];
		}
		return !out;
	}


	inline std::valarray<bool> operator~(const std::valarray<bool>& a)
	{
		std::valarray<bool> out = std::valarray<bool>(a.size());
		negate(a, out);
		return out;
	}




	inline std::valarray<bool> operator|(const std::valarray<bool>& a, const bool b)
	{
		std::valarray<bool> out = std::valarray<bool>(a.size());
		unite(a, b, out);
		return out;
	}
	inline std::valarray<bool> operator&(const std::valarray<bool>& a, const bool b)
	{
		std::valarray<bool> out = std::valarray<bool>(a.size());
		intersect(a, b, out);
		return out;
	}

	inline std::valarray<bool> operator|(const std::valarray<bool>& a, const std::valarray<bool>& b)
	{
		std::valarray<bool> out = std::valarray<bool>(a.size());
		unite(a, b, out);
		return out;
	}
	inline std::valarray<bool> operator&(const std::valarray<bool>& a, const std::valarray<bool>& b)
	{
		std::valarray<bool> out = std::valarray<bool>(a.size());
		intersect(a, b, out);
		return out;
	}




	inline std::valarray<bool>& operator|=(std::valarray<bool>& a, const bool b){
		unite(a, b, a);
		return a;
	}
	inline std::valarray<bool>& operator&=(std::valarray<bool>& a, const bool b){
		intersect(a, b, a);
		return a;
	}

	inline std::valarray<bool>& operator|=(std::valarray<bool>& a, const std::valarray<bool>& b){
		unite(a, b, a);
		return a;
	}
	inline std::valarray<bool>& operator&=(std::valarray<bool>& a, const std::valarray<bool>& b){
		intersect(a, b, a);
		return a;
	}

}