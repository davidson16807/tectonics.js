#pragma once

#include <glm/vector_relational.hpp>

#include "../many.hpp"

namespace composites
{
	using namespace glm;

	// template<length_t L, typename T, qualifier Q>
	// void greaterThan(const many<vec<L,T,Q>>& a, const T b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::greaterThan(a[i], b);
	// 	}
	// }
	// template<length_t L, typename T, qualifier Q>
	// void greaterThanEqual(const many<vec<L,T,Q>>& a, const T b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::greaterThanEqual(a[i], b);
	// 	}
	// }
	// template<length_t L, typename T, qualifier Q>
	// void lessThan(const many<vec<L,T,Q>>& a, const T b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::lessThan(a[i], b);
	// 	}
	// }
	// template<length_t L, typename T, qualifier Q>
	// void lessThanEqual(const many<vec<L,T,Q>>& a, const T b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::lessThanEqual(a[i], b);
	// 	}
	// }





	// template<length_t L, typename T, qualifier Q>
	// void greaterThan(const many<vec<L,T,Q>>& a, const many<T> b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::greaterThan(a[i], b[i]);
	// 	}
	// }
	// template<length_t L, typename T, qualifier Q>
	// void greaterThanEqual(const many<vec<L,T,Q>>& a, const many<T> b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::greaterThanEqual(a[i], b[i]);
	// 	}
	// }
	// template<length_t L, typename T, qualifier Q>
	// void lessThan(const many<vec<L,T,Q>>& a, const many<T> b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::lessThan(a[i], b[i]);
	// 	}
	// }
	// template<length_t L, typename T, qualifier Q>
	// void lessThanEqual(const many<vec<L,T,Q>>& a, const many<T> b, many<vec<L,bool,defaultp>>& out)
	// {
	// 	for (unsigned int i = 0; i < a.size(); ++i)
	// 	{
	// 		out[i] = glm::lessThanEqual(a[i], b[i]);
	// 	}
	// }




	template<length_t L, typename T, qualifier Q>
	void greaterThan(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::greaterThan(a[i], b);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void greaterThanEqual(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::greaterThanEqual(a[i], b);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void lessThan(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::lessThan(a[i], b);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void lessThanEqual(const many<vec<L,T,Q>>& a, const vec<L,T,Q> b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::lessThanEqual(a[i], b);
		}
	}







	template<length_t L, typename T, qualifier Q>
	void greaterThan(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::greaterThan(a[i], b[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void greaterThanEqual(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::greaterThanEqual(a[i], b[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void lessThan(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::lessThan(a[i], b[i]);
		}
	}
	template<length_t L, typename T, qualifier Q>
	void lessThanEqual(const many<vec<L,T,Q>>& a, const many<vec<L,T,Q>>& b, many<vec<L,bool,defaultp>>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = glm::lessThanEqual(a[i], b[i]);
		}
	}




}