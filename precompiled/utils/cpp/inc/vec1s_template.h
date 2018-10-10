#pragma once

#include <math.h>       // ceil, round 

namespace Rasters
{
	template <class T, int N>
	struct vec1s_template
	{
		T values[N];

		vec1s_template() {};

		~vec1s_template() {};


		static void gt(const vec1s_template<T,N>& a, const T b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gt(a.values[i], b);
			}
		}
		static void gte(const vec1s_template<T,N>& a, const T b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gte(a.values[i], b);
			}
		}
		static void lt(const vec1s_template<T,N>& a, const T b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lt(a.values[i], b);
			}
		}
		static void lte(const vec1s_template<T,N>& a, const T b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lte(a.values[i], b);
			}
		}
		static void eq(const vec1s_template<T,N>& a, const T b, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::eq(a.values[i], b, threshold);
			}
		}
		static void ne(const vec1s_template<T,N>& a, const T b, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::ne(a.values[i], b, threshold);
			}
		}





		static void gt(const vec1s_template<T,N>& a, const vec1s_template<T,N> b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gt(a.values[i], b.values[i]);
			}
		}
		static void gte(const vec1s_template<T,N>& a, const vec1s_template<T,N> b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::gte(a.values[i], b.values[i]);
			}
		}
		static void lt(const vec1s_template<T,N>& a, const vec1s_template<T,N> b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lt(a.values[i], b.values[i]);
			}
		}
		static void lte(const vec1s_template<T,N>& a, const vec1s_template<T,N> b, vec1s_template<bool,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::lte(a.values[i], b.values[i]);
			}
		}
		static void eq(const vec1s_template<T,N>& a, const vec1s_template<T,N> b, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::eq(a.values[i], b.values[i], threshold);
			}
		}
		static void ne(const vec1s_template<T,N>& a, const vec1s_template<T,N> b, vec1s_template<bool,N>& out, const T threshold)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = vec2_template<T>::ne(a.values[i], b.values[i], threshold);
			}
		}






		static void add(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] + b;
			}
		}
		static void sub(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] - b;
			}
		}
		static void mult(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] * b;
			}
		}
		static void div(const vec1s_template<T,N>& a, const T b, vec1s_template<T,N>& out)
		{
			const T binv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] * binv;
			}
		}


		static void add(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] + b.values[i];
			}
		}
		static void sub(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] + b.values[i];
			}
		}
		static void mult(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] + b.values[i];
			}
		}
		static void div(const vec1s_template<T,N>& a, const vec1s_template<T,N>& b, vec1s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out.values[i] = a.values[i] + b.values[i];
			}
		}


		vec1s_template<bool,N> operator>(const T a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator>=(const T a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator<(const T a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator<=(const T a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::lte(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator==(const T a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::eq(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator!=(const T a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::ne(*this, a, out);
			return out;
		}



		vec1s_template<bool,N> operator>(const vec1s_template<T,N> a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::gt(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator>=(const vec1s_template<T,N> a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::gte(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator<(const vec1s_template<T,N> a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::lt(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator<=(const vec1s_template<T,N> a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::lte(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator==(const vec1s_template<T,N> a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::eq(*this, a, out);
			return out;
		}
		vec1s_template<bool,N> operator!=(const vec1s_template<T,N> a) const
		{
			vec1s_template<bool,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::ne(*this, a, out);
			return out;
		}



		vec1s_template<T,N> operator+(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator-(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator*(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator/(const T a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec1s_template<T,N> operator+(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator-(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec1s_template<T,N> operator/(const vec1s_template<T,N>& a) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec1s_template<T,N>::div(*this, a, out);
			return out;
		}



		T operator[](const int i) const
		{
		    if (i >= N) 
		    { 
		        exit(0); 
		    } 
		    return values[i];
		}
	};


	template <int N>
	using floats = vec1s_template<double, N>;
	template <int N>
	using ints = vec1s_template<int, N>;
	template <int N>
	using bools = vec1s_template<bool, N>;


}
