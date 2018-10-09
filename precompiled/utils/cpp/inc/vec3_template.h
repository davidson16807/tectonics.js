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

		static T distance(const vec3_template<T> u, const vec3_template<T> v) 
		{
			return (u-v).magnitude();
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



		double magnitude() const
		{
			return sqrt(x*x + y*y + z*z);
		}
		vec3_template<T> normalize() const
		{
			return *this / magnitude();
		}

		vec3_template<T> operator+(const T a) const
		{
			return vec3_template<T>(
				x + a,
				y + a,
				z + a
			);
		}
		vec3_template<T> operator-(const T a) const
		{
			return vec3_template<T>(
				x - a,
				y - a,
				z - a
			);
		}
		vec3_template<T> operator*(const T a) const
		{
			return vec3_template<T>(
				x * a,
				y * a,
				z * a
			);
		}
		vec3_template<T> operator/(const T a) const
		{
			return vec3_template<T>(
				x / a,
				y / a,
				z / a
			);
		}
		vec3_template<T> operator+(const vec3_template<T> u) const
		{
			return vec3_template<T>(
				x + u.x,
				y + u.y,
				z + u.z
			);
		}
		vec3_template<T> operator-(const vec3_template<T> u) const
		{
			return vec3_template<T>(
				x - u.x,
				y - u.y,
				z - u.z
			);
		}
		double operator*(const vec3_template<T> u) const
		{
			return 
				x * u.x+
				y * u.y+
				z * u.z
			;
		}

	};

	using vec3 = vec3_template<double>;
	using ivec3 = vec3_template<int>;
	using bvec3 = vec3_template<bool>;
}