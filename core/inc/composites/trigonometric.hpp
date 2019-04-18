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
	void radians(const many<T>& degrees, many<T>& out)
	{
		T conversion_factor = M_PI/180.;
		return transform(a, [](T ai){ return conversion_factor * ai; }, out);
	}

	/// Converts degrees to radians and returns the result.
	template <class T>
	void degrees(const many<T>& radians, many<T>& out)
	{
		T conversion_factor = 180./M_PI;
		return transform(a, [](T ai){ return conversion_factor * ai; }, out);
	}

	/// The standard trigonometric sine function.
	/// The values returned by this function will range from [-1, 1].
	template <class T>
	void sin(const many<T>& radians, many<T>& out)
	{
		return transform(radians, std::sin, out);
	}

	/// The standard trigonometric cosine function.
	/// The values returned by this function will range from [-1, 1].
	template <class T>
	void cos(const many<T>& radians, many<T>& out)
	{
		return transform(radians, std::cos, out);
	}

	/// The standard trigonometric tangent function.
	template <class T>
	void tan(const many<T>& radians, many<T>& out)
	{
		return transform(radians, std::tan, out);
	}

	/// Arc sine. Returns an angle whose sine is x.
	/// The range of values returned by this function is [-PI/2, PI/2].
	/// Results are undefined if |x| > 1.
	template <class T>
	void asin(const many<T>& x, many<T>& out)
	{
		return transform(x, std::asin, out);
	}

	/// Arc cosine. Returns an angle whose sine is x.
	/// The range of values returned by this function is [0, PI].
	/// Results are undefined if |x| > 1.
	template <class T>
	void acos(const many<T>& x, many<T>& out)
	{
		return transform(x, std::acos, out);
	}

	/// Arc tangent. Returns an angle whose tangent is y_over_x.
	/// The signs of x and y are used to determine what
	/// quadrant the angle is in. The range of values returned
	/// by this function is [-PI, PI]. Results are undefined
	/// if x and y are both 0.
	template <class T>
	void atan(const many<T>& y_over_x, many<T>& out)
	{
		return transform(y_over_x, std::atan, out);
	}


	/// Arc tangent. Returns an angle whose tangent is y/x.
	/// The signs of x and y are used to determine what
	/// quadrant the angle is in. The range of values returned
	/// by this function is [-PI, PI]. Results are undefined
	/// if x and y are both 0.
	template <class T>
	void atan(const many<T>& x, const many<T>& y, many<T>& out)
	{
		return transform(x, y, std::atan2, out);
	}


	/// Returns the hyperbolic sine function, (exp(x) - exp(-x)) / 2
	template <class T>
	void sinh(const many<T>& radians, many<T>& out)
	{
		return transform(radians, std::sinh, out);
	}

	/// Returns the hyperbolic cosine function, (exp(x) + exp(-x)) / 2
	template <class T>
	void cosh(const many<T>& radians, many<T>& out)
	{
		return transform(radians, std::cosh, out);
	}

	/// Returns the hyperbolic tangent function, sinh(angle) / cosh(angle)
	template <class T>
	void tanh(const many<T>& radians, many<T>& out)
	{
		return transform(radians, std::tanh, out);
	}

	/// Arc hyperbolic sine; returns the inverse of sinh.
	template <class T>
	void asinh(const many<T>& x, many<T>& out)
	{
		return transform(x, std::asinh, out);
	}

	/// Arc hyperbolic cosine; returns the non-negative inverse
	/// of cosh. Results are undefined if x < 1.
	template <class T>
	void acosh(const many<T>& x, many<T>& out)
	{
		return transform(x, std::acosh, out);
	}

	/// Arc hyperbolic tangent; returns the inverse of tanh.
	/// Results are undefined if abs(x) >= 1.
	template <class T>
	void atanh(const many<T>& x, many<T>& out)
	{
		return transform(x, std::atanh, out);
	}

}//namespace composites

