#pragma once

#include <math.h>       // ceil, round 
#include "vec2_template.h"

namespace rasters
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





		// NOTE: THESE ARE NOT COMPONENT-WISE!
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
		// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
		bool operator>(const T a) const
		{
			return this->magnitude() > a;
		}
		bool operator>=(const T a) const
		{
			return this->magnitude() >= a;
		}
		bool operator<(const T a) const
		{
			return this->magnitude() < a;
		}
		bool operator<=(const T a) const
		{
			return this->magnitude() <= a;
		}
		bool operator==(const T a) const
		{
			return ((*this)-a).magnitude() < 1e-4;
		}
		bool operator!=(const T a) const
		{
			return ((*this)-a).magnitude() > 1e-4;
		}



		// NOTE: THESE ARE NOT COMPONENT-WISE!
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
		// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
		bool operator>(const vec3_template<T> a)
		{
			return this->magnitude() > a.magnitude();
		}
		bool operator>=(const vec3_template<T> a)
		{
			return this->magnitude() >= a.magnitude();
		}
		bool operator<(const vec3_template<T> a)
		{
			return this->magnitude() < a.magnitude();
		}
		bool operator<=(const vec3_template<T> a)
		{
			return this->magnitude() <= a.magnitude();
		}
		bool operator==(const vec3_template<T> a)
		{
			return ((*this)-a).magnitude() < 1e-4;
		}
		bool operator!=(const vec3_template<T> a)
		{
			return ((*this)-a).magnitude() > 1e-4;
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
		// NOTE: THIS IS NOT THE DOT PRODUCT!
		// THIS IS COMPONENT-WISE MULTIPLICATION
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT DEMONSTRATE THE "CLOSURE" PROPERTY
		// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
		vec3_template<T> operator* (const vec3_template<T> v) const 
		{
			return hadamard(*this, v);
		}
		vec3_template<T> operator/ (const vec3_template<T> v) const 
		{
			return div (*this, v);
		}

	};

	using vec3 = vec3_template<float>;
	using ivec3 = vec3_template<int>;
	using uivec3 = vec3_template<unsigned int>;
	using bvec3 = vec3_template<bool>;
}