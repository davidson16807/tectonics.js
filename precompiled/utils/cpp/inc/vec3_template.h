
template <class T>
struct vec3_template
{
	T x, y, z;
	vec3_template() {};
	vec3_template(T x, T y, T z) : x(x), y(y), z(z) {};
	~vec3_template() {};

	double magnitude()
	{
		return sqrt(pow(x, 2.) + pow(y, 2.) + pow(z, 2.));
	}
	static double distance(const vec3_template<T> a, const vec3_template<T> b) 
	{
		return sqrt(pow(a.x-b.x, 2.) + pow(a.y-b.y, 2.) + pow(a.z-b.z, 2.));
	}
	// static double add(const vec3_template<T>& a, const vec3_template<T>& b, vec3_template<T>& c) 
	// {
	// 	c.x = a.x + b.x;
	// 	c.y = a.y + b.y;
	// 	c.z = a.z + b.z;
	// }
	vec3_template<T> operator*(const double scalar) const
	{
		return vec3_template<T>(
			x + scalar,
			y + scalar,
			z + scalar
		);
	}
	double operator*(const vec3_template<T> vector) const
	{
		return 
			x * vector.x+
			y * vector.y+
			z * vector.z
		;
	}
	vec3_template<T> operator+(const vec3_template<T> vector) const
	{
		return vec3_template<T>(
			x + vector.x,
			y + vector.y,
			z + vector.z
		);
	}
};

using vec3 = vec3_template<double>;
using ivec3 = vec3_template<int>;
using bvec3 = vec3_template<bool>;
