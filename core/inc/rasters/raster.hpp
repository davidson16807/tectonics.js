#pragma once

#include <initializer_list>	// initializer_list
#include <memory>	        // std::shared_ptr

#include <composites/many.hpp> // floats, etc.

#include "Grid.hpp"            // Grid

namespace rasters
{

	// This template represents a statically-sized contiguous block of heap memory occupied by the primitive data of the same arbitrary type
	// Each data entry within the block maps to some vertex within an arbitrary 3d mesh
	// the data type held in each vertex should be small enough to fit in a computer's register (e.g. ints, floats, and even vec3s)
	// the data type must have basic operators common to all primitives: == != 
	// 
	// Q: Why not favor composition over inheritance? Why inherit from many<T>?
	// A: We've invested a lot of code to streamline mathematical expressions using many<T>,
	//      we can guarantee this functionality will be needed for rasters,
	//      and duplicating this code for use with rasters would be pretty insane.
	template <class T>
	class raster : public many<T>
	{
	public:
		std::shared_ptr<Grid> grid;

		// destructor: delete pointer 
		~raster()
		{
		};

		// copy constructor
		raster(const raster<T>& a)
			: many<T>(a),
			  grid(a.grid)
		{

		}

		// initializer list constructor
		explicit raster(const std::shared_ptr<Grid>& grid, std::initializer_list<T> list) 
			: many<T>(list),
			  grid(grid)
		{

		};
		template<class TIterator>
		explicit raster(const std::shared_ptr<Grid>& grid, TIterator first, TIterator last)
			: many<T>(grid->vertex_positions.size()),
			  grid(grid)
		{

		}

		template <class T2>
		explicit raster(const raster<T2>& a)
			: many<T>(a),
			  grid(a.grid)
		{

		}

		explicit raster(const std::shared_ptr<Grid>& grid)
			: many<T>(grid->vertex_positions.size()),
			  grid(grid)
		{

		}

		explicit raster(const std::shared_ptr<Grid>& grid, const T a)
			: many<T>(grid->vertex_positions.size(), a),
			  grid(grid)
		{

		}

		template <class T2>
		explicit raster(const std::shared_ptr<Grid>& grid, const many<T2>& a)
			: many<T2>(a),
			  grid(grid)
		{
			
		}
	};

	typedef raster<bool>	     bool_raster;
	typedef raster<int>	         int_raster;
	typedef raster<unsigned int> uint_raster;
	typedef raster<float>	     float_raster;
	typedef raster<double>       double_raster;
}
