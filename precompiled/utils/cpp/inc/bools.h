#pragma once

#include <initializer_list>// initializer_list

#include "primitives.h"

namespace rasters
{
	// NOTE: bools get special treatment because they're special
	class bools : public primitives_template<bool>
	{
	public:
		bools(const unsigned int N) 				: primitives_template<bool>(N){};
		bools(const unsigned int N, const bool a)  	: primitives_template<bool>(N,a){};
		bools(const primitives_template<bool>& a) 	: primitives_template<bool>(a){};
		bools(std::initializer_list<bool> list)  	: primitives_template<bool>(list){};

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

		const bool& operator[](const unsigned int id ) const
		{
		   return this->values[id]; // reference return 
		}
		bool& operator[](const unsigned int id )
		{
		   return this->values[id]; // reference return 
		}
		const bools operator[](const primitives_template<bool>& mask ) const
		{
			bools out = bools(mask.N);
			get(*this, mask, out);
			return out;
		}
		const bools operator[](const primitives_template<unsigned int>& ids ) const
		{
			bools out = bools(ids.N);
			get(*this, ids, out);
			return out;
		}
	};
}