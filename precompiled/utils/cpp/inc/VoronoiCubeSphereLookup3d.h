#pragma once

#include <math.h>       // ceil, round 
#include <algorithm> 	// max, min
#include <vector>		// vectors
#include <array>		// arrays
#include <iostream>		// cout

#include "vec2_template.h"
#include "vec3_template.h"
// #include "vec3s_template.h"

#include "CartesianGridLookup3d.h"

namespace Rasters
{

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
			return CUBE_SPHERE_SIDE_COUNT * dimensions.x * dimensions.y;
		}
		int cell_id(const int side_id, const int xi, const int yi) {
			return  side_id * dimensions.x * dimensions.y
				  + xi      * dimensions.y 
				  + yi;
		}
	public:
		~VoronoiCubeSphereLookup3d(){}
		
		VoronoiCubeSphereLookup3d(const std::vector<vec3> points, const double cell_width)
			: cell_width(cell_width),
			  dimensions((int)ceil(2./cell_width)+1)
		{
			CartesianGridLookup3d grid = CartesianGridLookup3d(points, 1.*cell_width);

			// populate cells using the slower CartesianGridLookup3d implementation
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
						z2d *= side_id > 2? -1 : 1;

						vec3 cell_pos = 
							CUBE_SPHERE_SIDE_BASES[(side_id+0)%3] * z2d +
							CUBE_SPHERE_SIDE_BASES[(side_id+1)%3] * x2d +
							CUBE_SPHERE_SIDE_BASES[(side_id+2)%3] * y2d ;

						cells[cell_id(side_id, xi2d, yi2d)] = grid.nearest_id(cell_pos);
					}
				}
			}
		}

		int nearest_id(const vec3 point)
		{
			const vec3 normalized = point.normalize();
    		std::cout << "normalized " << normalized.x << " " << normalized.y << " " << normalized.z << " " << std::endl; 

    		// NOTE: on a unit sphere, the largest coordinate will always exceed this threshold
    		// we adjust this threshold by epsilon to ensure that only one side is ever selected
			const double threshold = sqrt(1./3.) + 0.01;

			const int side_id = 
			//( normalized.x > threshold) * 0 +
			  ( normalized.y > threshold) * 1 +
			  ( normalized.z > threshold) * 2 +
			  (-normalized.x > threshold) * 3 +
			  (-normalized.y > threshold) * 4 +
			  (-normalized.z > threshold) * 5 ; 

    		std::cout << "side_id " << side_id << std::endl; 

			const double x2d = CUBE_SPHERE_SIDE_BASES[(side_id+1)%3] * normalized;
			const double y2d = CUBE_SPHERE_SIDE_BASES[(side_id+2)%3] * normalized;
			std::cout << "2d " << x2d << " " << y2d << " " << std::endl; 

			const int xi2d = (x2d + 1.) / cell_width;
			const int yi2d = (y2d + 1.) / cell_width;
			std::cout << "i2d " << side_id << " " << xi2d << " " << yi2d << " " << std::endl; 
			return cells[cell_id(side_id, xi2d, yi2d)];
		}
	};
}