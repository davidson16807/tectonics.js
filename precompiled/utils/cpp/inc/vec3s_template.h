#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec3_template.h"
#include "numerics_template.h"

namespace rasters
{
	template<class T>
	class vec3s_template : numerics_template<vec3_template<T>>{

	public:

		vec3s_template(const unsigned int N) 
		{
			this->N = N;
			this->values = new T[this->N];
		};

		vec3s_template(const unsigned int N, const T x)  
		{
			this->N = N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = x;
				this->values[i].z = x;
			}
		};

		vec3s_template(const numerics_template<T>& x)   
		{
			this->N = x.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = x[i];
				this->values[i].z = x[i];
			}
		};

		vec3s_template(const unsigned int N, const T x, const T y, const T z)  
		{
			this->N = N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
				this->values[i].z = z;
			}
		};
		vec3s_template(const numerics_template<T>& x, const T y, const T z)  
		{
			this->N = x.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
				this->values[i].z = z;
			}
		};

		vec3s_template(const T x, const numerics_template<T>& y, const T z)  
		{
			this->N = y.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
				this->values[i].z = z;
			}
		};

		vec3s_template(const numerics_template<T>& x, const numerics_template<T>& y, const T z)   
		{
			this->N = y.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
				this->values[i].z = z;
			}
		};

		vec3s_template(const T x, const T y, const numerics_template<T>&  z)  
		{
			this->N = z.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
				this->values[i].z = z[i];
			}
		};

		vec3s_template(const numerics_template<T>& x, const T y, const numerics_template<T>&  z)  
		{
			this->N = z.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
				this->values[i].z = z[i];
			}
		};

		vec3s_template(const T x, const numerics_template<T>& y, const numerics_template<T>&  z)  
		{
			this->N = z.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
				this->values[i].z = z[i];
			}
		};

		vec3s_template(const numerics_template<T>& x, const numerics_template<T>& y, const numerics_template<T>&  z)  
		{
			this->N = z.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
				this->values[i].z = z[i];
			}
		};

		static void dot (const vec3s_template<T>& u, const vec3_template<T> v, numerics_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::dot(u.values[i], v);
			}
		}
		static void cross (const vec3s_template<T>& u, const vec3_template<T> v, vec3s_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::cross(u.values[i], v);
			}
		}
		static void hadamard (const vec3s_template<T>& u, const vec3_template<T> v, vec3s_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::hadamard(u.values[i], v);
			}
		}
		static void distance(const vec3s_template<T>& u, const vec3_template<T> v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::distance(u.values[i], v);
			}
		}


		static void dot (const vec3s_template<T>& u, const vec3s_template<T>& v, numerics_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::dot(u.values[i], v.values[i]);
			}
		}
		static void cross (const vec3s_template<T>& u, const vec3s_template<T>& v, vec3s_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::cross(u.values[i], v.values[i]);
			}
		}
		static void hadamard (const vec3s_template<T>& u, const vec3s_template<T>& v, vec3s_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::hadamard(u.values[i], v.values[i]);
			}
		}
		static void distance(const vec3s_template<T>& u, const vec3s_template<T>& v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec3_template<T>::distance(u.values[i], v.values[i]);
			}
		}

		static void magnitude(const vec3s_template<T>& u, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}

		static void normalize(const vec3s_template<T>& u, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
		}

	};

	using vec3s = numerics_template<vec3_template<float>>;
	using ivec3s = numerics_template<vec3_template<int>>;
	using uivec3s = numerics_template<vec3_template<unsigned int>>;
	using bvec3s = numerics_template<vec3_template<bool>>;
}
