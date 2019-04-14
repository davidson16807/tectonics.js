#pragma once

#include <math.h>       // ceil, round 
#include <algorithm> 	// max, min
#include <vector>		// vectors
#include <array>		// arrays
// #include <iostream>		// cout

#include <composites/many.hpp>
#include <composites/glm/vecs.hpp>
#include <composites/glm/geometric.hpp>

#include "CartesianGridCellList3d.hpp"

namespace rasters
{
	using namespace glm;
	using namespace composites;

	// describes a 3d unit cube sphere where every cell houses an id representing the nearest point
	// uses CartesianGridCellList3d behind the scenes to optimize initialization
	class SphereGridVoronoi3d
	{
		static const vec3s OCTAHEDRON_SIDE_Z;
		static const vec3s OCTAHEDRON_SIDE_X;
		static const vec3s OCTAHEDRON_SIDE_Y;
		static constexpr int OCTAHEDRON_SIDE_COUNT = 8;	// number of sides on the data cube

		ivec2 dimensions; // dimensions of the grid on each side of the data cube 
		float cell_width;
		std::vector<int> cells;

		int cell_count() const {
			return OCTAHEDRON_SIDE_COUNT * dimensions.x * dimensions.y;
		}
		int cell_id(const int side_id, const int xi, const int yi) const {
			return  side_id * dimensions.x * dimensions.y
				  + xi      * dimensions.y 
				  + yi;
		}
		// NOTE: copy constructor set to private so we don't have to think about managing pointer resources
		SphereGridVoronoi3d(const SphereGridVoronoi3d& grid){};
	public:
		~SphereGridVoronoi3d()
		{
		}
		
		SphereGridVoronoi3d(const vec3s points, const float cell_width)
			: dimensions((int)ceil(2./cell_width)+1),
			  cell_width(cell_width),
			  cells(cell_count(), 0)
		{
			CartesianGridCellList3d grid = CartesianGridCellList3d(points, 2.*cell_width);

			// populate cells using the slower CartesianGridCellList3d implementation
			for (int side_id = 0; side_id < OCTAHEDRON_SIDE_COUNT; ++side_id)
			{
				for (int xi2d = 0; xi2d < dimensions.x; ++xi2d)
				{
					for (int yi2d = 0; yi2d < dimensions.y; ++yi2d)
					{
						// get position of the cell that's projected onto the 2d grid
						float x2d = (float)xi2d * cell_width - 1.;
						float y2d = (float)yi2d * cell_width - 1.;
						// reconstruct the dimension omitted from the grid using pythagorean theorem
						float z2d = sqrt(std::max(1. - (x2d*x2d) - (y2d*y2d), 0.));

						vec3 cell_pos = 
							OCTAHEDRON_SIDE_X[side_id] * x2d +
							OCTAHEDRON_SIDE_Y[side_id] * y2d +
							OCTAHEDRON_SIDE_Z[side_id] * z2d ;

						cells[cell_id(side_id, xi2d, yi2d)] = grid.nearest_id(cell_pos);
					}
				}
			}
		}

		int nearest_id(const vec3 point) const
		{
			const int side_id = 
			  (( point.x > 0) << 0) +
			  (( point.y > 0) << 1) +
			  (( point.z > 0) << 2) ; 

			const double x2d = dot( OCTAHEDRON_SIDE_X[side_id], point );
			const double y2d = dot( OCTAHEDRON_SIDE_Y[side_id], point );

			const int xi2d = (x2d + 1.) / cell_width;
			const int yi2d = (y2d + 1.) / cell_width;
			
			return cells[cell_id(side_id, xi2d, yi2d)];
		}

		template <int N>
		void nearest_ids(const vec3s& points, uints& out) const
		{
			for (unsigned int i = 0; i < N; ++i)
			{
				const unsigned int side_id = 
				  (( points[i].x > 0)     ) +
				  (( points[i].y > 0) << 1) +
				  (( points[i].z > 0) << 2) ; 

				const vec2 projection = vec2(
					dot( OCTAHEDRON_SIDE_X[side_id], points[i] ),
					dot( OCTAHEDRON_SIDE_Y[side_id], points[i] )
				);

				const ivec2 grid_pos = ivec2((projection + 1.f) / cell_width);

				out[i] = cells[cell_id(side_id, grid_pos.x, grid_pos.y)];
			}
		}
	};
	const vec3s SphereGridVoronoi3d::OCTAHEDRON_SIDE_Z = normalize(
		vec3s {
			vec3(-1,-1,-1),
			vec3( 1,-1,-1),
			vec3(-1, 1,-1),
			vec3( 1, 1,-1),
			vec3(-1,-1, 1),
			vec3( 1,-1, 1),
			vec3(-1, 1, 1),
			vec3( 1, 1, 1)
		} 
	);
	const vec3s SphereGridVoronoi3d::OCTAHEDRON_SIDE_X = normalize(
		cross(SphereGridVoronoi3d::OCTAHEDRON_SIDE_Z, vec3(0,0,1))
	);
	const vec3s SphereGridVoronoi3d::OCTAHEDRON_SIDE_Y = normalize(
		cross(OCTAHEDRON_SIDE_Z, OCTAHEDRON_SIDE_X)
	);
}