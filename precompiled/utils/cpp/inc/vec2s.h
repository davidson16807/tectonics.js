#pragma once

#include "vec2s.h"
#include "numerics.h"

namespace composites
{
	template<class T>
	class vec2s_template : public numerics_template<vec2_template<T>>
	{

	public:
		vec2s_template(const unsigned int N) : numerics_template<vec2_template<T>>(N) {};

		vec2s_template(const unsigned int N, const T x) : numerics_template<vec2_template<T>>(N)
		{
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = x;
			}
		};

		vec2s_template(const numerics_template<T>& x)   : numerics_template<vec2_template<T>>(x.N)
		{
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = x[i];
			}
		};

		vec2s_template(const unsigned int N, const T x, const T y) : numerics_template<vec2_template<T>>(N)
		{
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
			}
		};
		vec2s_template(const numerics_template<T>& x, const T y)  : numerics_template<vec2_template<T>>(x.N)
		{
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
			}
		};

		vec2s_template(const T x, const numerics_template<T>& y)  : numerics_template<vec2_template<T>>(y.N)
		{
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
			}
		};

		vec2s_template(const numerics_template<T>& x, const numerics_template<T>& y)   : numerics_template<vec2_template<T>>(y.N)
		{
			for (int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
			}
		};


		static void dot (const vec2s_template<T>& u, const vec2_template<T> v, numerics_template<T>& out) {
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::dot(u[i], v);
			}
		}
		static void cross (const vec2s_template<T>& u, const vec2_template<T> v, vec2s_template<T>& out) 
		{
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::cross(u[i], v);
			}
		}
		static void hadamard (const vec2s_template<T>& u, const vec2_template<T> v, vec2s_template<T>& out) {
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::hadamard(u[i], v);
			}
		}
		static void distance(const vec2s_template<T>& u, const vec2_template<T> v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::distance(u[i], v);
			}
		}


		static void dot (const vec2s_template<T>& u, const vec2s_template<T>& v, numerics_template<T>& out) {
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::dot(u[i], v[i]);
			}
		}
		static void cross (const vec2s_template<T>& u, const vec2s_template<T>& v, vec2s_template<T>& out) 
		{
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::cross(u[i], v[i]);
			}
		}
		static void hadamard (const vec2s_template<T>& u, const vec2s_template<T>& v, vec2s_template<T>& out) {
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::hadamard(u[i], v[i]);
			}
		}
		static void distance(const vec2s_template<T>& u, const vec2s_template<T>& v, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = vec2_template<T>::distance(u[i], v[i]);
			}
		}

		static void magnitude(const vec2s_template<T>& u, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = u[i].magnitude();
			}
		}
		static void normalize(const vec2s_template<T>& u, numerics_template<T>& out) 
		{
			for (int i = 0; i < u.size(); ++i)
			{
				out[i] = u[i].normalize();
			}
		}

		const T& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		T& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		const vec2s_template<T> operator[](const primitives_template<bool>& mask ) const
		{
			vec2s_template<T> out = vec2s_template<T>(mask.N);
			get(*this, mask, out);
			return out;
		}
		const vec2s_template<T> operator[](const primitives_template<unsigned int>& ids ) const
		{
			vec2s_template<T> out = vec2s_template<T>(ids.N);
			get(*this, ids, out);
			return out;
		}
	};

	using vec2s = vec2s_template<float>;
	using ivec2s = vec2s_template<int>;
	using uivec2s = vec2s_template<unsigned int>;
	using bvec2s = vec2s_template<bool>;
}
