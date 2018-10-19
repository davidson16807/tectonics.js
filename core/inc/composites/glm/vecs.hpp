#pragma once

#include <initializer_list>	// initializer_list

#include <glm/vec3.hpp>    	// vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/geometric.hpp>// all the GLSL geometry functions: dot, cross, reflect, etc.

#include "../primitives.hpp"

namespace composites
{
	using namespace glm;

	template<length_t L, typename T, qualifier Q>
	class vecs : public primitives<vec<L, T, Q>>
	{
	public:
		vecs(std::initializer_list<vec<L,T,Q>> list)  		: primitives<vec<L,T,Q>>(list) {};
		vecs(primitives<vec<L,T,Q>>&& a)					: primitives<vec<L,T,Q>>(a) {};
		explicit vecs(const unsigned int N) 				: primitives<vec<L,T,Q>>(N) {};
		explicit vecs(const unsigned int N, const vec<L,T,Q> a): primitives<vec<L,T,Q>>(N,a) {};
		explicit vecs(const primitives<vec<L,T,Q>>& a)		: primitives<vec<L,T,Q>>(a) {};

		template <class T2>
		explicit vecs(const primitives<vec<L,T2,Q>>& a)		: primitives<vec<L,T,Q>>(a) {};

		explicit vecs(const unsigned int N, const T x) 		: primitives<vec<L,T,Q>>(N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i] = vec<L,T,Q>(x);
			}
		};

		explicit vecs(const primitives<T>& x) : primitives<vec<L,T,Q>>(x.N)
		{
			for (unsigned int i = 0; i < this->N; ++i)
			{
				this->values[i] = vec<L,T,Q>(x[i]);
			}
		};


		inline const vec<L,T,Q>& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline vec<L,T,Q>& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		inline const vecs<L,T,Q> operator[](const primitives<bool>& mask ) const
		{
			vecs<L,T,Q> out = vecs<L,T,Q>(mask.size());
			get(*this, mask, out);
			return out;
		}
		inline const vecs<L,T,Q> operator[](const primitives<unsigned int>& ids ) const
		{
			vecs<L,T,Q> out = vecs<L,T,Q>(ids.size());
			get(*this, ids, out);
			return out;
		}
	};

	typedef vecs<1, bool, glm::defaultp>	bvec1s;
	typedef vecs<2, bool, glm::defaultp>	bvec2s;
	typedef vecs<3, bool, glm::defaultp>	bvec3s;
	typedef vecs<4, bool, glm::defaultp>	bvec4s;

	typedef vecs<1, int, glm::defaultp>	ivec1s;
	typedef vecs<2, int, glm::defaultp>	ivec2s;
	typedef vecs<3, int, glm::defaultp>	ivec3s;
	typedef vecs<4, int, glm::defaultp>	ivec4s;

	typedef vecs<1, unsigned int, glm::defaultp> uivec1s;
	typedef vecs<2, unsigned int, glm::defaultp> uivec2s;
	typedef vecs<3, unsigned int, glm::defaultp> uivec3s;
	typedef vecs<4, unsigned int, glm::defaultp> uivec4s;

	typedef vecs<1, double, glm::defaultp> dvec1s;
	typedef vecs<2, double, glm::defaultp> dvec2s;
	typedef vecs<3, double, glm::defaultp> dvec3s;
	typedef vecs<4, double, glm::defaultp> dvec4s;

	typedef vecs<1, float, glm::defaultp> vec1s;
	typedef vecs<2, float, glm::defaultp> vec2s;
	typedef vecs<3, float, glm::defaultp> vec3s;
	typedef vecs<4, float, glm::defaultp> vec4s;

}
