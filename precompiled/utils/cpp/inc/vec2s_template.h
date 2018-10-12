#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec2_template.h"
#include "numerics_template.h"

namespace rasters
{
	template<class T>
	class vec2s_template : numerics_template<vec2_template<T>>{

	public:

		vec2s_template(const unsigned int N) 
		{
			this->N = N;
			this->values = new T[this->N];
		};

		vec2s_template(const unsigned int N, const T x)  
		{
			this->N = N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = x;
			}
		};

		vec2s_template(const numerics_template<T>& x)   
		{
			this->N = x.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = x[i];
			}
		};

		vec2s_template(const unsigned int N, const T x, const T y)  
		{
			this->N = N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
			}
		};
		vec2s_template(const numerics_template<T>& x, const T y)  
		{
			this->N = x.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
			}
		};

		vec2s_template(const T x, const numerics_template<T>& y)  
		{
			this->N = y.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
			}
		};

		vec2s_template(const numerics_template<T>& x, const numerics_template<T>& y)   
		{
			this->N = y.N;
			this->values = new T[this->N];
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
			}
		};


		static void dot (const vec2s_template<T>& u, const vec2_template<T> v, numerics_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v);
			}
		}
		static void cross (const vec2s_template<T>& u, const vec2_template<T> v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::cross(u.values[i], v);
			}
		}
		static void hadamard (const vec2s_template<T>& u, const vec2_template<T> v, vec2s_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::hadamard(u.values[i], v);
			}
		}
		static void distance(const vec2s_template<T>& u, const vec2_template<T> v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v);
			}
		}


		static void dot (const vec2s_template<T>& u, const vec2s_template<T>& v, numerics_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::dot(u.values[i], v.values[i]);
			}
		}
		static void cross (const vec2s_template<T>& u, const vec2s_template<T>& v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::cross(u.values[i], v.values[i]);
			}
		}
		static void hadamard (const vec2s_template<T>& u, const vec2s_template<T>& v, vec2s_template<T>& out) {
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::hadamard(u.values[i], v.values[i]);
			}
		}
		static void distance(const vec2s_template<T>& u, const vec2s_template<T>& v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = vec2_template<T>::distance(u.values[i], v.values[i]);
			}
		}

		static void magnitude(const vec2s_template<T>& u, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i].magnitude();
			}
		}

		static void normalize(const vec2s_template<T>& u, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i].normalize();
			}
		}

	};

	using vec2s = numerics_template<vec2_template<float>>;
	using ivec2s = numerics_template<vec2_template<int>>;
	using uivec2s = numerics_template<vec2_template<unsigned int>>;
	using bvec2s = numerics_template<vec2_template<bool>>;
}
