#pragma once

#include <math.h>       // ceil, round 
#include <vector>       // vectors

#include "vec3_template.h"
#include "vec1s_template.h"

namespace Rasters
{
	template <class T, int N>
	struct vec3s_template
	{
		vec3_template<T> values[N];

		vec3s_template() {};

		~vec3s_template() {};



		static void add(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::add(u[i], a);
			}
		}
		static void sub(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::sub(u[i], a);
			}
		}
		static void mult(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::mult(u[i], a);
			}
		}
		static void div(const vec3s_template<T,N>& u, const T a, vec3s_template<T,N>& out)
		{
			const T ainv = 1./a;
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::mult(u[i], ainv);
			}
		}


		static void add(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::add(u[i], a[i]);
			}
		}
		static void sub(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::sub(u[i], a[i]);
			}
		}
		static void mult(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::mult(u[i], a[i]);
			}
		}
		static void div(const vec3s_template<T,N>& u, const vec1s_template<T,N>& a, vec3s_template<T,N>& out)
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::div(u[i], a[i]);
			}
		}


		static void add (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::add(u[i], v);
			}
		}
		static void sub (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::sub(u[i], v);
			}
		}
		static void dot (const vec3s_template<T,N>& u, const vec3_template<T> v, vec1s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::dot(u[i], v);
			}
		}
		static void cross (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::cross(u[i], v);
			}
		}
		static void hadamard (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::hadamard(u[i], v);
			}
		}
		static void div (const vec3s_template<T,N>& u, const vec3_template<T> v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::div(u[i], v);
			}
		}
		static void distance(const vec3s_template<T,N>& u, const vec3_template<T> v, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::distance(u[i], v);
			}
		}


		static void add (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::add(u[i], v[i]);
			}
		}
		static void sub (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::sub(u[i], v[i]);
			}
		}
		static void dot (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec1s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::dot(u[i], v[i]);
			}
		}
		static void cross (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::cross(u[i], v[i]);
			}
		}
		static void hadamard (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::hadamard(u[i], v[i]);
			}
		}
		static void div (const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec3s_template<T,N>& out) {
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::div(u[i], v[i]);
			}
		}
		static void distance(const vec3s_template<T,N>& u, const vec3s_template<T,N>& v, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = vec3_template<T>::distance(u[i], v[i]);
			}
		}


		static void magnitude(const vec3s_template<T,N>& u, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = u[i].magnitude();
			}
		}
		static void normalize(const vec3s_template<T,N>& u, vec1s_template<T,N>& out) 
		{
			for (int i = 0; i < N; ++i)
			{
				out[i] = u[i].normalize();
			}
		}

		vec3s_template<T,N> operator+(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator-(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator*(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator/(const T a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec3s_template<T,N> operator+(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator-(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::sub(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator*(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::mult(*this, a, out);
			return out;
		}
		vec3s_template<T,N> operator/(const vec1s_template<T,N>& a) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, a, out);
			return out;
		}


		vec3s_template<T,N> operator+(const vec3_template<T> u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator-(const vec3_template<T> u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec3_template<T> u) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator/(const vec3_template<T> u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, u, out);
			return out;
		}


		vec3s_template<T,N> operator+(const vec3s_template<T,N>& u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator-(const vec3s_template<T,N>& u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec1s_template<T,N> operator*(const vec3s_template<T,N>& u) const
		{
			vec1s_template<T,N> out = vec1s_template<T,N>();
			vec3s_template<T,N>::add(*this, u, out);
			return out;
		}
		vec3s_template<T,N> operator/(const vec3s_template<T,N>& u) const
		{
			vec3s_template<T,N> out = vec3s_template<T,N>();
			vec3s_template<T,N>::div(*this, u, out);
			return out;
		}


		vec3_template<T> operator[](const int i) const
		{
		    if (i >= N) 
		    { 
		        exit(0); 
		    } 
		    return vec3_template<T>(values[i]);
		}
	};

	template <int N>
	using vec3s = vec3s_template<double, N>;
	template <int N>
	using ivec3s = vec3s_template<int, N>;
	template <int N>
	using bvec3s = vec3s_template<bool, N>;

	template <class T, int N>
	struct vec3_raster: vec3s_template<T,N>
	{
		//Grid* grid;
		//mat4* frame;
		vec3_raster(){};
		~vec3_raster(){};
	};
}
