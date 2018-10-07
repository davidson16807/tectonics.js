#pragma once

#include <math.h>       // ceil, round 

#include "vec3_template.h"
#include "vec1s_template.h"

namespace Rasters
{
	template <class T, int N>
	struct vec3s_template
	{
		T x[N];
		T y[N];
		T z[N];

		vec3s_template() {};
		~vec3s_template() {};

		static void magnitude(const vec3s_template<T,N>& a, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i]  = pow(a.x[i], 2);
			}
			for (int i = 0; i < N; ++i)
			{
				out[i] += pow(a.y[i], 2);
			}
			for (int i = 0; i < N; ++i)
			{
				out[i] += pow(a.z[i], 2);
			}
			for (int i = 0; i < N; ++i)
			{
				out[i] = sqrt(out[i]);
			}
		}
		static void distance(const vec3s_template<T,N>& a, const vec3s_template<T,N>& b, vec1s_template<T,N>& out) 
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
		static void add(const vec3s_template<T,N>& a, const vec3s_template<T,N>& b, vec3s_template<T,N>& out)
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
		static void mult(const vec3s_template<T,N>& a, const vec3s_template<T,N>& b, vec3s_template<T,N>& out)
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
		vec3s_template<T,N> operator*(const double scalar) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			mult(this, scalar, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec3s_template<T,N> vector) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			dot(this, vector, out);
			return out;
		}
		vec3s_template<T,N> operator+(const vec3s_template<T,N> vector) const
		{
			for (int i = 0; i < N; ++i)
			{

			}
		}
	};

	template <int N>
	using vec3s = vec3s_template<double, N>;
	template <int N>
	using ivec3s = vec3s_template<int, N>;
	template <int N>
	using bvec3s = vec3s_template<bool, N>;

	template <class T, int N>
	struct vec3_raster: vec3s_template<T,N>
	{
		//Grid* grid;
		//mat4* frame;
		vec3s_raster(){};
		~vec3s_raster(){};
	};
}
