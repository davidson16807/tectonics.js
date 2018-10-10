#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec3_template.h"
#include "vec1s_template.h"

namespace Rasters
{
	template <class T, int N>
	class vec3s_template
	{
		vec3_template<T> values[N];

	public:
		vec3s_template() {};

		vec3s_template(const T x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = x;
				values[i].z = x;
			}
		};

		vec3s_template(const vec1s_template<T,N>& x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = x[i];
				values[i].z = x[i];
			}
		};

		vec3s_template(const T x, 					const T y, 					const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
				values[i].z = z;
			}
		};

		vec3s_template(const vec1s_template<T,N>& x, 	const T y, 					const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
				values[i].z = z;
			}
		};

		vec3s_template(const T x, 					const vec1s_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z;
			}
		};

		vec3s_template(const vec1s_template<T,N>& x, 	const vec1s_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z;
			}
		};
		vec3s_template(const T x, 					const T y, 					const vec1s_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
				values[i].z = z[i];
			}
		};

		vec3s_template(const vec1s_template<T,N>& x, 	const T y, 					const vec1s_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
				values[i].z = z[i];
			}
		};

		vec3s_template(const T x, 					const vec1s_template<T,N>& y, const vec1s_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y[i];
				values[i].z = z[i];
			}
		};

		vec3s_template(const vec1s_template<T,N>& x, 	const vec1s_template<T,N>& y, const vec1s_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z[i];
			}
		};

		vec3s_template(const vec3_template<T> u)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i] = u;
			}
		};
		vec3s_template(const vec3s_template<T,N>& u)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i] = u.values[i];
			}
		};




		~vec3s_template() {};




		static bool eq(const vec3s_template<T,N>& u, const T a, const T threshold)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= (u.values[i] - a).magnitude() < threshold;
			}
			return out;
		}
		static bool ne(const vec3s_template<T,N>& u, const T a, const T threshold)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= (u.values[i] - a).magnitude() > threshold;
			}
			return out;
		}
		static bool eq(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, const T threshold)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= (u.values[i] - a.values[i]).magnitude() < threshold;
			}
			return out;
		}
		static bool ne(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, const T threshold)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= (u.values[i] - a.values[i]).magnitude() > threshold;
			}
			return out;
		}
		static bool eq(const vec3s_template<T,N>& u, const vec3_template<T> v, const T threshold)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= (u.values[i] - v).magnitude() < threshold;
			}
			return out;
		}
		static bool ne(const vec3s_template<T,N>& u, const vec3_template<T> v, const T threshold)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= (u.values[i] - v).magnitude() > threshold;
			}
			return out;
		}
		static bool eq(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, const T threshold)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= (u.values[i] - v.values[i]).magnitude() < threshold;
			}
			return out;
		}
		static bool ne(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, const T threshold)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= (u.values[i] - v.values[i]).magnitude() > threshold;
			}
			return out;
		}




		static void eq(const vec3s_template<T,N>& u, const T a, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - a).magnitude() < threshold;
			}
		}
		static void ne(const vec3s_template<T,N>& u, const T a, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - a).magnitude() > threshold;
			}
		}

		static void eq(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - a.values[i]).magnitude() < threshold;
			}
		}
		static void ne(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - a.values[i]).magnitude() > threshold;
			}
		}


		static void eq(const vec3s_template<T,N>& u, const vec3_template<T> v, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - v).magnitude() < threshold;
			}
		}
		static void ne(const vec3s_template<T,N>& u, const vec3_template<T> v, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - v).magnitude() > threshold;
			}
		}


		static void eq(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - v.values[i]).magnitude() < threshold;
			}
		}
		static void ne(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = (u.values[i] - v.values[i]).magnitude() > threshold;
			}
		}



		static void gt(const vec3s_template<T,N>& u, const T a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gt(u.values[i], a);
			}
		}
		static void gte(const vec3s_template<T,N>& u, const T a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gte(u.values[i], a);
			}
		}
		static void lt(const vec3s_template<T,N>& u, const T a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lt(u.values[i], a);
			}
		}
		static void lte(const vec3s_template<T,N>& u, const T a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lte(u.values[i], a);
			}
		}
		static void eq(const vec3s_template<T,N>& u, const T a, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::eq(u.values[i], a, threshold);
			}
		}
		static void ne(const vec3s_template<T,N>& u, const T a, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::ne(u.values[i], a, threshold);
			}
		}





		static void gt(const vec3s_template<T,N>& u, const vec1s_template<T,N> a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gt(u.values[i], a.values[i]);
			}
		}
		static void gte(const vec3s_template<T,N>& u, const vec1s_template<T,N> a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gte(u.values[i], a.values[i]);
			}
		}
		static void lt(const vec3s_template<T,N>& u, const vec1s_template<T,N> a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lt(u.values[i], a.values[i]);
			}
		}
		static void lte(const vec3s_template<T,N>& u, const vec1s_template<T,N> a, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lte(u.values[i], a.values[i]);
			}
		}
		static void eq(const vec3s_template<T,N>& u, const vec1s_template<T,N> a, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::eq(u.values[i], a.values[i], threshold);
			}
		}
		static void ne(const vec3s_template<T,N>& u, const vec1s_template<T,N> a, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::ne(u.values[i], a.values[i], threshold);
			}
		}





		static void gt(const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gt(u.values[i], v);
			}
		}
		static void gte(const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gte(u.values[i], v);
			}
		}
		static void lt(const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lt(u.values[i], v);
			}
		}
		static void lte(const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lte(u.values[i], v);
			}
		}
		static void eq(const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::eq(u.values[i], v, threshold);
			}
		}
		static void ne(const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::ne(u.values[i], v, threshold);
			}
		}





		static void gt(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gt(u.values[i], v.values[i]);
			}
		}
		static void gte(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::gte(u.values[i], v.values[i]);
			}
		}
		static void lt(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lt(u.values[i], v.values[i]);
			}
		}
		static void lte(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::lte(u.values[i], v.values[i]);
			}
		}
		static void eq(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::eq(u.values[i], v.values[i], threshold);
			}
		}
		static void ne(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::ne(u.values[i], v.values[i], threshold);
			}
		}



		static void add(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::add(u.values[i], a);
			}
		}
		static void sub(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::sub(u.values[i], a);
			}
		}
		static void mult(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::mult(u.values[i], a);
			}
		}
		static void div(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			const T ainv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::mult(u.values[i], ainv);
			}
		}


		static void add(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::add(u.values[i], a.values[i]);
			}
		}
		static void sub(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::sub(u.values[i], a.values[i]);
			}
		}
		static void mult(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::mult(u.values[i], a.values[i]);
			}
		}
		static void div(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::div(u.values[i], a.values[i]);
			}
		}


		static void add (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::add(u.values[i], v);
			}
		}
		static void sub (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::sub(u.values[i], v);
			}
		}
		static void dot (const vec3s_template<T,N>& u, const vec3_template<T> v, vec1s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::dot(u.values[i], v);
			}
		}
		static void cross (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::cross(u.values[i], v);
			}
		}
		static void hadamard (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::hadamard(u.values[i], v);
			}
		}
		static void div (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::div(u.values[i], v);
			}
		}
		static void distance(const vec3s_template<T,N>& u, const vec3_template<T> v, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::distance(u.values[i], v);
			}
		}


		static void add (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::add(u.values[i], v.values[i]);
			}
		}
		static void sub (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::sub(u.values[i], v.values[i]);
			}
		}
		static void dot (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec1s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::dot(u.values[i], v.values[i]);
			}
		}
		static void cross (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::cross(u.values[i], v.values[i]);
			}
		}
		static void hadamard (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::hadamard(u.values[i], v.values[i]);
			}
		}
		static void div (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::div(u.values[i], v.values[i]);
			}
		}
		static void distance(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::distance(u.values[i], v.values[i]);
			}
		}


		static void magnitude(const vec3s_template<T,N>& u, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}
		static void normalize(const vec3s_template<T,N>& u, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
		}


		bool operator==(const T a) const
		{
			return vec3s_template<T,N>::eq(*this, a);
		}
		bool operator!=(const T a) const
		{
			return vec3s_template<T,N>::ne(*this, a);
		}
		bool operator==(const vec1s_template<T,N> a) const
		{
			return vec3s_template<T,N>::eq(*this, a);
		}
		bool operator!=(const vec1s_template<T,N> a) const
		{
			return vec3s_template<T,N>::ne(*this, a);
		}
		bool operator==(const vec3_template<T> v) const
		{
			return vec3s_template<T,N>::eq(*this, v);
		}
		bool operator!=(const vec3_template<T> v) const
		{
			return vec3s_template<T,N>::ne(*this, v);
		}
		bool operator==(const vec3s_template<T,N>& v) const
		{
			return vec3s_template<T,N>::eq(*this, v);
		}
		bool operator!=(const vec3s_template<T,N>& v) const
		{
			return vec3s_template<T,N>::ne(*this, v);
		}
		

		vec3s_template<bool,N> operator>(const T a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec3s_template<bool,N> operator>=(const T a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec3s_template<bool,N> operator<(const T a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec3s_template<bool,N> operator<=(const T a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lte(*this, a, out);
			return out;
		}

		

		vec3s_template<bool,N> operator>(const vec1s_template<T,N> a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec3s_template<bool,N> operator>=(const vec1s_template<T,N> a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec3s_template<bool,N> operator<(const vec1s_template<T,N> a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec3s_template<bool,N> operator<=(const vec1s_template<T,N> a) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lte(*this, a, out);
			return out;
		}
		


		vec3s_template<bool,N> operator>(const vec3_template<T> v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gt(*this, v, out);
			return out;
		}
		vec3s_template<bool,N> operator>=(const vec3_template<T> v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gte(*this, v, out);
			return out;
		}
		vec3s_template<bool,N> operator<(const vec3_template<T> v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lt(*this, v, out);
			return out;
		}
		vec3s_template<bool,N> operator<=(const vec3_template<T> v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lte(*this, v, out);
			return out;
		}

		

		vec3s_template<bool,N> operator>(const vec3s_template<T,N>& v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gt(*this, v, out);
			return out;
		}
		vec3s_template<bool,N> operator>=(const vec3s_template<T,N>& v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::gte(*this, v, out);
			return out;
		}
		vec3s_template<bool,N> operator<(const vec3s_template<T,N>& v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lt(*this, v, out);
			return out;
		}
		vec3s_template<bool,N> operator<=(const vec3s_template<T,N>& v) const
		{
			vec3s_template<bool,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::lte(*this, v, out);
			return out;
		}



		vec3s_template<T,N> operator+(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator-(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator*(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator/(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec3s_template<T,N> operator+(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator-(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator*(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator/(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec3s_template<T,N> operator+(const vec3_template<T> u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator-(const vec3_template<T> u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec3_template<T> u) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator/(const vec3_template<T> u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, u, out);
			return out;
		}


		vec3s_template<T,N> operator+(const vec3s_template<T,N>& u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator-(const vec3s_template<T,N>& u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec3s_template<T,N>& u) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator/(const vec3s_template<T,N>& u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, u, out);
			return out;
		}


		vec3_template<T> operator[](const int i) const
		{
		    if (i >= N) 
		    { 
		        exit(0); 
		    } 
		    return vec3_template<T>(values[i]);
		}
	};

	template <int N>
	using vec3s = vec3s_template<double, N>;
	template <int N>
	using ivec3s = vec3s_template<int, N>;
	template <int N>
	using bvec3s = vec3s_template<bool, N>;
}
