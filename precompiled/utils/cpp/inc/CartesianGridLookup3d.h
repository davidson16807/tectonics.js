#pragma once

#include <math.h>       // ceil, round 
#include <vector>		// vectors 

#include "vec2_template.h"
#include "vec3_template.h"
// #include "vec3s_template.h"

namespace Rasters {
	
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
}