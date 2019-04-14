#pragma once

#include "../many.hpp"

namespace composites
{
	template<length_t L, typename T, qualifier Q>
	vec<L,T,Q> weighted_average(const many<vec<L,T,Q>>& a, const many<T>& weights)
	{
		vec<L,T,Q> out = vec<L,T,Q>(0);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out += a[i] * weights[i];
		}
		out /= sum(weights);
		return out;
	};
	// TODO: vector version
	template<length_t L, typename T, qualifier Q>
	inline void rescale(const many<vec<L,T,Q>>& a, many<vec<L,T,Q>>& out, T max_new = 1.)
	{
		mult(a, max_new / max(length(a)), out);
	};
	
} //namespace composites
