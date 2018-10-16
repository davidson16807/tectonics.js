#pragma once

#include <math.h>       // ceil, round 

#include "vec2.h"

namespace composites
{
	template <class T>
	struct tvec2
	{
		T x, y, z;

		// destructor: don't implement, we want it to be trivial so tvec2 can be built at compile time
		// ~tvec2() {};

		// default constructor
		constexpr tvec2() : x(0), y(0) {};
		constexpr tvec2(T x) : x(x), y(x) {};

		template<class T2>
		constexpr tvec2(T2 x) : x(x), y(x) {};

		constexpr tvec2(T x, T y) : x(x), y(y) {};

		template<class T2>
		explicit constexpr tvec2(tvec2<T2> u) : x(u.x), y(u.y) {};

	};

	using vec2 = tvec2<float>;
	using ivec2 = tvec2<int>;
	using uivec2 = tvec2<unsigned int>;
	using bvec2 = tvec2<bool>;

	template <class T, class T2>
	inline tvec2<bool> gt(const tvec2<T> u, const T2 a)
	{
		return tvec2<bool>(
			u.x > a,
			u.y > a
		);
	}
	template <class T, class T2>
	inline tvec2<bool> gte(const tvec2<T> u, const T2 a)
	{
		return tvec2<bool>(
			u.x >= a,
			u.y >= a
		);
	}
	template <class T, class T2>
	inline tvec2<bool> lt(const tvec2<T> u, const T2 a)
	{
		return tvec2<bool>(
			u.x < a,
			u.y < a
		);
	}
	template <class T, class T2>
	inline tvec2<bool> lte(const tvec2<T> u, const T2 a)
	{
		return tvec2<bool>(
			u.x <= a,
			u.y <= a
		);
	}
	template <class T, class T2>
	inline tvec2<bool> eq(const tvec2<T> u, const T2 a, const T threshold)
	{
		return tvec2<bool>(
			abs(u.x - a) < threshold,
			abs(u.y - a) < threshold
		);
	}
	template <class T, class T2>
	inline tvec2<bool> ne(const tvec2<T> u, const T2 a, const T threshold)
	{
		return tvec2<bool>(
			abs(u.x - a) > threshold,
			abs(u.y - a) > threshold
		);
	}



	template <class T>
	inline tvec2<bool> gt(const tvec2<T> u, const tvec2<T> v)
	{
		return tvec2<bool>(
			u.x > v.x,
			u.y > v.y
		);
	}
	template <class T>
	inline tvec2<bool> gte(const tvec2<T> u, const tvec2<T> v)
	{
		return tvec2<bool>(
			u.x >= v.x,
			u.y >= v.y
		);
	}
	template <class T>
	inline tvec2<bool> lt(const tvec2<T> u, const tvec2<T> v)
	{
		return tvec2<bool>(
			u.x < v.x,
			u.y < v.y
		);
	}
	template <class T>
	inline tvec2<bool> lte(const tvec2<T> u, const tvec2<T> v)
	{
		return tvec2<bool>(
			u.x <= v.x,
			u.y <= v.y
		);
	}
	template <class T>
	inline tvec2<bool> eq(const tvec2<T> u, const tvec2<T> v, const T threshold)
	{
		return tvec2<bool>(
			abs(u.x - v.x) < threshold,
			abs(u.y - v.y) < threshold
		);
	}
	template <class T>
	inline tvec2<bool> ne(const tvec2<T> u, const tvec2<T> v, const T threshold)
	{
		return tvec2<bool>(
			abs(u.x - v.x) > threshold,
			abs(u.y - v.y) > threshold
		);
	}


	template <class T, class T2>
	inline tvec2<T> add(const tvec2<T> u, const T2 a)
	{
		return tvec2<T>(
			u.x + a,
			u.y + a
		);
	}
	template <class T, class T2>
	inline tvec2<T> sub(const tvec2<T> u, const T2 a)
	{
		return tvec2<T>(
			u.x - a,
			u.y - a
		);
	}
	template <class T, class T2>
	inline tvec2<T> mult(const tvec2<T> u, const T2 a)
	{
		return tvec2<T>(
			u.x * a,
			u.y * a
		);
	}
	template <class T, class T2>
	inline tvec2<T> div(const tvec2<T> u, const T2 a)
	{
		const T ainv = 1./a;
		return tvec2<T>(
			u.x * ainv,
			u.y * ainv
		);
	}
	template <class T>
	inline tvec2<T> add (const tvec2<T> u, const tvec2<T> v) {
		return tvec2<T>(
			u.x + v.x,
			u.y + v.y
		);
	}
	template <class T>
	inline tvec2<T> sub (const tvec2<T> u, const tvec2<T> v) {
		return tvec2<T>(
			u.x - v.x,
			u.y - v.y
		);
	}
	template <class T>
	inline T dot (const tvec2<T> u, const tvec2<T> v) {
		return 
			u.x * v.x+
			u.y * v.y;
	}
	template <class T>
	inline tvec2<T> cross (const tvec2<T> u, const tvec2<T> v) 
	{
		return u.x * v.y - u.y * v.x;
	}
	template <class T>
	inline tvec2<T> hadamard (const tvec2<T> u, const tvec2<T> v) {
		return tvec2<T>(
			u.x * v.x,
			u.y * v.y
		);
	}
	template <class T>
	inline tvec2<T> div (const tvec2<T> u, const tvec2<T> v) {
		return tvec2<T>(
			u.x / v.x,
			u.y / v.y
		);
	}


	template <class T>
	inline T distance(const tvec2<T> u, const tvec2<T> v) 
	{
		return length((u-v));
	}




	template <class T>
	inline double length(tvec2<T> u)
	{
		return sqrt(u.x*u.x + u.y*u.y + u.z*u.z);
	}
	template <class T>
	inline tvec2<T> normalize(tvec2<T> u)
	{
		return u / length(u);
	}





	// NOTE: THESE ARE NOT COMPONENT-WISE!
	// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
	// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
	template <class T, class T2>
	inline bool operator>(const tvec2<T> a, const T2 b)
	{
		return length(a) > b;
	}
	template <class T, class T2>
	inline bool operator>=(const tvec2<T> a, const T2 b)
	{
		return length(a) >= b;
	}
	template <class T, class T2>
	inline bool operator<(const tvec2<T> a, const T2 b)
	{
		return length(a) < b;
	}
	template <class T, class T2>
	inline bool operator<=(const tvec2<T> a, const T2 b)
	{
		return length(a) <= b;
	}
	template <class T, class T2>
	inline bool operator==(const tvec2<T> a, const T2 b)
	{
		return length((a)-b) < 1e-4;
	}
	template <class T, class T2>
	inline bool operator!=(const tvec2<T> a, const T2 b)
	{
		return length((a)-b) > 1e-4;
	}



	// NOTE: THESE ARE NOT COMPONENT-WISE!
	// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
	// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
	template <class T>
	inline bool operator>(const tvec2<T> a, const tvec2<T> b)
	{
		return length(a) > length(b);
	}
	template <class T>
	inline bool operator>=(const tvec2<T> a, const tvec2<T> b)
	{
		return length(a) >= length(b);
	}
	template <class T>
	inline bool operator<(const tvec2<T> a, const tvec2<T> b)
	{
		return length(a) < length(b);
	}
	template <class T>
	inline bool operator<=(const tvec2<T> a, const tvec2<T> b)
	{
		return length(a) <= length(b);
	}
	template <class T>
	inline bool operator==(const tvec2<T> a, const tvec2<T> b)
	{
		return length((a)-b) < 1e-4;
	}
	template <class T>
	inline bool operator!=(const tvec2<T> a, const tvec2<T> b)
	{
		return length((a)-b) > 1e-4;
	}


	template <class T, class T2>
	inline tvec2<T> operator+(const tvec2<T> a, const T2 b)
	{
		return add(a, b);
	}
	template <class T, class T2>
	inline tvec2<T> operator-(const tvec2<T> a, const T2 b)
	{
		return sub(a, b);
	}
	template <class T, class T2>
	inline tvec2<T> operator*(const tvec2<T> a, const T2 b)
	{
		return mult(a, b);
	}
	template <class T, class T2>
	inline tvec2<T> operator/(const tvec2<T> a, const T2 b)
	{
		return div(a, b);
	}



	template <class T>
	inline tvec2<T> operator+ (const tvec2<T> a, const tvec2<T> v) 
	{
		return add (a, v);
	}
	template <class T>
	inline tvec2<T> operator- (const tvec2<T> a, const tvec2<T> v) 
	{
		return sub (a, v);
	}
	// NOTE: THIS IS NOT THE DOT PRODUCT!
	// THIS IS COMPONENT-WISE MULTIPLICATION
	// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT DEMONSTRATE THE "CLOSURE" PROPERTY
	// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
	template <class T>
	inline tvec2<T> operator* (const tvec2<T> a, const tvec2<T> v) 
	{
		return hadamard(a, v);
	}
	template <class T>
	inline tvec2<T> operator/ (const tvec2<T> a, const tvec2<T> v) 
	{
		return div (a, v);
	}
}