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
		vec2_template(T2 x, T2 y) : x(x), y(y) {};

		template<class T2>
		vec2_template(const vec2_template<T2> a) : x(a.x), y(a.y) {};

		~vec2_template() {};

		double magnitude()
		{
			return sqrt(pow(x, 2.) + pow(y, 2.));
		}
		static double distance(const vec2_template<T> a, const vec2_template<T> b) 
		{
			return sqrt(pow(a.x-b.x, 2.) + pow(a.y-b.y, 2.));
		}
		// static double add(const vec2_template<T>& a, const vec2_template<T>& b, vec2_template<T>& c) 
		// {
		// 	c.x = a.x + b.x;
		// 	c.y = a.y + b.y;
		// }

		vec2_template<T> operator+(const double scalar) const
		{
			return vec2_template<T>(
				x + scalar,
				y + scalar
			);
		}
		vec2_template<T> operator-(const double scalar) const
		{
			return vec2_template<T>(
				x - scalar,
				y - scalar
			);
		}
		vec2_template<T> operator*(const double scalar) const
		{
			return vec2_template<T>(
				x * scalar,
				y * scalar
			);
		}
		vec2_template<T> operator/(const double scalar) const
		{
			return vec2_template<T>(
				x / scalar,
				y / scalar
			);
		}
		vec2_template<T> operator+(const vec2_template<T> vector) const
		{
			return vec2_template<T>(
				x + vector.x,
				y + vector.y
			);
		}
		vec2_template<T> operator-(const vec2_template<T> vector) const
		{
			return vec2_template<T>(
				x - vector.x,
				y - vector.y
			);
		}
		double operator*(const vec2_template<T> vector) const
		{
			return 
				x * vector.x+
				y * vector.y
			;
		}
	};

	using vec2 = vec2_template<double>;
	using ivec2 = vec2_template<int>;
	using bvec2 = vec2_template<bool>;
}