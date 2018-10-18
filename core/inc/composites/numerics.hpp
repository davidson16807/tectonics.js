#pragma once

#include <initializer_list>// initializer_list

#include "primitives.hpp"

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
		numerics(std::initializer_list<T> list)  	: primitives<T>(list)  {};
		numerics(numerics<T>&&a)  					: primitives<T>(a) {};

		explicit numerics(const unsigned int N) 	: primitives<T>(N) {};
		explicit numerics(const unsigned int N, const T a) : primitives<T>(N, a) {};
		explicit numerics(const numerics<T>& a)  	: primitives<T>(a) {};

		template <class T2>
		explicit numerics(const numerics<T2>& a)  : primitives<T>(a) {};


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


	template <class T>
	T min(const numerics<T>& a)
	{
		T out = a[0];
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out = a[i] < out? a[i] : out;
		}
		return out;
	}
	template <class T>
	T max(const numerics<T>& a)
	{
		T out = a[0];
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out = a[i] > out? a[i] : out;
		}
		return out;
	}



	template <class T, class T2>
	void max(const numerics<T>& a, const T2 b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b? a[i] : b;
		}
	}
	template <class T, class T2>
	void min(const numerics<T>& a, const T2 b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b? a[i] : b;
		}
	}



	template <class T, class T2>
	void max(const numerics<T>& a, const numerics<T2>& b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b[i]? a[i] : b[i];
		}
	}
	template <class T, class T2>
	void min(const numerics<T>& a, const numerics<T2>& b, numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b[i]? a[i] : b[i];
		}
	}


	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const Tlo lo, const Thi hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi? hi : a[i] < lo? lo : a[i];
		}
	}
	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const Tlo lo, const numerics<Thi>& hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi[i]? hi[i] : a[i] < lo? lo : a[i];
		}
	}
	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const numerics<Tlo>& lo, const Thi hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi? hi : a[i] < lo[i]? lo[i] : a[i];
		}
	}
	template <class T, class Tlo, class Thi>
	void clamp(const numerics<T>& a, const numerics<Tlo>& lo, const numerics<Thi>& hi, const numerics<T>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > hi[i]? hi[i] : a[i];
		}
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < lo[i]? lo[i] : out[i];
		}
	}

	template <class T, class T2>
	void gt(const numerics<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b;
		}
	}
	template <class T, class T2>
	void gte(const numerics<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b;
		}
	}
	template <class T, class T2>
	void lt(const numerics<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b;
		}
	}
	template <class T, class T2>
	void lte(const numerics<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b;
		}
	}





	template <class T, class T2>
	void gt(const numerics<T>& a, const numerics<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b[i];
		}
	}
	template <class T, class T2>
	void gte(const numerics<T>& a, const numerics<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b[i];
		}
	}
	template <class T, class T2>
	void lt(const numerics<T>& a, const numerics<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b[i];
		}
	}
	template <class T, class T2>
	void lte(const numerics<T>& a, const numerics<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b[i];
		}
	}





	template <class T, class T2, class T3>
	void add(const numerics<T>& a, const T2 b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b;
		}
	}
	template <class T, class T2, class T3>
	void sub(const numerics<T>& a, const T2 b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b;
		}
	}
	template <class T, class T2, class T3>
	void mult(const numerics<T>& a, const T2 b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * b;
		}
	}
	template <class T, class T2, class T3>
	void div(const numerics<T>& a, const T2 b, numerics<T3>& out)
	{
		const T ainv = 1./b;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] / b;
		}
	}



	template <class T, class T2, class T3>
	void add(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b[i];
		}
	}
	template <class T, class T2, class T3>
	void sub(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b[i];
		}
	}
	template <class T, class T2, class T3>
	void mult(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * b[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const numerics<T>& a, const numerics<T2>& b, numerics<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] / b[i];
		}
	}
	
	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline numerics<T3> operator>(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::gt(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator>=(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::gte(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator<(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::lt(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator<=(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::lte(a, b, out);
		return out;
	}

	

	template <class T, class T2, class T3>
	inline numerics<T3> operator>(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::gt(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator>=(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::gte(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator<(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::lt(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator<=(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::lte(a, b, out);
		return out;
	}






	template <class T, class T2>
	inline numerics<T>& operator+=(const numerics<T>& a, const T2 b) 
	{
		numerics<T>::add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline numerics<T>& operator-=(const numerics<T>& a, const T2 b) 
	{
		numerics<T>::sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline numerics<T>& operator*=(const numerics<T>& a, const T2 b) 
	{
		numerics<T>::mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline numerics<T>& operator/=(const numerics<T>& a, const T2 b) 
	{
		numerics<T>::div(a, b, a);
		return a;
	}


	template <class T, class T2>
	inline numerics<T>& operator+=(const numerics<T>& a, const numerics<T2>& b) 
	{
		numerics<T>::add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline numerics<T>& operator-=(const numerics<T>& a, const numerics<T2>& b) 
	{
		numerics<T>::sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline numerics<T>& operator*=(const numerics<T>& a, const numerics<T2>& b) 
	{
		numerics<T>::mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline numerics<T>& operator/=(const numerics<T>& a, const numerics<T2>& b) 
	{
		numerics<T>::div(a, b, a);
		return a;
	}

	// NOTE: prefix increment/decrement
	template <class T>
	inline numerics<T>& operator++(const numerics<T>& a)  
	{  
		numerics<T>::add(a, 1, a);
		return a;
	}  
	template <class T>
	inline numerics<T>& operator--(const numerics<T>& a)  
	{  
		numerics<T>::add(a, 1, a);
		return a;
	}  

	// NOTE: postfix increment/decrement
	template <class T>
	inline numerics<T> operator++(const numerics<T>& a, int)  
	{  
		numerics<T>::add(a, 1, a);
		return a;
	}  
	template <class T>
	inline numerics<T> operator--(const numerics<T>& a, int)  
	{  
		numerics<T>::add(a, 1, a);
		return a;
	}  
	




	template <class T, class T2, class T3>
	inline numerics<T3> operator+(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator-(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T> operator*(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator/(const numerics<T>& a, const T2 b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::div(a, b, out);
		return out;
	}


	template <class T, class T2, class T3>
	inline numerics<T3> operator+(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator-(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator*(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline numerics<T3> operator/(const numerics<T>& a, const numerics<T2>& b)
	{
		numerics<T3> out = numerics<T3>(a.N);
		numerics<T>::div(a, b, out);
		return out;
	}

}
