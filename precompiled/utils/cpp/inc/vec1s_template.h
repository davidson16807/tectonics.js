#pragma once

#include <math.h>       // ceil, round 

namespace Rasters
{
	template <class T, int N>
	struct vec1s_template
	{
		T values[N];

		vec1s_template() {};

		~vec1s_template() {};



		static void add(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] + b;
			}
		}
		static void sub(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] - b;
			}
		}
		static void mult(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] * b;
			}
		}
		static void div(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			const T binv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] * binv;
			}
		}


		static void add(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] + b[i];
			}
		}
		static void sub(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] + b[i];
			}
		}
		static void mult(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] + b[i];
			}
		}
		static void div(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = a[i] + b[i];
			}
		}



		vec1s_template<T,N> operator+(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator-(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator*(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator/(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec1s_template<T,N> operator+(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator-(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator/(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::div(*this, a, out);
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
	using floats = vec1s_template<double, N>;
	template <int N>
	using ints = vec1s_template<int, N>;
	template <int N>
	using bools = vec1s_template<bool, N>;


}
