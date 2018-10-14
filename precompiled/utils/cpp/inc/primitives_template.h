#pragma once

namespace rasters
{

	// This template represents a statically-sized contiguous block of memory occupied by primitive data of arbitrary type
	// The intention is to abstract away arrays of primitives that are used to address data locality issues
	// the data type should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the data type must have basic operators common to all primitives: == != 
	template <class T>
	class primitives_template
	{
	protected:
		T* values;
		const unsigned int N;

	public:

		~primitives_template() 
		{
    		delete [] values;
		};

		primitives_template(const unsigned int N) : N(N)
		{
			values = new T[N];
		};

		primitives_template(const unsigned int N, const T a)  : N(N)
		{
			values = new T[N];
			for (int i = 0; i < N; ++i)
			{
				values[i] = a;
			}
		};

		template <class T2>
		primitives_template(const primitives_template<T2>& a)  : N(a.N)
		{
			values = new T[N];
			for (int i = 0; i < N; ++i)
			{
				values[i] = a.values[i];
			}
		};



		static T get(const primitives_template<T>& a, const unsigned int id )
		{
			return a.values[id];
		}
		static void get(const primitives_template<T>& a, const primitives_template<unsigned int>& ids, primitives_template<T>& out )
		{
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[i] = a.values[ids[i]];
			}
		}
		static void get(const primitives_template<T>& a, const primitives_template<bool>& mask, primitives_template<T>& out )
		{
			int out_i = 0;
			for (int i = 0; i < a.N; ++i)
			{
				if (mask.values[i])
				{
					out.values[out_i] = a.values[i];
					out_i++;
				}
			}
		}

		static void set(primitives_template<T>& out, const T a )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = a;
			}
		}
		static void set(primitives_template<T>& out, const unsigned int id, const T a )
		{
			out.values[id] = a;
		}
		static void set(primitives_template<T>& out, const primitives_template<unsigned int>& ids, const T a )
		{
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[ids[i]] = a;
			}
		}
		static void set(const primitives_template<T>& out, const primitives_template<bool>& mask, const T a )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = mask[i]? a : out.values[i];
			}
		}


		static void set(primitives_template<T>& out, const primitives_template<T>& a )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = a.values[i];
			}
		}
		static void set(primitives_template<T>& out, const primitives_template<unsigned int>& ids, const primitives_template<T>& a )
		{
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[ids[i]] = a.values[i];
			}
		}
		static void set(primitives_template<T>& out, const primitives_template<bool>& mask, const primitives_template<T>& a )
		{
			for (int i = 0; i < out.N; ++i)
			{
				out.values[i] = mask[i]? a.values[i] : out.values[i];
			}
		}



		template <class T2>
		static bool eq(const primitives_template<T>& a, const T2 b)
		{
			bool out = true;
			for (int i = 0; i < a.N; ++i)
			{
				out &= a.values[i] == b;
			}
			return out;
		}
		template <class T2>
		static bool ne(const primitives_template<T>& a, const T2 b)
		{
			bool out = false;
			for (int i = 0; i < a.N; ++i)
			{
				out |= a.values[i] != b;
			}
			return out;
		}
		template <class T2>
		static bool eq(const primitives_template<T>& a, const primitives_template<T2>& b)
		{
			bool out = true;
			for (int i = 0; i < a.N; ++i)
			{
				out &= a.values[i] == b.values[i];
			}
			return out;
		}
		template <class T2>
		static bool ne(const primitives_template<T>& a, const primitives_template<T2>& b)
		{
			bool out = false;
			for (int i = 0; i < a.N; ++i)
			{
				out |= a.values[i] != b.values[i];
			}
			return out;
		}



		template <class T2>
		static void eq(const primitives_template<T>& a, const T2 b, primitives_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b;
			}
		}
		template <class T2>
		static void ne(const primitives_template<T>& a, const T2 b, primitives_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b;
			}
		}
		template <class T2>
		static void eq(const primitives_template<T>& a, const primitives_template<T2>& b, primitives_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] == b.values[i];
			}
		}
		template <class T2>
		static void ne(const primitives_template<T>& a, const primitives_template<T2>& b, primitives_template<bool>& out)
		{
			for (int i = 0; i < a.N; ++i)
			{
				out.values[i] = a.values[i] != b.values[i];
			}
		}




		template <class T2>
		bool operator==(const T2 b) const
		{
			return primitives_template<T>::eq(*this, b);
		}
		template <class T2>
		bool operator!=(const T2 b) const
		{
			return primitives_template<T>::ne(*this, b);
		}
		template <class T2>
		bool operator==(const primitives_template<T2>& b) const
		{
			return primitives_template<T>::eq(*this, b);
		}
		template <class T2>
		bool operator!=(const primitives_template<T2>& b) const
		{
			return primitives_template<T>::ne(*this, b);
		}
		





		T& operator[](const unsigned int id )
		{
		   return values[id]; // reference return 
		}
		
		const T& operator[](const unsigned int id ) const
		{
		   return values[id]; // reference return 
		}

		const primitives_template<T>& operator[](const primitives_template<bool>& mask ) const
		{
			primitives_template<T> out = primitives_template<T>(mask.N);
			for (int i = 0; i < mask.N; ++i)
			{
				out.values[i] = values[mask[i]];
			}
			return out;
		}

		const primitives_template<T>& operator[](const primitives_template<unsigned int>& ids ) const
		{
			primitives_template<T> out = primitives_template<T>(ids.N);
			for (int i = 0; i < ids.N; ++i)
			{
				out.values[i] = values[ids[i]];
			}
			return out;
		}
	};

	// NOTE: bools get special treatment because they're special
	class bools : public primitives_template<bool>
	{
	public:
		bools(const unsigned int N) 				: primitives_template<bool>(N){};
		bools(const unsigned int N, const bool a)  	: primitives_template<bool>(N, a){};
		bools(const bools& a) 						: primitives_template<bool>(a){};

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
