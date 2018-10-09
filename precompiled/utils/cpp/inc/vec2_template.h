#pragma once

#include <math.h>       // ceil, round 

namespace Rasters
{
	template <class T>
	struct vec2_template
	{
		T x, y;
		vec2_template() {};

		template<class T2>
		vec2_template(T2 x) : x(x), y(x) {};

		template<class T2>
		vec2_template(T2 x, T2 y, T2 z) : x(x), y(y) {};

		template<class T2>
		vec2_template(vec2_template<T2> u) : x(u.x), y(u.y) {};

		~vec2_template() {};

		static T distance(const vec2_template<T> u, const vec2_template<T> v) 
		{
			return (u-v).magnitude();
		}
		static vec2_template<T> add(const vec2_template<T> u, const T a)
		{
			return vec2_template<T>(
				u.x + a,
				u.y + a
			);
		}
		static vec2_template<T> sub(const vec2_template<T> u, const T a)
		{
			return vec2_template<T>(
				u.x - a,
				u.y - a
			);
		}
		static vec2_template<T> mult(const vec2_template<T> u, const T a)
		{
			return vec2_template<T>(
				u.x * a,
				u.y * a
			);
		}
		static vec2_template<T> div(const vec2_template<T> u, const T a)
		{
			const T ainv = 1./a;
			return vec2_template<T>(
				u.x * ainv,
				u.y * ainv
			);
		}
		static vec2_template<T> add (const vec2_template<T> u, const vec2_template<T> v) {
			return vec2_template<T>(
				u.x + v.x,
				u.y + v.y
			);
		}
		static vec2_template<T> sub (const vec2_template<T> u, const vec2_template<T> v) {
			return vec2_template<T>(
				u.x - v.x,
				u.y - v.y
			);
		}
		static T dot (const vec2_template<T> u, const vec2_template<T> v) {
			return 
				u.x * v.x+
				u.y * v.y;
		}
		static T cross (const vec2_template<T> u, const vec2_template<T> v) 
		{
			return 
				u.x * v.y - u.y * v.x
			;
		}
		static vec2_template<T> hadamard (const vec2_template<T> u, const vec2_template<T> v) {
			return vec2_template<T>(
				u.x * v.x,
				u.y * v.y
			);
		}
		static vec2_template<T> div (const vec2_template<T> u, const vec2_template<T> v) {
			return vec2_template<T>(
				u.x / v.x,
				u.y / v.y
			);
		}



		double magnitude() const
		{
			return sqrt(x*x + y*y);
		}
		vec2_template<T> normalize() const
		{
			return *this / magnitude();
		}

		vec2_template<T> operator+(const T a) const
		{
			return vec2_template<T>(
				x + a,
				y + a
			);
		}
		vec2_template<T> operator-(const T a) const
		{
			return vec2_template<T>(
				x - a,
				y - a
			);
		}
		vec2_template<T> operator*(const T a) const
		{
			return vec2_template<T>(
				x * a,
				y * a
			);
		}
		vec2_template<T> operator/(const T a) const
		{
			return vec2_template<T>(
				x / a,
				y / a
			);
		}
		vec2_template<T> operator+(const vec2_template<T> u) const
		{
			return vec2_template<T>(
				x + u.x,
				y + u.y
			);
		}
		vec2_template<T> operator-(const vec2_template<T> u) const
		{
			return vec2_template<T>(
				x - u.x,
				y - u.y
			);
		}
		double operator*(const vec2_template<T> u) const
		{
			return 
				x * u.x+
				y * u.y
			;
		}
		vec2_template<T> operator/(const vec2_template<T> u) const
		{
			return vec2_template<T>(
				x / u.x,
				y / u.y
			);
		}

	};

	using vec2 = vec2_template<double>;
	using ivec2 = vec2_template<int>;
	using bvec2 = vec2_template<bool>;
}