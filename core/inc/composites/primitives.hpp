#pragma once

#include <initializer_list>	// initializer_list

namespace composites
{

	// This template represents a statically-sized contiguous block of heap memory occupied by the primitive data of the same arbitrary type
	// The intention is to abstract away arrays of primitives that are used to address data locality issues
	// the data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the data type must have basic operators common to all primitives: == != 
	template <class T>
	class primitives
	{
	protected:
		T* values;
		const unsigned int N;

	public:

		// destructor: delete pointer 
		~primitives()
		{
    		delete [] this->values;
    		this->values = nullptr;
		};

		// initializer list constructor
		primitives(std::initializer_list<T> list) : values(new T[list.size()]), N(list.size())
		{
			int id = 0;
			for (auto i = list.begin(); i != list.end(); ++i)
			{
				this->values[id] = *i;
				id++;
			}
		};
		
		// move constructor
		primitives(primitives<T>&& a)  : values(a.values), N(a.N)
		{
			a.values = nullptr;
		};

		// copy constructor
		explicit primitives(const primitives<T>& a)  : values(new T[a.N]), N(a.N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a[i];
			}
		};

		explicit primitives(const unsigned int N) : values(new T[N]), N(N) {};

		explicit primitives(const unsigned int N, const T a)  : values(new T[N]), N(N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a;
			}
		};
		template <class T2>
		explicit primitives(const primitives<T2>& a)  : values(new T[a.N]), N(a.N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a[i];
			}
		};

		inline unsigned int size() const
		{
			return N;
		}

		// NOTE: all operators should to be inline because they are thin wrappers of functions
		inline const T& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline T& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
	
		inline primitives<T> operator[](const primitives<bool>& mask )
		{
			primitives<T> out = primitives<T>(mask.size());
			get(*this, mask, out);
			return out;
		}
		inline primitives<T> operator[](const primitives<unsigned int>& ids )
		{
			primitives<T> out = primitives<T>(ids.size());
			get(*this, ids, out);
			return out;
		}
	};


	template <class T>
	inline T get(const primitives<T>& a, const unsigned int id )
	{
		return a[id];
	}
	template <class T>
	void get(const primitives<T>& a, const primitives<unsigned int>& ids, primitives<T>& out )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[i] = a[ids[i]];
		}
	}
	template <class T>
	void get(const primitives<T>& a, const primitives<bool>& mask, primitives<T>& out )
	{
		int out_i = 0;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			if (mask[i])
			{
				out[out_i] = a[i];
				out_i++;
			}
		}
	}

	template <class T>
	inline void set(primitives<T>& out, const unsigned int id, const T a )
	{
		out[id] = a;
	}
	template <class T>
	void set(primitives<T>& out, const T a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = a;
		}
	}
	template <class T>
	void set(primitives<T>& out, const primitives<unsigned int>& ids, const T a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a;
		}
	}
	template <class T>
	void set(const primitives<T>& out, const primitives<bool>& mask, const T a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = mask[i]? a : out[i];
		}
	}


	template <class T>
	void set(primitives<T>& out, const primitives<T>& a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = a[i];
		}
	}
	template <class T>
	void set(primitives<T>& out, const primitives<unsigned int>& ids, const primitives<T>& a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a[i];
		}
	}
	template <class T>
	void set(primitives<T>& out, const primitives<bool>& mask, const primitives<T>& a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = mask[i]? a[i] : out[i];
		}
	}



	template <class T>
	bool equal(const primitives<T>& a, const T b)
	{
		bool out = true;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out &= a[i] == b;
		}
		return out;
	}
	template <class T>
	bool notEqual(const primitives<T>& a, const T b)
	{
		bool out = false;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= a[i] != b;
		}
		return out;
	}
	template <class T>
	bool equal(const primitives<T>& a, const primitives<T>& b)
	{
		bool out = true;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out &= a[i] == b[i];
		}
		return out;
	}
	template <class T>
	bool notEqual(const primitives<T>& a, const primitives<T>& b)
	{
		bool out = false;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out |= a[i] != b[i];
		}
		return out;
	}



	template <class T>
	void equal(const primitives<T>& a, const T b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] == b;
		}
	}
	template <class T>
	void notEqual(const primitives<T>& a, const T b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] == b;
		}
	}
	template <class T>
	void equal(const primitives<T>& a, const primitives<T>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] == b[i];
		}
	}
	template <class T>
	void notEqual(const primitives<T>& a, const primitives<T>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] != b[i];
		}
	}


	// NOTE: all operators are suggested to be inline because they are thin wrappers of functions
	template <class T>
	inline bool operator==(const primitives<T>& a, const T b)
	{
		return primitives<T>::equal(a, b);
	}
	template <class T>
	inline bool operator!=(const primitives<T>& a, const T b)
	{
		return primitives<T>::notEqual(a, b);
	}
	template <class T>
	inline bool operator==(const primitives<T>& a, const primitives<T>& b)
	{
		return primitives<T>::equal(a, b);
	}
	template <class T>
	inline bool operator!=(const primitives<T>& a, const primitives<T>& b)
	{
		return primitives<T>::notEqual(a, b);
	}







	template <class T, class T2>
	void greaterThan(const primitives<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b;
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const primitives<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b;
		}
	}
	template <class T, class T2>
	void lessThan(const primitives<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b;
		}
	}
	template <class T, class T2>
	void lessThanEqual(const primitives<T>& a, const T2 b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b;
		}
	}



	template <class T, class T2>
	void greaterThan(const primitives<T>& a, const primitives<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b[i];
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const primitives<T>& a, const primitives<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b[i];
		}
	}
	template <class T, class T2>
	void lessThan(const primitives<T>& a, const primitives<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b[i];
		}
	}
	template <class T, class T2>
	void lessThanEqual(const primitives<T>& a, const primitives<T2>& b, primitives<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b[i];
		}
	}



	template <class T, class T2, class T3>
	void add(const primitives<T>& a, const T2 b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b;
		}
	}
	template <class T, class T2, class T3>
	void sub(const primitives<T>& a, const T2 b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b;
		}
	}
	template <class T, class T2, class T3>
	void mult(const primitives<T>& a, const T2 b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * b;
		}
	}
	template <class T, class T2, class T3>
	void div(const primitives<T>& a, const T2 b, primitives<T3>& out)
	{
		const T ainv = 1./b;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] / b;
		}
	}



	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	void add(const primitives<T>& a, const primitives<T2>& b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b[i];
		}
	}
	template <class T, class T2, class T3>
	void sub(const primitives<T>& a, const primitives<T2>& b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b[i];
		}
	}
	template <class T, class T2, class T3>
	void mult(const primitives<T>& a, const primitives<T2>& b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * b[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const primitives<T>& a, const primitives<T2>& b, primitives<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] / b[i];
		}
	}
	
	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline primitives<T3> operator>(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator>=(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator<(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator<=(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::lessThanEqual(a, b, out);
		return out;
	}

	

	template <class T, class T2, class T3>
	inline primitives<T3> operator>(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator>=(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator<(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator<=(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::lessThanEqual(a, b, out);
		return out;
	}






	template <class T, class T2, class T3>
	inline primitives<T>& operator+=(const primitives<T>& a, const T2 b) 
	{
		primitives<T>::add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline primitives<T>& operator-=(const primitives<T>& a, const T2 b) 
	{
		primitives<T>::sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline primitives<T>& operator*=(const primitives<T>& a, const T2 b) 
	{
		primitives<T>::mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline primitives<T>& operator/=(const primitives<T>& a, const T2 b) 
	{
		primitives<T>::div(a, b, a);
		return a;
	}


	template <class T, class T2>
	inline primitives<T>& operator+=(const primitives<T>& a, const primitives<T2>& b) 
	{
		primitives<T>::add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline primitives<T>& operator-=(const primitives<T>& a, const primitives<T2>& b) 
	{
		primitives<T>::sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline primitives<T>& operator*=(const primitives<T>& a, const primitives<T2>& b) 
	{
		primitives<T>::mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline primitives<T>& operator/=(const primitives<T>& a, const primitives<T2>& b) 
	{
		primitives<T>::div(a, b, a);
		return a;
	}

	// NOTE: prefix increment/decrement
	template <class T>
	inline primitives<T>& operator++(const primitives<T>& a)  
	{  
		primitives<T>::add(a, 1, a);
		return a;
	}  
	template <class T>
	inline primitives<T>& operator--(const primitives<T>& a)  
	{  
		primitives<T>::add(a, 1, a);
		return a;
	}  

	// NOTE: postfix increment/decrement
	template <class T>
	inline primitives<T> operator++(const primitives<T>& a, int)  
	{  
		primitives<T>::add(a, 1, a);
		return a;
	}  
	template <class T>
	inline primitives<T> operator--(const primitives<T>& a, int)  
	{  
		primitives<T>::add(a, 1, a);
		return a;
	}  
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	inline primitives<T3> operator+(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator-(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T> operator*(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator/(const primitives<T>& a, const T2 b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::div(a, b, out);
		return out;
	}


	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	inline primitives<T3> operator+(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator-(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator*(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline primitives<T3> operator/(const primitives<T>& a, const primitives<T2>& b)
	{
		primitives<T3> out = primitives<T3>(a.N);
		primitives<T>::div(a, b, out);
		return out;
	}
	typedef primitives<bool>	bools;
	typedef primitives<int>		ints;
	typedef primitives<unsigned int> uints;
	typedef primitives<float>	floats;
	typedef primitives<double>	doubles;
}
