#pragma once

#include <initializer_list>	// initializer_list
#include <iterator>			// std::distance
#include <valarray>

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
		unsigned int N;

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
		many(TIterator first, TIterator last) : values(new T[std::distance(first, last)]), N(std::distance(first, last))
		{
			unsigned int id = 0;
			while (first!=last) 
			{
				this->values[id] = *first;
				++first;
				++id;
			}
		}

		// copy constructor
		many(const std::valarray<T>& a)  : values(new T[a.N]), N(a.N)
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
		explicit many(const std::valarray<T2>& a)  : values(new T[a.N]), N(a.N)
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
	
		inline std::valarray<T> operator[](const std::valarray<bool>& mask )
		{
			std::valarray<T> out = std::valarray<T>(mask.size());
			get(*this, mask, out);
			return out;
		}
		inline std::valarray<T> operator[](const std::valarray<unsigned int>& ids )
		{
			std::valarray<T> out = std::valarray<T>(ids.size());
			get(*this, ids, out);
			return out;
		}

		inline std::valarray<T>& operator=(const std::valarray<T>& other )
		{
			copy(*this, other);
			return *this;
		}
		inline std::valarray<T>& operator=(const T& other )
		{
			fill(*this, other);
			return *this;
		}
	};


	template <class T>
	inline T get(const std::valarray<T>& a, const unsigned int id )
	{
		return a[id];
	}
	template <class T>
	void get(const std::valarray<T>& a, const std::valarray<unsigned int>& ids, std::valarray<T>& out )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[i] = a[ids[i]];
		}
	}
	template <class T>
	void get(const std::valarray<T>& a, const std::valarray<bool>& mask, std::valarray<T>& out )
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
	std::valarray<T> get(const std::valarray<T>& a, const std::valarray<unsigned int>& ids)
	{
		std::valarray<T> out(ids.size());
		get(a, ids, out);
		return out;
	}

	template <class T>
	void fill(std::valarray<T>& out, const T a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = a;
		}
	}
	template <class T>
	void fill(std::valarray<T>& out, const std::valarray<unsigned int>& ids, const T a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a;
		}
	}
	template <class T>
	void fill(std::valarray<T>& out, const std::valarray<bool>& mask, const T a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = mask[i]? a : out[i];
		}
	}

	template <class T>
	void copy(std::valarray<T>& out, const std::valarray<T>& a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = a[i];
		}
	}
	// NOTE: duplicate of copy constructor, just in case library needs it
	template <class T>
	std::valarray<T> copy(const std::valarray<T>& a )
	{
		return std::valarray<T>(a);
	}
	template <class T>
	inline void copy(std::valarray<T>& out, const unsigned int id, const std::valarray<T>& a )
	{
		out[id] = a[id];
	}
	template <class T>
	void copy(std::valarray<T>& out, const std::valarray<unsigned int>& ids, const std::valarray<T>& a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a[ids[i]];
		}
	}
	template <class T>
	void copy(std::valarray<T>& out, const std::valarray<bool>& mask, const std::valarray<T>& a )
	{
		for (unsigned int i = 0; i < out.size(); ++i)
		{
			out[i] = mask[i]? a[i] : out[i];
		}
	}


	template <class T>
	inline void set(std::valarray<T>& out, const unsigned int id, const T a )
	{
		out[id] = a;
	}
	template <class T>
	void set(std::valarray<T>& out, const std::valarray<unsigned int>& ids, const std::valarray<T>& a )
	{
		for (unsigned int i = 0; i < ids.size(); ++i)
		{
			out[ids[i]] = a[i];
		}
	}


	float COMPOSITES_EPSILON = 1e-4;

	template <class T>
	bool equal(const std::valarray<T>& a, const T b)
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
	bool notEqual(const std::valarray<T>& a, const T b)
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
	bool equal(const std::valarray<T>& a, const std::valarray<T>& b)
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
	bool notEqual(const std::valarray<T>& a, const std::valarray<T>& b)
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
	void equal(const std::valarray<T>& a, const T b, std::valarray<bool>& out)
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
	void notEqual(const std::valarray<T>& a, const T b, std::valarray<bool>& out)
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
	void equal(const std::valarray<T>& a, const std::valarray<T>& b, std::valarray<bool>& out)
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
	void notEqual(const std::valarray<T>& a, const std::valarray<T>& b, std::valarray<bool>& out)
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
	inline bool operator==(const std::valarray<T>& a, const T b)
	{
		return equal(a, b);
	}
	template <class T>
	inline bool operator!=(const std::valarray<T>& a, const T b)
	{
		return notEqual(a, b);
	}
	template <class T>
	inline bool operator==(const T a, const std::valarray<T>& b)
	{
		return equal(a, b);
	}
	template <class T>
	inline bool operator!=(const T a, const std::valarray<T>& b)
	{
		return notEqual(a, b);
	}
	template <class T>
	inline bool operator==(const std::valarray<T>& a, const std::valarray<T>& b)
	{
		return equal(a, b);
	}
	template <class T>
	inline bool operator!=(const std::valarray<T>& a, const std::valarray<T>& b)
	{
		return notEqual(a, b);
	}







	template <class T, class T2>
	void greaterThan(const std::valarray<T>& a, const T2 b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b;
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const std::valarray<T>& a, const T2 b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b;
		}
	}
	template <class T, class T2>
	void lessThan(const std::valarray<T>& a, const T2 b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b;
		}
	}
	template <class T, class T2>
	void lessThanEqual(const std::valarray<T>& a, const T2 b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b;
		}
	}



	template <class T, class T2>
	void greaterThan(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] > b[i];
		}
	}
	template <class T, class T2>
	void greaterThanEqual(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] >= b[i];
		}
	}
	template <class T, class T2>
	void lessThan(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] <= b[i];
		}
	}
	template <class T, class T2>
	void lessThanEqual(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<bool>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] < b[i];
		}
	}



	template <class T, class T2, class T3>
	void add(const std::valarray<T>& a, const T2 b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b;
		}
	}
	template <class T, class T2, class T3>
	void sub(const std::valarray<T>& a, const T2 b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b;
		}
	}
	template <class T, class T2, class T3>
	void mult(const std::valarray<T>& a, const T2 b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = b * a[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const std::valarray<T>& a, const T2 b, std::valarray<T3>& out)
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
	void add(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] + b[i];
		}
	}
	template <class T, class T2, class T3>
	void sub(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] - b[i];
		}
	}
	template <class T, class T2, class T3>
	void mult(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] * b[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const std::valarray<T>& a, const std::valarray<T2>& b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a[i] / b[i];
		}
	}
	template <class T, class T2, class T3>
	void div(const T a, const std::valarray<T2>& b, std::valarray<T3>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = a / b[i];
		}
	}
	














	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline std::valarray<T3> operator>(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline std::valarray<T3> operator>=(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline std::valarray<T3> operator<(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline std::valarray<T3> operator<=(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		lessThanEqual(a, b, out);
		return out;
	}
	
	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline std::valarray<T3> operator>(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		greaterThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline std::valarray<T3> operator>=(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		greaterThanEqual(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline std::valarray<T3> operator<(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		lessThan(a, b, out);
		return out;
	}
	template <class T, class T2, class T3>
	inline std::valarray<T3> operator<=(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T3> out = std::valarray<T3>(a.N);
		lessThanEqual(a, b, out);
		return out;
	}




	template <class T, class T2, class T3>
	inline std::valarray<T>& operator+=(std::valarray<T>& a, const T2 b) 
	{
		add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline std::valarray<T>& operator-=(std::valarray<T>& a, const T2 b) 
	{
		sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline std::valarray<T>& operator*=(std::valarray<T>& a, const T2 b) 
	{
		mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline std::valarray<T>& operator/=(std::valarray<T>& a, const T2 b) 
	{
		div(a, b, a);
		return a;
	}


	template <class T, class T2>
	inline std::valarray<T>& operator+=(std::valarray<T>& a, const std::valarray<T2>& b) 
	{
		add(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline std::valarray<T>& operator-=(std::valarray<T>& a, const std::valarray<T2>& b) 
	{
		sub(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline std::valarray<T>& operator*=(std::valarray<T>& a, const std::valarray<T2>& b) 
	{
		mult(a, b, a);
		return a;
	}
	template <class T, class T2>
	inline std::valarray<T>& operator/=(std::valarray<T>& a, const std::valarray<T2>& b) 
	{
		div(a, b, a);
		return a;
	}

	// NOTE: prefix increment/decrement
	template <class T>
	inline std::valarray<T>& operator++(std::valarray<T>& a)  
	{  
		add(a, 1, a);
		return a;
	}  
	template <class T>
	inline std::valarray<T>& operator--(std::valarray<T>& a)  
	{  
		add(a, 1, a);
		return a;
	}  

	// NOTE: postfix increment/decrement
	template <class T>
	inline std::valarray<T> operator++(std::valarray<T>& a, int)  
	{  
		add(a, 1, a);
		return a;
	}  
	template <class T>
	inline std::valarray<T> operator--(std::valarray<T>& a, int)  
	{  
		add(a, 1, a);
		return a;
	}  
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2>
	inline std::valarray<T> operator+(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T> out(a.size());
		add(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator-(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T> out(a.size());
		sub(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator*(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T> out(a.size());
		mult(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator/(const std::valarray<T>& a, const T2 b)
	{
		std::valarray<T> out(a.size());
		div(a, b, out);
		return out;
	}
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2>
	inline std::valarray<T> operator+(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T> out(a.size());
		add(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator-(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T> out(a.size());
		sub(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator*(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T> out(a.size());
		mult(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator/(const T2 a, const std::valarray<T>& b)
	{
		std::valarray<T> out(a.size());
		div(a, b, out);
		return out;
	}


	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2>
	inline std::valarray<T> operator+(const std::valarray<T>& a, const std::valarray<T2>& b)
	{
		std::valarray<T> out(a.size());
		add(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator-(const std::valarray<T>& a, const std::valarray<T2>& b)
	{
		std::valarray<T> out(a.size());
		sub(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator*(const std::valarray<T>& a, const std::valarray<T2>& b)
	{
		std::valarray<T> out(a.size());
		mult(a, b, out);
		return out;
	}
	template <class T, class T2>
	inline std::valarray<T> operator/(const std::valarray<T>& a, const std::valarray<T2>& b)
	{
		std::valarray<T> out(a.size());
		div(a, b, out);
		return out;
	}
	typedef std::valarray<bool>	bools;
	typedef std::valarray<int>	ints;
	typedef std::valarray<unsigned int> uints;
	typedef std::valarray<float>	floats;
	typedef std::valarray<double>doubles;
}
