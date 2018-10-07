#pragma once

#include <math.h>       // ceil, round 
#include <algorithm> 	// max
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
			return CUBE_SPHERE_SIDE_COUNT * (dimensions.x+1) * dimensions.y;
		}
		int cell_id(const int side_id, const int xi, const int yi) {
			return  side_id * dimensions.x * dimensions.y
				  + xi      * dimensions.y 
				  + yi;
		}
	public:
		~VoronoiCubeSphereLookup3d(){}
		
		VoronoiCubeSphereLookup3d(const std::vector<vec3> points, const double cell_width)
			: cell_width(cell_width)
		{
			dimensions.x = 1/cell_width;
			dimensions.y = 1/cell_width;

			CartesianGridLookup3d grid = CartesianGridLookup3d(
				vec3(
				    (*std::min_element(points.begin(), points.end(), []( const vec3 a, const vec3 b ) { return a.x < b.x; })).x,
				    (*std::min_element(points.begin(), points.end(), []( const vec3 a, const vec3 b ) { return a.y < b.y; })).y,
				    (*std::min_element(points.begin(), points.end(), []( const vec3 a, const vec3 b ) { return a.z < b.z; })).z
	    		),
				vec3(
				    (*std::max_element(points.begin(), points.end(), []( const vec3 a, const vec3 b ) { return a.x < b.x; })).x,
				    (*std::max_element(points.begin(), points.end(), []( const vec3 a, const vec3 b ) { return a.y < b.y; })).y,
				    (*std::max_element(points.begin(), points.end(), []( const vec3 a, const vec3 b ) { return a.z < b.z; })).z
	    		),
	    		cell_width
	    	);

			// populate cells using the slower CartesianGridLookup3d implementation
			cells = new int[cell_count()];
			for (int side_id = 0; side_id < CUBE_SPHERE_SIDE_COUNT; ++side_id)
			{
				for (int xi2d = 0; xi2d < dimensions.x; ++xi2d)
				{
					for (int yi2d = 0; yi2d < dimensions.y; ++yi2d)
					{
						// get position of the cell that's projected onto the 2d grid
						double x2d = 0.5 * (double)xi2d * cell_width - 1.;
						double y2d = 0.5 * (double)yi2d * cell_width - 1.;
						// reconstruct the dimension omitted from the grid using pythagorean theorem
						double z2d = sqrt(std::max(1 - pow((double)x2d, 2.) - pow((double)y2d, 2.), 0.));
						z2d *= side_id > 2? -1 : 1;

    					std::cout << x2d << " " << y2d << " " << z2d << " " << std::endl; 

						vec3 cell_pos = 
							CUBE_SPHERE_SIDE_BASES[side_id%3+0] * z2d +
							CUBE_SPHERE_SIDE_BASES[side_id%3+1] * x2d +
							CUBE_SPHERE_SIDE_BASES[side_id%3+2] * y2d ;

    					std::cout << cell_pos.x << " " << cell_pos.y << " " << cell_pos.z << " " << std::endl; 

						int cell_id_ = cell_id(side_id, xi2d, yi2d);
    					std::cout << cell_id_ << std::endl; 
						int nearest_id = grid.nearest_id(cell_pos);
    					std::cout << nearest_id << std::endl; 
						// cells[cell_id(side_id, xi2d, yi2d)] = grid.nearest_id(cell_pos);
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

			double x2d = CUBE_SPHERE_SIDE_BASES[side_id%3+1] * point;
			double y2d = CUBE_SPHERE_SIDE_BASES[side_id%3+2] * point;

			int xi2d = (x2d + 1.) * 2. / cell_width;
			int yi2d = (y2d + 1.) * 2. / cell_width;
			return cells[cell_id(side_id, xi2d, yi2d)];
		}
	};
}