#pragma once

#include "primitives.h"

namespace rasters
{

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