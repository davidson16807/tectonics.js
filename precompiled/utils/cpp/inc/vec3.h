#pragma once

#include <math.h>       // ceil, round 

namespace composites
{
	template <class T>
	struct tvec3
	{
		T x, y, z;
		tvec3() {};

		template<class T2>
		constexpr tvec3(T2 x) : x(x), y(x), z(x) {};

		constexpr tvec3(T x, T y, T z) : x(x), y(y), z(z) {};

		template<class T2>
		explicit constexpr tvec3(tvec3<T2> u) : x(u.x), y(u.y), z(u.z) {};

		template<class T2, class T3>
		explicit constexpr tvec3(const tvec3<T2> u, T3 z) : x(u.x), y(u.y), z(z) {};

		template<class T2, class T3>
		explicit constexpr tvec3(T2 x, tvec3<T3> u) : x(x), y(u.y), z(u.z) {};

		~tvec3() {};

		static inline tvec3<bool> gt(const tvec3<T> u, const T a)
		{
			return tvec3<bool>(
				u.x > a,
				u.y > a,
				u.z > a
			);
		}
		static inline tvec3<bool> gte(const tvec3<T> u, const T a)
		{
			return tvec3<bool>(
				u.x >= a,
				u.y >= a,
				u.z >= a
			);
		}
		static inline tvec3<bool> lt(const tvec3<T> u, const T a)
		{
			return tvec3<bool>(
				u.x < a,
				u.y < a,
				u.z < a
			);
		}
		static inline tvec3<bool> lte(const tvec3<T> u, const T a)
		{
			return tvec3<bool>(
				u.x <= a,
				u.y <= a,
				u.z <= a
			);
		}
		static inline tvec3<bool> eq(const tvec3<T> u, const T a, const T threshold)
		{
			return tvec3<bool>(
				abs(u.x - a) < threshold,
				abs(u.y - a) < threshold,
				abs(u.z - a) < threshold
			);
		}
		static inline tvec3<bool> ne(const tvec3<T> u, const T a, const T threshold)
		{
			return tvec3<bool>(
				abs(u.x - a) > threshold,
				abs(u.y - a) > threshold,
				abs(u.z - a) > threshold
			);
		}



		static inline tvec3<bool> gt(const tvec3<T> u, const tvec3<T> v)
		{
			return tvec3<bool>(
				u.x > v.x,
				u.y > v.y,
				u.z > v.z
			);
		}
		static inline tvec3<bool> gte(const tvec3<T> u, const tvec3<T> v)
		{
			return tvec3<bool>(
				u.x >= v.x,
				u.y >= v.y,
				u.z >= v.z
			);
		}
		static inline tvec3<bool> lt(const tvec3<T> u, const tvec3<T> v)
		{
			return tvec3<bool>(
				u.x < v.x,
				u.y < v.y,
				u.z < v.z
			);
		}
		static inline tvec3<bool> lte(const tvec3<T> u, const tvec3<T> v)
		{
			return tvec3<bool>(
				u.x <= v.x,
				u.y <= v.y,
				u.z <= v.z
			);
		}
		static inline tvec3<bool> eq(const tvec3<T> u, const tvec3<T> v, const T threshold)
		{
			return tvec3<bool>(
				abs(u.x - v.x) < threshold,
				abs(u.y - v.y) < threshold,
				abs(u.z - v.z) < threshold
			);
		}
		static inline tvec3<bool> ne(const tvec3<T> u, const tvec3<T> v, const T threshold)
		{
			return tvec3<bool>(
				abs(u.x - v.x) > threshold,
				abs(u.y - v.y) > threshold,
				abs(u.z - v.z) > threshold
			);
		}


		static inline tvec3<T> add(const tvec3<T> u, const T a)
		{
			return tvec3<T>(
				u.x + a,
				u.y + a,
				u.z + a
			);
		}
		static inline tvec3<T> sub(const tvec3<T> u, const T a)
		{
			return tvec3<T>(
				u.x - a,
				u.y - a,
				u.z - a
			);
		}
		static inline tvec3<T> mult(const tvec3<T> u, const T a)
		{
			return tvec3<T>(
				u.x * a,
				u.y * a,
				u.z * a
			);
		}
		static inline tvec3<T> div(const tvec3<T> u, const T a)
		{
			const T ainv = 1./a;
			return tvec3<T>(
				u.x * ainv,
				u.y * ainv,
				u.z * ainv
			);
		}
		static inline tvec3<T> add (const tvec3<T> u, const tvec3<T> v) {
			return tvec3<T>(
				u.x + v.x,
				u.y + v.y,
				u.z + v.z
			);
		}
		static inline tvec3<T> sub (const tvec3<T> u, const tvec3<T> v) {
			return tvec3<T>(
				u.x - v.x,
				u.y - v.y,
				u.z - v.z
			);
		}
		static inline T dot (const tvec3<T> u, const tvec3<T> v) {
			return 
				u.x * v.x+
				u.y * v.y+
				u.z * v.z;
		}
		static inline tvec3<T> cross (const tvec3<T> u, const tvec3<T> v) 
		{
			return tvec3<T>(
				u.y * v.z - u.z * v.y,
				u.z * v.x - u.x * v.z,
				u.x * v.y - u.y * v.x
			);
		}
		static inline tvec3<T> hadamard (const tvec3<T> u, const tvec3<T> v) {
			return tvec3<T>(
				u.x * v.x,
				u.y * v.y,
				u.z * v.z
			);
		}
		static inline tvec3<T> div (const tvec3<T> u, const tvec3<T> v) {
			return tvec3<T>(
				u.x / v.x,
				u.y / v.y,
				u.z / v.z
			);
		}


		static inline T distance(const tvec3<T> u, const tvec3<T> v) 
		{
			return (u-v).magnitude();
		}




		inline double magnitude() const
		{
			return sqrt(x*x + y*y + z*z);
		}
		inline tvec3<T> normalize() const
		{
			return *this / magnitude();
		}





		// NOTE: THESE ARE NOT COMPONENT-WISE!
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT ALSO RETURN BOOL,
		// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
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
		// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
		inline bool operator>(const tvec3<T> a)
		{
			return this->magnitude() > a.magnitude();
		}
		inline bool operator>=(const tvec3<T> a)
		{
			return this->magnitude() >= a.magnitude();
		}
		inline bool operator<(const tvec3<T> a)
		{
			return this->magnitude() < a.magnitude();
		}
		inline bool operator<=(const tvec3<T> a)
		{
			return this->magnitude() <= a.magnitude();
		}
		inline bool operator==(const tvec3<T> a)
		{
			return ((*this)-a).magnitude() < 1e-4;
		}
		inline bool operator!=(const tvec3<T> a)
		{
			return ((*this)-a).magnitude() > 1e-4;
		}


		inline tvec3<T> operator+(const T a) const
		{
			return add(*this, a);
		}
		inline tvec3<T> operator-(const T a) const
		{
			return sub(*this, a);
		}
		inline tvec3<T> operator*(const T a) const
		{
			return mult(*this, a);
		}
		inline tvec3<T> operator/(const T a) const
		{
			return div(*this, a);
		}



		inline tvec3<T> operator+ (const tvec3<T> v) const 
		{
			return add (*this, v);
		}
		inline tvec3<T> operator- (const tvec3<T> v) const 
		{
			return sub (*this, v);
		}
		// NOTE: THIS IS NOT THE DOT PRODUCT!
		// THIS IS COMPONENT-WISE MULTIPLICATION
		// THIS IS DONE FOR CONSISTENCY WITH OTHER DATATYPES THAT DEMONSTRATE THE "CLOSURE" PROPERTY
		// AND ALSO TO MIMIC GLSL's "vec3" DATATYPE
		inline tvec3<T> operator* (const tvec3<T> v) const 
		{
			return hadamard(*this, v);
		}
		inline tvec3<T> operator/ (const tvec3<T> v) const 
		{
			return div (*this, v);
		}

	};

	using vec3 = tvec3<float>;
	using ivec3 = tvec3<int>;
	using uivec3 = tvec3<unsigned int>;
	using bvec3 = tvec3<bool>;
}