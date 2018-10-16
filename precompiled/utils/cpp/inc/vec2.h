#pragma once

#include <math.h>       // ceil, round 

namespace composites
{
	template <class T>
	struct tvec2
	{
		T x, y, z;
		tvec2() {};

		template<class T2>
		constexpr tvec2(T2 x) : x(x), y(x) {};

		constexpr tvec2(T x, T y) : x(x), y(y) {};

		template<class T2>
		constexpr tvec2(tvec2<T2> u) : x(u.x), y(u.y) {};

		~tvec2() {};

		static inline tvec2<bool> gt(const tvec2<T> u, const T a)
		{
			return tvec2<bool>(
				u.x > a,
				u.y > a
			);
		}
		static inline tvec2<bool> gte(const tvec2<T> u, const T a)
		{
			return tvec2<bool>(
				u.x >= a,
				u.y >= a
			);
		}
		static inline tvec2<bool> lt(const tvec2<T> u, const T a)
		{
			return tvec2<bool>(
				u.x < a,
				u.y < a
			);
		}
		static inline tvec2<bool> lte(const tvec2<T> u, const T a)
		{
			return tvec2<bool>(
				u.x <= a,
				u.y <= a
			);
		}
		static inline tvec2<bool> eq(const tvec2<T> u, const T a, const T threshold)
		{
			return tvec2<bool>(
				abs(u.x - a) < threshold,
				abs(u.y - a) < threshold
			);
		}
		static inline tvec2<bool> ne(const tvec2<T> u, const T a, const T threshold)
		{
			return tvec2<bool>(
				abs(u.x - a) > threshold,
				abs(u.y - a) > threshold
			);
		}



		static inline tvec2<bool> gt(const tvec2<T> u, const tvec2<T> v)
		{
			return tvec2<bool>(
				u.x > v.x,
				u.y > v.y
			);
		}
		static inline tvec2<bool> gte(const tvec2<T> u, const tvec2<T> v)
		{
			return tvec2<bool>(
				u.x >= v.x,
				u.y >= v.y
			);
		}
		static inline tvec2<bool> lt(const tvec2<T> u, const tvec2<T> v)
		{
			return tvec2<bool>(
				u.x < v.x,
				u.y < v.y
			);
		}
		static inline tvec2<bool> lte(const tvec2<T> u, const tvec2<T> v)
		{
			return tvec2<bool>(
				u.x <= v.x,
				u.y <= v.y
			);
		}
		static inline tvec2<bool> eq(const tvec2<T> u, const tvec2<T> v, const T threshold)
		{
			return tvec2<bool>(
				abs(u.x - v.x) < threshold,
				abs(u.y - v.y) < threshold
			);
		}
		static inline tvec2<bool> ne(const tvec2<T> u, const tvec2<T> v, const T threshold)
		{
			return tvec2<bool>(
				abs(u.x - v.x) > threshold,
				abs(u.y - v.y) > threshold
			);
		}


		static inline tvec2<T> add(const tvec2<T> u, const T a)
		{
			return tvec2<T>(
				u.x + a,
				u.y + a
			);
		}
		static inline tvec2<T> sub(const tvec2<T> u, const T a)
		{
			return tvec2<T>(
				u.x - a,
				u.y - a
			);
		}
		static inline tvec2<T> mult(const tvec2<T> u, const T a)
		{
			return tvec2<T>(
				u.x * a,
				u.y * a
			);
		}
		static inline tvec2<T> div(const tvec2<T> u, const T a)
		{
			const T ainv = 1./a;
			return tvec2<T>(
				u.x * ainv,
				u.y * ainv
			);
		}
		static inline tvec2<T> add (const tvec2<T> u, const tvec2<T> v) {
			return tvec2<T>(
				u.x + v.x,
				u.y + v.y
			);
		}
		static inline tvec2<T> sub (const tvec2<T> u, const tvec2<T> v) {
			return tvec2<T>(
				u.x - v.x,
				u.y - v.y
			);
		}
		static inline T dot (const tvec2<T> u, const tvec2<T> v) {
			return 
				u.x * v.x+
				u.y * v.y;
		}
		static inline tvec2<T> cross (const tvec2<T> u, const tvec2<T> v) 
		{
			return u.x * v.y - u.y * v.x;
		}
		static inline tvec2<T> hadamard (const tvec2<T> u, const tvec2<T> v) {
			return tvec2<T>(
				u.x * v.x,
				u.y * v.y
			);
		}
		static inline tvec2<T> div (const tvec2<T> u, const tvec2<T> v) {
			return tvec2<T>(
				u.x / v.x,
				u.y / v.y
			);
		}


		static inline T distance(const tvec2<T> u, const tvec2<T> v) 
		{
			return (u-v).magnitude();
		}




		inline double magnitude() const
		{
			return sqrt(x*x + y*y + z*z);
		}
		inline tvec2<T> normalize() const
		{
			return *this / magnitude();
		}





		// NOTE: THESE ARE NOT COMPONENT-WISE!
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
		// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
		inline bool operator>(const T a) const
		{
			return this->magnitude() > a;
		}
		inline bool operator>=(const T a) const
		{
			return this->magnitude() >= a;
		}
		inline bool operator<(const T a) const
		{
			return this->magnitude() < a;
		}
		inline bool operator<=(const T a) const
		{
			return this->magnitude() <= a;
		}
		inline bool operator==(const T a) const
		{
			return ((*this)-a).magnitude() < 1e-4;
		}
		inline bool operator!=(const T a) const
		{
			return ((*this)-a).magnitude() > 1e-4;
		}



		// NOTE: THESE ARE NOT COMPONENT-WISE!
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
		// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
		inline bool operator>(const tvec2<T> a)
		{
			return this->magnitude() > a.magnitude();
		}
		inline bool operator>=(const tvec2<T> a)
		{
			return this->magnitude() >= a.magnitude();
		}
		inline bool operator<(const tvec2<T> a)
		{
			return this->magnitude() < a.magnitude();
		}
		inline bool operator<=(const tvec2<T> a)
		{
			return this->magnitude() <= a.magnitude();
		}
		inline bool operator==(const tvec2<T> a)
		{
			return ((*this)-a).magnitude() < 1e-4;
		}
		inline bool operator!=(const tvec2<T> a)
		{
			return ((*this)-a).magnitude() > 1e-4;
		}


		inline tvec2<T> operator+(const T a) const
		{
			return add(*this, a);
		}
		inline tvec2<T> operator-(const T a) const
		{
			return sub(*this, a);
		}
		inline tvec2<T> operator*(const T a) const
		{
			return mult(*this, a);
		}
		inline tvec2<T> operator/(const T a) const
		{
			return div(*this, a);
		}



		inline tvec2<T> operator+ (const tvec2<T> v) const 
		{
			return add (*this, v);
		}
		inline tvec2<T> operator- (const tvec2<T> v) const 
		{
			return sub (*this, v);
		}
		// NOTE: THIS IS NOT THE DOT PRODUCT!
		// THIS IS COMPONENT-WISE MULTIPLICATION
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT DEMONSTRATE THE "CLOSURE" PROPERTY
		// AND ALSO TO MIMIC GLSL's "vec2" DATATYPE
		inline tvec2<T> operator* (const tvec2<T> v) const 
		{
			return hadamard(*this, v);
		}
		inline tvec2<T> operator/ (const tvec2<T> v) const 
		{
			return div (*this, v);
		}

	};

	using vec2 = tvec2<float>;
	using ivec2 = tvec2<int>;
	using uivec2 = tvec2<unsigned int>;
	using bvec2 = tvec2<bool>;
}