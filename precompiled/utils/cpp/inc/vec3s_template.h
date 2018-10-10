#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec3_template.h"
#include "dataseries_template.h"

namespace Rasters
{
	template <class T, int N>
	class vec3s_template : dataseries_template<vec3_template<T>, N>
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

		vec3s_template(const dataseries_template<T,N>& x) 
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

		vec3s_template(const dataseries_template<T,N>& x, 	const T y, 					const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
				values[i].z = z;
			}
		};

		vec3s_template(const T x, 					const dataseries_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z;
			}
		};

		vec3s_template(const dataseries_template<T,N>& x, 	const dataseries_template<T,N>& y, const T z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y[i];
				values[i].z = z;
			}
		};
		vec3s_template(const T x, 					const T y, 					const dataseries_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y;
				values[i].z = z[i];
			}
		};

		vec3s_template(const dataseries_template<T,N>& x, 	const T y, 					const dataseries_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x[i];
				values[i].y = y;
				values[i].z = z[i];
			}
		};

		vec3s_template(const T x, 					const dataseries_template<T,N>& y, const dataseries_template<T,N>&  z)
		{
			for (int i = 0; i < N; ++i)
			{
				values[i].x = x;
				values[i].y = y[i];
				values[i].z = z[i];
			}
		};

		vec3s_template(const dataseries_template<T,N>& x, 	const dataseries_template<T,N>& y, const dataseries_template<T,N>&  z)
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


		static void dot (const vec3s_template<T,N>& u, const vec3_template<T> v, dataseries_template<T,N>& out) {
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
		static void distance(const vec3s_template<T,N>& u, const vec3_template<T> v, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::distance(u.values[i], v);
			}
		}


		static void dot (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, dataseries_template<T,N>& out) {
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
		static void distance(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec3_template<T>::distance(u.values[i], v.values[i]);
			}
		}


		static void magnitude(const vec3s_template<T,N>& u, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}
		static void normalize(const vec3s_template<T,N>& u, dataseries_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
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
