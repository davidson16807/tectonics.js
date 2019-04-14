#pragma once

#include <cmath>

#include <glm/common.hpp>	// all the GLSL common functions: abs, floor, etc.

#include "../many.hpp"

namespace composites
{
	/// Returns x if x >= 0; otherwise, it returns -x.
	template <length_t L, typename T, qualifier Q>
	void abs(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::abs(a[i]);
		}
	}

	/// Returns 1.0 if x > 0, 0.0 if x == 0, or -1.0 if x < 0.
	template <length_t L, typename T, qualifier Q, class Tout>
	void sign(const many<vec<L,T,Q>>& a, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::abs(a[i]);
		}
	}

	/// Returns a value equal to the nearest integer that is less then or equal to x.
	template <length_t L, typename T, qualifier Q>
	void floor(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::floor(a[i]);
		}
	}

	/// Returns a value equal to the nearest integer to x
	/// whose absolute value is not larger than the absolute value of x.
	template <length_t L, typename T, qualifier Q>
	void trunc(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::trunc(a[i]);
		}
	}

	/// Returns a value equal to the nearest integer to x.
	/// The fraction 0.5 will round in a direction chosen by the
	/// implementation, presumably the direction that is fastest.
	/// This includes the possibility that round(x) returns the
	/// same value as roundEven(x) for all values of x.
	template <length_t L, typename T, qualifier Q>
	void round(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::round(a[i]);
		}
	}

	/// Returns a value equal to the nearest integer
	/// that is greater than or equal to x.
	template <length_t L, typename T, qualifier Q>
	void ceil(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::ceil(a[i]);
		}
	}

	/// Return x - floor(x).
	template <length_t L, typename T, qualifier Q>
	void fract(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - glm::floor(a[i]);
		}
	}

	/// Modulus. Returns x - y * floor(x / y)
	/// for each component in x using the floating point value y.
	template <length_t L, typename T, qualifier Q>
	void mod(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::mod(a, b);
		}
	}

	/// Returns the fractional part of x and sets i to the integer
	/// part (as a whole number floating point value). Both the
	/// return value and the output parameter will have the same
	/// sign as x.
	template <length_t L, typename T, qualifier Q>
	void modf(const many<vec<L,T,Q>>& a, many<vec<L,int,Q>>& intout, many<vec<L,T,Q>>& fractout)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			fractout[i] = a[i] % 1.;
			// intout[i] = vec<L,int,Q>(a[i]-fractout[i]);
		}
	}

	/// Returns y if y < x; otherwise, it returns x.
	template <length_t L, typename T, qualifier Q>
	void min(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::min(a[i], b[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void min(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::min(a[i], b[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	vec<L,T,Q> min(const many<vec<L,T,Q>>& a)
	{
		vec<L,T,Q> out = a[0];
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out = glm::min(a[i], out);
		}
		return out;
	}
	/// Returns y if y < x; otherwise, it returns x.
	template <length_t L, typename T, qualifier Q>
	void max(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::max(a[i], b[i]);
		}
	}
	/// Returns y if y < x; otherwise, it returns x.
	template <length_t L, typename T, qualifier Q>
	void max(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::max(a[i], b[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	vec<L,T,Q> max(const many<vec<L,T,Q>>& a)
	{
		vec<L,T,Q> out = a[0];
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out = glm::max(a[i], out);
		}
		return out;
	}

	/// Returns min(max(x, minVal), maxVal) for each component in x
	/// using the floating-point values minVal and maxVal.
	template <length_t L, typename T, qualifier Q>
	void clamp(const many<vec<L,T,Q>>& a, const vec<L,T,Q> lo, const vec<L,T,Q> hi, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::clamp(a[i], lo, hi);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void clamp(const many<vec<L,T,Q>>& a, const vec<L,T,Q> lo, const many<vec<L,T,Q>>& hi, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::clamp(a[i], lo, hi[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void clamp(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& lo, const vec<L,T,Q> hi, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::clamp(a[i], lo[i], hi);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void clamp(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& lo, const many<vec<L,T,Q>>& hi, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::clamp(a[i], lo[i], hi[i]);
		}
	}


	/// If genTypeU is a floating scalar or vector:
	/// Returns x * (1.0 - a) + y * a, i.e., the linear blend of
	/// x and y using the floating-point value a.
	/// The value for a is not restricted to the range [0, 1].
	///
	/// NOTE: should probably implement this:
	/// If genTypeU is a boolean scalar or vector:
	/// Selects which vector each returned component comes
	/// from. For a component of 'a' that is false, the
	/// corresponding component of 'x' is returned. For a
	/// component of 'a' that is true, the corresponding
	/// component of 'y' is returned. Components of 'x' and 'y' that
	/// are not selected are allowed to be invalid floating point
	/// values and will have no effect on the results. Thus, this
	/// provides different functionality than
	/// genType mix(genType x, genType y, genType(a))
	/// where a is a Boolean vector.
	///
	/// @param[in]  x Value to interpolate.
	/// @param[in]  y Value to interpolate.
	/// @param[in]  a Interpolant.
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const many<vec<L,T,Q>>& y, const many<T>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y[i], a[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const many<vec<L,T,Q>>& y, const T a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y[i], a);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const vec<L,T,Q> y, const many<T>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y, a[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const vec<L,T,Q> y, const T a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y, a);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const vec<L,T,Q> x, const many<vec<L,T,Q>>& y, const many<T>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < y.size(); ++i)
		{
			out[i] = glm::mix(x, y[i], a[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const vec<L,T,Q> x, const many<vec<L,T,Q>>& y, const T a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < y.size(); ++i)
		{
			out[i] = glm::mix(x, y[i], a);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const vec<L,T,Q> x, const vec<L,T,Q> y, const many<T>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::mix(x, y, a[i]);
		}
	}




	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const many<vec<L,T,Q>>& y, const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y[i], a[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const many<vec<L,T,Q>>& y, const vec<L,T,Q> a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y[i], a);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const vec<L,T,Q> y, const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y, a[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const many<vec<L,T,Q>>& x, const vec<L,T,Q> y, const vec<L,T,Q> a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::mix(x[i], y, a);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const vec<L,T,Q> x, const many<vec<L,T,Q>>& y, const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < y.size(); ++i)
		{
			out[i] = glm::mix(x, y[i], a[i]);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const vec<L,T,Q> x, const many<vec<L,T,Q>>& y, const vec<L,T,Q> a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < y.size(); ++i)
		{
			out[i] = glm::mix(x, y[i], a);
		}
	}
	template <length_t L, typename T, qualifier Q>
	void mix(const vec<L,T,Q> x, const vec<L,T,Q> y, const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::mix(x, y, a[i]);
		}
	}




	/// Returns 0.0 if x < edge, otherwise it returns 1.0 for each component of a genType.
	template<length_t L, typename T, qualifier Q>
	void step(const many<vec<L,T,Q>>& edge, const many<vec<L,T,Q>>&  x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < edge.size(); ++i)
		{
			out[i] = glm::step(edge[i], x[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void step(const many<vec<L,T,Q>>&  edge, const vec<L,T,Q> x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < edge.size(); ++i)
		{
			out[i] = glm::step(edge[i], x);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void step(const vec<L,T,Q> edge, const many<vec<L,T,Q>>&  x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::step(edge, x[i]);
		}
	}

	/// Returns 0.0 if x <= lo and 1.0 if x >= hi and
	/// performs smooth Hermite interpolation between 0 and 1
	/// when lo < x < hi. This is useful in cases where
	/// you would want a threshold function with a smooth
	/// transition. This is equivalent to:
	/// genType t;
	/// t = clamp ((x - lo) / (hi - lo), 0, 1);
	/// return t * t * (3 - 2 * t);
	/// Results are undefined if lo >= hi.
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const many<vec<L,T,Q>>& lo, const many<vec<L,T,Q>>& hi, const many<vec<L,T,Q>>& x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::smoothstep(lo[i], hi[i], x[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const vec<L,T,Q> lo, const many<vec<L,T,Q>>& hi, const many<vec<L,T,Q>>& x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::smoothstep(lo, hi[i], x[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const many<vec<L,T,Q>>& lo, vec<L,T,Q> hi, const many<vec<L,T,Q>>& x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::smoothstep(lo[i], hi, x[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const vec<L,T,Q> lo, const vec<L,T,Q> hi, const many<vec<L,T,Q>>& x, many<vec<L,T,Q>>& out)
	{
		vec<L,T,Q> range = hi-lo;
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::smoothstep(lo, hi, x[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const many<vec<L,T,Q>>& lo, const many<vec<L,T,Q>>& hi, const vec<L,T,Q> x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < hi.size(); ++i)
		{
			out[i] = glm::smoothstep(lo[i], hi[i], x);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const vec<L,T,Q> lo, const many<vec<L,T,Q>>& hi, const vec<L,T,Q> x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < hi.size(); ++i)
		{
			out[i] = glm::smoothstep(lo, hi[i], x);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void smoothstep(const many<vec<L,T,Q>>& lo, const vec<L,T,Q> hi, const vec<L,T,Q> x, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < lo.size(); ++i)
		{
			out[i] = glm::smoothstep(lo[i], hi, x);
		}
	}

	/// Returns true if x holds a NaN (not a number)
	/// representation in the underlying implementation's set of
	/// floating point representations. Returns false otherwise,
	/// including for implementations with no NaN
	/// representations.
	template<length_t L, typename T, qualifier Q>
	void isnan(const many<vec<L,T,Q>>&  x, many<bool>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::isnan(x[i]);
		}
	}

	/// Returns true if x holds a positive infinity or negative
	/// infinity representation in the underlying implementation's
	/// set of floating point representations. Returns false
	/// otherwise, including for implementations with no infinity
	/// representations.
	template<length_t L, typename T, qualifier Q>
	void isinf(const many<vec<L,T,Q>>&  x, many<bool>& out)
	{
		for (unsigned int i = 0; i < x.size(); ++i)
		{
			out[i] = glm::isinf(x[i]);
		}
	}

	/// Computes and returns a * b + c.
	template<length_t L, typename T, qualifier Q>
	void fma(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, const many<vec<L,T,Q>>& c, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < c.size(); ++i)
		{
			out[i] = glm::fma(a[i], b[i], c[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void fma(const vec<L,T,Q> a, const many<vec<L,T,Q>>& b, const many<vec<L,T,Q>>& c, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < c.size(); ++i)
		{
			out[i] = glm::fma(a, b[i], c[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void fma(const many<vec<L,T,Q>>& a, vec<L,T,Q> b, const many<vec<L,T,Q>>& c, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < c.size(); ++i)
		{
			out[i] = glm::fma(a[i], b, c[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void fma(const vec<L,T,Q> a, const vec<L,T,Q> b, const many<vec<L,T,Q>>& c, many<vec<L,T,Q>>& out)
	{
		vec<L,T,Q> ab = a*b;
		for (unsigned int i = 0; i < c.size(); ++i)
		{
			out[i] = glm::fma(a, b, c[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void fma(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, const vec<L,T,Q> c, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < b.size(); ++i)
		{
			out[i] = glm::fma(a[i], b[i], c);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void fma(const vec<L,T,Q> a, const many<vec<L,T,Q>>& b, const vec<L,T,Q> c, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < b.size(); ++i)
		{
			out[i] = glm::fma(a, b[i], c);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void fma(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, const vec<L,T,Q> c, many<vec<L,T,Q>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::fma(a[i], b, c);
		}
	}

//	/// Returns a signed integer value representing
//	/// the encoding of a floating-point value. The floating-point
//	/// value's bit-level representation is preserved.
//	int floatBitsToInt(float const& v);
//
//	/// Returns a signed integer value representing
//	/// the encoding of a floating-point value. The floatingpoint
//	/// value's bit-level representation is preserved.
//	template<length_t L, qualifier Q>
//	vec<L, int, Q> floatBitsToInt(vec<L, float, Q> const& v);
//
//	/// Returns a unsigned integer value representing
//	/// the encoding of a floating-point value. The floatingpoint
//	/// value's bit-level representation is preserved.
//	uint floatBitsToUint(float const& v);
//
//	/// Returns a unsigned integer value representing
//	/// the encoding of a floating-point value. The floatingpoint
//	/// value's bit-level representation is preserved.
//	template<length_t L, qualifier Q>
//	vec<L, uint, Q> floatBitsToUint(vec<L, float, Q> const& v);
//
//	/// Returns a floating-point value corresponding to a signed
//	/// integer encoding of a floating-point value.
//	/// If an inf or NaN is passed in, it will not signal, and the
//	/// resulting floating point value is unspecified. Otherwise,
//	/// the bit-level representation is preserved.
//	float intBitsToFloat(int const& v);
//
//	/// Returns a floating-point value corresponding to a signed
//	/// integer encoding of a floating-point value.
//	/// If an inf or NaN is passed in, it will not signal, and the
//	/// resulting floating point value is unspecified. Otherwise,
//	/// the bit-level representation is preserved.
//	template<length_t L, qualifier Q>
//	vec<L, float, Q> intBitsToFloat(vec<L, int, Q> const& v);
//
//	/// Returns a floating-point value corresponding to a
//	/// unsigned integer encoding of a floating-point value.
//	/// If an inf or NaN is passed in, it will not signal, and the
//	/// resulting floating point value is unspecified. Otherwise,
//	/// the bit-level representation is preserved.
//	float uintBitsToFloat(uint const& v);
//
//	/// Returns a floating-point value corresponding to a
//	/// unsigned integer encoding of a floating-point value.
//	/// If an inf or NaN is passed in, it will not signal, and the
//	/// resulting floating point value is unspecified. Otherwise,
//	/// the bit-level representation is preserved.
//	template<length_t L, qualifier Q>
//	vec<L, float, Q> uintBitsToFloat(vec<L, uint, Q> const& v);
//
//	/// Splits x into a floating-point significand in the range
//	/// [0.5, 1.0) and an integral exponent of two, such that:
//	/// x = significand * exp(2, exponent)
//	///
//	/// The significand is returned by the function and the
//	/// exponent is returned in the parameter exp. For a
//	/// floating-point value of zero, the significant and exponent
//	/// are both zero. For a floating-point value that is an
//	/// infinity or is not a number, the results are undefined.
//	template<typename genType, typename genIType>
//	genType frexp(genType const& x, genIType& exp);
//
//	/// Builds a floating-point number from x and the
//	/// corresponding integral exponent of two in exp, returning:
//	/// significand * exp(2, exponent)
//	///
//	/// If this product is too large to be represented in the
//	/// floating-point type, the result is undefined.
//	template<typename genType, typename genIType>
//	genType ldexp(genType const& x, genIType const& exp);

}//namespace composites



