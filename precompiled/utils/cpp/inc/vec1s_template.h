#pragma once

#include <math.h>       // ceil, round 

namespace Rasters
{
	template <class T, int N>
	struct vec1s_template
	{
		T x[N];

		vec1s_template() {};
		~vec1s_template() {};

		static void magnitude(const vec1s_template<T,N>& a, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i]  = abs(a.x[i]);
			}
		}
		static void distance(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i]  = pow(a.x[i]-b.x[i], 2);
			}
			for (int i = 0; i < N; ++i)
			{
				out[i] += pow(a.y[i]-b.y[i], 2);
			}
			for (int i = 0; i < N; ++i)
			{
				out[i] += pow(a.z[i]-b.z[i], 2);
			}
			for (int i = 0; i < N; ++i)
			{
				out[i] = sqrt(out[i]);
			}
		}
		static void add(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.x[i] = a.x[i] + b.x[i];
			}
			for (int i = 0; i < N; ++i)
			{
				out.y[i] = a.y[i] + b.y[i];
			}
			for (int i = 0; i < N; ++i)
			{
				out.z[i] = a.z[i] + b.z[i];
			}
		}
		static void mult(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.x[i] = a.x[i] * b.x[i];
			}
			for (int i = 0; i < N; ++i)
			{
				out.y[i] = a.y[i] * b.y[i];
			}
			for (int i = 0; i < N; ++i)
			{
				out.z[i] = a.z[i] * b.z[i];
			}
		}
		vec1s_template<T,N> operator*(const T scalar) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			mult(this, scalar, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec1s_template<T,N> vector) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			dot(this, vector, out);
			return out;
		}
		vec1s_template<T,N> operator+(const vec1s_template<T,N> vector) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			add(this, vector, out);
			return out;
		}
	};

	template <int N>
	using floats = vec1s_template<double, N>;
	template <int N>
	using ints = vec1s_template<int, N>;
	template <int N>
	using bools = vec1s_template<bool, N>;


}
