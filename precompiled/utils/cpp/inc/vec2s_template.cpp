#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec2_template.h"
#include "vec1s_template.h"

namespace Rasters
{
	template <class T, int N>
	class vec2s_template
	{
		vec2_template<T> values[N];

	public:
		vec2s_template() {};

		vec2s_template(const T x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = x;
			}
		};

		vec2s_template(const vec1s_template<T,N>& x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = x[i];
			}
		};

		vec2s_template(const T x, 					const T y)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
			}
		};

		vec2s_template(const vec1s_template<T,N>& x, 	const T y)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
			}
		};

		vec2s_template(const T x, 					const vec1s_template<T,N>& y)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
			}
		};

		vec2s_template(const vec1s_template<T,N>& x, 	const vec1s_template<T,N>& y)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
			}
		};

		vec2s_template(const vec2_template<T> u)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i] = u;
			}
		};
		vec2s_template(const vec2s_template<T,N>& u)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i] = u.values[i];
			}
		};








		~vec2s_template() {};



		static void gt(const vec2s_template<T,N>& u, const T a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gt(u.values[i], a);
			}
		}
		static void gte(const vec2s_template<T,N>& u, const T a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gte(u.values[i], a);
			}
		}
		static void lt(const vec2s_template<T,N>& u, const T a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lt(u.values[i], a);
			}
		}
		static void lte(const vec2s_template<T,N>& u, const T a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lte(u.values[i], a);
			}
		}
		static void eq(const vec2s_template<T,N>& u, const T a, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::eq(u.values[i], a, threshold);
			}
		}
		static void ne(const vec2s_template<T,N>& u, const T a, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::ne(u.values[i], a, threshold);
			}
		}





		static void gt(const vec2s_template<T,N>& u, const vec1s_template<T,N> a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gt(u.values[i], a.values[i]);
			}
		}
		static void gte(const vec2s_template<T,N>& u, const vec1s_template<T,N> a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gte(u.values[i], a.values[i]);
			}
		}
		static void lt(const vec2s_template<T,N>& u, const vec1s_template<T,N> a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lt(u.values[i], a.values[i]);
			}
		}
		static void lte(const vec2s_template<T,N>& u, const vec1s_template<T,N> a, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lte(u.values[i], a.values[i]);
			}
		}
		static void eq(const vec2s_template<T,N>& u, const vec1s_template<T,N> a, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::eq(u.values[i], a.values[i], threshold);
			}
		}
		static void ne(const vec2s_template<T,N>& u, const vec1s_template<T,N> a, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::ne(u.values[i], a.values[i], threshold);
			}
		}





		static void gt(const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gt(u.values[i], v);
			}
		}
		static void gte(const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gte(u.values[i], v);
			}
		}
		static void lt(const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lt(u.values[i], v);
			}
		}
		static void lte(const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lte(u.values[i], v);
			}
		}
		static void eq(const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::eq(u.values[i], v, threshold);
			}
		}
		static void ne(const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::ne(u.values[i], v, threshold);
			}
		}





		static void gt(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gt(u.values[i], v.values[i]);
			}
		}
		static void gte(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gte(u.values[i], v.values[i]);
			}
		}
		static void lt(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lt(u.values[i], v.values[i]);
			}
		}
		static void lte(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lte(u.values[i], v.values[i]);
			}
		}
		static void eq(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::eq(u.values[i], v.values[i], threshold);
			}
		}
		static void ne(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::ne(u.values[i], v.values[i], threshold);
			}
		}



		static void add(const vec2s_template<T,N>& u, const T a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::add(u.values[i], a);
			}
		}
		static void sub(const vec2s_template<T,N>& u, const T a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::sub(u.values[i], a);
			}
		}
		static void mult(const vec2s_template<T,N>& u, const T a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::mult(u.values[i], a);
			}
		}
		static void div(const vec2s_template<T,N>& u, const T a, vec2s_template<T,N>& out)
		{
			const T ainv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::mult(u.values[i], ainv);
			}
		}


		static void add(const vec2s_template<T,N>& u, const vec1s_template<T,N>& a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::add(u.values[i], a.values[i]);
			}
		}
		static void sub(const vec2s_template<T,N>& u, const vec1s_template<T,N>& a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::sub(u.values[i], a.values[i]);
			}
		}
		static void mult(const vec2s_template<T,N>& u, const vec1s_template<T,N>& a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::mult(u.values[i], a.values[i]);
			}
		}
		static void div(const vec2s_template<T,N>& u, const vec1s_template<T,N>& a, vec2s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::div(u.values[i], a.values[i]);
			}
		}


		static void add (const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::add(u.values[i], v);
			}
		}
		static void sub (const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::sub(u.values[i], v);
			}
		}
		static void dot (const vec2s_template<T,N>& u, const vec2_template<T> v, vec1s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v);
			}
		}
		static void cross (const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::cross(u.values[i], v);
			}
		}
		static void hadamard (const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::hadamard(u.values[i], v);
			}
		}
		static void div (const vec2s_template<T,N>& u, const vec2_template<T> v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::div(u.values[i], v);
			}
		}
		static void distance(const vec2s_template<T,N>& u, const vec2_template<T> v, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v);
			}
		}


		static void add (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::add(u.values[i], v.values[i]);
			}
		}
		static void sub (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::sub(u.values[i], v.values[i]);
			}
		}
		static void dot (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec1s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v.values[i]);
			}
		}
		static void cross (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::cross(u.values[i], v.values[i]);
			}
		}
		static void hadamard (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::hadamard(u.values[i], v.values[i]);
			}
		}
		static void div (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec2s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::div(u.values[i], v.values[i]);
			}
		}
		static void distance(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v.values[i]);
			}
		}


		static void magnitude(const vec2s_template<T,N>& u, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}
		static void normalize(const vec2s_template<T,N>& u, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
		}

		vec2s_template<bool,N> operator>(const T a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator>=(const T a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<(const T a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<=(const T a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator==(const T a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::eq(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator!=(const T a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::ne(*this, a, out);
			return out;
		}

		vec2s_template<bool,N> operator>(const vec1s_template<T,N> a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator>=(const vec1s_template<T,N> a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<(const vec1s_template<T,N> a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<=(const vec1s_template<T,N> a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator==(const vec1s_template<T,N> a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::eq(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator!=(const vec1s_template<T,N> a) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::ne(*this, a, out);
			return out;
		}

		vec2s_template<bool,N> operator>(const vec2_template<T> v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator>=(const vec2_template<T> v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<(const vec2_template<T> v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<=(const vec2_template<T> v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator==(const vec2_template<T> v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::eq(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator!=(const vec2_template<T> v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::ne(*this, a, out);
			return out;
		}

		vec2s_template<bool,N> operator>(const vec2s_template<T,N>& v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator>=(const vec2s_template<T,N>& v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<(const vec2s_template<T,N>& v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator<=(const vec2s_template<T,N>& v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::lte(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator==(const vec2s_template<T,N>& v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::eq(*this, a, out);
			return out;
		}
		vec2s_template<bool,N> operator!=(const vec2s_template<T,N>& v) const
		{
			vec2s_template<bool,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::ne(*this, a, out);
			return out;
		}




		vec2s_template<T,N> operator+(const T a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec2s_template<T,N> operator-(const T a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec2s_template<T,N> operator*(const T a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec2s_template<T,N> operator/(const T a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec2s_template<T,N> operator+(const vec1s_template<T,N>& a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec2s_template<T,N> operator-(const vec1s_template<T,N>& a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec2s_template<T,N> operator*(const vec1s_template<T,N>& a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec2s_template<T,N> operator/(const vec1s_template<T,N>& a) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec2s_template<T,N> operator+(const vec2_template<T> u) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec2s_template<T,N> operator-(const vec2_template<T> u) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec2_template<T> u) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec2s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec2s_template<T,N> operator/(const vec2_template<T> u) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::div(*this, u, out);
			return out;
		}


		vec2s_template<T,N> operator+(const vec2s_template<T,N>& u) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec2s_template<T,N> operator-(const vec2s_template<T,N>& u) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec2s_template<T,N>& u) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec2s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec2s_template<T,N> operator/(const vec2s_template<T,N>& u) const
		{
			vec2s_template<T,N> out = vec2s_template<T,N>();
			vec2s_template<T,N>::div(*this, u, out);
			return out;
		}


		vec2_template<T> operator[](const int i) const
		{
		    if (i >= N) 
		    { 
		        exit(0); 
		    } 
		    return vec2_template<T>(values[i]);
		}
	};

	template <int N>
	using vec2s = vec2s_template<double, N>;
	template <int N>
	using ivec2s = vec2s_template<int, N>;
	template <int N>
	using bvec2s = vec2s_template<bool, N>;

	template <class T, int N>
	struct vec2_raster: vec2s_template<T,N>
	{
		//Grid* grid;
		//mat4* frame;
		vec2_raster(){};
		~vec2_raster(){};
	};
}
