#pragma once

#include <cmath> 		// sqrt, etc
#include <algorithm>	// std::sort
#include <functional>	// std::function

#include "many.hpp"

namespace composites
{


	template<class T, typename Taggregator>
	void aggregate_into(const many<T>& a, const many<unsigned int>& group_ids, Taggregator aggregator, many<T>& group_out)
	{
		for (unsigned int i = 0; i < group_ids.size(); ++i)
		{
			group_out[group_ids[i]] = aggregator(group_out[group_ids[i]], a[i]);
		}
	}
	template<class T, typename Taggregator>
	void aggregate(const many<T>& a, const many<unsigned int>& group_ids, Taggregator aggregator, many<T>& group_out)
	{
		fill(group_out, T(0));
		for (unsigned int i = 0; i < group_ids.size(); ++i)
		{
			group_out[group_ids[i]] = aggregator(group_out[group_ids[i]], a[i]);
		}
	}
	template<class T, typename Taggregator>
	many<T> aggregate(const many<T>& a, const many<unsigned int>& group_ids, Taggregator aggregator)
	{
		many<T> group_out = many<T>(max(group_ids));
		for (unsigned int i = 0; i < group_ids.size(); ++i)
		{
			group_out[group_ids[i]] = aggregator(group_out[group_ids[i]], a[i]);
		}
		return group_out;
	}


	template<class T, typename Taggregator>
	void aggregate_into(const many<unsigned int>& group_ids, Taggregator aggregator, many<T>& group_out)
	{
		for (unsigned int i = 0; i < group_ids.size(); ++i)
		{
			group_out[group_ids[i]] = aggregator(group_out[group_ids[i]]);
		}
	}
	template<class T, typename Taggregator>
	void aggregate(const many<unsigned int>& group_ids, Taggregator aggregator, many<T>& group_out)
	{
		fill(group_out, T(0));
		for (unsigned int i = 0; i < group_ids.size(); ++i)
		{
			group_out[group_ids[i]] = aggregator(group_out[group_ids[i]]);
		}
	}
	template<class T, typename Taggregator>
	many<T> aggregate(const many<unsigned int>& group_ids, Taggregator aggregator)
	{
		many<T> group_out = many<T>(max(group_ids));
		for (unsigned int i = 0; i < group_ids.size(); ++i)
		{
			group_out[group_ids[i]] = aggregator(group_out[group_ids[i]]);
		}
		return group_out;
	}



	// component-wise min
	template <class T>
	unsigned int min_id(const many<T>& a)
	{
		T min_value = a[0];
		unsigned int min_id = 0;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			if (a[i] < min_value)
			{
				min_value = a[i];
				min_id = i;
			}
		}
		return min_id;
	}



	template <class T>
	unsigned int max_id(const many<T>& a)
	{
		T min_value = a[0];
		unsigned int max_id = 0;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			if (a[i] < min_value)
			{
				min_value = a[i];
				max_id = i;
			}
		}
		return max_id;
	}


	// component-wise min
	template <class T>
	T sum(const many<T>& a)
	{
		T out = T(0);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out += a[i];
		}
		return out;
	}

	template <class T>
	T mean(const many<T>& a)
	{
		T out = T(0);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out += a[i];
		}
		out /= a.size();
		return out;
	}

	// // component-wise min
	// template <class T>
	// T median(const many<T>& a)
	// {
	// 	const many<T> temp = many<T>(a);
	// 	std::sort(std::begin(temp), std::end(temp));
	// 	return a[a.size()/2];
	// }
// 
	// template <class T>
	// T mode(const many<T>& a)
	// {
	// 	const many<T> temp = many<T>(a);
	// 	std::sort(std::begin(temp), std::end(temp));
	//     int value = a[0];
	//     int max = a[0];
	//     int min = a[0];
	//     int mode;
	//     for (int i = 1, mode_count = 1, count = 1; i < a.size(); ++i) {
	//         if (a[i] == value)
	//             ++mode_count;
	//         if (mode_count > count) {
	//             count = mode_count;
	//             mode = value;
	//         }
	//         if (a[i] > max)
	//             max = a[i];
	//         if (a[i] < min)
	//             min = a[i];
	//         value = a[i];
	//     }
	//     return mode;
	// }

	template <class T>
	T standard_deviation(const many<T>& a)
	{
		T mean_a = mean(a);

		T difference(0);
		T sum_of_squared_differences(0);
		for (T i(0); i<a.size(); ++i) {
			difference = (a[i] - mean_a);
			sum_of_squared_differences += difference * difference;
		}
		return std::sqrt(sum_of_squared_differences / (a.size()-1));
	};

	template <class T>
	T weighted_average(const many<T>& a, const many<T>& weights)
	{
		T out = T(0);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out += a[i] * weights[i];
		}
		out /= sum(weights);
		return out;
	};

	// TODO: vector version
	template <class T>
	void rescale(const many<T>& a, many<T>& out, T max_new = 1., T min_new = 0.)
	{
	    T max_old = max(a);
	    T min_old = min(a);
		T range_old = max_old - min_old;
		T range_new = max_new - min_new;

		T scaling_factor = range_new / range_old;

		for (unsigned int i=0; i<a.size(); ++i) {
			out[i] = scaling_factor * (a[i] - min_old) + min_new;
		}
	};
} //namespace composites
