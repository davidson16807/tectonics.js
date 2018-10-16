#pragma once

#include <initializer_list>// initializer_list
#include <iostream>// cout

#include "vec3.h"
#include "numerics.h"

namespace composites
{
	template<class T>
	class tvec3s : public numerics<tvec3<T>>
	{
	public:
		tvec3s(std::initializer_list<tvec3<T>> list)  			: numerics<tvec3<T>>(list) {};
		tvec3s(numerics<tvec3<T>>&& a)							: numerics<tvec3<T>>(a) {};
		explicit tvec3s(const unsigned int N) 					: numerics<tvec3<T>>(N) {};
		explicit tvec3s(const unsigned int N, const tvec3<T> a)	: numerics<tvec3<T>>(N,a) {};
		explicit tvec3s(const numerics<tvec3<T>>& a)			: numerics<tvec3<T>>(a) {};

		template <class T2>
		explicit tvec3s(const numerics<tvec3<T2>>& a)			: numerics<tvec3<T>>(a) {};

		explicit tvec3s(const unsigned int N, const T x) : numerics<tvec3<T>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = x;
				this->values[i].z = x;
			}
		};

		explicit tvec3s(const numerics<T>& x) : numerics<tvec3<T>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = x[i];
				this->values[i].z = x[i];
			}
		};

		explicit tvec3s(const unsigned int N, const T x, const T y, const T z) : numerics<tvec3<T>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
				this->values[i].z = z;
			}
		};
		explicit tvec3s(const numerics<T>& x, const T y, const T z)  : numerics<tvec3<T>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
				this->values[i].z = z;
			}
		};

		explicit tvec3s(const T x, const numerics<T>& y, const T z)  : numerics<tvec3<T>>(y.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
				this->values[i].z = z;
			}
		};

		explicit tvec3s(const numerics<T>& x, const numerics<T>& y, const T z)   : numerics<tvec3<T>>(y.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
				this->values[i].z = z;
			}
		};

		explicit tvec3s(const T x, const T y, const numerics<T>&  z)     : numerics<tvec3<T>>(z.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
				this->values[i].z = z[i];
			}
		};

		explicit tvec3s(const numerics<T>& x, const T y, const numerics<T>&  z)      : numerics<tvec3<T>>(z.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
				this->values[i].z = z[i];
			}
		};

		explicit tvec3s(const T x, const numerics<T>& y, const numerics<T>&  z)      : numerics<tvec3<T>>(z.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
				this->values[i].z = z[i];
			}
		};

		explicit tvec3s(const numerics<T>& x, const numerics<T>& y, const numerics<T>&  z)     : numerics<tvec3<T>>(z.N) 
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
				this->values[i].z = z[i];
			}
		};


		inline const tvec3<T>& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline tvec3<T>& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		inline const tvec3s<T> operator[](const primitives<bool>& mask ) const
		{
			tvec3s<T> out = tvec3s<T>(mask.size());
			get(*this, mask, out);
			return out;
		}
		inline const tvec3s<T> operator[](const primitives<unsigned int>& ids ) const
		{
			tvec3s<T> out = tvec3s<T>(ids.size());
			get(*this, ids, out);
			return out;
		}
	};

	using vec3s = tvec3s<float>;
	using ivec3s = tvec3s<int>;
	using uivec3s = tvec3s<unsigned int>;
	using bvec3s = tvec3s<bool>;


	template <class T>
	void dot (const tvec3s<T>& u, const tvec3<T> v, numerics<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v);
		}
	}
	template <class T>
	void cross (const tvec3s<T>& u, const tvec3<T> v, tvec3s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v);
		}
	}
	template <class T>
	void hadamard (const tvec3s<T>& u, const tvec3<T> v, tvec3s<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = hadamard(u[i], v);
		}
	}
	template <class T>
	void distance(const tvec3s<T>& u, const tvec3<T> v, numerics<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v);
		}
	}


	template <class T>
	void dot (const tvec3s<T>& u, const tvec3s<T>& v, numerics<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = dot(u[i], v[i]);
		}
	}
	template <class T>
	void cross (const tvec3s<T>& u, const tvec3s<T>& v, tvec3s<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = cross(u[i], v[i]);
		}
	}
	template <class T>
	void hadamard (const tvec3s<T>& u, const tvec3s<T>& v, tvec3s<T>& out) {
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = hadamard(u[i], v[i]);
		}
	}
	template <class T>
	void distance(const tvec3s<T>& u, const tvec3s<T>& v, numerics<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = distance(u[i], v[i]);
		}
	}



	template <class T>
	void length(const tvec3s<T>& u, numerics<T>& out) 
	{
		for (unsigned int i = 0; i < u.size(); ++i)
		{
			out[i] = u[i].length();
		}
	}
	template <class T>
	void normalize(const tvec3s<T>& u, tvec3s<T>& out) 
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
	inline numerics<T> dot (const numerics<tvec3<T>>& u, const tvec3<T> v ) {
		tvec3s<T> out = tvec3s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec3s<T> cross (const tvec3s<T>& u, const tvec3<T> v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline numerics<T> distance(const numerics<tvec3<T>>& u, const tvec3<T> v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline numerics<T> dot (const numerics<tvec3<T>>& u, const tvec3s<T>& v ) {
		tvec3s<T> out = tvec3s<T>(u.size());
		dot(u, v, out);
		return out;
	}
	template <class T>
	inline tvec3s<T> cross (const tvec3s<T>& u, const tvec3s<T>& v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		cross(u, v, out);
		return out;
	}
	template <class T>
	inline numerics<T> distance(const numerics<tvec3<T>>& u, const tvec3s<T>& v ) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		distance(u, v, out);
		return out;
	}
	template <class T>
	inline tvec3s<T> normalize(const tvec3s<T>& u) 
	{
		tvec3s<T> out = tvec3s<T>(u.size());
		normalize(u, out);
		return out;
	}
	template <class T>
	inline floats length(const tvec3s<T>& u) 
	{
		numerics<T> out = numerics<T>(u.size());
		length(u, out);
		return out;
	}
}
