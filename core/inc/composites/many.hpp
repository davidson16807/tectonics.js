#pragma once

#include <initializer_list>	// initializer_list

namespace composites
{

	// This template represents a statically-sized contiguous block of heap memory occupied by the primitive data of the same arbitrary type
	// The intention is to abstract away arrays of primitives that are used to address data locality issues
	// the data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the data type must have basic operators common to all primitives: == != 
	template <class T>
	class many
	{
	protected:
		T* values;
		const unsigned int N;

	public:

		// destructor: delete pointer 
		~many()
		{
    		delete [] this->values;
    		this->values = nullptr;
		};

		// initializer list constructor
		many(std::initializer_list<T> list) : values(new T[list.size()]), N(list.size())
		{
			unsigned int id = 0;
			for (auto i = list.begin(); i != list.end(); ++i)
			{
				this->values[id] = *i;
				id++;
			}
		};
		template<class TIterator>
		many(TIterator first, TIterator last)
		{
			unsigned int id = 0;
			while (first!=last) {
				this->values[id] = *first;
				++first;
				++id;
			}
		}
		
		// move constructor
		many(many<T>&& a)  : values(a.values), N(a.N)
		{
			a.values = nullptr;
		};

		// copy constructor
		explicit many(const many<T>& a)  : values(new T[a.N]), N(a.N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a[i];
			}
		};

		explicit many(const unsigned int N) : values(new T[N]), N(N) {};

		explicit many(const unsigned int N, const T a)  : values(new T[N]), N(N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a;
			}
		};
		template <class T2>
		explicit many(const many<T2>& a)  : values(new T[a.N]), N(a.N)
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

		inline T* data()
		{
			return this->values;
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
	
		inline many<T> operator[](const many<bool>& mask )
		{
			many<T> out = many<T>(mask.size());
			get(*this, mask, out);
			return out;
		}
		inline many<T> operator[](const many<unsigned int>& ids )
		{
			many<T> out = many<T>(ids.size());
			get(*this, ids, out);
			return out;
		}
	};


	template <class T>
	inline T get(const many<T>& a, const unsigned int id )
	{
		return a[id];
	}
	template <class T>
	void get(const many<T>& a, const many<unsigned int>& ids, many<T>& out )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[i] = a[ids[i]];
		}
	}
	template <class T>
	void get(const many<T>& a, const many<bool>& mask, many<T>& out )
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
	void fill(many<T>& out, const T a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = a;
		}
	}
	template <class T>
	void fill(many<T>& out, const many<unsigned int>& ids, const T a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a;
		}
	}
	template <class T>
	void fill(many<T>& out, const many<bool>& mask, const T a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = mask[i]? a : out[i];
		}
	}

	template <class T>
	void copy(many<T>& out, const many<T>& a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = a[i];
		}
	}
	// NOTE: duplicate of copy constructor, just in case library needs it
	template <class T>
	many<T> copy(const many<T>& a )
	{
		return many<T>(a);
	}
	template <class T>
	inline void copy(many<T>& out, const unsigned int id, const many<T>& a )
	{
		out[id] = a[id];
	}
	template <class T>
	void copy(many<T>& out, const many<unsigned int>& ids, const many<T>& a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a[ids[i]];
		}
	}
	template <class T>
	void copy(many<T>& out, const many<bool>& mask, const many<T>& a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = mask[i]? a[i] : out[i];
		}
	}


	template <class T>
	inline void set(many<T>& out, const unsigned int id, const T a )
	{
		out[id] = a;
	}
	template <class T>
	void set(many<T>& out, const many<unsigned int>& ids, const many<T>& a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a[i];
		}
	}


	float COMPOSITES_EPSILON = 1e-4;

	template <class T>
	bool equal(const many<T>& a, const T b)
	{
		bool out(true);
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b;
			out &= diff*diff <= threshold;
		}
		return out;
	}
	template <class T>
	bool notEqual(const many<T>& a, const T b)
	{
		bool out(false);
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b;
			out |= diff*diff > threshold;
		}
		return out;
	}
	template <class T>
	bool equal(const many<T>& a, const many<T>& b)
	{
		bool out(true);
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b[i];
			out &= diff*diff <= threshold;
		}
		return out;
	}
	template <class T>
	bool notEqual(const many<T>& a, const many<T>& b)
	{
		bool out(false);
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b[i];
			out |= diff*diff > threshold;
		}
		return out;
	}



	template <class T>
	void equal(const many<T>& a, const T b, many<bool>& out)
	{
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b;
			out[i] = diff*diff <= threshold;
		}
	}
	template <class T>
	void notEqual(const many<T>& a, const T b, many<bool>& out)
	{
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b;
			out[i] = diff*diff > threshold;
		}
	}
	template <class T>
	void equal(const many<T>& a, const many<T>& b, many<bool>& out)
	{
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b[i];
			out[i] = diff*diff <= threshold;
		}
	}
	template <class T>
	void notEqual(const many<T>& a, const many<T>& b, many<bool>& out)
	{
		T diff(0);
		T threshold(COMPOSITES_EPSILON);
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			diff = a[i] - b[i];
			out[i] = diff*diff > threshold;
		}
	}


	// NOTE: all operators are suggested to be inline because they are thin wrappers of functions
	template <class T>
	inline bool operator==(const many<T>& a, const T b)
	{
		return equal(a, b);
	}
	template <class T>
	inline bool operator!=(const many<T>& a, const T b)
	{
		return notEqual(a, b);
	}
	template <class T>
	inline bool operator==(const T a, const many<T>& b)
	{
		return equal(a, b);
	}
	template <class T>
	inline bool operator!=(const T a, const many<T>& b)
	{
		return notEqual(a, b);
	}
	template <class T>
	inline bool operator==(const many<T>& a, const many<T>& b)
	{
		return equal(a, b);
	}
	template <class T>
	inline bool operator!=(const many<T>& a, const many<T>& b)
	{
		return notEqual(a, b);
	}







	template <class T, class T2>
	void greaterThan(const many<T>& a, const T2 b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b;
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const many<T>& a, const T2 b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b;
		}
	}
	template <class T, class T2>
	void lessThan(const many<T>& a, const T2 b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b;
		}
	}
	template <class T, class T2>
	void lessThanEqual(const many<T>& a, const T2 b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b;
		}
	}



	template <class T, class T2>
	void greaterThan(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b[i];
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b[i];
		}
	}
	template <class T, class T2>
	void lessThan(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b[i];
		}
	}
	template <class T, class T2>
	void lessThanEqual(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b[i];
		}
	}



	template <class T, class T2, class T3>
	void add(const many<T>& a, const T2 b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b;
		}
	}
	template <class T, class T2, class T3>
	void sub(const many<T>& a, const T2 b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b;
		}
	}
	template <class T, class T2, class T3>
	void mult(const many<T>& a, const T2 b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = b * a[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const many<T>& a, const T2 b, many<T3>& out)
	{
		const T2 binv = T2(1.)/b;
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * binv;
		}
	}



	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	void add(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b[i];
		}
	}
	template <class T, class T2, class T3>
	void sub(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b[i];
		}
	}
	template <class T, class T2, class T3>
	void mult(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * b[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] / b[i];
		}
	}
	
	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline many<T3> operator>(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator>=(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<=(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		lessThanEqual(a, b, out);
		return out;
	}
	
	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline many<T3> operator>(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator>=(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<=(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		lessThanEqual(a, b, out);
		return out;
	}

	

	template <class T, class T2, class T3>
	inline many<T3> operator>(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator>=(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<=(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		lessThanEqual(a, b, out);
		return out;
	}






	template <class T, class T2, class T3>
	inline many<T>& operator+=(const many<T>& a, const T2 b) 
	{
		add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator-=(const many<T>& a, const T2 b) 
	{
		sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator*=(const many<T>& a, const T2 b) 
	{
		mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator/=(const many<T>& a, const T2 b) 
	{
		div(a, b, a);
		return a;
	}


	template <class T, class T2>
	inline many<T>& operator+=(const many<T>& a, const many<T2>& b) 
	{
		add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator-=(const many<T>& a, const many<T2>& b) 
	{
		sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator*=(const many<T>& a, const many<T2>& b) 
	{
		mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator/=(const many<T>& a, const many<T2>& b) 
	{
		div(a, b, a);
		return a;
	}

	// NOTE: prefix increment/decrement
	template <class T>
	inline many<T>& operator++(const many<T>& a)  
	{  
		add(a, 1, a);
		return a;
	}  
	template <class T>
	inline many<T>& operator--(const many<T>& a)  
	{  
		add(a, 1, a);
		return a;
	}  

	// NOTE: postfix increment/decrement
	template <class T>
	inline many<T> operator++(const many<T>& a, int)  
	{  
		add(a, 1, a);
		return a;
	}  
	template <class T>
	inline many<T> operator--(const many<T>& a, int)  
	{  
		add(a, 1, a);
		return a;
	}  
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	inline many<T3> operator+(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator-(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T> operator*(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator/(const many<T>& a, const T2 b)
	{
		many<T3> out = many<T3>(a.N);
		div(a, b, out);
		return out;
	}
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	inline many<T3> operator+(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator-(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T> operator*(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator/(const T2 a, const many<T>& b)
	{
		many<T3> out = many<T3>(a.N);
		div(a, b, out);
		return out;
	}


	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	inline many<T3> operator+(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		add(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator-(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		sub(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator*(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		mult(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline many<T3> operator/(const many<T>& a, const many<T2>& b)
	{
		many<T3> out = many<T3>(a.N);
		div(a, b, out);
		return out;
	}
	typedef many<bool>	bools;
	typedef many<int>		ints;
	typedef many<unsigned int> uints;
	typedef many<float>	floats;
	typedef many<double>	doubles;
}
