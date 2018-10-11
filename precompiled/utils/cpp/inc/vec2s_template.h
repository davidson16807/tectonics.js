#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec2_template.h"
#include "dataseries_template.h"

namespace rasters
{
	template <class T, int N>
	class vec2s_template : dataseries_template<vec2_template<T>, N>
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

		vec2s_template(const dataseries_template<T,N>& x) 
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = x[i];
			}
		};

		vec2s_template(const T x, 					const T y, 					const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
			}
		};

		vec2s_template(const dataseries_template<T,N>& x, 	const T y, 					const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
			}
		};

		vec2s_template(const T x, 						const dataseries_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
			}
		};

		vec2s_template(const dataseries_template<T,N>& x, const dataseries_template<T,N>& y, const T z)
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

		static void dot (const vec2s_template<T,N>& u, const vec2_template<T> v, dataseries_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v);
			}
		}
		static void cross (const vec2s_template<T,N>& u, const vec2_template<T> v, dataseries_template<T,N>& out) 
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
		static void distance(const vec2s_template<T,N>& u, const vec2_template<T> v, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v);
			}
		}


		static void dot (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, dataseries_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v.values[i]);
			}
		}
		static void cross (const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, dataseries_template<T,N>& out) 
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
		static void distance(const vec2s_template<T,N>& u, const vec2s_template<T,N>& v, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v.values[i]);
			}
		}

		static void magnitude(const vec2s_template<T,N>& u, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}

		static void normalize(const vec2s_template<T,N>& u, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
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
}
