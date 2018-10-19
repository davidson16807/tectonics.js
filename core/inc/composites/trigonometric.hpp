/// Function parameters specified as angle are assumed to be in units of radians.
/// In no case will any of these functions result in a divide by zero error. If
/// the divisor of a ratio is 0, then results will be undefined.
///
/// These all operate component-wise. The description is per component.

#pragma once

#include <cmath>

namespace composites
{

	/// Converts degrees to radians and returns the result.
	template <class T>
	void radians(const primitives<T>& degrees, primitives<T>& out)
	{
		T conversion_factor = M_PI/180.;
		for (unsigned int i = 0; i < degrees.size(); ++i)
		{
			out[i] = conversion_factor * degrees[i];
		}
	}

	/// Converts degrees to radians and returns the result.
	template <class T>
	void degrees(const primitives<T>& radians, primitives<T>& out)
	{
		T conversion_factor = 180./M_PI;
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = conversion_factor * radians[i];
		}
	}

	/// The standard trigonometric sine function.
	/// The values returned by this function will range from [-1, 1].
	template <class T>
	void sin(const primitives<T>& radians, primitives<T>& out)
	{
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = std::sin(radians[i]);
		}
	}

	/// The standard trigonometric cosine function.
	/// The values returned by this function will range from [-1, 1].
	template <class T>
	void cos(const primitives<T>& radians, primitives<T>& out)
	{
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = std::cos(radians[i]);
		}
	}

	/// The standard trigonometric tangent function.
	template <class T>
	void tan(const primitives<T>& radians, primitives<T>& out)
	{
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = std::tan(radians[i]);
		}
	}

	/// Arc sine. Returns an angle whose sine is x.
	/// The range of values returned by this function is [-PI/2, PI/2].
	/// Results are undefined if |x| > 1.
	template <class T>
	void asin(const primitives<T>& x, primitives<T>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = std::asin(x[i]);
		}
	}

	/// Arc cosine. Returns an angle whose sine is x.
	/// The range of values returned by this function is [0, PI].
	/// Results are undefined if |x| > 1.
	template <class T>
	void acos(const primitives<T>& x, primitives<T>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = std::acos(x[i]);
		}
	}

	/// Arc tangent. Returns an angle whose tangent is y_over_x.
	/// The signs of x and y are used to determine what
	/// quadrant the angle is in. The range of values returned
	/// by this function is [-PI, PI]. Results are undefined
	/// if x and y are both 0.
	template <class T>
	void atan(const primitives<T>& y_over_x, primitives<T>& out)
	{
		for (unsigned int i = 0; i < y_over_x.size(); ++i)
		{
			out[i] = std::atan(y_over_x[i]);
		}
	}


	/// Arc tangent. Returns an angle whose tangent is y/x.
	/// The signs of x and y are used to determine what
	/// quadrant the angle is in. The range of values returned
	/// by this function is [-PI, PI]. Results are undefined
	/// if x and y are both 0.
	template <class T>
	void atan(const primitives<T>& x, const primitives<T>& y, primitives<T>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = std::atan(x[i], y[i]);
		}
	}


	/// Returns the hyperbolic sine function, (exp(x) - exp(-x)) / 2
	template <class T>
	void sinh(const primitives<T>& radians, primitives<T>& out)
	{
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = std::sinh(radians[i]);
		}
	}

	/// Returns the hyperbolic cosine function, (exp(x) + exp(-x)) / 2
	template <class T>
	void cosh(const primitives<T>& radians, primitives<T>& out)
	{
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = std::cosh(radians[i]);
		}
	}

	/// Returns the hyperbolic tangent function, sinh(angle) / cosh(angle)
	template <class T>
	void tanh(const primitives<T>& radians, primitives<T>& out)
	{
		for (unsigned int i = 0; i < radians.size(); ++i)
		{
			out[i] = std::tanh(radians[i]);
		}
	}

	/// Arc hyperbolic sine; returns the inverse of sinh.
	template <class T>
	void asinh(const primitives<T>& x, primitives<T>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = std::asinh(x[i]);
		}
	}

	/// Arc hyperbolic cosine; returns the non-negative inverse
	/// of cosh. Results are undefined if x < 1.
	template <class T>
	void acosh(const primitives<T>& x, primitives<T>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = std::acosh(x[i]);
		}
	}

	/// Arc hyperbolic tangent; returns the inverse of tanh.
	/// Results are undefined if abs(x) >= 1.
	template <class T>
	void atanh(const primitives<T>& x, primitives<T>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = std::atanh(x[i]);
		}
	}

}//namespace composites

