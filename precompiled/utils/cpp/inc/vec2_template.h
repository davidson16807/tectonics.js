#pragma once

#include <math.h>       // ceil, round 
#include "vec2_template.h"

namespace rasters
{
	template <class T>
	struct vec2_template
	{
		T x, y, z;
		vec2_template() {};

		template<class T2>
		vec2_template(T2 x) : x(x), y(x) {};

		template<class T2>
		vec2_template(T2 x, T2 y) : x(x), y(y) {};

		template<class T2>
		vec2_template(vec2_template<T2> u) : x(u.x), y(u.y) {};

		~vec2_template() {};

		static vec2_template<bool> gt(const vec2_template<T> u, const T a)
		{
			return vec2_template<bool>(
				u.x > a,
				u.y > a
			);
		}
		static vec2_template<bool> gte(const vec2_template<T> u, const T a)
		{
			return vec2_template<bool>(
				u.x >= a,
				u.y >= a
			);
		}
		static vec2_template<bool> lt(const vec2_template<T> u, const T a)
		{
			return vec2_template<bool>(
				u.x < a,
				u.y < a
			);
		}
		static vec2_template<bool> lte(const vec2_template<T> u, const T a)
		{
			return vec2_template<bool>(
				u.x <= a,
				u.y <= a
			);
		}
		static vec2_template<bool> eq(const vec2_template<T> u, const T a, const T threshold)
		{
			return vec2_template<bool>(
				abs(u.x - a) < threshold,
				abs(u.y - a) < threshold
			);
		}
		static vec2_template<bool> ne(const vec2_template<T> u, const T a, const T threshold)
		{
			return vec2_template<bool>(
				abs(u.x - a) > threshold,
				abs(u.y - a) > threshold
			);
		}



		static vec2_template<bool> gt(const vec2_template<T> u, const vec2_template<T> v)
		{
			return vec2_template<bool>(
				u.x > v.x,
				u.y > v.y
			);
		}
		static vec2_template<bool> gte(const vec2_template<T> u, const vec2_template<T> v)
		{
			return vec2_template<bool>(
				u.x >= v.x,
				u.y >= v.y
			);
		}
		static vec2_template<bool> lt(const vec2_template<T> u, const vec2_template<T> v)
		{
			return vec2_template<bool>(
				u.x < v.x,
				u.y < v.y
			);
		}
		static vec2_template<bool> lte(const vec2_template<T> u, const vec2_template<T> v)
		{
			return vec2_template<bool>(
				u.x <= v.x,
				u.y <= v.y
			);
		}
		static vec2_template<bool> eq(const vec2_template<T> u, const vec2_template<T> v, const T threshold)
		{
			return vec2_template<bool>(
				abs(u.x - v.x) < threshold,
				abs(u.y - v.y) < threshold
			);
		}
		static vec2_template<bool> ne(const vec2_template<T> u, const vec2_template<T> v, const T threshold)
		{
			return vec2_template<bool>(
				abs(u.x - v.x) > threshold,
				abs(u.y - v.y) > threshold
			);
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
			return u.x * v.y - u.y * v.x;
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


		static T distance(const vec2_template<T> u, const vec2_template<T> v) 
		{
			return (u-v).magnitude();
		}




		double magnitude() const
		{
			return sqrt(x*x + y*y);
		}
		vec2_template<T> normalize() const
		{
			return *this / magnitude();
		}





		// NOTE: THESE ARE NOT COMPONENT-WISE!
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
		// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
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
		// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
		bool operator>(const vec2_template<T> a)
		{
			return this->magnitude() > a.magnitude();
		}
		bool operator>=(const vec2_template<T> a)
		{
			return this->magnitude() >= a.magnitude();
		}
		bool operator<(const vec2_template<T> a)
		{
			return this->magnitude() < a.magnitude();
		}
		bool operator<=(const vec2_template<T> a)
		{
			return this->magnitude() <= a.magnitude();
		}
		bool operator==(const vec2_template<T> a)
		{
			return ((*this)-a).magnitude() < 1e-4;
		}
		bool operator!=(const vec2_template<T> a)
		{
			return ((*this)-a).magnitude() > 1e-4;
		}


		vec2_template<T> operator+(const T a) const
		{
			return add(*this, a);
		}
		vec2_template<T> operator-(const T a) const
		{
			return sub(*this, a);
		}
		vec2_template<T> operator*(const T a) const
		{
			return mult(*this, a);
		}
		vec2_template<T> operator/(const T a) const
		{
			return div(*this, a);
		}


		
		vec2_template<T> operator+ (const vec2_template<T> v) const 
		{
			return add (*this, v);
		}
		vec2_template<T> operator- (const vec2_template<T> v) const 
		{
			return sub (*this, v);
		}
		// NOTE: THIS IS NOT THE DOT PRODUCT!
		// THIS IS COMPONENT-WISE MULTIPLICATION
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT DEMONSTRATE THE "CLOSURE" PROPERTY
		// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
		vec2_template<T> operator* (const vec2_template<T> v) const 
		{
			return hadamard(*this, v);
		}
		vec2_template<T> operator/ (const vec2_template<T> v) const 
		{
			return div (*this, v);
		}

	};

	using vec2 = vec2_template<float>;
	using ivec2 = vec2_template<int>;
	using uivec2 = vec2_template<unsigned int>;
	using bvec2 = vec2_template<bool>;
}