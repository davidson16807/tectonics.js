
#include <math.h>       // ceil, round 
#include <limits.h> 	// infinity
#include <vector>		// vectors

#include "vec2_template.h"
#include "vec3_template.h"

#include <emscripten/bind.h>

using namespace emscripten;

namespace Rasters
{

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
		CartesianGridLookup3d(const std::vector<vec3>& points, const double cell_width) 
			: cell_width(cell_width)
		{
			max_bounds.x = std::max_element(points.begin(), points.end(),
							[]( const vec3 a, const vec3 b ) { return a.x < b.x; })->x,
			max_bounds.y = std::max_element(points.begin(), points.end(),
							[]( const vec3 a, const vec3 b ) { return a.y < b.y; })->y,
			max_bounds.z = std::max_element(points.begin(), points.end(),
							[]( const vec3 a, const vec3 b ) { return a.z < b.z; })->z,

			min_bounds.x = std::min_element(points.begin(), points.end(),
							[]( const vec3 a, const vec3 b ) { return a.x < b.x; })->x,
			min_bounds.y = std::min_element(points.begin(), points.end(),
							[]( const vec3 a, const vec3 b ) { return a.y < b.y; })->y,
			min_bounds.z = std::min_element(points.begin(), points.end(),
							[]( const vec3 a, const vec3 b ) { return a.z < b.z; })->z,

			dimensions.x = (max_bounds.x - min_bounds.x) / cell_width;
			dimensions.y = (max_bounds.y - min_bounds.y) / cell_width;
			dimensions.z = (max_bounds.z - min_bounds.z) / cell_width;

			// initialize grid
			int cell_count_ = cell_count();
			cells = new std::vector<std::pair<int, vec3>>[cell_count_];
			for (int i = 0; i < cell_count_; ++i)
			{
				cells[i] = std::vector<std::pair<int, vec3>>();
			}

			for (int i = 0; i < points.size(); ++i)
			{
				add(i, points[i]);
			}
		}
		int nearest_id(const vec3 point)
		{
			const int xi = (int)ceil((point.x - min_bounds.x) / cell_width);
			const int yi = (int)ceil((point.y - min_bounds.y) / cell_width);
			const int zi = (int)ceil((point.z - min_bounds.z) / cell_width);

			std::vector<std::pair<int, vec3>> & neighbors = cells[cell_id(xi, yi, zi)];

			std::pair<int, vec3> nearest_id = 
				*std::min_element( neighbors.begin(), neighbors.end(),
			                       [&point]( const std::pair<int, vec3> &a, const std::pair<int, vec3> &b )
			                       {
			                           return vec3::distance(a.second, point) < vec3::distance(b.second, point);
			                       } );

			return nearest_id.first;
		}
	};



	// describes a 3d unit cube sphere where every cell houses an id representing the nearest point
	// uses CartesianGridLookup3d behind the scenes to optimize initialization
	class VoronoiCubeSphereLookup3d
	{
		const std::array<vec3, 3> CUBE_SPHERE_SIDE_BASES = {
			vec3( 1., 0., 0. ),
			vec3( 0., 1., 0. ),
			vec3( 0., 0., 1. )
		};
		const int CUBE_SPHERE_SIDE_COUNT = 6;	// number of sides on the data cube
		ivec2 dimensions; // dimensions of the grid on each side of the data cube 
		int* cells;
		double cell_width;

		int cell_count() {
			return CUBE_SPHERE_SIDE_COUNT * (dimensions.x+1) * dimensions.y;
		}
		int cell_id(const int side_id, const int xi, const int yi) {
			return  side_id * dimensions.x * dimensions.y
				  + xi      * dimensions.y 
				  + yi;
		}
	public:
		VoronoiCubeSphereLookup3d(){}
		~VoronoiCubeSphereLookup3d(){}
		
		VoronoiCubeSphereLookup3d(const std::vector<vec3>& points, const double cell_width)
			: cell_width(cell_width)
		{
			dimensions.x = 1/cell_width;
			dimensions.y = 1/cell_width;

			CartesianGridLookup3d grid = CartesianGridLookup3d(points, cell_width);

			// populate cells using the slower CartesianGridLookup3d implementation
			cells = new int[cell_count()];
			for (int side_id = 0; side_id < CUBE_SPHERE_SIDE_COUNT; ++side_id)
			{
				for (int xi2d = 0; xi2d < dimensions.x; ++xi2d)
				{
					for (int yi2d = 0; yi2d < dimensions.y; ++yi2d)
					{
						// get position of the cell that's projected onto the 2d grid
						double x2d = 0.5 * xi2d * cell_width - 1.;
						double y2d = 0.5 * yi2d * cell_width - 1.;
						// reconstruct the dimension omitted from the grid using pythagorean theorem
						double z2d = sqrt(1 - pow(x2d, 2.) - pow(y2d, 2.));
						z2d *= side_id > 2? -1 : 1;

						vec3 cell_pos = 
							CUBE_SPHERE_SIDE_BASES[side_id%3+0] * z2d +
							CUBE_SPHERE_SIDE_BASES[side_id%3+1] * x2d +
							CUBE_SPHERE_SIDE_BASES[side_id%3+2] * y2d ;

						cells[cell_id(side_id, xi2d, yi2d)] = grid.nearest_id(cell_pos);
					}
				}
			}
		}

		int nearest_id(const vec3 point)
		{
			const double threshold = sqrt(1/3); // NOTE: on a unit sphere, the largest coordinate will always exceed this threshold

			const int side_id =
			//point.x > threshold * 0 +
			  point.y > threshold * 1 +
			  point.z > threshold * 2 +
			 -point.x > threshold * 3 + 
			 -point.y > threshold * 4 +
			 -point.z > threshold * 5 ;
			
			float x2d = CUBE_SPHERE_SIDE_BASES[side_id%3+1] * point;
			float y2d = CUBE_SPHERE_SIDE_BASES[side_id%3+2] * point;

			int xi2d = (x2d + 1.) * 2. / cell_width;
			int yi2d = (y2d + 1.) * 2. / cell_width;
			return cells[cell_id(side_id, xi2d, yi2d)];
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
      .constructor<std::vector<Rasters::vec3>, double>()
      .function("nearest_id", &Rasters::CartesianGridLookup3d::nearest_id)
  ;
  class_<Rasters::VoronoiCubeSphereLookup3d>("VoronoiCubeSphereLookup3d")
      .constructor()
      .constructor<std::vector<Rasters::vec3>, double>()
      .function("nearest_id", &Rasters::VoronoiCubeSphereLookup3d::nearest_id)
  ;
}
