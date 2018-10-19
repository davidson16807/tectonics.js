
#pragma once

#include <cmath>

namespace composites
{
	/// Returns 'base' raised to the power 'exponent'.
	///
	/// @param base Floating point value. pow function is defined for input values of 'base' defined in the range (inf-, inf+) in the limit of the type qualifier.
	/// @param exponent Floating point value representing the 'exponent'.
	template <class T>
	void pow(const numerics<T>& base, const numerics<T>& exponent, numerics<T>& out)
	{
		for (unsigned int i = 0; i < base.size(); ++i)
		{
			out[i] = std::pow(base[i], exponent[i]);
		}
	}
	// TODO: vector variant
	/// Returns the natural exponentiation of x, i.e., e^x.
	///
	/// @param a exp function is defined for input values of a defined in the range (inf-, inf+) in the limit of the type qualifier.
	template <class T>
	void exp(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = std::exp(a[i]);
		}
	}

	// TODO: vector variant
	/// Returns the natural logarithm of a, i.e.,
	/// returns the value y which satisfies the equation x = e^y.
	/// Results are undefined if a <= 0.
	///
	/// @param a log function is defined for input values of a defined in the range (0, inf+) in the limit of the type qualifier.
	template <class T>
	void log(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = std::log(a[i]);
		}
	}

	// TODO: vector variant
	/// Returns 2 raised to the a power.
	///
	/// @param a exp2 function is defined for input values of a defined in the range (inf-, inf+) in the limit of the type qualifier.
	template <class T>
	void exp2(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = std::exp2(a[i]);
		}
	}

	// TODO: vector variant
	/// Returns the base 2 log of x, i.e., returns the value y,
	/// which satisfies the equation x = 2 ^ y.
	///
	/// @param a log2 function is defined for input values of a defined in the range (0, inf+) in the limit of the type qualifier.
	template <class T>
	void log2(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = std::log2(a[i]);
		}
	}

	// TODO: vector variant
	/// Returns the positive square root of a.
	///
	/// @param a sqrt function is defined for input values of a defined in the range [0, inf+) in the limit of the type qualifier.
	template <class T>
	void sqrt(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = std::sqrt(a[i]);
		}
	}

	// TODO: vector variant
	/// Returns the reciprocal of the positive square root of a.
	///
	/// @param a inversesqrt function is defined for input values of a defined in the range [0, inf+) in the limit of the type qualifier.
	template <class T>
	void inversesqrt(const numerics<T>& a, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = 1./std::sqrt(a[i]);
		}
	}
}//namespace composites

