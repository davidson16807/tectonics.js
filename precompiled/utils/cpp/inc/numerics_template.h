#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

namespace rasters
{

	// This template represents a statically-sized contiguous block of memory occupied by numeric data of arbitrary type
	// The intention is to abstract away numeric arrays that are used to address data locality issues
	// the numeric data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the numeric data type must have all the standard arithmetic operators as regular ints/floats: + - * / < > <= >= == != 
	// the arithmetic operators must share the same general behavior as ints/floats (i.e. no dot products or element-wise comparators)
	template <class T>
	class numerics_template
	{
	protected:
		T* values;
		const unsigned int N;

	public:

		~numerics_template() 
		{
    		delete [] values;
		};

		numerics_template(const unsigned int N) : N(N)
		{
			values = new T[N];
		};

		numerics_template(const unsigned int N, const T u)  : N(N)
		{
			values = new T[N];
			for (int i = 0; i < u.N; ++i)
			{
				values[i] = u;
			}
		};

		numerics_template(const numerics_template<T>& u)  : N(u.N)
		{
			values = new T[N];
			for (int i = 0; i < N; ++i)
			{
				values[i] = u.values[i];
			}
		};

		static T min(const numerics_template<T>& u)
		{
			T out = u.values[0];
			for (int i = 0; i < u.N; ++i)
			{
				out = u.values[i] < out? u.values[i] : out;
			}
			return out;
		}
		static T max(const numerics_template<T>& u)
		{
			T out = u.values[0];
			for (int i = 0; i < u.N; ++i)
			{
				out = u.values[i] > out? u.values[i] : out;
			}
			return out;
		}
		static void min(const numerics_template<T>& u, const numerics_template<T>& v, numerics_template<T>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] <= v.values[i]? u.values[i] : v.values[i];
			}
		}
		static void max(const numerics_template<T>& u, const numerics_template<T>& v, numerics_template<T>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] >= v.values[i]? u.values[i] : v.values[i];
			}
		}

		template <class T2>
		static bool eq(const numerics_template<T>& u, const T2 a)
		{
			bool out = true;
			for (int i = 0; i < u.N; ++i)
			{
				out &= u.values[i] == a;
			}
			return out;
		}
		template <class T2>
		static bool ne(const numerics_template<T>& u, const T2 a)
		{
			bool out = false;
			for (int i = 0; i < u.N; ++i)
			{
				out |= u.values[i] != a;
			}
			return out;
		}
		template <class T2>
		static bool eq(const numerics_template<T>& u, const numerics_template<T2>& a)
		{
			bool out = true;
			for (int i = 0; i < u.N; ++i)
			{
				out &= u.values[i] == a.values[i];
			}
			return out;
		}
		template <class T2>
		static bool ne(const numerics_template<T>& u, const numerics_template<T2>& a)
		{
			bool out = false;
			for (int i = 0; i < u.N; ++i)
			{
				out |= u.values[i] != a.values[i];
			}
			return out;
		}



		template <class T2>
		static void eq(const numerics_template<T>& u, const T2 a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] == a;
			}
		}
		template <class T2>
		static void ne(const numerics_template<T>& u, const T2 a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] == a;
			}
		}
		template <class T2>
		static void eq(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] == a.values[i];
			}
		}
		template <class T2>
		static void ne(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] != a.values[i];
			}
		}




		template <class T2>
		static void gt(const numerics_template<T>& u, const T2 a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] > a;
			}
		}
		template <class T2>
		static void gte(const numerics_template<T>& u, const T a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] >= a;
			}
		}
		template <class T2>
		static void lt(const numerics_template<T>& u, const T2 a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] < a;
			}
		}
		template <class T2>
		static void lte(const numerics_template<T>& u, const T2 a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] <= a;
			}
		}





		template <class T2>
		static void gt(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] > a.values[i];
			}
		}
		template <class T2>
		static void gte(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] >= a.values[i];
			}
		}
		template <class T2>
		static void lt(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] <= a.values[i];
			}
		}
		template <class T2>
		static void lte(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<bool>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] < a.values[i];
			}
		}





		template <class T2, class T3>
		static void add(const numerics_template<T>& u, const T2 a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] + a;
			}
		}
		template <class T2, class T3>
		static void sub(const numerics_template<T>& u, const T2 a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] - a;
			}
		}
		template <class T2, class T3>
		static void mult(const numerics_template<T>& u, const T2 a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] * a;
			}
		}
		template <class T2, class T3>
		static void div(const numerics_template<T>& u, const T2 a, numerics_template<T3>& out)
		{
			const T ainv = 1./a;
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] / a;
			}
		}



		template <class T2, class T3>
		static void add(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] + a.values[i];
			}
		}
		template <class T2, class T3>
		static void sub(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] - a.values[i];
			}
		}
		template <class T2, class T3>
		static void mult(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] * a.values[i];
			}
		}
		template <class T2, class T3>
		static void div(const numerics_template<T>& u, const numerics_template<T2>& a, numerics_template<T3>& out)
		{
			for (int i = 0; i < u.N; ++i)
			{
				out.values[i] = u.values[i] / a.values[i];
			}
		}



		// static void magnitude(const numerics_template<T>& u, numerics_template<double>& out) 
		// {
		// 	for (int i = 0; i < u.N; ++i)
		// 	{
		// 		out.values[i] = u.values[i].magnitude();
		// 	}
		// }
		// static void normalize(const numerics_template<T>& u, numerics_template<T>& out) 
		// {
		// 	for (int i = 0; i < u.N; ++i)
		// 	{
		// 		out.values[i] = u.values[i].normalize();
		// 	}
		// }


		template <class T2>
		bool operator==(const T2 a) const
		{
			return numerics_template<T>::eq(*this, a);
		}
		template <class T2>
		bool operator!=(const T2 a) const
		{
			return numerics_template<T>::ne(*this, a);
		}
		template <class T2>
		bool operator==(const numerics_template<T2>& a) const
		{
			return numerics_template<T>::eq(*this, a);
		}
		template <class T2>
		bool operator!=(const numerics_template<T2>& a) const
		{
			return numerics_template<T>::ne(*this, a);
		}
		

		template <class T2, class T3>
		numerics_template<T3> operator>(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::gt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator>=(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::gte(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::lt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<=(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::lte(*this, a, out);
			return out;
		}

		

		template <class T2, class T3>
		numerics_template<T3> operator>(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::gt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator>=(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::gte(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::lt(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<=(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::lte(*this, a, out);
			return out;
		}
		




		template <class T2, class T3>
		numerics_template<T3> operator+(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::add(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator-(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::sub(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T> operator*(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::mult(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator/(const T2 a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::div(*this, a, out);
			return out;
		}


		template <class T2, class T3>
		numerics_template<T3> operator+(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::add(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator-(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::sub(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator*(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::mult(*this, a, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator/(const numerics_template<T2>& a) const
		{
			numerics_template<T3> out = numerics_template<T3>();
			numerics_template<T>::div(*this, a, out);
			return out;
		}


		T operator[](const unsigned int i) const
		{
		    return values[i];
		}
	};

	using floats = numerics_template<float>;
	using ints = numerics_template<vec3_template<int>>;
	using bools = numerics_template<vec3_template<bool>>;
}
