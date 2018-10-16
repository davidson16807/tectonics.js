#pragma once

#include <initializer_list>// initializer_list

#include "primitives.h"

namespace composites
{
	// NOTE: bools get special treatment because they're special
	class bools : public primitives<bool>
	{
	public:
		bools(std::initializer_list<bool> list)  			: primitives<bool>(list){};

		explicit bools(const unsigned int N) 				: primitives<bool>(N){};
		explicit bools(const unsigned int N, const bool a)  : primitives<bool>(N,a){};
		explicit bools(const primitives<bool>& a) 	: primitives<bool>(a){};

		template <class T2>
		explicit bools(const primitives<T2>& a) 	: primitives<bool>(a){};

		static void unite(const bools& a, const bool b, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = a[i] || b;
			}
		}

		static void unite(const bools& a, const bools& b, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = a[i] || b[i];
			}
		}

		static void intersect(const bools& a, const bool b, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = a[i] && b;
			}
		}

		static void intersect(const bools& a, const bools& b, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = a[i] && b[i];
			}
		}

		static void differ(const bools& a, const bool b, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = a[i] && !b;
			}
		}

		static void differ(const bools& a, const bools& b, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = a[i] && !b[i];
			}
		}

		static void negate(const bools& a, bools& out)
		{
			for (unsigned int i = 0; i < a.size(); ++i)
			{
				out[i] = !a[i];
			}
		}


		inline bools operator~() const
		{
			bools out = bools(this->N);
			bools::negate(*this, out);
			return out;
		}




		inline bools operator|(const bool b) const
		{
			bools out = bools(this->N);
			bools::unite(*this, b, out);
			return out;
		}
		inline bools operator&(const bool b) const
		{
			bools out = bools(this->N);
			bools::intersect(*this, b, out);
			return out;
		}

		inline bools operator|(const bools& b) const
		{
			bools out = bools(this->N);
			bools::unite(*this, b, out);
			return out;
		}
		inline bools operator&(const bools& b) const
		{
			bools out = bools(this->N);
			bools::intersect(*this, b, out);
			return out;
		}




		inline bools& operator|=(const bool b){
			bools::unite(*this, b, *this);
			return *this;
		}
		inline bools& operator&=(const bool b){
			bools::intersect(*this, b, *this);
			return *this;
		}

		inline bools& operator|=(const bools& b){
			bools::unite(*this, b, *this);
			return *this;
		}
		inline bools& operator&=(const bools& b){
			bools::intersect(*this, b, *this);
			return *this;
		}

		inline const bool& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		inline bool& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		inline const bools operator[](const primitives<bool>& mask ) const
		{
			bools out = bools(mask.N);
			get(*this, mask, out);
			return out;
		}
		inline const bools operator[](const primitives<unsigned int>& ids ) const
		{
			bools out = bools(ids.N);
			get(*this, ids, out);
			return out;
		}
	};
}