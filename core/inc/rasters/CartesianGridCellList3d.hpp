#pragma once

#include <cmath>        // ceil, round 
#include <vector>		// vectors 
#include <algorithm>	// clamp
// #include <iostream>	// cout

#include <glm/vec3.hpp>               // *vec3
#include <composites/glm/vecs.hpp>    // *vec*s

using namespace composites;

namespace rasters {
	
	// describes a 3d cartesian grid where every cell houses a list of ids representing nearby points
	class CartesianGridCellList3d
	{
		glm::vec3  min_bounds;
		glm::vec3  max_bounds;
		glm::ivec3 dimensions;
		float cell_width;
		std::vector<std::vector<std::pair<int, glm::vec3>>> cells;

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
		void add(const int id, const glm::vec3 point)
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
		}
		
		CartesianGridCellList3d(const vec3s& points, const float cell_width)
			: min_bounds(
			    (*std::min_element(points.begin(), points.end(), []( const glm::vec3 a, const glm::vec3 b ) { return a.x < b.x; })).x,
			    (*std::min_element(points.begin(), points.end(), []( const glm::vec3 a, const glm::vec3 b ) { return a.y < b.y; })).y,
			    (*std::min_element(points.begin(), points.end(), []( const glm::vec3 a, const glm::vec3 b ) { return a.z < b.z; })).z
    		  ),
			  max_bounds(
			    (*std::max_element(points.begin(), points.end(), []( const glm::vec3 a, const glm::vec3 b ) { return a.x < b.x; })).x,
			    (*std::max_element(points.begin(), points.end(), []( const glm::vec3 a, const glm::vec3 b ) { return a.y < b.y; })).y,
			    (*std::max_element(points.begin(), points.end(), []( const glm::vec3 a, const glm::vec3 b ) { return a.z < b.z; })).z
    		  ),
			  dimensions((max_bounds - min_bounds) / cell_width + 1.f), // NOTE: always offset by 1 because add() writes to neighboring cells, as well
			  cell_width(cell_width),
			  cells(cell_count(), std::vector<std::pair<int, glm::vec3>>(0))
		{
			for (int i = 0; i < points.size(); ++i)
			{
				add(i, points[i]);
			}
		}
		int nearest_id(const glm::vec3 point) const
		{
			const int xi = std::clamp((int)ceil((point.x - min_bounds.x) / cell_width), 0, dimensions.x-1);
			const int yi = std::clamp((int)ceil((point.y - min_bounds.y) / cell_width), 0, dimensions.y-1);
			const int zi = std::clamp((int)ceil((point.z - min_bounds.z) / cell_width), 0, dimensions.z-1);

			const std::vector<std::pair<int, glm::vec3>>& neighbors = cells[cell_id(xi, yi, zi)];

			if (neighbors.size() < 1)
			{
				return -1;
			}

			std::pair<int, glm::vec3> nearest_id = 
				*std::min_element( neighbors.begin(), neighbors.end(),
			                       [&point]( const std::pair<int, glm::vec3> &a, const std::pair<int, glm::vec3> &b )
			                       {
			                           return distance(a.second, point) < distance(b.second, point);
			                       } );

			return nearest_id.first;
		}
	};
}