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
		vec3_template(vec3_template<T2> a) : x(a.x), y(a.y), z(a.z) {};

		template<class T2>
		vec3_template(const vec2_template<T2> a, T z) : x(a.x), y(a.y), z(z) {};

		template<class T2>
		vec3_template(T x, vec2_template<T2> a) : x(x), y(a.y), z(a.z) {};

		~vec3_template() {};

		static double distance(const vec3_template<T> a, const vec3_template<T> b) 
		{
			return (a-b).magnitude();
		}
		double magnitude() const
		{
			return sqrt(pow(x, 2.) + pow(y, 2.) + pow(z, 2.));
		}
		vec3_template<T> normalize() const
		{
			return *this / magnitude();
		}
		// static double add(const vec3_template<T>& a, const vec3_template<T>& b, vec3_template<T>& c) 
		// {
		// 	c.x = a.x + b.x;
		// 	c.y = a.y + b.y;
		// 	c.z = a.z + b.z;
		// }

		vec3_template<T> operator+(const double scalar) const
		{
			return vec3_template<T>(
				x + scalar,
				y + scalar,
				z + scalar
			);
		}
		vec3_template<T> operator-(const double scalar) const
		{
			return vec3_template<T>(
				x - scalar,
				y - scalar,
				z - scalar
			);
		}
		vec3_template<T> operator*(const double scalar) const
		{
			return vec3_template<T>(
				x * scalar,
				y * scalar,
				z * scalar
			);
		}
		vec3_template<T> operator/(const double scalar) const
		{
			return vec3_template<T>(
				x / scalar,
				y / scalar,
				z / scalar
			);
		}
		vec3_template<T> operator+(const vec3_template<T> vector) const
		{
			return vec3_template<T>(
				x + vector.x,
				y + vector.y,
				z + vector.z
			);
		}
		vec3_template<T> operator-(const vec3_template<T> vector) const
		{
			return vec3_template<T>(
				x - vector.x,
				y - vector.y,
				z - vector.z
			);
		}
		double operator*(const vec3_template<T> vector) const
		{
			return 
				x * vector.x+
				y * vector.y+
				z * vector.z
			;
		}
	};

	using vec3 = vec3_template<double>;
	using ivec3 = vec3_template<int>;
	using bvec3 = vec3_template<bool>;
}