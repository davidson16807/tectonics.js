#pragma once

#include <initializer_list>// initializer_list

#include "bools.h"
#include "primitives.h"

namespace composites
{

	// This template represents a statically-sized contiguous block of memory occupied by numeric data of arbitrary type
	// The intention is to abstract away numeric arrays that are used to address data locality issues
	// the numeric data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the numeric data type must have all the standard arithmetic operators as regular ints/floats: + - * / < > <= >= == != 
	// the arithmetic operators must share the same general behavior as ints/floats (i.e. no dot products or element-wise comparators)
	template <class T>
	class numerics : public primitives<T>
	{

	public:
		numerics(std::initializer_list<T> list)  			: primitives<T>(list)  {};

		explicit numerics(const unsigned int N) 			: primitives<T>(N) {};
		explicit numerics(const unsigned int N, const T a) : primitives<T>(N, a) {};
		explicit numerics(const numerics<T>& a)  	: primitives<T>(a) {};

		template <class T2>
		explicit numerics(const numerics<T2>& a)  : primitives<T>(a) {};

		static T min(const numerics<T>& a)
		{
			T out = a.values[0];
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out = a.values[i] < out? a.values[i] : out;
			}
			return out;
		}
		static T max(const numerics<T>& a)
		{
			T out = a.values[0];
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out = a.values[i] > out? a.values[i] : out;
			}
			return out;
		}



		template <class T2>
		static void max(const numerics<T>& a, const T2 b, numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > b? a.values[i] : b;
			}
		}
		template <class T2>
		static void min(const numerics<T>& a, const T2 b, numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < b? a.values[i] : b;
			}
		}



		template <class T2>
		static void max(const numerics<T>& a, const numerics<T2>& b, numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > b.values[i]? a.values[i] : b.values[i];
			}
		}
		template <class T2>
		static void min(const numerics<T>& a, const numerics<T2>& b, numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < b.values[i]? a.values[i] : b.values[i];
			}
		}


		template <class Tlo, class Thi>
		static void clamp(const numerics<T>& a, const Tlo lo, const Thi hi, const numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > hi? hi : a.values[i] < lo? lo : a.values[i];
			}
		}
		template <class Tlo, class Thi>
		static void clamp(const numerics<T>& a, const Tlo lo, const numerics<Thi>& hi, const numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > hi.values[i]? hi.values[i] : a.values[i] < lo? lo : a.values[i];
			}
		}
		template <class Tlo, class Thi>
		static void clamp(const numerics<T>& a, const numerics<Tlo>& lo, const Thi hi, const numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > hi? hi : a.values[i] < lo.values[i]? lo.values[i] : a.values[i];
			}
		}
		template <class Tlo, class Thi>
		static void clamp(const numerics<T>& a, const numerics<Tlo>& lo, const numerics<Thi>& hi, const numerics<T>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > hi.values[i]? hi.values[i] : a.values[i];
			}
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < lo.values[i]? lo.values[i] : out.values[i];
			}
		}

		template <class T2>
		static void gt(const numerics<T>& a, const T2 b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > b;
			}
		}
		template <class T2>
		static void gte(const numerics<T>& a, const T2 b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] >= b;
			}
		}
		template <class T2>
		static void lt(const numerics<T>& a, const T2 b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < b;
			}
		}
		template <class T2>
		static void lte(const numerics<T>& a, const T2 b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] <= b;
			}
		}





		template <class T2>
		static void gt(const numerics<T>& a, const numerics<T2>& b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] > b.values[i];
			}
		}
		template <class T2>
		static void gte(const numerics<T>& a, const numerics<T2>& b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] >= b.values[i];
			}
		}
		template <class T2>
		static void lt(const numerics<T>& a, const numerics<T2>& b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] <= b.values[i];
			}
		}
		template <class T2>
		static void lte(const numerics<T>& a, const numerics<T2>& b, bools& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] < b.values[i];
			}
		}





		template <class T2, class T3>
		static void add(const numerics<T>& a, const T2 b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] + b;
			}
		}
		template <class T2, class T3>
		static void sub(const numerics<T>& a, const T2 b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] - b;
			}
		}
		template <class T2, class T3>
		static void mult(const numerics<T>& a, const T2 b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] * b;
			}
		}
		template <class T2, class T3>
		static void div(const numerics<T>& a, const T2 b, numerics<T3>& out)
		{
			const T ainv = 1./b;
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] / b;
			}
		}



		template <class T2, class T3>
		static void add(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] + b.values[i];
			}
		}
		template <class T2, class T3>
		static void sub(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] - b.values[i];
			}
		}
		template <class T2, class T3>
		static void mult(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] * b.values[i];
			}
		}
		template <class T2, class T3>
		static void div(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] / b.values[i];
			}
		}
		
		// NOTE: all wrappers are suggested to be inline because they are thin wrappers of static functions

		template <class T2, class T3>
		inline numerics<T3> operator>(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::gt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator>=(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::gte(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator<(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::lt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator<=(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::lte(*this, b, out);
			return out;
		}

		

		template <class T2, class T3>
		inline numerics<T3> operator>(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::gt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator>=(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::gte(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator<(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::lt(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator<=(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::lte(*this, b, out);
			return out;
		}






		template <class T2>
		inline numerics<T>& operator+=(const T2 b) 
		{
			numerics<T>::add(*this, b, *this);
			return *this;
		}
		template <class T2>
		inline numerics<T>& operator-=(const T2 b) 
		{
			numerics<T>::sub(*this, b, *this);
			return *this;
		}
		template <class T2>
		inline numerics<T>& operator*=(const T2 b) 
		{
			numerics<T>::mult(*this, b, *this);
			return *this;
		}
		template <class T2>
		inline numerics<T>& operator/=(const T2 b) 
		{
			numerics<T>::div(*this, b, *this);
			return *this;
		}


		template <class T2>
		inline numerics<T>& operator+=(const numerics<T2>& b) 
		{
			numerics<T>::add(*this, b, *this);
			return *this;
		}
		template <class T2>
		inline numerics<T>& operator-=(const numerics<T2>& b) 
		{
			numerics<T>::sub(*this, b, *this);
			return *this;
		}
		template <class T2>
		inline numerics<T>& operator*=(const numerics<T2>& b) 
		{
			numerics<T>::mult(*this, b, *this);
			return *this;
		}
		template <class T2>
		inline numerics<T>& operator/=(const numerics<T2>& b) 
		{
			numerics<T>::div(*this, b, *this);
			return *this;
		}

		// NOTE: prefix increment/decrement
		inline numerics<T>& operator++()  
		{  
			numerics<T>::add(*this, 1, *this);
			return *this;
		}  
		inline numerics<T>& operator--()  
		{  
			numerics<T>::add(*this, 1, *this);
			return *this;
		}  

		// NOTE: postfix increment/decrement
		inline numerics<T> operator++(int)  
		{  
			numerics<T>::add(*this, 1, *this);
			return *this;
		}  
		inline numerics<T> operator--(int)  
		{  
			numerics<T>::add(*this, 1, *this);
			return *this;
		}  
		




		template <class T2, class T3>
		inline numerics<T3> operator+(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::add(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator-(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::sub(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T> operator*(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::mult(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator/(const T2 b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::div(*this, b, out);
			return out;
		}


		template <class T2, class T3>
		inline numerics<T3> operator+(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::add(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator-(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::sub(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator*(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::mult(*this, b, out);
			return out;
		}
		template <class T2, class T3>
		inline numerics<T3> operator/(const numerics<T2>& b) const
		{
			numerics<T3> out = numerics<T3>(this->N);
			numerics<T>::div(*this, b, out);
			return out;
		}

		inline const T& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline T& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		inline const numerics<T> operator[](const primitives<bool>& mask ) const
		{
			numerics<T> out = numerics<T>(mask.N);
			get(*this, mask, out);
			return out;
		}
		inline const numerics<T> operator[](const primitives<unsigned int>& ids ) const
		{
			numerics<T> out = numerics<T>(ids.N);
			get(*this, ids, out);
			return out;
		}
	};

	using floats = numerics<float>;
	using ints = numerics<int>;
	using uints = numerics<unsigned int>;

}
