

#define GLM_FORCE_PURE      // disable SIMD support for glm so we can work with webassembly
#include <glm/vec2.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>     // vec3, bvec3, dvec3, ivec3 and uvec3
#include <glm/vec4.hpp>     // vec4, bvec4, dvec4, ivec4 and uvec4
#include <glm/matrix.hpp>     // vec4, bvec4, dvec4, ivec4 and uvec4
#include <composites/composites.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/glm/glm.hpp>     // vec*, bvec*, dvec*, ivec* and uvec*

#include "rasters/SphereGridVoronoi3d.hpp"
#include "rasters/CartesianGridCellList3d.hpp"
#include "rasters/Grid.hpp"

#include "academics/tectonics.hpp"

// #define CATCH_CONFIG_MAIN  // This tells Catch to provide a main() - only do this in one cpp file
#include "catch/catch.hpp"

using namespace composites;
using namespace rasters;

Grid tetrahedron = Grid(
        vec3s({
                vec3(0,0,0),
                vec3(1,0,0),
                vec3(0,1,0),
                vec3(0,0,1)
            }),
        uvec3s({
                uvec3(0,1,2),
                uvec3(0,1,3),
                uvec3(0,2,3),
                uvec3(1,2,3)
            })
    );
// "diamond" is a 2d grid, it looks like this:
//   2  
//  /|\ 
// 3-0-1
//  \|/ 
//   4   
Grid diamond = Grid(
        vec3s({
                vec3( 0, 0, 0),
                vec3( 1, 0, 0),
                vec3( 0, 1, 0),
                vec3(-1, 0, 0),
                vec3( 0,-1, 0)
            }),
        uvec3s({
                uvec3(0,1,2),
                uvec3(0,1,4),
                uvec3(0,3,2),
                uvec3(0,3,4)
            })
    );

int main(int argc, char const *argv[])
{
    //    0   
    //  / | \ 
    // 0- 1- 1
    //  \ | / 
    //    0    
    bools plate_mask = bools ({1,1,0,0,0});
    //    0  
    //  / | \ 
    // 0--1- 0
    //  \ | / 
    //    0   
    floats buoyancy  = floats({0,-1,0,0,0});
    float mantle_viscosity = 1.57e20;
    vec3s gradient_of_bools = vec3s(5);
    //    0   
    //  / | \ 
    // 0- < -0
    //  \ | / 
    //    0    
    // gradient(plate_mask, tetrahedron, gradient_of_bools);
    academics::tectonics::guess_plate_velocity(plate_mask, buoyancy, mantle_viscosity, diamond, gradient_of_bools);
    std::cout << gradient_of_bools << std::endl;
    return 0;
}
