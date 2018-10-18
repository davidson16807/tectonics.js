#pragma once

#include <initializer_list>	// initializer_list

#include <glm/vec2.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "../numerics.hpp"

namespace composites
{
	using namespace glm;

	template<class T>
	class tvec2s : public numerics<tvec2<T>>
	{
	public:
		tvec2s(std::initializer_list<tvec2<T>> list)  			: numerics<tvec2<T>>(list) {};
		tvec2s(numerics<tvec2<T>>&& a)							: numerics<tvec2<T>>(a) {};
		explicit tvec2s(const unsigned int N) 					: numerics<tvec2<T>>(N) {};
		explicit tvec2s(const unsigned int N, const tvec2<T> a) : numerics<tvec2<T>>(N,a) {};
		explicit tvec2s(const numerics<tvec2<T>>& a)			: numerics<tvec2<T>>(a) {};

		template <class T2>
		explicit tvec2s(const numerics<tvec2<T2>>& a)			: numerics<tvec2<T>>(a) {};

		explicit tvec2s(const unsigned int N, const T x) 		: numerics<tvec2<T>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = x;
			}
		};

		explicit tvec2s(const numerics<T>& x) : numerics<tvec2<T>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = x[i];
			}
		};

		explicit tvec2s(const unsigned int N, const T x, const T y) : numerics<tvec2<T>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y;
			}
		};
		explicit tvec2s(const numerics<T>& x, const T y)  : numerics<tvec2<T>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y;
			}
		};

		explicit tvec2s(const T x, const numerics<T>& y)  : numerics<tvec2<T>>(y.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x;
				this->values[i].y = y[i];
			}
		};

		explicit tvec2s(const numerics<T>& x, const numerics<T>& y)   : numerics<tvec2<T>>(y.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i].x = x[i];
				this->values[i].y = y[i];
			}
		};


		inline const tvec2<T>& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline tvec2<T>& operator[](const unsigned int id )
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


}
