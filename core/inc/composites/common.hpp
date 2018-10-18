#pragma once

#include "numerics.hpp"

namespace composites
{

	template <class T>
	void abs(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = abs(a[i]);
		}
	}

	template <class T>
	T min(const numerics<T>& a)
	{
		T out = a[0];
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out = a[i] < out? a[i] : out;
		}
		return out;
	}
	
	template <class T>
	T max(const numerics<T>& a)
	{
		T out = a[0];
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out = a[i] > out? a[i] : out;
		}
		return out;
	}


	template <class T, class T2>
	void max(const numerics<T>& a, const T2 b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b? a[i] : b;
		}
	}
	template <class T, class T2>
	void min(const numerics<T>& a, const T2 b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b? a[i] : b;
		}
	}



	template <class T, class T2>
	void max(const numerics<T>& a, const numerics<T2>& b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b[i]? a[i] : b[i];
		}
	}
	template <class T, class T2>
	void min(const numerics<T>& a, const numerics<T2>& b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b[i]? a[i] : b[i];
		}
	}


	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const Tlo lo, const Thi hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi? hi : a[i] < lo? lo : a[i];
		}
	}
	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const Tlo lo, const numerics<Thi>& hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi[i]? hi[i] : a[i] < lo? lo : a[i];
		}
	}
	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const numerics<Tlo>& lo, const Thi hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi? hi : a[i] < lo[i]? lo[i] : a[i];
		}
	}
	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const numerics<Tlo>& lo, const numerics<Thi>& hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi[i]? hi[i] : a[i];
		}
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < lo[i]? lo[i] : out[i];
		}
	}

}