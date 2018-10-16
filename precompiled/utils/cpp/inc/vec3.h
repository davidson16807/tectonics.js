#pragma once

#include <math.h>       // ceil, round 

#include "vec2.h"

namespace composites
{
	template <class T>
	struct tvec3
	{
		T x, y, z;

		// destructor: don't implement, we want it to be trivial so tvec3 can be built at compile time
		// ~tvec3() {};

		// default constructor
		constexpr tvec3() : x(0), y(0), z(0) {};

		template<class T2>
		constexpr tvec3(T2 x) : x(x), y(x), z(x) {};

		constexpr tvec3(T x, T y, T z) : x(x), y(y), z(z) {};

		template<class T2>
		explicit constexpr tvec3(tvec3<T2> u) : x(u.x), y(u.y), z(u.z) {};

		template<class T2, class T3>
		explicit constexpr tvec3(const tvec2<T2> u, T3 z) : x(u.x), y(u.y), z(z) {};

		template<class T2, class T3>
		explicit constexpr tvec3(T2 x, tvec2<T3> u) : x(x), y(u.y), z(u.z) {};



	};

	using vec3 = tvec3<float>;
	using ivec3 = tvec3<int>;
	using uivec3 = tvec3<unsigned int>;
	using bvec3 = tvec3<bool>;

	template <class T, class T2>
	inline tvec3<bool> gt(const tvec3<T> u, const T2 a)
	{
		return tvec3<bool>(
			u.x > a,
			u.y > a,
			u.z > a
		);
	}
	template <class T, class T2>
	inline tvec3<bool> gte(const tvec3<T> u, const T2 a)
	{
		return tvec3<bool>(
			u.x >= a,
			u.y >= a,
			u.z >= a
		);
	}
	template <class T, class T2>
	inline tvec3<bool> lt(const tvec3<T> u, const T2 a)
	{
		return tvec3<bool>(
			u.x < a,
			u.y < a,
			u.z < a
		);
	}
	template <class T, class T2>
	inline tvec3<bool> lte(const tvec3<T> u, const T2 a)
	{
		return tvec3<bool>(
			u.x <= a,
			u.y <= a,
			u.z <= a
		);
	}
	template <class T, class T2>
	inline tvec3<bool> eq(const tvec3<T> u, const T2 a, const T threshold)
	{
		return tvec3<bool>(
			abs(u.x - a) < threshold,
			abs(u.y - a) < threshold,
			abs(u.z - a) < threshold
		);
	}
	template <class T, class T2>
	inline tvec3<bool> ne(const tvec3<T> u, const T2 a, const T threshold)
	{
		return tvec3<bool>(
			abs(u.x - a) > threshold,
			abs(u.y - a) > threshold,
			abs(u.z - a) > threshold
		);
	}



	template <class T>
	inline tvec3<bool> gt(const tvec3<T> u, const tvec3<T> v)
	{
		return tvec3<bool>(
			u.x > v.x,
			u.y > v.y,
			u.z > v.z
		);
	}
	template <class T>
	inline tvec3<bool> gte(const tvec3<T> u, const tvec3<T> v)
	{
		return tvec3<bool>(
			u.x >= v.x,
			u.y >= v.y,
			u.z >= v.z
		);
	}
	template <class T>
	inline tvec3<bool> lt(const tvec3<T> u, const tvec3<T> v)
	{
		return tvec3<bool>(
			u.x < v.x,
			u.y < v.y,
			u.z < v.z
		);
	}
	template <class T>
	inline tvec3<bool> lte(const tvec3<T> u, const tvec3<T> v)
	{
		return tvec3<bool>(
			u.x <= v.x,
			u.y <= v.y,
			u.z <= v.z
		);
	}
	template <class T>
	inline tvec3<bool> eq(const tvec3<T> u, const tvec3<T> v, const T threshold)
	{
		return tvec3<bool>(
			abs(u.x - v.x) < threshold,
			abs(u.y - v.y) < threshold,
			abs(u.z - v.z) < threshold
		);
	}
	template <class T>
	inline tvec3<bool> ne(const tvec3<T> u, const tvec3<T> v, const T threshold)
	{
		return tvec3<bool>(
			abs(u.x - v.x) > threshold,
			abs(u.y - v.y) > threshold,
			abs(u.z - v.z) > threshold
		);
	}


	template <class T, class T2>
	inline tvec3<T> add(const tvec3<T> u, const T2 a)
	{
		return tvec3<T>(
			u.x + a,
			u.y + a,
			u.z + a
		);
	}
	template <class T, class T2>
	inline tvec3<T> sub(const tvec3<T> u, const T2 a)
	{
		return tvec3<T>(
			u.x - a,
			u.y - a,
			u.z - a
		);
	}
	template <class T, class T2>
	inline tvec3<T> mult(const tvec3<T> u, const T2 a)
	{
		return tvec3<T>(
			u.x * a,
			u.y * a,
			u.z * a
		);
	}
	template <class T, class T2>
	inline tvec3<T> div(const tvec3<T> u, const T2 a)
	{
		const T ainv = 1./a;
		return tvec3<T>(
			u.x * ainv,
			u.y * ainv,
			u.z * ainv
		);
	}
	template <class T>
	inline tvec3<T> add (const tvec3<T> u, const tvec3<T> v) {
		return tvec3<T>(
			u.x + v.x,
			u.y + v.y,
			u.z + v.z
		);
	}
	template <class T>
	inline tvec3<T> sub (const tvec3<T> u, const tvec3<T> v) {
		return tvec3<T>(
			u.x - v.x,
			u.y - v.y,
			u.z - v.z
		);
	}
	template <class T>
	inline T dot (const tvec3<T> u, const tvec3<T> v) {
		return 
			u.x * v.x+
			u.y * v.y+
			u.z * v.z;
	}
	template <class T>
	inline tvec3<T> cross (const tvec3<T> u, const tvec3<T> v) 
	{
		return tvec3<T>(
			u.y * v.z - u.z * v.y,
			u.z * v.x - u.x * v.z,
			u.x * v.y - u.y * v.x
		);
	}
	template <class T>
	inline tvec3<T> hadamard (const tvec3<T> u, const tvec3<T> v) {
		return tvec3<T>(
			u.x * v.x,
			u.y * v.y,
			u.z * v.z
		);
	}
	template <class T>
	inline tvec3<T> div (const tvec3<T> u, const tvec3<T> v) {
		return tvec3<T>(
			u.x / v.x,
			u.y / v.y,
			u.z / v.z
		);
	}


	template <class T>
	inline T distance(const tvec3<T> u, const tvec3<T> v) 
	{
		return length((u-v));
	}




	template <class T>
	inline double length(tvec3<T> u)
	{
		return sqrt(u.x*u.x + u.y*u.y + u.z*u.z);
	}
	template <class T>
	inline tvec3<T> normalize(tvec3<T> u)
	{
		return u / length(u);
	}





	// NOTE: THESE ARE NOT COMPONENT-WISE!
	// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
	// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
	template <class T, class T2>
	inline bool operator>(const tvec3<T> a, const T2 b)
	{
		return length(a) > b;
	}
	template <class T, class T2>
	inline bool operator>=(const tvec3<T> a, const T2 b)
	{
		return length(a) >= b;
	}
	template <class T, class T2>
	inline bool operator<(const tvec3<T> a, const T2 b)
	{
		return length(a) < b;
	}
	template <class T, class T2>
	inline bool operator<=(const tvec3<T> a, const T2 b)
	{
		return length(a) <= b;
	}
	template <class T, class T2>
	inline bool operator==(const tvec3<T> a, const T2 b)
	{
		return length((a)-b) < 1e-4;
	}
	template <class T, class T2>
	inline bool operator!=(const tvec3<T> a, const T2 b)
	{
		return length((a)-b) > 1e-4;
	}



	// NOTE: THESE ARE NOT COMPONENT-WISE!
	// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
	// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
	template <class T>
	inline bool operator>(const tvec3<T> a, const tvec3<T> b)
	{
		return length(a) > length(b);
	}
	template <class T>
	inline bool operator>=(const tvec3<T> a, const tvec3<T> b)
	{
		return length(a) >= length(b);
	}
	template <class T>
	inline bool operator<(const tvec3<T> a, const tvec3<T> b)
	{
		return length(a) < length(b);
	}
	template <class T>
	inline bool operator<=(const tvec3<T> a, const tvec3<T> b)
	{
		return length(a) <= length(b);
	}
	template <class T>
	inline bool operator==(const tvec3<T> a, const tvec3<T> b)
	{
		return length((a)-b) < 1e-4;
	}
	template <class T>
	inline bool operator!=(const tvec3<T> a, const tvec3<T> b)
	{
		return length((a)-b) > 1e-4;
	}


	template <class T, class T2>
	inline tvec3<T> operator+(const tvec3<T> a, const T2 b)
	{
		return add(a, b);
	}
	template <class T, class T2>
	inline tvec3<T> operator-(const tvec3<T> a, const T2 b)
	{
		return sub(a, b);
	}
	template <class T, class T2>
	inline tvec3<T> operator*(const tvec3<T> a, const T2 b)
	{
		return mult(a, b);
	}
	template <class T, class T2>
	inline tvec3<T> operator/(const tvec3<T> a, const T2 b)
	{
		return div(a, b);
	}



	template <class T>
	inline tvec3<T> operator+ (const tvec3<T> a, const tvec3<T> v) 
	{
		return add (a, v);
	}
	template <class T>
	inline tvec3<T> operator- (const tvec3<T> a, const tvec3<T> v) 
	{
		return sub (a, v);
	}
	// NOTE: THIS IS NOT THE DOT PRODUCT!
	// THIS IS COMPONENT-WISE MULTIPLICATION
	// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT DEMONSTRATE THE "CLOSURE" PROPERTY
	// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
	template <class T>
	inline tvec3<T> operator* (const tvec3<T> a, const tvec3<T> v) 
	{
		return hadamard(a, v);
	}
	template <class T>
	inline tvec3<T> operator/ (const tvec3<T> a, const tvec3<T> v) 
	{
		return div (a, v);
	}
}