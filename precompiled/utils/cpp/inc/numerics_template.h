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

		numerics_template(const unsigned int N, const T a)  : N(N)
		{
			values = new T[N];
			for (int i = 0; i < N; ++i)
			{
				values[i] = a;
			}
		};

		numerics_template(const numerics_template<T>& a)  : N(a.N)
		{
			values = new T[N];
			for (int i = 0; i < N; ++i)
			{
				values[i] = a.values[i];
			}
		};



		static T get(const numerics_template<T>& a, const unsigned int id )
		{
			return a.values[id];
		}
		static void set(numerics_template<T>& out, const unsigned int id, const T a )
		{
			out.values[id] = a;
		}

		//TODO: revisit need to get by mask instead of ids
		static void get(const numerics_template<T>& a, const numerics_template<unsigned int>& ids, numerics_template<T>& out )
		{
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[i] = a.values[ids[i]];
			}
		}
		//TODO: revisit need to set by mask instead of ids
		static void set(numerics_template<T>& out, const numerics_template<unsigned int>& ids, const numerics_template<T>& a )
		{
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[ids[i]] = a.values[i];
			}
		}
		static void fill(numerics_template<T>& out, const T a )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = a;
			}
		}
		static void copy(const numerics_template<T>& a, numerics_template<T>& out )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = a.values[i];
			}
		}
		//TODO: revisit need to fill by ids instead of mask
		static void fill(const numerics_template<T>& out, const numerics_template<bool>& mask, const T a )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = mask[i]? a : out.values[i];
			}
		}
		//TODO: revisit need to copy by ids instead of mask
		static void copy(const numerics_template<T>& a, const numerics_template<bool>& mask, numerics_template<T>& out )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = mask[i]? a.values[i] : out.values[i];
			}
		}



		static T min(const numerics_template<T>& a)
		{
			T out = a.values[0];
			for (int i = 0; i < a.N; ++i)
			{
				out = a.values[i] < out? a.values[i] : out;
			}
			return out;
		}
		static T max(const numerics_template<T>& a)
		{
			T out = a.values[0];
			for (int i = 0; i < a.N; ++i)
			{
				out = a.values[i] > out? a.values[i] : out;
			}
			return out;
		}

		template <class T2>
		static bool eq(const numerics_template<T>& a, const T2 b)
		{
			bool out = true;
			for (int i = 0; i < a.N; ++i)
			{
				out &= a.values[i] == b;
			}
			return out;
		}
		template <class T2>
		static bool ne(const numerics_template<T>& a, const T2 b)
		{
			bool out = false;
			for (int i = 0; i < a.N; ++i)
			{
				out |= a.values[i] != b;
			}
			return out;
		}
		template <class T2>
		static bool eq(const numerics_template<T>& a, const numerics_template<T2>& b)
		{
			bool out = true;
			for (int i = 0; i < a.N; ++i)
			{
				out &= a.values[i] == b.values[i];
			}
			return out;
		}
		template <class T2>
		static bool ne(const numerics_template<T>& a, const numerics_template<T2>& b)
		{
			bool out = false;
			for (int i = 0; i < a.N; ++i)
			{
				out |= a.values[i] != b.values[i];
			}
			return out;
		}



		template <class T2>
		static void eq(const numerics_template<T>& a, const T2 b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b;
			}
		}
		template <class T2>
		static void ne(const numerics_template<T>& a, const T2 b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b;
			}
		}
		template <class T2>
		static void eq(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b.values[i];
			}
		}
		template <class T2>
		static void ne(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] != b.values[i];
			}
		}




		template <class T2>
		static void gt(const numerics_template<T>& a, const T2 b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > b;
			}
		}
		template <class T2>
		static void gte(const numerics_template<T>& a, const T b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] >= b;
			}
		}
		template <class T2>
		static void lt(const numerics_template<T>& a, const T2 b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < b;
			}
		}
		template <class T2>
		static void lte(const numerics_template<T>& a, const T2 b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] <= b;
			}
		}





		template <class T2>
		static void gt(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > b.values[i];
			}
		}
		template <class T2>
		static void gte(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] >= b.values[i];
			}
		}
		template <class T2>
		static void lt(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] <= b.values[i];
			}
		}
		template <class T2>
		static void lte(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < b.values[i];
			}
		}





		template <class T2, class T3>
		static void add(const numerics_template<T>& a, const T2 b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] + b;
			}
		}
		template <class T2, class T3>
		static void sub(const numerics_template<T>& a, const T2 b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] - b;
			}
		}
		template <class T2, class T3>
		static void mult(const numerics_template<T>& a, const T2 b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] * b;
			}
		}
		template <class T2, class T3>
		static void div(const numerics_template<T>& a, const T2 b, numerics_template<T3>& out)
		{
			const T ainv = 1./b;
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] / b;
			}
		}



		template <class T2, class T3>
		static void add(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] + b.values[i];
			}
		}
		template <class T2, class T3>
		static void sub(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] - b.values[i];
			}
		}
		template <class T2, class T3>
		static void mult(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] * b.values[i];
			}
		}
		template <class T2, class T3>
		static void div(const numerics_template<T>& a, const numerics_template<T2>& b, numerics_template<T3>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] / b.values[i];
			}
		}



		// static void magnitude(const numerics_template<T>& a, numerics_template<double>& out) 
		// {
		// 	for (int i = 0; i < a.N; ++i)
		// 	{
		// 		out.values[i] = a.values[i].magnitude();
		// 	}
		// }
		// static void normalize(const numerics_template<T>& a, numerics_template<T>& out) 
		// {
		// 	for (int i = 0; i < a.N; ++i)
		// 	{
		// 		out.values[i] = a.values[i].normalize();
		// 	}
		// }


		template <class T2>
		bool operator==(const T2 b) const
		{
			return numerics_template<T>::eq(*this, b);
		}
		template <class T2>
		bool operator!=(const T2 b) const
		{
			return numerics_template<T>::ne(*this, b);
		}
		template <class T2>
		bool operator==(const numerics_template<T2>& b) const
		{
			return numerics_template<T>::eq(*this, b);
		}
		template <class T2>
		bool operator!=(const numerics_template<T2>& b) const
		{
			return numerics_template<T>::ne(*this, b);
		}
		

		template <class T2, class T3>
		numerics_template<T3> operator>(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::gt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator>=(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::gte(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::lt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<=(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::lte(*this, b, out);
			return out;
		}

		

		template <class T2, class T3>
		numerics_template<T3> operator>(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::gt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator>=(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::gte(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::lt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator<=(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::lte(*this, b, out);
			return out;
		}






		template <class T2, class T3>
		numerics_template<T>& operator+=(const T2 b) 
		{
			numerics_template<T>::add(*this, b, *this);
			return *this;
		}
		template <class T2, class T3>
		numerics_template<T>& operator-=(const T2 b) 
		{
			numerics_template<T>::sub(*this, b, *this);
			return *this;
		}
		template <class T2, class T3>
		numerics_template<T>& operator*=(const T2 b) 
		{
			numerics_template<T>::mult(*this, b, *this);
			return *this;
		}
		template <class T2, class T3>
		numerics_template<T>& operator/=(const T2 b) 
		{
			numerics_template<T>::div(*this, b, *this);
			return *this;
		}


		template <class T2, class T3>
		numerics_template<T>& operator+=(const numerics_template<T2>& b) 
		{
			numerics_template<T>::add(*this, b, *this);
			return *this;
		}
		template <class T2, class T3>
		numerics_template<T>& operator-=(const numerics_template<T2>& b) 
		{
			numerics_template<T>::sub(*this, b, *this);
			return *this;
		}
		template <class T2, class T3>
		numerics_template<T>& operator*=(const numerics_template<T2>& b) 
		{
			numerics_template<T>::mult(*this, b, *this);
			return *this;
		}
		template <class T2, class T3>
		numerics_template<T>& operator/=(const numerics_template<T2>& b) 
		{
			numerics_template<T>::div(*this, b, *this);
			return *this;
		}
		




		template <class T2, class T3>
		numerics_template<T3> operator+(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::add(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator-(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::sub(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T> operator*(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::mult(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator/(const T2 b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::div(*this, b, out);
			return out;
		}


		template <class T2, class T3>
		numerics_template<T3> operator+(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::add(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator-(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::sub(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator*(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::mult(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		numerics_template<T3> operator/(const numerics_template<T2>& b) const
		{
			numerics_template<T3> out = numerics_template<T3>(this->N);
			numerics_template<T>::div(*this, b, out);
			return out;
		}
		
		T& operator[](const unsigned int id )
		{
		   return values[id]; // reference return 
		}
		
		const T& operator[](const unsigned int id ) const
		{
		   return values[id]; // reference return 
		}

		const numerics_template<T>& operator[](const numerics_template<bool>& ids ) const
		{
			numerics_template<T> out = numerics_template<T>(ids.N);
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[i] = values[ids[i]];
			}
			return out;
		}
	};

	using floats = numerics_template<float>;
	using ints = numerics_template<vec3_template<int>>;
	using uints = numerics_template<vec3_template<unsigned int>>;

	// NOTE: bools get special treatment because they're special
	class bools : numerics_template<bool>
	{
	public:
		bools(const unsigned int N) 				: numerics_template<bool>(N){};
		bools(const unsigned int N, const bool a)  	: numerics_template<bool>(N, a){};
		bools(const bools& a) 						: numerics_template<bool>(a){};

		static void unite(const bools& a, const bool b, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] || b;
			}
		}

		static void unite(const bools& a, const bools& b, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] || b.values[i];
			}
		}

		static void intersect(const bools& a, const bool b, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] && b;
			}
		}

		static void intersect(const bools& a, const bools& b, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] && b.values[i];
			}
		}

		static void differ(const bools& a, const bool b, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] && !b;
			}
		}

		static void differ(const bools& a, const bools& b, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] && !b.values[i];
			}
		}

		static void negate(const bools& a, bools& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = !a.values[i];
			}
		}


		bools operator~() const
		{
			bools out = bools(this->N);
			bools::negate(*this, out);
			return out;
		}




		bools operator|(const bool b) const
		{
			bools out = bools(this->N);
			bools::unite(*this, b, out);
			return out;
		}
		bools operator&(const bool b) const
		{
			bools out = bools(this->N);
			bools::intersect(*this, b, out);
			return out;
		}

		bools operator|(const bools& b) const
		{
			bools out = bools(this->N);
			bools::unite(*this, b, out);
			return out;
		}
		bools operator&(const bools& b) const
		{
			bools out = bools(this->N);
			bools::intersect(*this, b, out);
			return out;
		}




		bools& operator|=(const bool b){
			bools::unite(*this, b, *this);
			return *this;
		}
		bools& operator&=(const bool b){
			bools::intersect(*this, b, *this);
			return *this;
		}

		bools& operator|=(const bools& b){
			bools::unite(*this, b, *this);
			return *this;
		}
		bools& operator&=(const bools& b){
			bools::intersect(*this, b, *this);
			return *this;
		}
	};
}
