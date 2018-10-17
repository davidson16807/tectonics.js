#pragma once

#include <initializer_list>	// initializer_list
#include <iostream>			// cout

#include <glm/vec2.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "numerics.hpp"

using namespace glm;

namespace composites
{
	template<class T>
	class tvec2s : public numerics<glm::tvec2<T>>
	{
	public:
		tvec2s(std::initializer_list<glm::tvec2<T>> list)  			: numerics<glm::tvec2<T>>(list) {};
		tvec2s(numerics<glm::tvec2<T>>&& a)							: numerics<glm::tvec2<T>>(a) {};
		explicit tvec2s(const unsigned int N) 					: numerics<glm::tvec2<T>>(N) {};
		explicit tvec2s(const unsigned int N, const glm::tvec2<T> a)	: numerics<glm::tvec2<T>>(N,a) {};
		explicit tvec2s(const numerics<glm::tvec2<T>>& a)			: numerics<glm::tvec2<T>>(a) {};

		template <class T2>
		explicit tvec2s(const numerics<glm::tvec2<T2>>& a)			: numerics<glm::tvec2<T>>(a) {};

		explicit tvec2s(const unsigned int N, const T x) : numerics<glm::tvec2<T>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = x;
			}
		};

		explicit tvec2s(const numerics<T>& x) : numerics<glm::tvec2<T>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = x[i];
			}
		};

		explicit tvec2s(const unsigned int N, const T x, const T y) : numerics<glm::tvec2<T>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
			}
		};
		explicit tvec2s(const numerics<T>& x, const T y)  : numerics<glm::tvec2<T>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
			}
		};

		explicit tvec2s(const T x, const numerics<T>& y)  : numerics<glm::tvec2<T>>(y.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
			}
		};

		explicit tvec2s(const numerics<T>& x, const numerics<T>& y)   : numerics<glm::tvec2<T>>(y.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
			}
		};


		inline const glm::tvec2<T>& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline glm::tvec2<T>& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		inline const tvec2s<T> operator[](const primitives<bool>& mask ) const
		{
			tvec2s<T> out = tvec2s<T>(mask.size());
			get(*this, mask, out);
			return out;
		}
		inline const tvec2s<T> operator[](const primitives<unsigned int>& ids ) const
		{
			tvec2s<T> out = tvec2s<T>(ids.size());
			get(*this, ids, out);
			return out;
		}
	};

	using vec2s = tvec2s<float>;
	using ivec2s = tvec2s<int>;
	using uivec2s = tvec2s<unsigned int>;
	using bvec2s = tvec2s<bool>;


	template <class T>
	void dot (const tvec2s<T>& u, const glm::tvec2<T> v, numerics<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template <class T>
	void cross (const tvec2s<T>& u, const glm::tvec2<T> v, tvec2s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template <class T>
	void hadamard (const tvec2s<T>& u, const glm::tvec2<T> v, tvec2s<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = hadamard(u[i], v);
		}
	}
	template <class T>
	void distance(const tvec2s<T>& u, const glm::tvec2<T> v, numerics<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template <class T>
	void dot (const tvec2s<T>& u, const tvec2s<T>& v, numerics<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template <class T>
	void cross (const tvec2s<T>& u, const tvec2s<T>& v, tvec2s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template <class T>
	void hadamard (const tvec2s<T>& u, const tvec2s<T>& v, tvec2s<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = hadamard(u[i], v[i]);
		}
	}
	template <class T>
	void distance(const tvec2s<T>& u, const tvec2s<T>& v, numerics<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}



	template <class T>
	void length(const tvec2s<T>& u, numerics<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i].length();
		}
	}
	template <class T>
	void normalize(const tvec2s<T>& u, tvec2s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = normalize(u[i]);
		}
	}


	// NOTE: Here we have convenience functions that are stand-ins for operators
	//  we do this because there are no operators that can express them succinctly

	// NOTE: all operators and convenience functions are marked inline,
	//  because they are thin wrappers of static functions

	template <class T>
	inline numerics<T> dot (const numerics<glm::tvec2<T>>& u, const glm::tvec2<T> v ) {
		tvec2s<T> out = tvec2s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec2s<T> cross (const tvec2s<T>& u, const glm::tvec2<T> v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline numerics<T> distance(const numerics<glm::tvec2<T>>& u, const glm::tvec2<T> v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline numerics<T> dot (const numerics<glm::tvec2<T>>& u, const tvec2s<T>& v ) {
		tvec2s<T> out = tvec2s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec2s<T> cross (const tvec2s<T>& u, const tvec2s<T>& v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline numerics<T> distance(const numerics<glm::tvec2<T>>& u, const tvec2s<T>& v ) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline tvec2s<T> normalize(const tvec2s<T>& u) 
	{
		tvec2s<T> out = tvec2s<T>(u.size());
		normalize(u, out);
		return out;
	}
	template <class T>
	inline floats length(const tvec2s<T>& u) 
	{
		numerics<T> out = numerics<T>(u.size());
		length(u, out);
		return out;
	}
}
