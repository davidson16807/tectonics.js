#include <emscripten/bind.h>
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity
#include <vector>		// vectors

using namespace emscripten;

namespace Rasters
{
	template <class T = double>
	struct vector2
	{
		T x, y;
		vector2() {};
		vector2(T x, T y) : x(x), y(y);
		~vector2() {};

		double magnitude()
		{
			return sqrt(pow(x, 2.) + pow(y, 2.));
		}
		static double distance(const vector2<T>& a, const vector2<T>& b) 
		{
			return sqrt(pow(a.x-b.x, 2.) + pow(a.y-b.y, 2.));
		}
		static double dot(const vector2<T>& a, const vector2<T>& b) 
		{
			return  a.x * b.x;
					a.y * b.y;
		}
		// static double add(const vector2<T>& a, const vector2<T>& b, vector2<T>& c) 
		// {
		// 	c.x = a.x + b.x;
		// 	c.y = a.y + b.y;
		// }
	};

	template <class T = double>
	struct vector3
	{
		T x, y, z;
		vector3() {};
		vector3(T x, T y, T z) : x(x), y(y), z(z) {};
		~vector3() {};

		double magnitude()
		{
			return sqrt(pow(x, 2.) + pow(y, 2.) + pow(z, 2.));
		}
		static double distance(const vector3<T>& a, const vector3<T>& b) 
		{
			return sqrt(pow(a.x-b.x, 2.) + pow(a.y-b.y, 2.) + pow(a.z-b.z, 2.));
		}
		// static double add(const vector3<T>& a, const vector3<T>& b, vector3<T>& c) 
		// {
		// 	c.x = a.x + b.x;
		// 	c.y = a.y + b.y;
		// 	c.z = a.z + b.z;
		// }
	};

	using vec2 = vector2<float>;
	using ivec2 = vector2<int>;
	using bvec2 = vector2<bool>;
	using vec3 = vector3<float>;
	using ivec3 = vector3<int>;
	using bvec3 = vector3<bool>;

	// describes a 3d cartesian grid where every cell houses a list of ids representing nearby points
	class CartesianGridLookup3d
	{
		std::vector<std::pair<int, vec3>>* cells;
		vec3 min_bounds;
		vec3 max_bounds;
		ivec3 dimensions;
		double cell_width;

		int cell_count() {
			return dimensions.x * dimensions.y * dimensions.z 
		         + dimensions.y * dimensions.z 
		         + dimensions.z;
		}
		int cell_id(const int xi, const int yi, const int zi) {
			return  xi * dimensions.y * dimensions.z
				  + yi * dimensions.z 
				  + zi;
		}
	public:
		CartesianGridLookup3d(){}
		~CartesianGridLookup3d(){}
		
		CartesianGridLookup3d(const vec3 min_bounds, const vec3 max_bounds, const double cell_width) 
			: max_bounds(max_bounds),
			  min_bounds(min_bounds),
			  cell_width(cell_width),
			  dimensions(ivec3(
				(max_bounds.x - min_bounds.x) / cell_width,
				(max_bounds.y - min_bounds.y) / cell_width,
				(max_bounds.z - min_bounds.z) / cell_width
			  ))
		{
			int cell_count_ = cell_count();
			cells = new std::vector<std::pair<int, vec3>>[cell_count_];
			for (int i = 0; i < cell_count_; ++i)
			{
				cells[i] = std::vector<std::pair<int, vec3>>();
			}
		}

		void add(const int id, const vec3 point)
		{
			const int xi = (int)round((point.x - min_bounds.x) / cell_width);
			const int yi = (int)round((point.y - min_bounds.y) / cell_width);
			const int zi = (int)round((point.z - min_bounds.z) / cell_width);

			cells[cell_id( xi   , yi   , zi   )].push_back({id, point});
			cells[cell_id( xi+1 , yi   , zi   )].push_back({id, point});
			cells[cell_id( xi   , yi+1 , zi   )].push_back({id, point});
			cells[cell_id( xi   , yi   , zi+1 )].push_back({id, point});
			cells[cell_id( xi+1 , yi+1 , zi   )].push_back({id, point});
			cells[cell_id( xi   , yi+1 , zi+1 )].push_back({id, point});
			cells[cell_id( xi+1 , yi+1 , zi+1 )].push_back({id, point});
		}

		int nearest(const vec3 point)
		{
			const int xi = (int)ceil((point.x - min_bounds.x) / cell_width);
			const int yi = (int)ceil((point.y - min_bounds.y) / cell_width);
			const int zi = (int)ceil((point.z - min_bounds.z) / cell_width);

			std::vector<std::pair<int, vec3>> & neighbors = cells[cell_id(xi, yi, zi)];

			std::pair<int, vec3> nearest = 
				*std::min_element( neighbors.begin(), neighbors.end(),
			                       [&point]( const std::pair<int, vec3> &a, const std::pair<int, vec3> &b )
			                       {
			                           return vec3::distance(a.second, point) < vec3::distance(b.second, point);
			                       } );

			return nearest.first;
		}
	};
}

EMSCRIPTEN_BINDINGS(rasters)
{
  class_<Rasters::vec3>("vec3")
      .constructor()
      .constructor<double, double, double>()
      .property("x", &Rasters::vec3::x)
      .property("y", &Rasters::vec3::y)
      .property("z", &Rasters::vec3::z)
  ;
  class_<Rasters::CartesianGridLookup3d>("CartesianGridLookup3d")
      .constructor()
      .constructor<Rasters::vec3, Rasters::vec3, double>()
      .function("add", &Rasters::CartesianGridLookup3d::add)
      .function("nearest", &Rasters::CartesianGridLookup3d::nearest)
  ;
}
