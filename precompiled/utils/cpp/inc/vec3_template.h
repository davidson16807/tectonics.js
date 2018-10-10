#pragma once

#include <math.h>       // ceil, round 
#include "vec2_template.h"

namespace Rasters
{
	template <class T>
	struct vec3_template
	{
		T x, y, z;
		vec3_template() {};

		template<class T2>
		vec3_template(T2 x) : x(x), y(x), z(x) {};

		template<class T2>
		vec3_template(T2 x, T2 y, T2 z) : x(x), y(y), z(z) {};

		template<class T2>
		vec3_template(vec3_template<T2> u) : x(u.x), y(u.y), z(u.z) {};

		template<class T2>
		vec3_template(const vec2_template<T2> u, T z) : x(u.x), y(u.y), z(z) {};

		template<class T2>
		vec3_template(T x, vec2_template<T2> u) : x(x), y(u.y), z(u.z) {};

		~vec3_template() {};

		static vec3_template<bool> gt(const vec3_template<T> u, const T a)
		{
			return vec3_template<bool>(
				u.x > a,
				u.y > a,
				u.z > a
			);
		}
		static vec3_template<bool> gte(const vec3_template<T> u, const T a)
		{
			return vec3_template<bool>(
				u.x >= a,
				u.y >= a,
				u.z >= a
			);
		}
		static vec3_template<bool> lt(const vec3_template<T> u, const T a)
		{
			return vec3_template<bool>(
				u.x < a,
				u.y < a,
				u.z < a
			);
		}
		static vec3_template<bool> lte(const vec3_template<T> u, const T a)
		{
			return vec3_template<bool>(
				u.x <= a,
				u.y <= a,
				u.z <= a
			);
		}
		static vec3_template<bool> eq(const vec3_template<T> u, const T a, const T threshold)
		{
			return vec3_template<bool>(
				abs(u.x - a) < threshold,
				abs(u.y - a) < threshold,
				abs(u.z - a) < threshold
			);
		}
		static vec3_template<bool> ne(const vec3_template<T> u, const T a, const T threshold)
		{
			return vec3_template<bool>(
				abs(u.x - a) > threshold,
				abs(u.y - a) > threshold,
				abs(u.z - a) > threshold
			);
		}



		static vec3_template<bool> gt(const vec3_template<T> u, const vec3_template<T> v)
		{
			return vec3_template<bool>(
				u.x > v.x,
				u.y > v.y,
				u.z > v.z
			);
		}
		static vec3_template<bool> gte(const vec3_template<T> u, const vec3_template<T> v)
		{
			return vec3_template<bool>(
				u.x >= v.x,
				u.y >= v.y,
				u.z >= v.z
			);
		}
		static vec3_template<bool> lt(const vec3_template<T> u, const vec3_template<T> v)
		{
			return vec3_template<bool>(
				u.x < v.x,
				u.y < v.y,
				u.z < v.z
			);
		}
		static vec3_template<bool> lte(const vec3_template<T> u, const vec3_template<T> v)
		{
			return vec3_template<bool>(
				u.x <= v.x,
				u.y <= v.y,
				u.z <= v.z
			);
		}
		static vec3_template<bool> eq(const vec3_template<T> u, const vec3_template<T> v, const T threshold)
		{
			return vec3_template<bool>(
				abs(u.x - v.x) < threshold,
				abs(u.y - v.y) < threshold,
				abs(u.z - v.z) < threshold
			);
		}
		static vec3_template<bool> ne(const vec3_template<T> u, const vec3_template<T> v, const T threshold)
		{
			return vec3_template<bool>(
				abs(u.x - v.x) > threshold,
				abs(u.y - v.y) > threshold,
				abs(u.z - v.z) > threshold
			);
		}


		static vec3_template<T> add(const vec3_template<T> u, const T a)
		{
			return vec3_template<T>(
				u.x + a,
				u.y + a,
				u.z + a
			);
		}
		static vec3_template<T> sub(const vec3_template<T> u, const T a)
		{
			return vec3_template<T>(
				u.x - a,
				u.y - a,
				u.z - a
			);
		}
		static vec3_template<T> mult(const vec3_template<T> u, const T a)
		{
			return vec3_template<T>(
				u.x * a,
				u.y * a,
				u.z * a
			);
		}
		static vec3_template<T> div(const vec3_template<T> u, const T a)
		{
			const T ainv = 1./a;
			return vec3_template<T>(
				u.x * ainv,
				u.y * ainv,
				u.z * ainv
			);
		}
		static vec3_template<T> add (const vec3_template<T> u, const vec3_template<T> v) {
			return vec3_template<T>(
				u.x + v.x,
				u.y + v.y,
				u.z + v.z
			);
		}
		static vec3_template<T> sub (const vec3_template<T> u, const vec3_template<T> v) {
			return vec3_template<T>(
				u.x - v.x,
				u.y - v.y,
				u.z - v.z
			);
		}
		static T dot (const vec3_template<T> u, const vec3_template<T> v) {
			return 
				u.x * v.x+
				u.y * v.y+
				u.z * v.z;
		}
		static vec3_template<T> cross (const vec3_template<T> u, const vec3_template<T> v) 
		{
			return vec3_template<T>(
				u.y * v.z - u.z * v.y,
				u.z * v.x - u.x * v.z,
				u.x * v.y - u.y * v.x
			);
		}
		static vec3_template<T> hadamard (const vec3_template<T> u, const vec3_template<T> v) {
			return vec3_template<T>(
				u.x * v.x,
				u.y * v.y,
				u.z * v.z
			);
		}
		static vec3_template<T> div (const vec3_template<T> u, const vec3_template<T> v) {
			return vec3_template<T>(
				u.x / v.x,
				u.y / v.y,
				u.z / v.z
			);
		}


		static T distance(const vec3_template<T> u, const vec3_template<T> v) 
		{
			return (u-v).magnitude();
		}




		double magnitude() const
		{
			return sqrt(x*x + y*y + z*z);
		}
		vec3_template<T> normalize() const
		{
			return *this / magnitude();
		}








		vec3_template<bool> operator>(const T a) const
		{
			return gt(*this, a);
		}
		vec3_template<bool> operator>=(const T a) const
		{
			return gte(*this, a);
		}
		vec3_template<bool> operator<(const T a) const
		{
			return lt(*this, a);
		}
		vec3_template<bool> operator<=(const T a) const
		{
			return lte(*this, a);
		}
		vec3_template<bool> operator==(const T a) const
		{
			return eq(*this, a, 1e-4);
		}
		vec3_template<bool> operator!=(const T a) const
		{
			return ne(*this, a, 1e-4);
		}



		vec3_template<bool> operator>(const vec3_template<T> v) const
		{
			return gt(*this, v);
		}
		vec3_template<bool> operator>=(const vec3_template<T> v) const
		{
			return gte(*this, v);
		}
		vec3_template<bool> operator<(const vec3_template<T> v) const
		{
			return lt(*this, v);
		}
		vec3_template<bool> operator<=(const vec3_template<T> v) const
		{
			return lte(*this, v);
		}
		vec3_template<bool> operator==(const vec3_template<T> v) const
		{
			return eq(*this, v, 1e-4);
		}
		vec3_template<bool> operator!=(const vec3_template<T> v) const
		{
			return ne(*this, v, 1e-4);
		}


		vec3_template<T> operator+(const T a) const
		{
			return add(*this, a);
		}
		vec3_template<T> operator-(const T a) const
		{
			return sub(*this, a);
		}
		vec3_template<T> operator*(const T a) const
		{
			return mult(*this, a);
		}
		vec3_template<T> operator/(const T a) const
		{
			return div(*this, a);
		}
		vec3_template<T> operator+ (const vec3_template<T> v) const 
		{
			return add (*this, v);
		}
		vec3_template<T> operator- (const vec3_template<T> v) const 
		{
			return sub (*this, v);
		}
		T operator* (const vec3_template<T> v) const 
		{
			return dot (*this, v);
		}
		vec3_template<T> operator/ (const vec3_template<T> v) const 
		{
			return div (*this, v);
		}


	};

	using vec3 = vec3_template<double>;
	using ivec3 = vec3_template<int>;
	using bvec3 = vec3_template<bool>;
}