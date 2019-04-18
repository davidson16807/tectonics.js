#pragma once

#include <iostream>
#include <initializer_list>	// initializer_list
#include <iterator>			// std::distance
#include <vector>			// std::distance

namespace composites
{

	// This template represents a statically-sized contiguous block of heap memory occupied by primitive data of the same arbitrary type
	// The intention is to abstract away arrays of primitives that are used to address data locality issues
	// the data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the data type must have basic operators common to all primitives: == != 
	// 
	// Q: Why don't we use std::valarray<T> instead? Doesn't it do the same thing?
	// A: Yes, but std::valarray<T> forbids T from overloading operator|(), and this forbids us from using it with glm::vec3. 
	//      We really want to be able to use glm::vec3 since it allows us to easily port code from GLSL to C++.
	//      std::valarray<T> also has several severe limitations relating to its flawed design history that would forbid its use anyway,
	//      For instance, it does not implement standard container methods like .begin() and .end()
	// 
	// Q: Why don't we use the xtensor library? 
	// A: I've tried exposing xtensor through wasm but it remains elusive. 
	//      Rolling our own custom class allows us full control over how it can be exposed through wasm.
	//      In any case, I'm also conflicted on using xtensor because it favors borrowing cues from numpy instead of glm,
	//       and as mentioned above, we want to continue using glm because it allows us to port easily from GLSL to C++.
	//      The same could be said for any other library that provides tensor/ndarray functionality, really.
	//
	// Q: Why do we use std::vector internally?
	// A: The functions and operators that use many<T> could effectively be reimplemented using std::vector<T>, 
	//       but this could cause confusion in new developers, since they would see basic arithmetic being performed on std::vectors
	//       without having any idea where that behavior was being implemented. 
	//      Therefore, we roll our own custom class, many<T>, which is a thin wrapper around std::vector<T>
	//      We could implement many<T> as a derived class of std::vector, but we prefer to favor composition over inheritance. 
	//      This is especially the case given that we don't own std::vector<T>.
	//      The performance penalty of using std::vector<T> over traditional arrays is inconsequential, 
	//       and given our previous implementation was in javascript, we're happy with the performance boost we get by moving to C++.
	template <class T>
	class many
	{
	protected:
		std::vector<T> values;

	public:

		virtual ~many()
		{
		};

		// initializer list constructor
		many(std::initializer_list<T> list) : values(list.size())
		{
			unsigned int id = 0;
			for (auto i = list.begin(); i != list.end(); ++i)
			{
				this->values[id] = *i;
				id++;
			}
		};
		template<class TIterator>
		many(TIterator first, TIterator last) : values(std::distance(first, last))
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
		many(const many<T>& a)  : values(a.values) {};

		explicit many(const unsigned int N) : values(N) {};

		explicit many(const unsigned int N, const T a)  : values(N, a) {};

		template <class T2>
		explicit many(const many<T2>& a)  : values(a.N)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				values[i] = a[i];
			}
		};

		inline unsigned int size() const
		{
			return values.size();
		}

		inline std::vector<T>& vector()
		{
			return values;
		}

	    inline typename std::vector<T>::const_iterator begin() const { return values.begin(); }
	    inline typename std::vector<T>::const_iterator end()   const { return values.end();   }

	    inline typename std::vector<T>::iterator begin() { return values.begin(); }
	    inline typename std::vector<T>::iterator end()   { return values.end();   }

		// NOTE: all operators should to be inline because they are thin wrappers of functions
		inline typename std::vector<T>::const_reference operator[](const unsigned int id ) const
		{
		   return values.operator[](id);
		}
		inline typename std::vector<T>::reference operator[](const unsigned int id )
		{
		   return values[id]; // reference return 
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

		inline many<T>& operator=(const many<T>& other )
		{
			copy(*this, other);
			return *this;
		}
		inline many<T>& operator=(const T& other )
		{
			fill(*this, other);
			return *this;
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
	many<T> get(const many<T>& a, const many<unsigned int>& ids)
	{
		many<T> out(ids.size());
		get(a, ids, out);
		return out;
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

	template<class T, class TIterator>
	void copy_iterators(many<T>& out, TIterator first, TIterator last)
	{
		unsigned int id = 0;
		while (first!=last) 
		{
			out[id] = *first;
			++first;
			++id;
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





	
	// UNARY TRANSFORM
	template <class T1, class Tout, typename F>
	inline void transform(const many<T1>& a, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i]);
		}
	}
	template <class T1, class Tout, typename F>
	inline void transform(const T1 a, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a);
		}
	}


	template <class T1, typename F>
	inline many<T1> transform(const many<T1>& a, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, f, out); 
		return out;
	}


	// BINARY TRANSFORM
	template <class T1, class T2, class Tout, typename F>
	inline void transform(const many<T1>& a, const many<T2>& b, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i], b[i]);
		}
	}
	template <class T1, class T2, class Tout, typename F>
	inline void transform(const many<T1>& a, const T2 b, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i], b);
		}
	}
	template <class T1, class T2, class Tout, typename F>
	inline void transform(const T1 a, const many<T2>& b, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < b.size(); ++i)
		{
			out[i] = f(a, b[i]);
		}
	}


	template <class T1, class T2, typename F>
	inline many<T1> transform(const many<T1>& a, const many<T2>& b, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, b, f, out); 
		return out;
	}
	template <class T1, class T2, typename F>
	inline many<T1> transform(const many<T1>& a, const T2 b, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, b, f, out); 
		return out;
	}
	template <class T1, class T2, typename F>
	inline many<T1> transform(const T1 a, const many<T2>& b, F f)
	{
		many<T1> out = many<T1>(b.size());
		transform(a, b, f, out); 
		return out;
	}









	// TRINARY TRANSFORM
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const many<T1>& a, const many<T2>& b, const many<T3>& c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i], b[i], c[i]);
		}
	}
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const many<T1>& a, const many<T2>& b, const T3 c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i], b[i], c);
		}
	}
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const many<T1>& a, const T2 b, const many<T3>& c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i], b, c[i]);
		}
	}
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const many<T1>& a, const T2 b, const T3 c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			out[i] = f(a[i], b, c);
		}
	}
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const T1 a, const many<T2>& b, const many<T3>& c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < b.size(); ++i)
		{
			out[i] = f(a, b[i], c[i]);
		}
	}
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const T1 a, const many<T2>& b, const T3 c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < b.size(); ++i)
		{
			out[i] = f(a, b[i], c);
		}
	}
	template <class T1, class T2, class T3, class Tout, typename F>
	inline void transform(const T1 a, const T2 b, const many<T3>& c, F f, many<Tout>& out)
	{
		for (unsigned int i = 0; i < c.size(); ++i)
		{
			out[i] = f(a, b, c[i]);
		}
	}


	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const many<T1>& a, const many<T2>& b, const many<T3>& c, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, b, c, f, out); 
		return out;
	}
	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const many<T1>& a, const many<T2>& b, const T3 c, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, b, c, f, out); 
		return out;
	}
	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const many<T1>& a, const T2 b, const many<T3>& c, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, b, c, f, out); 
		return out;
	}
	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const many<T1>& a, const T2 b, const T3 c, F f)
	{
		many<T1> out = many<T1>(a.size());
		transform(a, b, c, f, out); 
		return out;
	}
	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const T1 a, const many<T2>& b, const many<T3>& c, F f)
	{
		many<T1> out = many<T1>(b.size());
		transform(a, b, c, f, out); 
		return out;
	}
	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const T1 a, const many<T2>& b, const T3 c, F f)
	{
		many<T1> out = many<T1>(b.size());
		transform(a, b, c, f, out); 
		return out;
	}
	template <class T1, class T2, class T3, typename F>
	inline many<T1> transform(const T1 a, const T2 b, const many<T3>& c, F f)
	{
		many<T1> out = many<T1>(c.size());
		transform(a, b, c, f, out); 
		return out;
	}







	template <class T, class T2>
	void greaterThan(const many<T>& a, const T2 b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai > bi; }, out); 
	}
	template <class T, class T2>
	void greaterThanEqual(const many<T>& a, const T2 b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai >= bi; }, out); 
	}
	template <class T, class T2>
	void lessThan(const many<T>& a, const T2 b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai < bi; }, out); 
	}
	template <class T, class T2>
	void lessThanEqual(const many<T>& a, const T2 b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai <= bi; }, out); 
	}



	template <class T, class T2>
	void greaterThan(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai > bi; }, out); 
	}
	template <class T, class T2>
	void greaterThanEqual(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai >= bi; }, out); 
	}
	template <class T, class T2>
	void lessThan(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai <= bi; }, out); 
	}
	template <class T, class T2>
	void lessThanEqual(const many<T>& a, const many<T2>& b, many<bool>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai < bi; }, out); 
	}



	template <class T, class T2, class T3>
	void add(const many<T>& a, const T2 b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai + bi; }, out); 
	}
	template <class T, class T2, class T3>
	void sub(const many<T>& a, const T2 b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai - bi; }, out); 
	}
	template <class T, class T2, class T3>
	void mult(const many<T>& a, const T2 b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai * bi; }, out); 
	}
	template <class T, class T2, class T3>
	void div(const many<T>& a, const T2 b, many<T3>& out)
	{
		const T2 binv = T2(1.)/b;
		transform(a, b, [](T ai, T2 bi){ return ai * bi; }, out); 
	}



	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2, class T3>
	void add(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai + bi; }, out); 
	}
	template <class T, class T2, class T3>
	void sub(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai - bi; }, out); 
	}
	template <class T, class T2, class T3>
	void mult(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai * bi; }, out); 
	}
	template <class T, class T2, class T3>
	void div(const many<T>& a, const many<T2>& b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai / bi; }, out); 
	}
	template <class T, class T2, class T3>
	void div(const T a, const many<T2>& b, many<T3>& out)
	{
		transform(a, b, [](T ai, T2 bi){ return ai / bi; }, out); 
	}
	











	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T>
	std::ostream &operator<<(std::ostream &os, const many<T>& a) { 
		os << "[";
		for (unsigned int i = 0; i < a.size(); ++i)
		{
		    os << a[i] << " ";
		}
		os << "]";
		return os;
	}

	template <class T, class T2, class T3>
	inline many<T3> operator>(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai > bi; });
	}
	template <class T, class T2, class T3>
	inline many<T3> operator>=(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai >= bi; });
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai < bi; });
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<=(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai <= bi; });
	}
	
	// NOTE: all wrappers are suggested to be inline because they are thin wrappers of functions

	template <class T, class T2, class T3>
	inline many<T3> operator>(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai > bi; });
	}
	template <class T, class T2, class T3>
	inline many<T3> operator>=(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai >= bi; });
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai < bi; });
	}
	template <class T, class T2, class T3>
	inline many<T3> operator<=(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai <= bi; });
	}




	template <class T>
	inline many<T>& operator+=(many<T>& a, const T b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] += b;
		}
		return a;
	}
	template <class T>
	inline many<T>& operator-=(many<T>& a, const T b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] -= b;
		}
		return a;
	}
	template <class T>
	inline many<T>& operator*=(many<T>& a, const T b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] *= b;
		}
		return a;
	}
	template <class T>
	inline many<T>& operator/=(many<T>& a, const T b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] /= b;
		}
		return a;
	}


	template <class T, class T2>
	inline many<T>& operator+=(many<T>& a, const many<T2>& b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] += b[i];
		}
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator-=(many<T>& a, const many<T2>& b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] -= b[i];
		}
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator*=(many<T>& a, const many<T2>& b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] *= b[i];
		}
		return a;
	}
	template <class T, class T2>
	inline many<T>& operator/=(many<T>& a, const many<T2>& b) 
	{
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i] /= b[i];
		}
		return a;
	}

	// NOTE: prefix increment/decrement
	template <class T>
	inline many<T>& operator++(many<T>& a)  
	{  
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i]++;
		}
		return a;
	}  
	template <class T>
	inline many<T>& operator--(many<T>& a)  
	{  
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i]--;
		}
		return a;
	}  

	// NOTE: postfix increment/decrement
	template <class T>
	inline many<T> operator++(many<T>& a, int)  
	{  
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i]++;
		}
		return a;
	}  
	template <class T>
	inline many<T> operator--(many<T>& a, int)  
	{  
		for (unsigned int i = 0; i < a.size(); ++i)
		{
			a[i]--;
		}
		return a;
	}  
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2>
	inline many<T> operator+(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai + bi; });
	}
	template <class T, class T2>
	inline many<T> operator-(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai - bi; });
	}
	template <class T, class T2>
	inline many<T> operator*(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai * bi; });
	}
	template <class T, class T2>
	inline many<T> operator/(const many<T>& a, const T2 b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai / bi; });
	}
	




	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2>
	inline many<T> operator+(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai + bi; });
	}
	template <class T, class T2>
	inline many<T> operator-(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai - bi; });
	}
	template <class T, class T2>
	inline many<T> operator*(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai * bi; });
	}
	template <class T, class T2>
	inline many<T> operator/(const T2 a, const many<T>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai / bi; });
	}


	// NOTE: we define operators for multiple classes T and T2 in order to support 
	//  vector/scalar multiplication, matrix/vect multiplication, etc.
	template <class T, class T2>
	inline many<T> operator+(const many<T>& a, const many<T2>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai + bi; });
	}
	template <class T, class T2>
	inline many<T> operator-(const many<T>& a, const many<T2>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai - bi; });
	}
	template <class T, class T2>
	inline many<T> operator*(const many<T>& a, const many<T2>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai * bi; });
	}
	template <class T, class T2>
	inline many<T> operator/(const many<T>& a, const many<T2>& b)
	{
		return transform(a, b, [](T ai, T2 bi){ return ai / bi; });
	}



	typedef many<bool>	       bools;
	typedef many<int>	       ints;
	typedef many<unsigned int> uints;
	typedef many<float>	       floats;
	typedef many<double>       doubles;
}
