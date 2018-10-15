#pragma once

#include <math.h>       // ceil, round 
#include <vector>		// vectors 
#include <algorithm>	// clamp
// #include <iostream>		// cout

#include "vec2.h"
#include "vec3.h"

namespace rasters {
	
	// describes a 3d cartesian grid where every cell houses a list of ids representing nearby points
	class CartesianGridCellList3d
	{
		vec3 min_bounds;
		vec3 max_bounds;
		ivec3 dimensions;
		double cell_width;
		std::vector<std::pair<int, vec3>>* cells;

		int cell_count() const
		{
			return dimensions.x * dimensions.y * dimensions.z 
		         + dimensions.y * dimensions.z 
		         + dimensions.z;
		}
		int cell_id(const int xi, const int yi, const int zi) const
		{
			return  xi * dimensions.y * dimensions.z
				  + yi * dimensions.z 
				  + zi;
		}
		void add(const int id, const vec3 point)
		{
			const int xi = std::clamp((int)round((point.x - min_bounds.x) / cell_width), 0, dimensions.x-2);
			const int yi = std::clamp((int)round((point.y - min_bounds.y) / cell_width), 0, dimensions.y-2);
			const int zi = std::clamp((int)round((point.z - min_bounds.z) / cell_width), 0, dimensions.z-2);

			cells[cell_id( xi   , yi   , zi   )].push_back({id, point});
			cells[cell_id( xi+1 , yi   , zi   )].push_back({id, point});
			cells[cell_id( xi   , yi+1 , zi   )].push_back({id, point});
			cells[cell_id( xi   , yi   , zi+1 )].push_back({id, point});
			cells[cell_id( xi+1 , yi+1 , zi   )].push_back({id, point});
			cells[cell_id( xi   , yi+1 , zi+1 )].push_back({id, point});
			cells[cell_id( xi+1 , yi+1 , zi+1 )].push_back({id, point});
		}
		// NOTE: copy constructor set to private so we don't have to think about managing pointer resources
		CartesianGridCellList3d(const CartesianGridCellList3d& grid){};

	public:
		~CartesianGridCellList3d()
		{
    		delete [] cells;
    		cells = nullptr;
		}
		
		CartesianGridCellList3d(const std::vector<vec3>& aos, const double cell_width)
			: min_bounds(
			    (*std::min_element(aos.begin(), aos.end(), []( const vec3 a, const vec3 b ) { return a.x < b.x; })).x,
			    (*std::min_element(aos.begin(), aos.end(), []( const vec3 a, const vec3 b ) { return a.y < b.y; })).y,
			    (*std::min_element(aos.begin(), aos.end(), []( const vec3 a, const vec3 b ) { return a.z < b.z; })).z
    		  ),
			  max_bounds(
			      (*std::max_element(aos.begin(), aos.end(), []( const vec3 a, const vec3 b ) { return a.x < b.x; })).x,
			      (*std::max_element(aos.begin(), aos.end(), []( const vec3 a, const vec3 b ) { return a.y < b.y; })).y,
			      (*std::max_element(aos.begin(), aos.end(), []( const vec3 a, const vec3 b ) { return a.z < b.z; })).z
    		  ),
			  dimensions((max_bounds - min_bounds) / cell_width + 1), // NOTE: always offset by 1 because add() writes to neighboring cells, as well
			  cell_width(cell_width),
			  cells(new std::vector<std::pair<int, vec3>>[cell_count()])
		{
			// initialize grid
			int cell_count_ = cell_count();
			for (int i = 0; i < cell_count_; ++i)
			{
				cells[i] = std::vector<std::pair<int, vec3>>();
			}

			for (int i = 0; i < aos.size(); ++i)
			{
				add(i, aos[i]);
			}
		}
		int nearest_id(const vec3 point) const
		{
			const int xi = std::clamp((int)ceil((point.x - min_bounds.x) / cell_width), 0, dimensions.x-1);
			const int yi = std::clamp((int)ceil((point.y - min_bounds.y) / cell_width), 0, dimensions.y-1);
			const int zi = std::clamp((int)ceil((point.z - min_bounds.z) / cell_width), 0, dimensions.z-1);

			std::vector<std::pair<int, vec3>> & neighbors = cells[cell_id(xi, yi, zi)];

			if (neighbors.size() < 1)
			{
				return -1;
			}

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