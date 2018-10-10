#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec3_template.h"
#include "vec1s_template.h"

namespace Rasters
{

	// A "data series" is a contiguous block of memory occupied by many values of the same simple data type
	// the data type must be small enough to fit in a computer's register (e.g. ints, doubles, vec3s)
	// and must have all the standard arithmetic operators (e.g. +, -, *, /)
	template <class T, int N>
	class dataseries_template
	{
		T values[N];

	public:
		dataseries_template() {};

		~dataseries_template() {};

		template <class T2>
		static bool eq(const dataseries_template<T,N>& u, const T2 a)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= u.values[i] == a;
			}
			return out;
		}
		template <class T2>
		static bool ne(const dataseries_template<T,N>& u, const T2 a)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= u.values[i] != a;
			}
			return out;
		}
		template <class T2>
		static bool eq(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= u.values[i] == a.values[i];
			}
			return out;
		}
		template <class T2>
		static bool ne(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= u.values[i] != a.values[i];
			}
			return out;
		}



		template <class T2>
		static void eq(const dataseries_template<T,N>& u, const T2 a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] == a;
			}
		}
		template <class T2>
		static void ne(const dataseries_template<T,N>& u, const T2 a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] == a;
			}
		}
		template <class T2>
		static void eq(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] == a.values[i];
			}
		}
		template <class T2>
		static void ne(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] != a.values[i];
			}
		}




		template <class T2>
		static void gt(const dataseries_template<T,N>& u, const T2 a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] > a;
			}
		}
		template <class T2>
		static void gte(const dataseries_template<T,N>& u, const T a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] >= a;
			}
		}
		template <class T2>
		static void lt(const dataseries_template<T,N>& u, const T2 a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] < a;
			}
		}
		template <class T2>
		static void lte(const dataseries_template<T,N>& u, const T2 a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] <= a;
			}
		}





		template <class T2>
		static void gt(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] > a.values[i];
			}
		}
		template <class T2>
		static void gte(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] >= a.values[i];
			}
		}
		template <class T2>
		static void lt(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] <= a.values[i];
			}
		}
		template <class T2>
		static void lte(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] < a.values[i];
			}
		}





		template <class T2, class T3>
		static void add(const dataseries_template<T,N>& u, const T2 a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] + a;
			}
		}
		template <class T2, class T3>
		static void sub(const dataseries_template<T,N>& u, const T2 a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] - a;
			}
		}
		template <class T2, class T3>
		static void mult(const dataseries_template<T,N>& u, const T2 a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] * a;
			}
		}
		template <class T2, class T3>
		static void div(const dataseries_template<T,N>& u, const T2 a, dataseries_template<T3,N>& out)
		{
			const T ainv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] / a;
			}
		}


		template <class T2, class T3>
		static void add(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] + a.values[i];
			}
		}
		template <class T2, class T3>
		static void sub(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] - a.values[i];
			}
		}
		template <class T2, class T3>
		static void mult(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] * a.values[i];
			}
		}
		template <class T2, class T3>
		static void div(const dataseries_template<T,N>& u, const dataseries_template<T2,N>& a, dataseries_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] / a.values[i];
			}
		}



		// static void magnitude(const dataseries_template<T,N>& u, dataseries_template<double,N>& out) 
		// {
		// 	for (int i = 0; i < N; ++i)
		// 	{
		// 		out.values[i] = u.values[i].magnitude();
		// 	}
		// }
		// static void normalize(const dataseries_template<T,N>& u, dataseries_template<T,N>& out) 
		// {
		// 	for (int i = 0; i < N; ++i)
		// 	{
		// 		out.values[i] = u.values[i].normalize();
		// 	}
		// }


		template <class T2>
		bool operator==(const T2 a) const
		{
			return dataseries_template<T,N>::eq(*this, a);
		}
		template <class T2>
		bool operator!=(const T2 a) const
		{
			return dataseries_template<T,N>::ne(*this, a);
		}
		template <class T2>
		bool operator==(const dataseries_template<T2,N>& a) const
		{
			return dataseries_template<T,N>::eq(*this, a);
		}
		template <class T2>
		bool operator!=(const dataseries_template<T2,N>& a) const
		{
			return dataseries_template<T,N>::ne(*this, a);
		}
		

		template <class T2, class T3>
		dataseries_template<T3,N> operator>(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::gt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator>=(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::gte(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator<(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::lt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator<=(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::lte(*this, a, out);
			return out;
		}

		

		template <class T2, class T3>
		dataseries_template<T3,N> operator>(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::gt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator>=(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::gte(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator<(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::lt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator<=(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::lte(*this, a, out);
			return out;
		}
		




		template <class T2, class T3>
		dataseries_template<T3,N> operator+(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::add(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator-(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::sub(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T,N> operator*(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::mult(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator/(const T2 a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::div(*this, a, out);
			return out;
		}


		template <class T2, class T3>
		dataseries_template<T3,N> operator+(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::add(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator-(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::sub(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator*(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::mult(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		dataseries_template<T3,N> operator/(const dataseries_template<T2,N>& a) const
		{
			dataseries_template<T3,N> out = dataseries_template<T3,N>();
			dataseries_template<T,N>::div(*this, a, out);
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

}
