#include <emscripten/bind.h>
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity
#include <vector>		// vectors
#include <iostream> 	// cout

using namespace emscripten;

namespace Rasters
{
	template <class T = double>
	struct Vector3d
	{
		T x, y, z;
		Vector3d() {};
		Vector3d(T x, T y, T z) : x(x), y(y), z(z) {};
		~Vector3d() {};

		double magnitude()
		{
			return sqrt(pow(x, 2.) + pow(y, 2.) + pow(z, 2.));
		}
		static double distance(const Vector3d<T>& a, const Vector3d<T>& b) 
		{
			return sqrt(pow(a.x-b.x, 2.) + pow(a.y-b.y, 2.) + pow(a.z-b.z, 2.));
		}
		// static double add(const Vector3d<T>& a, const Vector3d<T>& b, Vector3d<T>& c) 
		// {
		// 	c.x = a.x + b.x;
		// 	c.x = a.y + b.y;
		// 	c.x = a.z + b.z;
		// }
	};

	// describes a 3d cartesian grid where every cell can house a list of points
	// points are referenced by the order in which they occur in a starting array
	class CartesianGridLookup3d
	{
		std::vector<std::pair<int, Vector3d<>>>* cells;
		Vector3d<> min_bounds;
		Vector3d<> max_bounds;
		Vector3d<int> dimensions;
		double cell_width;

		// TODO: make a new class to abstract this functionality out?
		int cell_count() {
			return dimensions.x * dimensions.y * dimensions.z 
		         + dimensions.y * dimensions.z 
		         + dimensions.z;
		}
		// TODO: make a new class to abstract this functionality out?
		int cell_id(const int xi, const int yi, const int zi) {
			return  xi * dimensions.y * dimensions.z
				  + yi * dimensions.z 
				  + zi;
		}
	public:
		CartesianGridLookup3d(){}
		~CartesianGridLookup3d(){}
		
		CartesianGridLookup3d(const Vector3d<>& min_bounds, const Vector3d<>& max_bounds, const double cell_width) 
			: max_bounds(max_bounds),
			  min_bounds(min_bounds),
			  cell_width(cell_width),
			  dimensions(Vector3d<int>(
				(max_bounds.x - min_bounds.x) / cell_width,
				(max_bounds.y - min_bounds.y) / cell_width,
				(max_bounds.z - min_bounds.z) / cell_width
			  ))
		{
			int cell_count_ = cell_count();
			cells = new std::vector<std::pair<int, Vector3d<>>>[cell_count()];
			for (int i = 0; i < cell_count_; ++i)
			{
				cells[i] = std::vector<std::pair<int, Vector3d<>>>();
			}
		}
		CartesianGridLookup3d(const Vector3d<std::vector<double>>& points, const double cell_width)
			: min_bounds(
			      *std::min_element(points.x.begin(), points.x.end()),
			      *std::min_element(points.y.begin(), points.y.end()),
			      *std::min_element(points.z.begin(), points.z.end())
			  ),
			  max_bounds(
			      *std::max_element(points.x.begin(), points.x.end()),
			      *std::max_element(points.y.begin(), points.y.end()),
			      *std::max_element(points.z.begin(), points.z.end())
			  ),
			  cell_width(cell_width)
		{
			dimensions = Vector3d<int>(
				(max_bounds.x - min_bounds.x) / cell_width,
				(max_bounds.y - min_bounds.y) / cell_width,
				(max_bounds.z - min_bounds.z) / cell_width
			);

			int cell_count_ = cell_count();
			cells = new std::vector<std::pair<int, Vector3d<>>>[cell_count()];
			for (int i = 0; i < cell_count_; ++i)
			{
				cells[i] = std::vector<std::pair<int, Vector3d<>>>();
			}

			for (int i = 0; i < points.x.size(); ++i)
			{
				add(i, Vector3d<>(points.x[i], points.y[i], points.z[i]));
			}
		}

		void add(const int id, const Vector3d<>& point)
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

		int nearest(const Vector3d<>& point)
		{
			const int xi = (int)ceil((point.x - min_bounds.x) / cell_width);
			const int yi = (int)ceil((point.y - min_bounds.y) / cell_width);
			const int zi = (int)ceil((point.z - min_bounds.z) / cell_width);

			std::vector<std::pair<int, Vector3d<>>> & neighbors = cells[cell_id(xi, yi, zi)];

			std::pair<int, Vector3d<>> nearest = 
				*std::min_element( neighbors.begin(), neighbors.end(),
			                       [&point]( const std::pair<int, Vector3d<>> &a, const std::pair<int, Vector3d<>> &b )
			                       {
			                           return Vector3d<>::distance(a.second, point) < Vector3d<>::distance(b.second, point);
			                       } );

			return nearest.first;
		}
	};
}

EMSCRIPTEN_BINDINGS(rasters)
{
  class_<Rasters::Vector3d<>>("Vector3d")
      .constructor()
      .constructor<double, double, double>()
      .property("x", &Rasters::Vector3d<>::x)
      .property("y", &Rasters::Vector3d<>::y)
      .property("z", &Rasters::Vector3d<>::z)
  ;
  class_<Rasters::CartesianGridLookup3d>("CartesianGridLookup3d")
      .constructor()
      .constructor<Rasters::Vector3d<>&, Rasters::Vector3d<>&, const double>()
      // .constructor<Rasters::Vector3d<>, const double>()
      .function("add", &Rasters::CartesianGridLookup3d::add)
      .function("nearest", &Rasters::CartesianGridLookup3d::nearest)
  ;
}
