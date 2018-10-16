#pragma once

#include <initializer_list>	// initializer_list

namespace composites
{

	// This template represents a statically-sized contiguous block of memory occupied by primitive data of arbitrary type
	// The intention is to abstract away arrays of primitives that are used to address data locality issues
	// the data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the data type must have basic operators common to all primitives: == != 
	template <class T>
	class primitives
	{
	protected:
		T* values;

	public:
		const unsigned int N;

		~primitives()
		{
    		delete [] this->values;
    		this->values = nullptr;
		};

		primitives(std::initializer_list<T> list) : values(new T[list.size()]), N(list.size())
		{
			int id = 0;
			for (auto i = list.begin(); i != list.end(); ++i)
			{
				this->values[id] = *i;
				id++;
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
		explicit primitives(const primitives<T>& a)  : values(new T[a.N]), N(a.N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a.values[i];
			}
		};

		template <class T2>
		explicit primitives(const primitives<T2>& a)  : values(new T[a.N]), N(a.N)
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				values[i] = a.values[i];
			}
		};

		inline unsigned int size()
		{
			return N;
		}

		inline static T get(const primitives<T>& a, const unsigned int id )
		{
			return a.values[id];
		}
		static void get(const primitives<T>& a, const primitives<unsigned int>& ids, primitives<T>& out )
		{
			for (unsigned int i = 0; i < ids.N; ++i)
			{
				out.values[i] = a.values[ids[i]];
			}
		}
		static void get(const primitives<T>& a, const primitives<bool>& mask, primitives<T>& out )
		{
			int out_i = 0;
			for (unsigned int i = 0; i < a.N; ++i)
			{
				if (mask.values[i])
				{
					out.values[out_i] = a.values[i];
					out_i++;
				}
			}
		}

		inline static void set(primitives<T>& out, const unsigned int id, const T a )
		{
			out.values[id] = a;
		}
		static void set(primitives<T>& out, const T a )
		{
			for (unsigned int i = 0; i < out.N; ++i)
			{
				out.values[i] = a;
			}
		}
		static void set(primitives<T>& out, const primitives<unsigned int>& ids, const T a )
		{
			for (unsigned int i = 0; i < ids.N; ++i)
			{
				out.values[ids[i]] = a;
			}
		}
		static void set(const primitives<T>& out, const primitives<bool>& mask, const T a )
		{
			for (unsigned int i = 0; i < out.N; ++i)
			{
				out.values[i] = mask[i]? a : out.values[i];
			}
		}


		static void set(primitives<T>& out, const primitives<T>& a )
		{
			for (unsigned int i = 0; i < out.N; ++i)
			{
				out.values[i] = a.values[i];
			}
		}
		static void set(primitives<T>& out, const primitives<unsigned int>& ids, const primitives<T>& a )
		{
			for (unsigned int i = 0; i < ids.N; ++i)
			{
				out.values[ids[i]] = a.values[i];
			}
		}
		static void set(primitives<T>& out, const primitives<bool>& mask, const primitives<T>& a )
		{
			for (unsigned int i = 0; i < out.N; ++i)
			{
				out.values[i] = mask[i]? a.values[i] : out.values[i];
			}
		}



		template <class T2>
		static bool eq(const primitives<T>& a, const T2 b)
		{
			bool out = true;
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out &= a.values[i] == b;
			}
			return out;
		}
		template <class T2>
		static bool ne(const primitives<T>& a, const T2 b)
		{
			bool out = false;
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out |= a.values[i] != b;
			}
			return out;
		}
		template <class T2>
		static bool eq(const primitives<T>& a, const primitives<T2>& b)
		{
			bool out = true;
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out &= a.values[i] == b.values[i];
			}
			return out;
		}
		template <class T2>
		static bool ne(const primitives<T>& a, const primitives<T2>& b)
		{
			bool out = false;
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out |= a.values[i] != b.values[i];
			}
			return out;
		}



		template <class T2>
		static void eq(const primitives<T>& a, const T2 b, primitives<bool>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b;
			}
		}
		template <class T2>
		static void ne(const primitives<T>& a, const T2 b, primitives<bool>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b;
			}
		}
		template <class T2>
		static void eq(const primitives<T>& a, const primitives<T2>& b, primitives<bool>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b.values[i];
			}
		}
		template <class T2>
		static void ne(const primitives<T>& a, const primitives<T2>& b, primitives<bool>& out)
		{
			for (unsigned int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] != b.values[i];
			}
		}




		// NOTE: all operators are suggested to be inline because they are thin wrappers of static functions
		template <class T2>
		inline bool operator==(const T2 b) const
		{
			return primitives<T>::eq(*this, b);
		}
		template <class T2>
		inline bool operator!=(const T2 b) const
		{
			return primitives<T>::ne(*this, b);
		}
		template <class T2>
		inline bool operator==(const primitives<T2>& b) const
		{
			return primitives<T>::eq(*this, b);
		}
		template <class T2>
		inline bool operator!=(const primitives<T2>& b) const
		{
			return primitives<T>::ne(*this, b);
		}
		




		// NOTE: all operators are suggested to be inline because they are thin wrappers of static functions
		inline const T& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline T& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		inline const primitives<T> operator[](const primitives<bool>& mask ) const
		{
			primitives<T> out = primitives<T>(mask.N);
			get(*this, mask, out);
			return out;
		}
		inline const primitives<T> operator[](const primitives<unsigned int>& ids ) const
		{
			primitives<T> out = primitives<T>(ids.N);
			get(*this, ids, out);
			return out;
		}
	};

}
