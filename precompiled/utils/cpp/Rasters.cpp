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
	};

	// describes a 3d cartesian grid where every cell can house a list of points
	// points are referenced by the order in which they occur in a starting array
	class CartesianGrid3dLookup
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
		// TODO: make this a method of Vector3d?
		double get_distance(Vector3d<> u, Vector3d<> v)
		{
			return sqrt(pow(u.x-v.x, 2.) + pow(u.y-v.y, 2.) + pow(u.z-v.z, 2.));
		}
	public:
		CartesianGrid3dLookup(){}
		~CartesianGrid3dLookup(){
		}
		
		CartesianGrid3dLookup(const Vector3d<> min_bounds, const Vector3d<> max_bounds, const double cell_width) 
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
		CartesianGrid3dLookup(const Vector3d<std::vector<double>>& points, const double cell_width)
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

		int nearest(const Vector3d<> point)
		{
			const int xi = (int)ceil((point.x - min_bounds.x) / cell_width);
			const int yi = (int)ceil((point.y - min_bounds.y) / cell_width);
			const int zi = (int)ceil((point.z - min_bounds.z) / cell_width);

			std::vector<std::pair<int, Vector3d<>>> & neighbors = cells[cell_id(xi, yi, zi)];

			int  nearest_neighbor = -1;
			double nearest_distance = std::numeric_limits<double>::infinity();
			double neighbor_distance;
			for(std::pair<int, Vector3d<>> const & neighbor : neighbors){
				neighbor_distance = get_distance(point, neighbor.second);
				if (neighbor_distance < nearest_distance) {
					nearest_neighbor = neighbor.first;
					nearest_distance = neighbor_distance;
				}
			}

			return nearest_neighbor;
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
  class_<Rasters::CartesianGrid3dLookup>("CartesianGrid3dLookup")
      .constructor()
      .constructor<Rasters::Vector3d<>, Rasters::Vector3d<>, double>()
      .function("add", &Rasters::CartesianGrid3dLookup::add)
      .function("nearest", &Rasters::CartesianGrid3dLookup::nearest)
  ;
}
