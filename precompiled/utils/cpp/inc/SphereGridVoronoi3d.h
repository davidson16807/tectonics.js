#pragma once

#include <math.h>       // ceil, round 
#include <algorithm> 	// max, min
#include <vector>		// vectors
#include <array>		// arrays
// #include <iostream>		// cout

#include "vec2_template.h"
#include "vec3_template.h"
// #include "vec3s_template.h"

#include "CartesianGridCellList3d.h"

namespace Rasters
{

	// describes a 3d unit cube sphere where every cell houses an id representing the nearest point
	// uses CartesianGridCellList3d behind the scenes to optimize initialization
	class SphereGridVoronoi3d
	{
		const std::array<vec3, 8> CUBE_SPHERE_SIDE_Z = {
			vec3(-1,-1,-1).normalize(),
			vec3( 1,-1,-1).normalize(),
			vec3(-1, 1,-1).normalize(),
			vec3( 1, 1,-1).normalize(),
			vec3(-1,-1, 1).normalize(),
			vec3( 1,-1, 1).normalize(),
			vec3(-1, 1, 1).normalize(),
			vec3( 1, 1, 1).normalize()
		};
		const std::array<vec3, 8> CUBE_SPHERE_SIDE_X = {
			vec3::cross(CUBE_SPHERE_SIDE_Z[0], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[1], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[2], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[3], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[4], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[5], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[6], vec3(0,0,1)).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[7], vec3(0,0,1)).normalize()
		};
		const std::array<vec3, 8> CUBE_SPHERE_SIDE_Y = {
			vec3::cross(CUBE_SPHERE_SIDE_Z[0], CUBE_SPHERE_SIDE_X[0] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[1], CUBE_SPHERE_SIDE_X[1] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[2], CUBE_SPHERE_SIDE_X[2] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[3], CUBE_SPHERE_SIDE_X[3] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[4], CUBE_SPHERE_SIDE_X[4] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[5], CUBE_SPHERE_SIDE_X[5] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[6], CUBE_SPHERE_SIDE_X[6] ).normalize(),
			vec3::cross(CUBE_SPHERE_SIDE_Z[7], CUBE_SPHERE_SIDE_X[7] ).normalize()
		};
		const int CUBE_SPHERE_SIDE_COUNT = 8;	// number of sides on the data cube

		ivec2 dimensions; // dimensions of the grid on each side of the data cube 
		int* cells;
		double cell_width;

		int cell_count() const {
			return CUBE_SPHERE_SIDE_COUNT * dimensions.x * dimensions.y;
		}
		int cell_id(const int side_id, const int xi, const int yi) const {
			return  side_id * dimensions.x * dimensions.y
				  + xi      * dimensions.y 
				  + yi;
		}
	public:
		~SphereGridVoronoi3d(){}
		
		SphereGridVoronoi3d(const std::vector<vec3> points, const double cell_width)
			: cell_width(cell_width),
			  dimensions((int)ceil(2./cell_width)+1)
		{
			CartesianGridCellList3d grid = CartesianGridCellList3d(points, 2.*cell_width);

			// populate cells using the slower CartesianGridCellList3d implementation
			cells = new int[cell_count()];
			for (int side_id = 0; side_id < CUBE_SPHERE_SIDE_COUNT; ++side_id)
			{
				for (int xi2d = 0; xi2d < dimensions.x; ++xi2d)
				{
					for (int yi2d = 0; yi2d < dimensions.y; ++yi2d)
					{
						// get position of the cell that's projected onto the 2d grid
						double x2d = (double)xi2d * cell_width - 1.;
						double y2d = (double)yi2d * cell_width - 1.;
						// reconstruct the dimension omitted from the grid using pythagorean theorem
						double z2d = sqrt(std::max(1. - (x2d*x2d) - (y2d*y2d), 0.));

						vec3 cell_pos = 
							CUBE_SPHERE_SIDE_X[side_id] * x2d +
							CUBE_SPHERE_SIDE_Y[side_id] * y2d +
							CUBE_SPHERE_SIDE_Z[side_id] * z2d ;

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

			const double x2d = CUBE_SPHERE_SIDE_X[side_id] * point;
			const double y2d = CUBE_SPHERE_SIDE_Y[side_id] * point;

			const int xi2d = (x2d + 1.) / cell_width;
			const int yi2d = (y2d + 1.) / cell_width;
			
			return cells[cell_id(side_id, xi2d, yi2d)];
		}

		template <int N>
		void nearest_ids(const vec3s<N>& points, ints<N>& out) const
		{
			for (int i = 0; i < N; ++i)
			{
				const int side_id = 
				  (( points[i].x > 0) << 0) +
				  (( points[i].y > 0) << 1) +
				  (( points[i].z > 0) << 2) ; 

				const double x2d = CUBE_SPHERE_SIDE_X[side_id] * points[i];
				const double y2d = CUBE_SPHERE_SIDE_Y[side_id] * points[i];

				const int xi2d = (x2d + 1.) / cell_width;
				const int yi2d = (y2d + 1.) / cell_width;

				out[i] = cells[cell_id(side_id, xi2d, yi2d)];
			}
		}
	};
}