#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec2_template.h"
#include "numerics_template.h"

namespace rasters
{
	template<class T, int N>
	class numerics_template<vec2_template<T>, N>{
		T values[N];

	public:
		numerics_template(const T x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = x;
				values[i].z = x;
			}
		};

		numerics_template(const numerics_template<T,N>& x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = x[i];
				values[i].z = x[i];
			}
		};

		numerics_template(const T x, const T y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
				values[i].z = z;
			}
		};
		numerics_template(const numerics_template<T,N>& x, const T y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
				values[i].z = z;
			}
		};

		numerics_template(const T x, const numerics_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y[i];
				values[i].z = z;
			}
		};

		numerics_template(const numerics_template<T,N>& x, const numerics_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z;
			}
		};

		numerics_template(const T x, const T y, const numerics_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
				values[i].z = z[i];
			}
		};

		numerics_template(const numerics_template<T,N>& x, const T y, const numerics_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
				values[i].z = z[i];
			}
		};

		numerics_template(const T x, const numerics_template<T,N>& y, const numerics_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y[i];
				values[i].z = z[i];
			}
		};

		numerics_template(const numerics_template<T,N>& x, const numerics_template<T,N>& y, const numerics_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z[i];
			}
		};

		numerics_template(const vec2_template<T> u)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i] = u;
			}
		};
		numerics_template(const numerics_template<vec2_template<T>,N>& u)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i] = u.values[i];
			}
		};

		static void dot (const numerics_template<vec2_template<T>,N>& u, const vec2_template<T> v, numerics_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v);
			}
		}
		static void cross (const numerics_template<vec2_template<T>,N>& u, const vec2_template<T> v, numerics_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::cross(u.values[i], v);
			}
		}
		static void hadamard (const numerics_template<vec2_template<T>,N>& u, const vec2_template<T> v, numerics_template<vec2_template<T>,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::hadamard(u.values[i], v);
			}
		}
		static void distance(const numerics_template<vec2_template<T>,N>& u, const vec2_template<T> v, numerics_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v);
			}
		}


		static void dot (const numerics_template<vec2_template<T>,N>& u, const numerics_template<vec2_template<T>,N>& v, numerics_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v.values[i]);
			}
		}
		static void cross (const numerics_template<vec2_template<T>,N>& u, const numerics_template<vec2_template<T>,N>& v, numerics_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::cross(u.values[i], v.values[i]);
			}
		}
		static void hadamard (const numerics_template<vec2_template<T>,N>& u, const numerics_template<vec2_template<T>,N>& v, numerics_template<vec2_template<T>,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::hadamard(u.values[i], v.values[i]);
			}
		}
		static void distance(const numerics_template<vec2_template<T>,N>& u, const numerics_template<vec2_template<T>,N>& v, numerics_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v.values[i]);
			}
		}

		static void magnitude(const numerics_template<vec2_template<T>,N>& u, numerics_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}

		static void normalize(const numerics_template<vec2_template<T>,N>& u, numerics_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
		}

	};

	template <int N>
	using vec2s = numerics_template<vec2_template<float>, N>;
	template <int N>
	using ivec2s = numerics_template<vec2_template<int>, N>;
	template <int N>
	using bvec2s = numerics_template<vec2_template<bool>, N>;
}
