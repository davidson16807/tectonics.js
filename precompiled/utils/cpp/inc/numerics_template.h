#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

namespace rasters
{

	// This template represents a contiguous block of memory occupied by numeric data of arbitrary type
	// The intention is to abstract away numeric arrays that are built to address data locality issues
	// the numeric data type should be small enough to fit in a computer's register (e.g. ints, doubles, vec3s)
	// the numeric data type must have all the standard arithmetic operators as regular ints: + - * / < > <= >= == != 
	template <class T, int N>
	class numerics_template
	{
		T values[N];

	public:
		numerics_template() {};

		~numerics_template() {};

		static T min(const numerics_template<T,N>& u)
		{
			T out = u.values[0];
			for (int i = 0; i < N; ++i)
			{
				out = u.values[i] < out? u.values[i] : out;
			}
			return out;
		}
		static T max(const numerics_template<T,N>& u)
		{
			T out = u.values[0];
			for (int i = 0; i < N; ++i)
			{
				out = u.values[i] > out? u.values[i] : out;
			}
			return out;
		}
		static void min(const numerics_template<T,N>& u, const numerics_template<T,N>& v, numerics_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] <= v.values[i]? u.values[i] : v.values[i];
			}
		}
		static void max(const numerics_template<T,N>& u, const numerics_template<T,N>& v, numerics_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] >= v.values[i]? u.values[i] : v.values[i];
			}
		}

		template <class T2>
		static bool eq(const numerics_template<T,N>& u, const T2 a)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= u.values[i] == a;
			}
			return out;
		}
		template <class T2>
		static bool ne(const numerics_template<T,N>& u, const T2 a)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= u.values[i] != a;
			}
			return out;
		}
		template <class T2>
		static bool eq(const numerics_template<T,N>& u, const numerics_template<T2,N>& a)
		{
			bool out = true;
			for (int i = 0; i < N; ++i)
			{
				out &= u.values[i] == a.values[i];
			}
			return out;
		}
		template <class T2>
		static bool ne(const numerics_template<T,N>& u, const numerics_template<T2,N>& a)
		{
			bool out = false;
			for (int i = 0; i < N; ++i)
			{
				out |= u.values[i] != a.values[i];
			}
			return out;
		}



		template <class T2>
		static void eq(const numerics_template<T,N>& u, const T2 a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] == a;
			}
		}
		template <class T2>
		static void ne(const numerics_template<T,N>& u, const T2 a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] == a;
			}
		}
		template <class T2>
		static void eq(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] == a.values[i];
			}
		}
		template <class T2>
		static void ne(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] != a.values[i];
			}
		}




		template <class T2>
		static void gt(const numerics_template<T,N>& u, const T2 a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] > a;
			}
		}
		template <class T2>
		static void gte(const numerics_template<T,N>& u, const T a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] >= a;
			}
		}
		template <class T2>
		static void lt(const numerics_template<T,N>& u, const T2 a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] < a;
			}
		}
		template <class T2>
		static void lte(const numerics_template<T,N>& u, const T2 a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] <= a;
			}
		}





		template <class T2>
		static void gt(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] > a.values[i];
			}
		}
		template <class T2>
		static void gte(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] >= a.values[i];
			}
		}
		template <class T2>
		static void lt(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] <= a.values[i];
			}
		}
		template <class T2>
		static void lte(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] < a.values[i];
			}
		}





		template <class T2, class T3>
		static void add(const numerics_template<T,N>& u, const T2 a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] + a;
			}
		}
		template <class T2, class T3>
		static void sub(const numerics_template<T,N>& u, const T2 a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] - a;
			}
		}
		template <class T2, class T3>
		static void mult(const numerics_template<T,N>& u, const T2 a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] * a;
			}
		}
		template <class T2, class T3>
		static void div(const numerics_template<T,N>& u, const T2 a, numerics_template<T3,N>& out)
		{
			const T ainv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] / a;
			}
		}


		template <class T2, class T3>
		static void add(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] + a.values[i];
			}
		}
		template <class T2, class T3>
		static void sub(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] - a.values[i];
			}
		}
		template <class T2, class T3>
		static void mult(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] * a.values[i];
			}
		}
		template <class T2, class T3>
		static void div(const numerics_template<T,N>& u, const numerics_template<T2,N>& a, numerics_template<T3,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i] / a.values[i];
			}
		}



		// static void magnitude(const numerics_template<T,N>& u, numerics_template<double,N>& out) 
		// {
		// 	for (int i = 0; i < N; ++i)
		// 	{
		// 		out.values[i] = u.values[i].magnitude();
		// 	}
		// }
		// static void normalize(const numerics_template<T,N>& u, numerics_template<T,N>& out) 
		// {
		// 	for (int i = 0; i < N; ++i)
		// 	{
		// 		out.values[i] = u.values[i].normalize();
		// 	}
		// }


		template <class T2>
		bool operator==(const T2 a) const
		{
			return numerics_template<T,N>::eq(*this, a);
		}
		template <class T2>
		bool operator!=(const T2 a) const
		{
			return numerics_template<T,N>::ne(*this, a);
		}
		template <class T2>
		bool operator==(const numerics_template<T2,N>& a) const
		{
			return numerics_template<T,N>::eq(*this, a);
		}
		template <class T2>
		bool operator!=(const numerics_template<T2,N>& a) const
		{
			return numerics_template<T,N>::ne(*this, a);
		}
		

		template <class T2, class T3>
		numerics_template<T3,N> operator>(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::gt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator>=(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::gte(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator<(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::lt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator<=(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::lte(*this, a, out);
			return out;
		}

		

		template <class T2, class T3>
		numerics_template<T3,N> operator>(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::gt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator>=(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::gte(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator<(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::lt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator<=(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::lte(*this, a, out);
			return out;
		}
		




		template <class T2, class T3>
		numerics_template<T3,N> operator+(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::add(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator-(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::sub(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T,N> operator*(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::mult(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator/(const T2 a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::div(*this, a, out);
			return out;
		}


		template <class T2, class T3>
		numerics_template<T3,N> operator+(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::add(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator-(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::sub(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator*(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::mult(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3,N> operator/(const numerics_template<T2,N>& a) const
		{
			numerics_template<T3,N> out = numerics_template<T3,N>();
			numerics_template<T,N>::div(*this, a, out);
			return out;
		}


		T operator[](const int i) const
		{
		    if (i >= N) 
		    { 
		        exit(0); 
		    } 
		    return values[i];
		}
	};

	template <int N>
	using floats = numerics_template<float, N>;
	template <int N>
	using ints = numerics_template<vec3_template<int>, N>;
	template <int N>
	using bools = numerics_template<vec3_template<bool>, N>;
}
